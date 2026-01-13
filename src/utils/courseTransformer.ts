import { CourseData, Section, Chapter, Paragraph, ExerciseQuestion } from '@/types/course';
import { extractTOC } from './extractTOC';

/**
 * Transforme le contenu JSON Tiptap en un objet CourseData structuré
 * compatible avec le visualiseur de cours et le générateur PDF.
 */
export function transformTiptapToCourseData(apiCourse: any): CourseData {
    // Gestion de la structure imbriquée de l'API (cas de l'ID 2 vs ID 33)
    let contentJSON = apiCourse.content;

    // Si content contient un champ content (double imbrication), on descend d'un niveau
    if (contentJSON && contentJSON.content && contentJSON.content.type === 'doc') {
        contentJSON = contentJSON.content;
    }
    // Si c'est une chaîne de caractères (JSON stringifié)
    else if (typeof contentJSON === 'string') {
        try {
            const parsed = JSON.parse(contentJSON);
            contentJSON = parsed.content && parsed.content.type === 'doc' ? parsed.content : parsed;
        } catch (e) {
            console.error("Erreur parse contentJSON", e);
        }
    }

    // 1. Extraire la hiérarchie (TOC) depuis le JSON Tiptap
    const toc = extractTOC(contentJSON);

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
                                content: textContent,
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
                        content: getRawText(child.content),
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
        views: apiCourse.views || 0,
        likes: apiCourse.likes || 0,
        downloads: apiCourse.downloads || 0,
        author: {
            // Gestion des deux formats d'auteur (firstName/lastName vs name)
            name: apiCourse.author?.name
                ? apiCourse.author.name
                : (apiCourse.author?.firstName ? `${apiCourse.author.firstName} ${apiCourse.author.lastName}` : "Auteur inconnu"),
            image: apiCourse.author?.image || apiCourse.author?.photoUrl || "/images/prof.jpeg",
            designation: apiCourse.author?.designation || "Enseignant"
        },
        introduction: apiCourse.description || "",
        conclusion: "",
        learningObjectives: [],
        sections: sections
    };
}