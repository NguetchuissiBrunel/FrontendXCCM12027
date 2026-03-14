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
                    h1 { color: #5B21B6; text-align: center; margin-bottom: 40px; }
                    h2 { color: #7C3AED; border-bottom: 2px solid #DDD; padding-bottom: 8px; margin-top: 50px; margin-bottom: 20px; }
                    h3 { color: #10B981; margin-top: 40px; margin-bottom: 15px; }
                    h4 { color: #ea580c; margin-top: 30px; margin-bottom: 10px; }
                    p { line-height: 1.6; margin-bottom: 12px; text-align: justify; }
                    .meta { font-style: italic; color: #666; margin-bottom: 40px; border-bottom: 1px solid #EEE; padding-bottom: 15px; }
                    .notion { background-color: #F3F4F6; padding: 15px; border-left: 4px solid #DBEAFE; margin: 25px 0; }
                </style>
            </head>
            <body>
        `;

        // Génération de la Table des Matières (TOC)
        let tocBody = `
            <div class="toc" style="page-break-after: always; margin-bottom: 50px;">
                <h2 style="text-align: center; color: #5B21B6; margin-bottom: 30px;">TABLE DES MATIÈRES</h2>
        `;

        courseData.sections.forEach((section: Section, sIdx: number) => {
            const sectionId = `section_${sIdx + 1}`;
            const sectionTitle = `SECTION ${sIdx + 1} : ${section.title.toUpperCase()}`;
            tocBody += `<div style="margin-top: 15px; margin-bottom: 5px;">
                            <a href="#${sectionId}" style="text-decoration: none; color: #7C3AED; font-weight: bold; font-size: 14pt;">${sectionTitle}</a>
                        </div>`;

            if (section.chapters) {
                section.chapters.forEach((chapter: Chapter, cIdx: number) => {
                    const chapterId = `section_${sIdx + 1}_chapter_${cIdx + 1}`;
                    const chapterTitle = `Chapitre ${cIdx + 1} : ${chapter.title}`;
                    tocBody += `<div style="margin-left: 25px; margin-top: 5px; margin-bottom: 3px;">
                                    <a href="#${chapterId}" style="text-decoration: none; color: #10B981; font-weight: bold; font-size: 12pt;">${chapterTitle}</a>
                                </div>`;

                    chapter.paragraphs.forEach((para: Paragraph, pIdx: number) => {
                        const paraId = `section_${sIdx + 1}_chapter_${cIdx + 1}_para_${pIdx + 1}`;
                        const paraTitle = `${pIdx + 1}. ${para.title}`;
                        tocBody += `<div style="margin-left: 50px; margin-top: 3px; margin-bottom: 2px;">
                                        <a href="#${paraId}" style="text-decoration: none; color: #ea580c; font-size: 11pt;">${paraTitle}</a>
                                    </div>`;
                    });
                });
            }

            if (section.paragraphs) {
                section.paragraphs.forEach((para: Paragraph, pIdx: number) => {
                    const paraId = `section_${sIdx + 1}_para_${pIdx + 1}`;
                    const paraTitle = `${pIdx + 1}. ${para.title}`;
                    tocBody += `<div style="margin-left: 25px; margin-top: 5px; margin-bottom: 3px;">
                                    <a href="#${paraId}" style="text-decoration: none; color: #ea580c; font-size: 11pt;">${paraTitle}</a>
                                </div>`;
                });
            }
        });

        tocBody += `</div>`;

        let body = `
            <div class="cover-page" style="text-align: center; padding-top: 150px;">
                <h1 style="font-size: 48pt; margin-bottom: 50px; color: #5B21B6;">${courseData.title.toUpperCase()}</h1>
                <div class="meta" style="margin-top: 450px;">
                    <p style="font-size: 20pt; color: #4B5563;">Catégorie : ${courseData.category || 'Formation'}</p>
                    <p style="font-size: 18pt; color: #4B5563;">Auteur : ${courseData.author.name}</p>
                    <p style="font-size: 14pt; color: #9CA3AF; margin-top: 50px;">Document généré le ${new Date().toLocaleDateString()}</p>
                </div>
            </div>
            <br clear="all" style="page-break-before:always; mso-break-type:section-break">

            ${tocBody}
            <br clear="all" style="page-break-before:always; mso-break-type:section-break">
            
            <p>${(courseData.introduction || '').replace(/\n/g, '<br/>')}</p>
        `;

        const getIntroHtml = (intro: string | undefined, color: string, marginLeft: number = 0) => {
            if (!intro || intro.trim() === "") return "";
            return `<div style="padding: 10px; margin: 10px 0; border-left: 4px solid ${color}; background-color: #f9fafb; margin-left: ${marginLeft}px;">
                        <p style="font-style: italic; color: #4b5563; margin: 0;">${intro}</p>
                    </div>`;
        };

        const getExerciseHtml = (exerciseContent: any, exerciseData: any, marginLeft: number = 0) => {
            if (!exerciseContent && (!exerciseData || !exerciseData.questions?.length)) return "";

            // Augmentation de la marge supérieure de l'exercice
            let html = `<div style="margin-top: 40px; margin-bottom: 30px; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; background-color: #f3f4f6; margin-left: ${marginLeft}px;">`;
            html += `<h4 style="color: #4f46e5; margin-top: 0; margin-bottom: 15px;">Exercice : ${exerciseData?.title || 'Application'}</h4>`;

            if (exerciseContent) {
                // Pour Word, nous devons convertir les espaces d'indentation en &nbsp;
                const indentedText = extractTextFromContent(exerciseContent)
                    .split('\n')
                    .map(line => {
                        const match = line.match(/^( +)(.*)/);
                        if (match) {
                            return '&nbsp;'.repeat(match[1].length) + match[2];
                        }
                        return line;
                    })
                    .join('<br/>');
                html += `<div style="margin-bottom: 15px;">${indentedText}</div>`;
            }

            if (exerciseData?.questions) {
                exerciseData.questions.forEach((q: any, idx: number) => {
                    html += `<div style="margin-bottom: 15px; page-break-inside: avoid;">
                                <p style="margin-bottom: 5px;">${idx + 1}. ${q.text}</p>`;
                    if (q.options) {
                        html += `<ul style="list-style-type: none; padding-left: 25px; margin-top: 5px;">`;
                        q.options.forEach((opt: string, optIdx: number) => {
                            const letter = String.fromCharCode(97 + optIdx);
                            html += `<li style="margin-bottom: 5px;">${letter}) ${opt}</li>`;
                        });
                        html += `</ul>`;
                    }
                    html += `</div>`;
                });
            }

            html += `</div>`;
            return html;
        };

        // Loop through sections
        courseData.sections.forEach((section: Section, sIdx: number) => {
            body += `<h2 id="section_${sIdx + 1}" style="margin-left: 0px;">SECTION ${sIdx + 1} : ${section.title.toUpperCase()}</h2>`;
            body += getIntroHtml(section.introduction, '#7C3AED', 15); // Violet

            if (section.chapters) {
                section.chapters.forEach((chapter: Chapter, cIdx: number) => {
                    body += `<h3 id="section_${sIdx + 1}_chapter_${cIdx + 1}" style="margin-left: 20px;">Chapitre ${cIdx + 1} : ${chapter.title}</h3>`;
                    body += getIntroHtml(chapter.introduction, '#10B981', 35); // Vert

                    chapter.paragraphs.forEach((para: Paragraph, pIdx: number) => {
                        body += `<h4 id="section_${sIdx + 1}_chapter_${cIdx + 1}_para_${pIdx + 1}" style="color: #ea580c; margin-left: 40px;">${pIdx + 1}. ${para.title}</h4>`;
                        body += getIntroHtml(para.introduction, '#ea580c', 55);

                        const paraContent = extractTextFromContent(para.content)
                            .split('\n')
                            .map(line => {
                                const match = line.match(/^( +)(.*)/);
                                if (match) return '&nbsp;'.repeat(match[1].length) + match[2];
                                return line;
                            })
                            .join('<br/>');
                        body += `<div style="margin-left: 55px; margin-bottom: 20px;">${paraContent}</div>`;

                        if (para.notions && para.notions.length > 0) {
                            body += `<div class="notion" style="margin-left: 55px;"><strong style="color: #dc2626; margin-bottom: 5px; display: block;">Notions :</strong>`;
                            para.notions.forEach((notion: string) => {
                                body += `<div style="margin-left: 10px; margin-bottom: 3px;">• ${notion}</div>`;
                            });
                            body += `</div>`;
                        }

                        body += getExerciseHtml(para.exerciseContent, (para as any).exercise, 55);
                    });

                    body += getExerciseHtml(chapter.exerciseContent, (chapter as any).exercise, 35);
                });
            }

            if (section.paragraphs) {
                section.paragraphs.forEach((para: Paragraph, pIdx: number) => {
                    body += `<h4 id="section_${sIdx + 1}_para_${pIdx + 1}" style="color: #ea580c; margin-left: 40px;">${pIdx + 1}. ${para.title}</h4>`;
                    body += getIntroHtml(para.introduction, '#ea580c', 55);

                    const paraContent = extractTextFromContent(para.content)
                        .split('\n')
                        .map(line => {
                            const match = line.match(/^( +)(.*)/);
                            if (match) return '&nbsp;'.repeat(match[1].length) + match[2];
                            return line;
                        })
                        .join('<br/>');
                    body += `<div style="margin-left: 55px; margin-bottom: 20px;">${paraContent}</div>`;

                    if (para.notions && para.notions.length > 0) {
                        body += `<div class="notion" style="margin-left: 55px;"><strong style="color: #dc2626; margin-bottom: 5px; display: block;">Notions :</strong>`;
                        para.notions.forEach((notion: string) => {
                            body += `<div style="margin-left: 10px; margin-bottom: 3px;">• ${notion}</div>`;
                        });
                        body += `</div>`;
                    }

                    body += getExerciseHtml(para.exerciseContent, (para as any).exercise, 55);
                });
            }

            body += getExerciseHtml(section.exerciseContent, (section as any).exercise, 15);
        });

        const conclusionText = extractTextFromContent(courseData.conclusion || '');
        if (conclusionText.trim() !== "") {
            body += `
                <div style="margin-top: 50px; border-top: 2px solid #5B21B6; padding-top: 20px;">
                    <h2>Conclusion</h2>
                    <p>${conclusionText}</p>
                </div>
            `;
        }
        body += `
            </body>
            </html>
        `;

        const footer = "</body></html>";
        const sourceHTML = header + body; // footer is now included in body

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

