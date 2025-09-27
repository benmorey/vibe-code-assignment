import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ProfileData } from '../types';

export async function downloadResumePDF(profileData: ProfileData): Promise<void> {
  const element = document.getElementById('resume-content');
  if (!element) {
    throw new Error('Resume content not found');
  }

  try {
    // Create canvas from the resume element
    const canvas = await html2canvas(element, {
      scale: 2, // Higher resolution
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');

    // Calculate dimensions
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Download the PDF
    const fileName = `${profileData.personalInfo.name.replace(/\s+/g, '_')}_Resume.pdf` || 'Resume.pdf';
    pdf.save(fileName);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
}

export async function downloadCoverLetterPDF(coverLetter: string): Promise<void> {
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');

    // Set font
    pdf.setFont('times', 'normal');
    pdf.setFontSize(12);

    // Add margins
    const margin = 20;
    const pageWidth = pdf.internal.pageSize.getWidth() - 2 * margin;
    const pageHeight = pdf.internal.pageSize.getHeight() - 2 * margin;

    // Split text into lines that fit the page width
    const lines = pdf.splitTextToSize(coverLetter, pageWidth);

    let currentY = margin;
    const lineHeight = 7;

    for (let i = 0; i < lines.length; i++) {
      // Check if we need a new page
      if (currentY + lineHeight > pageHeight + margin) {
        pdf.addPage();
        currentY = margin;
      }

      pdf.text(lines[i], margin, currentY);
      currentY += lineHeight;
    }

    // Download the PDF
    pdf.save('Cover_Letter.pdf');
  } catch (error) {
    console.error('Error generating cover letter PDF:', error);
    throw new Error('Failed to generate cover letter PDF');
  }
}