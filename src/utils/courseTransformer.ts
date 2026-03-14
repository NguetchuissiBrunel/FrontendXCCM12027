import { CourseData, Section, Chapter, Paragraph, QuestionData } from '@/types/course';
import { extractTOC } from './extractTOC';
import { TableOfContentsItem } from '@/types/editor.types';

/**
 * Transforms Tiptap JSON content into a structured CourseData object
 * compatible with the Course viewer and PDF generator.
 */

export const extractTextFromContent = (content: any): string => {
    if (!content) return '';
    if (typeof content === 'string') return content;
    
    /**
     * @param node The current node to extract text from
     * @param index The index of the node within its parent's content
     * @param parentType The type of the parent node (e.g., 'orderedList')
     * @param listDepth The nesting level of lists (0 = top level, 1 = first list, 2 = nested list...)
     */
    const extract = (node: any, index: number = 0, parentType?: string, listDepth: number = 0): string => {
        if (!node) return '';
        if (typeof node === 'string') return node;
        
        let text = '';
        if (node.type === 'text') {
            text = node.text || '';
        } else if (node.type === 'math') {
            text = ` $${node.attrs?.tex || ''}$ `;
        } else if (node.content && Array.isArray(node.content)) {
            // Increase listDepth ONLY when entering a list node
            const nextListDepth = (node.type === 'orderedList' || node.type === 'bulletList') ? listDepth + 1 : listDepth;
            text = node.content.map((child: any, i: number) => extract(child, i, node.type, nextListDepth)).join('');
        }

        // Add formatting/structure based on node type
        if (node.type === 'paragraph' || node.type === 'heading') {
            return text.trim() ? text.trim() + '\n' : '';
        }
        
        if (node.type === 'listItem') {
            // Indentation: 2 spaces per level of nesting (starting from depth 2)
            const indent = '  '.repeat(Math.max(0, listDepth - 1));
            
            if (parentType === 'orderedList') {
                // Formatting: 1. 2. 3. for top level (depth 1), a) b) c) for nested (depth 2+)
                if (listDepth > 1) {
                    const letter = String.fromCharCode(96 + (index + 1)); // 97 is 'a'
                    return `${indent}${letter}) ${text.trim()}\n`;
                }
                return `${indent}${index + 1}. ${text.trim()}\n`;
            }
            return `${indent}• ${text.trim()}\n`;
        }
        
        if (node.type === 'bulletList' || node.type === 'orderedList') {
            return text + '\n';
        }
        
        return text;
    };

    if (Array.isArray(content)) {
        return content.map((node: any, i: number) => extract(node, i)).join('').trim();
    }
    
    return extract(content).trim();
};

