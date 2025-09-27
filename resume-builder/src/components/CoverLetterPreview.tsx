import React from 'react';
import { downloadCoverLetterPDF } from '../services/pdfService';

interface CoverLetterPreviewProps {
  coverLetter: string;
}

const CoverLetterPreview: React.FC<CoverLetterPreviewProps> = ({ coverLetter }) => {
  const handleDownloadPDF = async () => {
    if (!coverLetter) {
      alert('Please generate a cover letter first.');
      return;
    }

    try {
      await downloadCoverLetterPDF(coverLetter);
    } catch (error) {
      console.error('Error downloading cover letter PDF:', error);
      alert('Failed to download PDF. Please try again.');
    }
  };

  const handleCopyToClipboard = async () => {
    if (!coverLetter) {
      alert('Please generate a cover letter first.');
      return;
    }

    try {
      await navigator.clipboard.writeText(coverLetter);
      alert('Cover letter copied to clipboard!');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = coverLetter;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Cover letter copied to clipboard!');
    }
  };

  if (!coverLetter) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
        <h3>Cover Letter Preview</h3>
        <p>Enter a job description and click "Generate Cover Letter" to see your AI-generated cover letter here.</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <h3 style={{ margin: 0, color: '#1f2937' }}>AI-Generated Cover Letter</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="btn btn-secondary"
            onClick={handleCopyToClipboard}
          >
            Copy Text
          </button>
          <button
            className="btn btn-primary"
            onClick={handleDownloadPDF}
          >
            Download PDF
          </button>
        </div>
      </div>

      <div id="cover-letter-content" style={{
        background: 'white',
        padding: '40px',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        fontFamily: 'Times New Roman, serif',
        lineHeight: '1.6',
        fontSize: '14px',
        whiteSpace: 'pre-line'
      }}>
        {coverLetter}
      </div>

      <div style={{ marginTop: '15px', fontSize: '13px', color: '#6b7280' }}>
        <p><strong>Tips:</strong></p>
        <ul style={{ marginLeft: '20px', lineHeight: '1.5' }}>
          <li>Review and customize the cover letter as needed before sending</li>
          <li>Add the specific company name and hiring manager's name if known</li>
          <li>Consider adding any recent achievements or specific company research</li>
          <li>Use this as a starting point and personalize it further</li>
        </ul>
      </div>
    </div>
  );
};

export default CoverLetterPreview;