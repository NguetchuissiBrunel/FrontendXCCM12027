import { CourseData, Section, Chapter, Paragraph, ExerciseQuestion } from '@/types/course';
import { extractTOC } from './extractTOC';
import { TableOfContentsItem } from '@/types/editor.types';

/**
 * Transforms Tiptap JSON content into a structured CourseData object
 * compatible with the Course viewer and PDF generator.
 */

export const extractTextFromContent = (content: any): string => {
    if (!content) return '';
    if (typeof content === 'string') return content;
    if (Array.isArray(content)) {
        return content.map((node: any) => {
            if (node.type === 'text') return node.text;
            if (node.content) return extractTextFromContent(node.content);
            return '';
        }).join(' ');
    }
    if (content.type === 'doc' && content.content) return extractTextFromContent(content.content);
    if (content.content) return extractTextFromContent(content.content);
    return '';
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
            if (node.content) return getRawText(node.content);
            return '';
        }).join(' ').trim();
    };

    // 2. Parcourir l'arbre TOC pour construire la structure (récursif pour gérer l'imbrication)
    const processItems = (items: TableOfContentsItem[]): any[] => {
        const sections: Section[] = [];

        items.forEach(item => {
            if (item.type === 'section') {
                const section: Section = {
                    title: item.title || "Section sans titre",
                    chapters: [],
                    paragraphs: []
                };

                // Split children into chapters and paragraphs
                item.children.forEach(child => {
                    if (child.type === 'chapter') {
                        const chapter: Chapter = {
                            title: child.title || "Chapitre sans titre",
                            paragraphs: []
                        };

                        // Paragraphs inside chapter
                        child.children.forEach(grandChild => {
                            if (['paragraph', 'paragraphe', 'notion', 'exercise', 'exercice'].includes(grandChild.type)) {
                                chapter.paragraphs.push({
                                    title: grandChild.title || "",
                                    content: grandChild.content || [],
                                    notions: grandChild.type === 'notion' ? [grandChild.title] : [],
                                    exercise: (grandChild.type === 'exercise' || grandChild.type === 'exercice') ? { questions: [] } : undefined
                                });
                            }
                        });
                        section.chapters!.push(chapter);
                    } else if (['paragraph', 'paragraphe', 'notion', 'exercise', 'exercice'].includes(child.type)) {
                        section.paragraphs!.push({
                            title: child.title || "",
                            content: child.content || [],
                            notions: child.type === 'notion' ? [child.title] : [],
                            exercise: (child.type === 'exercise' || child.type === 'exercice') ? { questions: [] } : undefined
                        });
                    }
                });
                sections.push(section);
            } else if (item.type === 'chapter') {
                // If chapter is at top level, wrap it in a dummy section or handle it
                const chapter: Chapter = {
                    title: item.title || "Chapitre sans titre",
                    paragraphs: []
                };
                item.children.forEach(child => {
                    if (['paragraph', 'paragraphe', 'notion', 'exercise', 'exercice'].includes(child.type)) {
                        chapter.paragraphs.push({
                            title: child.title || "",
                            content: child.content || [],
                            notions: child.type === 'notion' ? [child.title] : [],
                            exercise: (child.type === 'exercise' || child.type === 'exercice') ? { questions: [] } : undefined
                        });
                    }
                });
                sections.push({ title: "", chapters: [chapter], paragraphs: [] });
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