export function transformTiptapToCourseData(apiCourse: any): CourseData {
    const contentJSON = typeof apiCourse.content === 'string'
        ? JSON.parse(apiCourse.content)
        : apiCourse.content;

    // 1. Extract the hierarchy (TOC) from the Tiptap JSON
    let toc: TableOfContentsItem[] = [];
    try {
        toc = extractTOC(contentJSON);
    } catch (error) {
        console.error("Error extracting TOC from course content:", error);
    }


    /**
     * Helper pour extraire le texte brut d'un nœud Tiptap de manière récursive
     */
    const getRawText = (nodes: any[] | any): string => {
        if (!nodes) return '';
        if (!Array.isArray(nodes)) nodes = [nodes];

        return nodes.map((node: any) => {
            if (node.type === 'text') return node.text;
            if (node.type === 'math') return ` $${node.attrs?.tex || ''}$ `;
            if (node.content) return getRawText(node.content);
            return '';
        }).join('').trim();
    };

    /**
     * Filtre les nœuds TipTap pour retirer les notions et exercices du flux de texte principal
     * car ils sont affichés dans des sections dédiées.
     */
    const filterSpecialNodes = (nodes: any[]): any[] => {
        if (!nodes || !Array.isArray(nodes)) return nodes;
        return nodes.filter(node => node.type !== 'notion' && node.type !== 'exercice' && node.type !== 'exercise').map(node => ({
            ...node,
            content: node.content ? filterSpecialNodes(node.content) : undefined
        }));
    };

    // 2. Parcourir l'arbre TOC pour construire la structure
    const processItems = (items: TableOfContentsItem[]): Section[] => {
        const sections: Section[] = [];

        items.forEach(item => {
            if (item.type === 'section') {
                const section: Section = {
                    title: item.title || "Section sans titre",
                    introduction: item.attrs?.introduction || "",
                    chapters: [],
                    paragraphs: [],
                    exerciseContent: item.children.find(c => c.type === 'exercise')?.content || null,
                    exercises: item.children.filter(c => c.type === 'exercise').map(c => ({
                        title: c.title || "Exercice",
                        content: c.content,
                        questions: c.attrs?.questions,
                        id: c.id
                    }))
                };

                item.children.forEach(child => {
                    if (child.type === 'chapter') {
                        const chapter: Chapter = {
                            title: child.title || "Chapitre sans titre",
                            introduction: child.attrs?.introduction || "",
                            paragraphs: [],
                            exerciseContent: child.children.find(c => c.type === 'exercise')?.content || null,
                            exercises: child.children.filter(c => c.type === 'exercise').map(c => ({
                                title: c.title || "Exercice",
                                content: c.content,
                                questions: c.attrs?.questions,
                                id: c.id
                            }))
                        };

                        child.children.forEach(grandChild => {
                            if (grandChild.type === 'paragraph') {
                                chapter.paragraphs.push({
                                    title: grandChild.title || "Paragraphe sans titre",
                                    introduction: grandChild.attrs?.introduction || "",
                                    content: filterSpecialNodes(grandChild.content || []),
                                    notions: (grandChild.children || []).filter(c => c.type === 'notion').map(c => extractTextFromContent(c.content)) || [],
                                    exerciseContent: grandChild.children.find(c => c.type === 'exercise')?.content || null,
                                    exercises: (grandChild.children || []).filter(c => c.type === 'exercise').map(c => ({
                                        title: c.title || "Exercice",
                                        content: c.content,
                                        questions: c.attrs?.questions,
                                        id: c.id
                                    }))
                                });
                            }
                        });
                        section.chapters!.push(chapter);
                    } else if (child.type === 'paragraph') {
                        section.paragraphs!.push({
                            title: child.title || "Paragraphe sans titre",
                            introduction: child.attrs?.introduction || "",
                            content: filterSpecialNodes(child.content || []),
                            notions: (child.children || []).filter(c => c.type === 'notion').map(c => extractTextFromContent(c.content)) || [],
                            exerciseContent: child.children.find(c => c.type === 'exercise')?.content || null,
                            exercises: (child.children || []).filter(c => c.type === 'exercise').map(c => ({
                                title: c.title || "Exercice",
                                content: c.content,
                                questions: c.attrs?.questions,
                                id: c.id
                            }))
                        });
                    }
                });
                sections.push(section);
            }
        });

        return sections;
    };

    const sections = processItems(toc);

    // 3. Retourner l'objet final formaté
    return {
        id: apiCourse.id || 0,
        title: apiCourse.title || "Titre non disponible",
        category: apiCourse.category || "Formation",
        image: apiCourse.coverImage || apiCourse.image || "/images/Capture2.png",
        viewCount: apiCourse.viewCount || 0,
        likeCount: apiCourse.likeCount || 0,
        downloadCount: apiCourse.downloadCount || 0,
        author: {
            id: apiCourse.author?.id,
            name: apiCourse.author
                ? (apiCourse.author.name || `${apiCourse.author.firstName || ''} ${apiCourse.author.lastName || ''}`.trim() || "Auteur inconnu")
                : "Auteur inconnu",
            image: apiCourse.author?.image || apiCourse.author?.photoUrl || "",
            designation: apiCourse.author?.designation
        },
        introduction: apiCourse.description || "",
        conclusion: "",
        learningObjectives: [],
        sections: sections
    };
}