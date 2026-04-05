// src/utils/DownloadCertification.tsx
import jsPDF from 'jspdf';
import { CourseData } from '@/types/course';

export const downloadCertificationPDF = async (courseData: CourseData, studentName: string): Promise<boolean> => {
  try {
    const doc = new jsPDF('l', 'pt', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Palette de couleurs premium
    const colors: { [key: string]: [number, number, number] } = {
      gold: [197, 168, 126],    // Or étouffé
      deepBlue: [30, 58, 138],  // Bleu marine
      darkGray: [55, 65, 81],   // Gris foncé
      lightGray: [209, 213, 219], // Gris clair
      white: [255, 255, 255]
    };

    // 1. Bordure décorative double
    doc.setDrawColor(...colors.gold);
    doc.setLineWidth(4);
    doc.roundedRect(30, 30, pageWidth - 60, pageHeight - 60, 10, 10, 'S');
    
    doc.setLineWidth(1);
    doc.roundedRect(40, 40, pageWidth - 80, pageHeight - 80, 8, 8, 'S');

    // Coins décoratifs
    const drawCorner = (x: number, y: number, rot: number) => {
      doc.saveGraphicsState();
      // Simuler des motifs de coins
      doc.setLineWidth(2);
      doc.line(x, y, x + (rot > 0 ? -30 : 30), y);
      doc.line(x, y, x, y + (rot > 0 ? -30 : 30));
      doc.restoreGraphicsState();
    };

    // 2. En-tête XCCM
    doc.setTextColor(...colors.deepBlue);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.text("XCCM", pageWidth / 2, 80, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("PLATEFORME D'APPRENTISSAGE NUMÉRIQUE", pageWidth / 2, 95, { align: 'center' });

    // 3. Titre Principal
    doc.setFontSize(42);
    doc.setFont("times", "italic");
    doc.setTextColor(...colors.gold);
    doc.text("Certificat de Réussite", pageWidth / 2, 160, { align: 'center' });

    // 4. Contenu personnalisé
    doc.setTextColor(...colors.darkGray);
    doc.setFontSize(16);
    doc.setFont("helvetica", "normal");
    doc.text("Ce certificat est fièrement décerné à", pageWidth / 2, 210, { align: 'center' });

    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colors.deepBlue);
    doc.text(studentName.toUpperCase(), pageWidth / 2, 250, { align: 'center' });

    // Ligne décorative sous le nom
    doc.setDrawColor(...colors.gold);
    doc.setLineWidth(1);
    doc.line(pageWidth / 2 - 150, 260, pageWidth / 2 + 150, 260);

    doc.setFontSize(16);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...colors.darkGray);
    doc.text("Pour avoir complété avec succès le cours", pageWidth / 2, 300, { align: 'center' });

    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...colors.deepBlue);
    const courseTitleLines = doc.splitTextToSize(courseData.title, pageWidth - 200);
    doc.text(courseTitleLines, pageWidth / 2, 335, { align: 'center' });

    // Message de félicitations
    doc.setFontSize(12);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(...colors.darkGray);
    const congratsMsg = `Chers étudiant, vous avez complété le cours "${courseData.title}" avec brio. Vos efforts et votre persévérance vous ont permis d'acquérir de nouvelles compétences précieuses pour votre avenir professionnel.`;
    const wrappedMsg = doc.splitTextToSize(congratsMsg, pageWidth - 250);
    doc.text(wrappedMsg, pageWidth / 2, 385, { align: 'center' });

    // 5. Section Compétences (Learning Objectives)
    if (courseData.learningObjectives && courseData.learningObjectives.length > 0) {
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Compétences Acquises :", 100, 440);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const skills = courseData.learningObjectives.slice(0, 4).map(s => `• ${s}`);
      doc.text(skills, 100, 460);
    }

    // 6. Badge Stylisé
    const badgeX = pageWidth - 150;
    const badgeY = 460;
    
    // Cercle extérieur dentelé (simplifié par cercles concentriques)
    doc.setDrawColor(...colors.gold);
    doc.setFillColor(...colors.gold);
    doc.circle(badgeX, badgeY, 45, 'FD');
    
    doc.setDrawColor(...colors.white);
    doc.setLineWidth(2);
    doc.circle(badgeX, badgeY, 40, 'S');
    
    doc.setTextColor(...colors.white);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("XCCM", badgeX, badgeY - 5, { align: 'center' });
    doc.setFontSize(8);
    doc.text("CERTIFIÉ", badgeX, badgeY + 10, { align: 'center' });

    // 7. Pied de page (Signatures)
    const lineY = 530;
    doc.setDrawColor(...colors.lightGray);
    doc.setLineWidth(1);
    
    // Signature Auteur
    doc.line(100, lineY, 250, lineY);
    doc.setFontSize(10);
    doc.setTextColor(...colors.darkGray);
    doc.text("Formateur", 175, lineY + 15, { align: 'center' });
    doc.setFont("helvetica", "bold");
    doc.text(courseData.author.name, 175, lineY - 5, { align: 'center' });

    // Signature Plateforme
    doc.line(pageWidth - 250, lineY, pageWidth - 100, lineY);
    doc.setFont("helvetica", "normal");
    doc.text("Direction XCCM", pageWidth - 175, lineY + 15, { align: 'center' });
    doc.setFont("helvetica", "bold");
    doc.text("Direction Pédagogique", pageWidth - 175, lineY - 5, { align: 'center' });

    // Date
    const date = new Date().toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Délivré le ${date}`, pageWidth / 2, 570, { align: 'center' });

    doc.save(`Certification_${courseData.title.replace(/\s+/g, '_')}.pdf`);
    return true;
  } catch (error) {
    console.error("Erreur lors de la génération du certificat:", error);
    return false;
  }
};
