import { Submission, Exercise, Question } from '@/types/exercise';
import { CourseData, Section, Chapter, Paragraph } from '@/types/course';

/**
 * Transforms a submission and its exercise into a CourseData object
 * compatible with the PDF and Docx generators.
 */
export const transformSubmissionToCourseData = (submission: Submission, exercise: Exercise): CourseData => {
    // Format date
    const submittedDate = new Date(submission.submittedAt).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    // Create sections based on questions
    const sections: Section[] = [];

    // Group questions by some logic if needed, but for now we put all in one "Détails" section
    // or we can treat each question as a Chapter if we want a structured layout

    const chapters: Chapter[] = exercise.questions.map((question, index) => {
        const answer = submission.answers.find(a => a.questionId === question.id);

        const paragraphs: Paragraph[] = [];

        // 1. Question Text
        paragraphs.push({
            title: "Énoncé",
            content: question.text,
            notions: []
        });

        // 2. Student Answer
        const answerText = answer ? answer.answer : "(Aucune réponse fournie)";
        paragraphs.push({
            title: "Réponse de l'étudiant",
            content: answerText,
            notions: []
        });

        // 3. Feedback/Correction (if graded)
        if (submission.graded || answer?.feedback || answer?.points !== undefined) {
            let feedbackContent = "";
            if (answer?.points !== undefined) {
                feedbackContent += `Points: ${answer.points} / ${question.points}\n`;
            }
            if (answer?.feedback) {
                feedbackContent += `Commentaire: ${answer.feedback}`;
            }
            if (question.correctAnswer && !question.type.includes('TEXT')) {
                feedbackContent += `\nRéponse correcte attendue: ${question.correctAnswer}`;
            }

            if (feedbackContent) {
                paragraphs.push({
                    title: "Correction & Feedback",
                    content: feedbackContent,
                    notions: []
                });
            }
        }

        return {
            title: `Question ${index + 1}`, // Or maybe truncate(question.text)
            paragraphs: paragraphs
        };
    });

    sections.push({
        title: "Questions et Réponses",
        chapters: chapters,
        paragraphs: []
    });

    // Intro text with score details
    const scoreText = submission.score !== undefined
        ? `${submission.score} / ${submission.maxScore} (${Math.round((submission.score / submission.maxScore) * 100)}%)`
        : "Non noté";

    const introduction = `
        Étudiant: ${submission.studentName}
        Email: ${submission.studentEmail || 'Non renseigné'}
        Date de soumission: ${submittedDate}
        Score global: ${scoreText}
        Statut: ${submission.graded ? 'Corrigé' : 'En attente de correction'}
    `;

    return {
        id: submission.id,
        title: `Soumission: ${exercise.title}`,
        category: "Examen / Exercice",
        image: "", // Could pass an image if available
        viewCount: 0,
        likeCount: 0,
        downloadCount: 0,
        author: {
            name: "Plateforme XCCM",
            image: ""
        },
        introduction: introduction,
        conclusion: "Fin du rapport de soumission.",
        learningObjectives: [],
        sections: sections
    };
};
