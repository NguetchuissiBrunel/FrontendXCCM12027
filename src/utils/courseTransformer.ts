import { CourseData, Section, Chapter, Paragraph, ExerciseQuestion } from '@/types/course';
import { extractTOC, TableOfContentsItem } from './extractTOC';

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


    // 2. Map TOC to Section/Chapter/Paragraph structure
    // The extractTOC returns a tree of TableOfContentsItem
    // Level 0: Course (usually only one, but we check)
    // Level 1: Section
    // Level 2: Chapter
    // Level 3: Paragraph

    const sections: Section[] = [];

    // Helper to parse content JSON string back to readable text (simple version)
    const getRawText = (contentStr?: string): string => {
        if (!contentStr) return '';
        try {
            const content = JSON.parse(contentStr);
            if (Array.isArray(content)) {
                return content.map(node => {
                    if (node.type === 'text') return node.text;
                    if (node.content) return getRawText(JSON.stringify(node.content));
                    return '';
                }).join(' ');
            }
            return '';
        } catch {
            return '';
        }
    };

    // Helper to extract questions from an exercise node
    const extractQuestions = (node: any): ExerciseQuestion[] => {
        // This depends on how the exercise node stores its data.
        // Based on extractTOC, exercise items are at level 5.
        // We might need to look into the node content or attrs.
        return []; // Placeholder for now, will refine if needed
    };

    // Traverse the TOC tree
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
                        if (grandChild.type === 'paragraph' || grandChild.type === 'notion' || grandChild.type === 'exercise') {
                            const para: Paragraph = {
                                title: grandChild.title,
                                content: grandChild.content || [],
                                notions: grandChild.type === 'notion' ? [grandChild.title] : [],
                                exercise: grandChild.type === 'exercise' ? { questions: [] } : undefined
                            };
                            chapter.paragraphs.push(para);
                        }
                    });
                    section.chapters!.push(chapter);
                } else if (child.type === 'paragraph') {
                    // Paragraph directly under section
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

    return {
        id: apiCourse.id || 0,
        title: apiCourse.title || "Titre non disponible",
        category: apiCourse.category || "Formation",
        image: apiCourse.coverImage || apiCourse.image || "",
        views: apiCourse.views || 0,
        likes: apiCourse.likes || 0,
        downloads: apiCourse.downloads || 0,
        author: {
            name: apiCourse.author ? `${apiCourse.author.firstName} ${apiCourse.author.lastName}` : "Auteur inconnu",
            image: apiCourse.author?.image || apiCourse.author?.photoUrl || "",
            designation: apiCourse.author?.designation
        },
        conclusion: apiCourse.description || "", // Use description as conclusion if not available
        learningObjectives: [], // Could be extracted if we have a specific tag
        sections: sections,
        introduction: apiCourse.description,
    };
}
