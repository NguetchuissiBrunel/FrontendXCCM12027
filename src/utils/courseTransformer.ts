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

    const sections: Section[] = [];

    // 2. Parcourir l'arbre TOC pour construire la structure Sections > Chapters > Paragraphs
    toc.forEach(item => {
        if (item.type === 'section') {
            const section: Section = {
                title: item.title,
                chapters: [],
                paragraphs: []
            };

            item.children.forEach(child => {
                if (child.type === 'chapter') {
                    const chapter: Chapter = {
                        title: child.title,
                        paragraphs: []
                    };

                    child.children.forEach(grandChild => {
                        // On traite les paragraphes, les notions et les exercices
                        if (['paragraph', 'paragraphe', 'notion', 'exercise', 'exercice', 'chapter', 'chapitre'].includes(grandChild.type)) {

                            // Pour une "notion", le texte est souvent dans son propre content
                            const textContent = getRawText(grandChild.content);

                            const para: Paragraph = {
                                title: grandChild.title,
                                content: grandChild.content || [],
                                notions: grandChild.type === 'notion' ? [grandChild.title] : [],
                                exercise: (grandChild.type === 'exercise')
                                    ? { questions: [] }
                                    : undefined
                            };
                            chapter.paragraphs.push(para);
                        }
                    });
                    section.chapters!.push(chapter);
                }
                else if (child.type === 'paragraph') {
                    section.paragraphs!.push({
                        title: child.title,
                        content: child.content || [],
                        notions: []
                    });
                }
            });
            sections.push(section);
        }
    });

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