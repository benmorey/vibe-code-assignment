import React from 'react';
import { ProfileData } from '../types';

interface PersonalInfoFormProps {
  data: ProfileData['personalInfo'];
  onChange: (data: ProfileData['personalInfo']) => void;
}

const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({ data, onChange }) => {
  const handleChange = (field: keyof ProfileData['personalInfo'], value: string) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  return (
    <div>
      <div className="two-column">
        <div className="form-group">
          <label className="form-label">Full Name *</label>
          <input
            type="text"
            className="form-input"
            value={data.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="John Doe"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Email *</label>
          <input
            type="email"
            className="form-input"
            value={data.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="john.doe@email.com"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Phone *</label>
          <input
            type="tel"
            className="form-input"
            value={data.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="(555) 123-4567"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Location *</label>
          <input
            type="text"
            className="form-input"
            value={data.location}
            onChange={(e) => handleChange('location', e.target.value)}
            placeholder="City, State"
          />
        </div>

        <div className="form-group">
          <label className="form-label">LinkedIn URL</label>
          <input
            type="url"
            className="form-input"
            value={data.linkedin || ''}
            onChange={(e) => handleChange('linkedin', e.target.value)}
            placeholder="https://linkedin.com/in/johndoe"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Portfolio/Website</label>
          <input
            type="url"
            className="form-input"
            value={data.portfolio || ''}
            onChange={(e) => handleChange('portfolio', e.target.value)}
            placeholder="https://johndoe.com"
          />
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoForm;