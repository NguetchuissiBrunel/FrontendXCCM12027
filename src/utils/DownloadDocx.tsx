'use client';

import { CourseData, Section, Chapter, Paragraph } from '@/types/course';
import { extractTextFromContent } from './courseTransformer';

/**
 * Downloads course content as a Word-compatible .doc file.
 * This method is used instead of html-to-docx to avoid bundling issues and crashes in Next.js.
 */
export const downloadCourseAsDocx = async (courseData: CourseData) => {
    try {
        // Construct basic HTML for the course with Word-specific XML namespaces for better compatibility
        const header = `
            <html xmlns:o='urn:schemas-microsoft-com:office:office' 
                  xmlns:w='urn:schemas-microsoft-com:office:word' 
                  xmlns='http://www.w3.org/TR/REC-html40'>
            <head>
                <meta charset='utf-8'>
                <title>${courseData.title}</title>
                <style>
                    body { font-family: 'Arial', sans-serif; }
                    h1 { color: #5B21B6; text-align: center; }
                    h2 { color: #7C3AED; border-bottom: 2px solid #DDD; padding-bottom: 5px; margin-top: 30px; }
                    h3 { color: #10B981; margin-top: 20px; }
                    h4 { color: #2563EB; }
                    p { line-height: 1.6; margin-bottom: 10px; text-align: justify; }
                    .meta { font-style: italic; color: #666; margin-bottom: 30px; border-bottom: 1px solid #EEE; padding-bottom: 10px; }
                    .notion { background-color: #F3F4F6; padding: 10px; border-left: 4px solid #DBEAFE; margin: 10px 0; }
                </style>
            </head>
            <body>
        `;

        let body = `
            <h1>${courseData.title}</h1>
            <div class="meta">
                <p>Catégorie : ${courseData.category || 'Formation'}</p>
                <p>Auteur : ${courseData.author.name}</p>
            </div>
            
            <p><strong>Introduction :</strong> ${courseData.introduction || ''}</p>
        `;

        // Loop through sections
        courseData.sections.forEach((section: Section) => {
            body += `<h2>${section.title}</h2>`;

            if (section.chapters) {
                section.chapters.forEach((chapter: Chapter) => {
                    body += `<h3>${chapter.title}</h3>`;

                    chapter.paragraphs.forEach((para: Paragraph) => {
                        body += `<h4>${para.title}</h4>`;
                        body += `<p>${extractTextFromContent(para.content)}</p>`;

                        if (para.notions && para.notions.length > 0) {
                            body += `<div class="notion"><strong>Notions clés :</strong> ${para.notions.join(', ')}</div>`;
                        }
                    });
                });
            }

            if (section.paragraphs) {
                section.paragraphs.forEach((para: Paragraph) => {
                    body += `<h4>${para.title}</h4>`;
                    body += `<p>${extractTextFromContent(para.content)}</p>`;

                    if (para.notions && para.notions.length > 0) {
                        body += `<div class="notion"><strong>Notions clés :</strong> ${para.notions.join(', ')}</div>`;
                    }
                });
            }
        });

        body += `
                <div style="margin-top: 50px; border-top: 2px solid #5B21B6; padding-top: 20px;">
                    <h2>Conclusion</h2>
                    <p>${courseData.conclusion || 'Merci d\'avoir suivi ce cours.'}</p>
                </div>
            </body>
            </html>
        `;

        const footer = "</body></html>";
        const sourceHTML = header + body + footer;

        // Create a blob with the correct Word MIME type
        const blob = new Blob([sourceHTML], { type: 'application/msword' });

        // Trigger download
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${courseData.title.replace(/\s+/g, '_')}.doc`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

    } catch (error) {
        console.error('Erreur lors du téléchargement Word:', error);
    }
};

