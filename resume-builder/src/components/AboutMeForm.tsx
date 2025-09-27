import React from 'react';

interface AboutMeFormProps {
  data: string;
  onChange: (data: string) => void;
}

const AboutMeForm: React.FC<AboutMeFormProps> = ({ data, onChange }) => {
  return (
    <div className="form-group">
      <label className="form-label">About Me / Professional Summary</label>
      <textarea
        className="form-textarea"
        value={data}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write a brief professional summary highlighting your key skills, experience, and career objectives..."
        style={{ minHeight: '120px' }}
      />
      <small style={{ color: '#6b7280', fontSize: '12px' }}>
        This section will be customized by AI based on the job description when generating your resume.
      </small>
    </div>
  );
};

export default AboutMeForm;