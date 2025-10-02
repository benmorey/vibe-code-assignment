import React from 'react';

interface JobDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
  onGenerateResume: () => void;
  onGenerateCoverLetter: () => void;
  isGenerating: boolean;
  companyName: string;
  onCompanyNameChange: (value: string) => void;
}

const JobDescriptionInput: React.FC<JobDescriptionInputProps> = ({
  value,
  onChange,
  onGenerateResume,
  onGenerateCoverLetter,
  isGenerating,
  companyName,
  onCompanyNameChange
}) => {
  return (
    <div className="card">
      <h2 style={{ marginBottom: '20px', color: '#1f2937' }}>Job Information</h2>

      <div className="form-group">
        <label className="form-label">Company Name (Optional)</label>
        <input
          type="text"
          className="form-input"
          value={companyName}
          onChange={(e) => onCompanyNameChange(e.target.value)}
          placeholder="e.g., Google, Microsoft, Startup Inc."
        />
      </div>

      <div className="form-group">
        <label className="form-label">Paste the job description here *</label>
        <textarea
          className="form-textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Copy and paste the job description, requirements, and qualifications from the job posting..."
          style={{ minHeight: '200px' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button
          className="btn btn-primary"
          onClick={onGenerateResume}
          disabled={isGenerating || !value.trim()}
          style={{ flex: 1, minWidth: '200px' }}
        >
          {isGenerating ? 'Generating...' : 'Generate AI Resume'}
        </button>

        <button
          className="btn btn-secondary"
          onClick={onGenerateCoverLetter}
          disabled={isGenerating || !value.trim()}
          style={{ flex: 1, minWidth: '200px' }}
        >
          {isGenerating ? 'Generating...' : 'Generate Cover Letter'}
        </button>
      </div>

      <div style={{ marginTop: '15px', fontSize: '13px', color: '#6b7280' }}>
        <p><strong>Tips:</strong></p>
        <ul style={{ marginLeft: '20px', lineHeight: '1.5' }}>
          <li>Include the full job posting for best results</li>
          <li>Make sure to include required skills and qualifications</li>
          <li>The AI will customize your resume to match keywords and requirements</li>
          <li>Your original profile data is preserved - this creates a tailored version</li>
        </ul>
      </div>
    </div>
  );
};

export default JobDescriptionInput;