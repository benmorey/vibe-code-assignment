import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ProfileData } from '../types';

export async function downloadResumePDF(profileData: ProfileData): Promise<void> {
  const element = document.getElementById('resume-content');
  if (!element) {
    throw new Error('Resume content not found');
  }

  try {
    // Store original styles
    const originalFontSize = element.style.fontSize;
    const originalLineHeight = element.style.lineHeight;
    const originalPadding = element.style.padding;
    const originalMargin = element.style.margin;
    const originalWidth = element.style.width;

    // Apply compact styles for PDF
    element.style.fontSize = '9px';
    element.style.lineHeight = '1.1';
    element.style.padding = '20px';
    element.style.margin = '0';
    element.style.width = '700px';

    // Wait for reflow
    await new Promise(resolve => setTimeout(resolve, 100));

    // Create canvas from the resume element
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 700,
      windowWidth: 700
    });

    // Restore original styles
    element.style.fontSize = originalFontSize;
    element.style.lineHeight = originalLineHeight;
    element.style.padding = originalPadding;
    element.style.margin = originalMargin;
    element.style.width = originalWidth;

    const imgData = canvas.toDataURL('image/png');

    // Use letter size (US standard)
    const pdfWidth = 215.9; // Letter width in mm (8.5in)
    const pdfHeight = 279.4; // Letter height in mm (11in)

    // Calculate image dimensions to fit the page
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    // Create PDF with letter size
    const pdf = new jsPDF('p', 'mm', 'letter');

    // Fit to one page by scaling down if needed
    if (imgHeight > pdfHeight) {
      const scaleRatio = pdfHeight / imgHeight;
      const scaledWidth = imgWidth * scaleRatio;
      const scaledHeight = pdfHeight;
      const xOffset = (pdfWidth - scaledWidth) / 2;
      pdf.addImage(imgData, 'PNG', xOffset, 0, scaledWidth, scaledHeight);
    } else {
      // Center vertically if smaller than page
      const yOffset = (pdfHeight - imgHeight) / 2;
      pdf.addImage(imgData, 'PNG', 0, yOffset, imgWidth, imgHeight);
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