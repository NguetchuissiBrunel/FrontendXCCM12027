// src/utils/DownloadPdf.tsx
import jsPDF from 'jspdf';
import { CourseData, Section, Chapter, Paragraph } from '@/types/course';

export const downloadCourseAsPDF = async (courseData: CourseData, orientation: 'p' | 'l' = 'p'): Promise<boolean> => {
  try {
    const doc = new jsPDF(orientation, 'pt', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;
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
      primary: [100, 50, 200],
      partie: [100, 50, 200],
      chapitre: [0, 130, 80],
      paragraphe: [230, 180, 0],
      notion: [50, 50, 150],
      dark: [50, 50, 50],
      light: [150, 150, 150]
    } as const;

    const lineSpacing = 1.3;
    const formattedDate = new Date().toLocaleDateString();

    // Page de garde
    doc.setDrawColor(...colors.primary);
    doc.setLineWidth(10);
    doc.roundedRect(20, 20, pageWidth - 40, pageHeight - 40, 10, 10, 'S');

    if (courseData.image) {
      try {
        const imgWidth = pageWidth - 100;
        const imgHeight = 200;
        const imgX = 50;
        const imgY = 80;

        doc.addImage(courseData.image, 'JPEG', imgX, imgY, imgWidth, imgHeight);

        doc.setDrawColor(...colors.primary);
        doc.setLineWidth(0.5);
        doc.rect(imgX, imgY, imgWidth, imgHeight);
      } catch {
        console.log("Image non chargée, utilisation du placeholder");
      }
    }

    const titleY = courseData.image ? 350 : pageHeight / 3;

    doc.setTextColor(...colors.primary);
    doc.setFontSize(fontSize.title);
    doc.setFont("helvetica", "bold");

    const titleLines = doc.splitTextToSize(courseData.title, pageWidth - 100);
    const titleHeight = titleLines.length * (fontSize.title * lineSpacing);

    doc.text(titleLines, pageWidth / 2, titleY, { align: 'center' });

    doc.setDrawColor(...colors.primary);
    doc.setLineWidth(2);
    doc.line(pageWidth / 2 - 120, titleY + titleHeight + 15,
      pageWidth / 2 + 120, titleY + titleHeight + 15);

    doc.setFontSize(fontSize.subtitle);
    doc.setTextColor(...colors.primary);
    doc.setFont("helvetica", "normal");
    const categoryText = courseData.category || "Formation";
    doc.text(categoryText, pageWidth / 2, titleY + titleHeight + 50, { align: 'center' });

    if (courseData.author) {
      doc.setFontSize(fontSize.normal);
      doc.setTextColor(...colors.primary);
      const authorText = `Par ${courseData.author.name}`;
      doc.text(authorText, pageWidth / 2, titleY + titleHeight + 80, { align: 'center' });
    }

    doc.setFontSize(fontSize.small);
    doc.setTextColor(...colors.light);
    doc.text(formattedDate, pageWidth / 2, pageHeight - margin, { align: 'center' });

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
        const sectionText = `Partie ${sIdx + 1}: ${section.title}`;
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
            const chapterText = `   Chapitre ${sIdx + 1}.${cIdx + 1}: ${chapter.title}`;
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
                const paraText = `      ${sIdx + 1}.${cIdx + 1}.${pIdx + 1}: ${paragraph.title}`;
                const paraLines = doc.splitTextToSize(paraText, pageWidth - margin - 30 - 100);
                doc.text(paraLines, margin + 30, y);
                y += paraLines.length * (fontSize.paragraphe * 1.4) + 5;
              });
            }
          });
        }
      });
    }

    // Contenu du cours
    if (hasSections) {
      courseData.sections.forEach((section: Section, sIdx: number) => {
        doc.addPage();
        y = margin;

        doc.setFontSize(fontSize.partie);
        doc.setTextColor(...colors.partie);
        doc.setFont("helvetica", "bold");
        doc.text(`Partie ${sIdx + 1}: ${section.title}`, margin, y);
        y += fontSize.partie * 1.5 + 20;

        doc.setDrawColor(...colors.partie);
        doc.setLineWidth(2);
        doc.line(margin, y, pageWidth - margin, y);
        y += 30;

        if (section.chapters) {
          section.chapters.forEach((chapter: Chapter, cIdx: number) => {
            if (y > pageHeight - margin * 2) {
              doc.addPage();
              y = margin;
            }

            doc.setFontSize(fontSize.chapitre);
            doc.setTextColor(...colors.chapitre);
            doc.setFont("helvetica", "bold");
            doc.text(`Chapitre ${sIdx + 1}.${cIdx + 1}: ${chapter.title}`, margin, y);
            y += fontSize.chapitre * 1.5 + 15;

            if (chapter.paragraphs) {
              chapter.paragraphs.forEach((paragraph: Paragraph, pIdx: number) => {
                if (y > pageHeight - margin * 2) {
                  doc.addPage();
                  y = margin;
                }

                doc.setFontSize(fontSize.paragraphe);
                doc.setTextColor(...colors.paragraphe);
                doc.setFont("helvetica", "bold");
                doc.text(`${sIdx + 1}.${cIdx + 1}.${pIdx + 1} ${paragraph.title}`, margin, y);
                y += fontSize.paragraphe * 1.5 + 10;

                doc.setFontSize(fontSize.normal);
                doc.setTextColor(...colors.dark);
                doc.setFont("helvetica", "normal");
                const contentLines = doc.splitTextToSize(paragraph.content, pageWidth - 2 * margin);
                doc.text(contentLines, margin, y);
                y += contentLines.length * (fontSize.normal * lineSpacing) + 15;

                if (paragraph.notions && paragraph.notions.length > 0) {
                  doc.setFontSize(fontSize.normal);
                  doc.setTextColor(...colors.notion);
                  doc.setFont("helvetica", "bold");
                  doc.text("Notions clés :", margin, y);
                  y += fontSize.normal * 1.5 + 10;

                  paragraph.notions.forEach((notion: string) => {
                    if (y > pageHeight - margin) {
                      doc.addPage();
                      y = margin;
                    }

                    const boxWidth = pageWidth - 2 * margin - 20;
                    const notionLines = doc.splitTextToSize(`• ${notion}`, boxWidth - 20);

                    doc.setFontSize(fontSize.small);
                    doc.setTextColor(...colors.dark);
                    doc.setFont("helvetica", "normal");
                    doc.text(notionLines, margin + 10, y);
                    y += notionLines.length * (fontSize.small * lineSpacing) + 10;
                  });
                }

                y += 10;
              });
            }
          });
        }
      });
    }

    // Conclusion
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

    doc.setFontSize(fontSize.normal);
    doc.setTextColor(0, 0, 0);

    if (courseData.conclusion) {
      const splitConclusion = doc.splitTextToSize(courseData.conclusion, pageWidth - 2 * margin);
      doc.text(splitConclusion, margin, y);
      y += splitConclusion.length * (fontSize.normal * lineSpacing) + 25;
    }

    if (courseData.learningObjectives && courseData.learningObjectives.length > 0) {
      doc.setFontSize(fontSize.paragraphe);
      doc.setTextColor(...colors.notion);
      doc.setFont("helvetica", "bold");
      doc.text("Objectifs d'apprentissage :", margin, y);
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