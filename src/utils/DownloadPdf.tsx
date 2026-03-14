// src/utils/DownloadPdf.tsx
import jsPDF from 'jspdf';
import { CourseData, Section, Chapter, Paragraph } from '@/types/course';
import { extractTextFromContent } from './courseTransformer';

export const downloadCourseAsPDF = async (courseData: CourseData, orientation: 'p' | 'l' = 'p'): Promise<boolean> => {
  try {
    const doc = new jsPDF(orientation, 'pt', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 60;
    let y = margin;

    const fontSize = {
      title: 22,
      subtitle: 20,
      partie: 18,
      chapitre: 16,
      paragraphe: 14,
      normal: 12,
      small: 10
    };

    const colors = {
      primary: [49, 46, 129],    // Indigo-900
      partie: [49, 46, 129],     // Indigo-900
      chapitre: [6, 78, 59],      // Emerald-900
      paragraphe: [154, 52, 18],  // Orange-900
      notion: [153, 27, 27],      // Red-800
      exercise: [30, 64, 175],    // Blue-800
      dark: [31, 41, 55],         // Gray-800
      light: [107, 114, 128],     // Gray-500
      bgLight: [249, 250, 251]    // Gray-50
    } as const;

    const lineSpacing = 1.3;
    const formattedDate = new Date().toLocaleDateString();

    // Page de garde améliorée
    doc.setDrawColor(...colors.primary);
    doc.setLineWidth(2);
    doc.roundedRect(30, 30, pageWidth - 60, pageHeight - 60, 5, 5, 'S');

    if (courseData.image) {
      try {
        const imgWidth = 300;
        const imgHeight = 150;
        const imgX = (pageWidth - imgWidth) / 2;
        const imgY = 100;

        doc.addImage(courseData.image, 'JPEG', imgX, imgY, imgWidth, imgHeight);
        doc.setDrawColor(...colors.primary);
        doc.setLineWidth(1);
        doc.rect(imgX, imgY, imgWidth, imgHeight);
      } catch {
        console.log("Image non chargée");
      }
    }

    const titleY = courseData.image ? 300 : pageHeight / 3;

    doc.setTextColor(...colors.primary);
    doc.setFontSize(32); // Titre plus grand
    doc.setFont("helvetica", "bold");

    const titleLines = doc.splitTextToSize(courseData.title.toUpperCase(), pageWidth - 120);
    doc.text(titleLines, pageWidth / 2, titleY, { align: 'center' });
    
    y = titleY + (titleLines.length * 35);

    doc.setDrawColor(...colors.primary);
    doc.setLineWidth(3);
    doc.line(pageWidth / 2 - 100, y + 20, pageWidth / 2 + 100, y + 20);
    y += 60;

    const categoryText = (courseData.category || "FORMATION").toUpperCase();
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colors.light);
    doc.text(categoryText, pageWidth / 2, y, { align: 'center' });
    y += 40;

    // Titre de la formation

    if (courseData.author) {
      doc.setFontSize(fontSize.normal);
      doc.setTextColor(...colors.dark);
      doc.setFont("helvetica", "bold");
      const authorText = `Auteur: ${courseData.author.name}`;
      doc.text(authorText, pageWidth / 2, pageHeight - 120, { align: 'center' });
    }

    doc.setFontSize(fontSize.small);
    doc.setTextColor(...colors.light);
    doc.text(`Document généré le ${formattedDate}`, pageWidth / 2, pageHeight - 80, { align: 'center' });

    // Table des matières
    doc.addPage();
    y = margin;

    doc.setFontSize(fontSize.subtitle);
    doc.setTextColor(...colors.primary);
    doc.setFont("helvetica", "bold");
    const tocTitle = "TABLE DES MATIÈRES";
    doc.text(tocTitle, pageWidth / 2, y, { align: 'center' });
    y += 40;

    const hasSections = courseData.sections && courseData.sections.length > 0;

    if (hasSections) {
      courseData.sections.forEach((section: Section, sIdx: number) => {
        if (y > pageHeight - margin * 2) {
          doc.addPage();
          y = margin;
        }

        doc.setFontSize(fontSize.partie);
        doc.setTextColor(...colors.partie);
        doc.setFont("helvetica", "bold");
        const sectionText = `SECTION ${sIdx + 1} : ${section.title.toUpperCase()}`;
        const sectionLines = doc.splitTextToSize(sectionText, pageWidth - margin - 100);
        doc.text(sectionLines, margin, y);
        y += sectionLines.length * (fontSize.partie * 1.8) + 10;

        if (section.chapters) {
          section.chapters.forEach((chapter: Chapter, cIdx: number) => {
            if (y > pageHeight - margin * 2) {
              doc.addPage();
              y = margin;
            }

            doc.setFontSize(fontSize.chapitre);
            doc.setTextColor(...colors.chapitre);
            doc.setFont("helvetica", "bold");
            const chapterText = `   Chapitre ${cIdx + 1} : ${chapter.title}`;
            const chapterLines = doc.splitTextToSize(chapterText, pageWidth - margin - 15 - 100);
            doc.text(chapterLines, margin + 15, y);
            y += chapterLines.length * (fontSize.chapitre * 1.6) + 8;

            if (chapter.paragraphs) {
              chapter.paragraphs.forEach((paragraph: Paragraph, pIdx: number) => {
                if (y > pageHeight - margin * 2) {
                  doc.addPage();
                  y = margin;
                }

                doc.setFontSize(fontSize.paragraphe);
                doc.setTextColor(...colors.paragraphe);
                doc.setFont("helvetica", "normal");
                const paraText = `      ${pIdx + 1}. ${paragraph.title}`;
                const paraLines = doc.splitTextToSize(paraText, pageWidth - margin - 30 - 100);
                doc.text(paraLines, margin + 30, y);
                y += paraLines.length * (fontSize.paragraphe * 1.4) + 5;
              });
            }
          });
        }
      });
    }

    const renderWrappedText = (text: string, xPos: number, currentY: number, size: number, color: readonly number[] | number[], font: "normal" | "bold" | "italic" = "normal", maxWidth: number = pageWidth - 2 * margin) => {
      doc.setFontSize(size);
      doc.setTextColor(color[0], color[1], color[2]);
      doc.setFont("helvetica", font);
      
      const lines = doc.splitTextToSize(text, maxWidth);
      let localY = currentY;

      lines.forEach((line: string) => {
        if (localY > pageHeight - margin) {
          doc.addPage();
          localY = margin;
          // Re-apply font settings for the new page
          doc.setFontSize(size);
          doc.setTextColor(color[0], color[1], color[2]);
          doc.setFont("helvetica", font);
        }
        doc.text(line, xPos, localY);
        localY += size * lineSpacing;
      });

      return localY;
    };

    const renderIntro = (intro: string | undefined, color: readonly number[], xPos: number = margin) => {
      if (!intro || intro.trim() === "") return;
      
      const introText = intro.trim();
      const maxWidth = pageWidth - xPos - margin - 20;
      const lines = doc.splitTextToSize(introText, maxWidth);
      const boxHeight = lines.length * (fontSize.normal * lineSpacing) + 20;

      if (y + boxHeight > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      
      // Fond léger (en utilisant une couleur RGB très claire au lieu de setAlpha)
      doc.setFillColor(245, 247, 250); 
      doc.roundedRect(xPos - 5, y - 10, maxWidth + 25, boxHeight, 3, 3, 'F');

      // Bordure gauche
      doc.setDrawColor(color[0], color[1], color[2]);
      doc.setLineWidth(3);
      doc.line(xPos - 5, y - 10, xPos - 5, y - 10 + boxHeight);

      y = renderWrappedText(introText, xPos + 5, y, fontSize.normal, colors.dark, "italic", maxWidth);
      y += 20;
    };

    const renderExercise = (exerciseContent: any, exerciseData: any, levelColor: readonly number[], xPos: number = margin) => {
      if (!exerciseContent && (!exerciseData || !exerciseData.questions?.length)) return;

      const exerciseTitle = `EXERCICE : ${exerciseData?.title || 'Application'}`;
      doc.setFontSize(fontSize.paragraphe);
      const titleLines = doc.splitTextToSize(exerciseTitle.toUpperCase(), pageWidth - xPos - margin - 20);
      
      // En-tête de l'exercice : Titre + contenu éventuel
      let headerHeight = titleLines.length * (fontSize.paragraphe * lineSpacing) + 30;
      if (exerciseContent) {
        const fullText = extractTextFromContent(exerciseContent);
        const contentLines = doc.splitTextToSize(fullText, pageWidth - xPos - margin - 10);
        headerHeight += contentLines.length * (fontSize.normal * lineSpacing) + 20;
      }
      
      if (y + headerHeight > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }

      const maxWidth = pageWidth - xPos - margin;

      // Card header background
      doc.setFillColor(...colors.bgLight);
      doc.roundedRect(xPos - 5, y - 5, maxWidth + 10, headerHeight, 5, 5, 'F');
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.roundedRect(xPos - 5, y - 5, maxWidth + 10, headerHeight, 5, 5, 'S');

      // Blue top line
      doc.setDrawColor(...colors.exercise);
      doc.setLineWidth(2);
      doc.line(xPos - 5, y - 5, xPos + maxWidth + 5, y - 5);

      y = renderWrappedText(exerciseTitle.toUpperCase(), xPos + 5, y + 15, fontSize.paragraphe, colors.exercise, "bold", maxWidth);
      y += 10;

      if (exerciseContent) {
        const fullText = extractTextFromContent(exerciseContent);
        y = renderWrappedText(fullText, xPos + 5, y, fontSize.normal, colors.dark, "normal", maxWidth);
        y += 10;
      }

      if (exerciseData?.questions) {
        exerciseData.questions.forEach((q: any, idx: number) => {
          // Calcul de la hauteur de la question + ses options
          const qText = `${idx + 1}. ${q.text}`;
          const qLines = doc.splitTextToSize(qText, maxWidth - 10);
          let qHeight = qLines.length * (fontSize.normal * lineSpacing);
          
          if (q.options) {
            q.options.forEach((opt: string) => {
              const optLines = doc.splitTextToSize(`a) ${opt}`, maxWidth - 30);
              qHeight += optLines.length * (fontSize.normal * lineSpacing);
            });
          }
          qHeight += 15; // Marge entre les questions

          // Si le bloc ne tient pas, on change de page
          if (y + qHeight > pageHeight - margin) {
            doc.addPage();
            y = margin;
            
            // On peut rajouter un petit rappel du titre de l'exercice si on veut
            doc.setFontSize(fontSize.small);
            doc.setTextColor(...colors.light);
            doc.text(`${exerciseTitle} (suite)`, xPos, y - 10);
          }

          y = renderWrappedText(qText, xPos + 10, y, fontSize.normal, colors.dark, "normal", maxWidth - 10);
          
          if (q.options) {
            q.options.forEach((opt: string, optIdx: number) => {
              const letter = String.fromCharCode(97 + optIdx);
              y = renderWrappedText(`${letter}) ${opt}`, xPos + 30, y, fontSize.normal, colors.dark, "normal", maxWidth - 30);
            });
          }
          y += 5;
        });
      }
      y += 20;
    };

    const renderNotions = (notions: string[] | undefined, xPos: number = margin) => {
      if (!notions || notions.length === 0) return;

      const notionBoxX = xPos;
      const notionMaxWidth = pageWidth - xPos - margin;
      
      // Calculer la hauteur totale nécessaire
      doc.setFontSize(fontSize.normal);
      doc.setFont("helvetica", "normal");
      let totalTextHeight = fontSize.normal * 1.5; // Pour le titre POINT CLÉ
      notions.forEach(notion => {
        const lines = doc.splitTextToSize(`• ${notion}`, notionMaxWidth - 15);
        totalTextHeight += lines.length * (fontSize.normal * lineSpacing) + 5;
      });

      const boxHeight = totalTextHeight + 20;

      if (y + boxHeight > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }

      const startY = y;
      
      // Fond léger rouge
      doc.setFillColor(254, 242, 242); 
      doc.roundedRect(notionBoxX, y - 5, notionMaxWidth, boxHeight, 3, 3, 'F');
      
      // Bordure gauche crimson
      doc.setDrawColor(153, 27, 27);
      doc.setLineWidth(2);
      doc.line(notionBoxX, y - 5, notionBoxX, y - 5 + boxHeight);

      y += 10;
      doc.setFontSize(fontSize.small);
      doc.setTextColor(153, 27, 27);
      doc.setFont("helvetica", "bold");
      doc.text("POINT CLÉ", notionBoxX + 10, y);
      y += 15;

      doc.setTextColor(...colors.dark);
      doc.setFont("helvetica", "normal");
      notions.forEach((notion: string) => {
        y = renderWrappedText(`• ${notion}`, notionBoxX + 10, y, fontSize.normal, colors.dark, "normal", notionMaxWidth - 20);
        y += 5;
      });
      
      y = startY + boxHeight + 10;
    };

    // Contenu du cours
    if (courseData.introduction) {
      doc.addPage();
      y = margin;
      doc.setFontSize(fontSize.subtitle);
      doc.setTextColor(...colors.primary);
      doc.setFont("helvetica", "bold");
      doc.text("INTRODUCTION", pageWidth / 2, y, { align: 'center' });
      y += 40;
      
      const introText = extractTextFromContent(courseData.introduction);
      y = renderWrappedText(introText, margin, y, fontSize.normal, colors.dark, "normal");
    }

    if (hasSections) {
      courseData.sections.forEach((section: Section, sIdx: number) => {
        doc.addPage();
        y = margin;

        doc.setFontSize(fontSize.partie);
        doc.setTextColor(...colors.partie);
        doc.setFont("helvetica", "bold");
        doc.text(`SECTION ${sIdx + 1} : ${section.title.toUpperCase()}`, margin, y);
        y += fontSize.partie * 1.5 + 10;

        renderIntro(section.introduction, colors.partie, margin + 5);

        doc.setDrawColor(...colors.partie);
        doc.setLineWidth(1);
        doc.line(margin, y, pageWidth - margin, y);
        y += 20;

        if (section.chapters) {
          section.chapters.forEach((chapter: Chapter, cIdx: number) => {
            if (y > pageHeight - margin * 2) {
              doc.addPage();
              y = margin;
            }

            doc.setFontSize(fontSize.chapitre);
            doc.setTextColor(...colors.chapitre);
            doc.setFont("helvetica", "bold");
            doc.text(`Chapitre ${cIdx + 1} : ${chapter.title}`, margin + 10, y);
            y += fontSize.chapitre * 1.5 + 5;

            renderIntro(chapter.introduction, colors.chapitre, margin + 15);
            
            y += 15; // Augmenté de 5 à 15

            if (chapter.paragraphs) {
              chapter.paragraphs.forEach((paragraph: Paragraph, pIdx: number) => {
                if (y > pageHeight - margin * 2) {
                  doc.addPage();
                  y = margin;
                }

                doc.setFontSize(fontSize.paragraphe);
                doc.setTextColor(...colors.paragraphe);
                doc.setFont("helvetica", "bold");
                doc.text(`${pIdx + 1}. ${paragraph.title}`, margin + 20, y);
                y += fontSize.paragraphe * 1.5 + 10; // Augmenté de 5 à 10

                renderIntro(paragraph.introduction, [249, 115, 22], margin + 25); 

                y = renderWrappedText(extractTextFromContent(paragraph.content), margin + 25, y, fontSize.normal, colors.dark, "normal", pageWidth - margin - 25 - margin);
                y += 15; // Augmenté de 10 à 15

                renderNotions(paragraph.notions, margin + 25);

                renderExercise(paragraph.exerciseContent, (paragraph as any).exercise, colors.paragraphe, margin + 25);

                y += 20; // Augmenté de 10 à 20
              });
            }
            
            // Chapter level exercise at the end of the chapter
            renderExercise(chapter.exerciseContent, (chapter as any).exercise, colors.chapitre, margin + 15);
            y += 25; // Espace après un chapitre
          });
        }
        
        // Paragraphes directs de section
        if (section.paragraphs) {
          section.paragraphs.forEach((paragraph: Paragraph, pIdx: number) => {
            if (y > pageHeight - margin * 2) {
              doc.addPage();
              y = margin;
            }

            doc.setFontSize(fontSize.paragraphe);
            doc.setTextColor(...colors.paragraphe);
            doc.setFont("helvetica", "bold");
            doc.text(`${pIdx + 1}. ${paragraph.title}`, margin + 20, y);
            y += fontSize.paragraphe * 1.5 + 10; // Augmenté de 5 à 10

            renderIntro(paragraph.introduction, [249, 115, 22], margin + 25);

            y = renderWrappedText(extractTextFromContent(paragraph.content), margin + 25, y, fontSize.normal, colors.dark, "normal", pageWidth - margin - 25 - margin);
            y += 15; // Augmenté de 10 à 15

            renderNotions(paragraph.notions, margin + 25);

            // Paragraph exercise for direct section paragraphs
            renderExercise(paragraph.exerciseContent, (paragraph as any).exercise, colors.paragraphe, margin + 25);
          });
        }

        // Section level exercise at the very end of the section
        renderExercise(section.exerciseContent, (section as any).exercise, colors.partie, margin + 5);
      });
    }

    // Conclusion - Check if it contains actual text (not just empty tags)
    const conclusionText = extractTextFromContent(courseData.conclusion || '');
    if (conclusionText.trim() !== "") {
      doc.addPage();
      y = margin * 2;

      doc.setLineWidth(1);
      doc.setDrawColor(...colors.primary);
      doc.line(margin, y - 10, pageWidth - margin, y - 10);

      doc.setFontSize(fontSize.partie);
      doc.setTextColor(...colors.primary);
      doc.setFont("helvetica", "bold");
      const conclusionTitle = "Conclusion";
      doc.text(conclusionTitle, margin, y + 20);

      doc.setLineWidth(1);
      doc.line(margin, y + 30, margin + doc.getTextWidth(conclusionTitle) * 1.5, y + 30);

      y = y + 60;

      y = renderWrappedText(conclusionText, margin, y, fontSize.normal, colors.dark, "normal");
      y += 15;
    }

    if (courseData.learningObjectives && courseData.learningObjectives.length > 0) {
      doc.setFontSize(fontSize.paragraphe);
      doc.setTextColor(...colors.notion);
      doc.setFont("helvetica", "bold");
      // doc.text("Objectifs d'apprentissage :", margin, y); - Removed
      y += fontSize.paragraphe * 1.5 + 10;

      doc.setFontSize(fontSize.normal);
      doc.setTextColor(...colors.dark);
      doc.setFont("helvetica", "normal");

      courseData.learningObjectives.forEach((objective: string) => {
        if (y > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }

        const objectiveLines = doc.splitTextToSize(`• ${objective}`, pageWidth - 2 * margin - 20);
        doc.text(objectiveLines, margin + 10, y);
        y += objectiveLines.length * (fontSize.normal * lineSpacing) + 5;
      });
    }

    // Pied de page sur toutes les pages - CORRECTION ICI
    // On utilise une approche différente pour compter les pages
    const totalPages = doc.getNumberOfPages();

    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);

      doc.setFontSize(fontSize.small);
      doc.setTextColor(150, 150, 150);

      const pageText = `Page ${i} sur ${totalPages}`;
      doc.text(pageText, pageWidth - margin - doc.getTextWidth(pageText), pageHeight - 15);

      // Ajouter aussi le titre court en bas de page
      const shortTitle = (courseData.title.substring(0, 30) + (courseData.title.length > 30 ? '...' : '')) || 'Sans titre';
      doc.text(shortTitle, margin, pageHeight - 15);

      // Ajouter la date au centre
      doc.text(formattedDate, pageWidth / 2, pageHeight - 15, { align: 'center' });
    }

    const safeTitle = courseData.title.replace(/\s+/g, '_').replace(/[^\w-]/g, '') || 'cours';
    doc.save(`${safeTitle}.pdf`);

    return true;
  } catch (error) {
    console.error("Erreur lors de la génération du PDF:", error);
    return false;
  }
};