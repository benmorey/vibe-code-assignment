import React from 'react';
import { EducationItem } from '../../types';

interface EducationFormProps {
  data: EducationItem;
  onChange: (data: EducationItem) => void;
  onDelete: () => void;
}

const EducationForm: React.FC<EducationFormProps> = ({ data, onChange, onDelete }) => {
  const handleChange = (field: keyof EducationItem, value: string) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  return (
    <div className="profile-item">
      <div className="profile-item-header">
        <div className="profile-item-title">
          {data.institution || 'New Education'}
        </div>
        <button className="btn btn-danger" onClick={onDelete}>
          Delete
        </button>
      </div>

      <div className="two-column">
        <div className="form-group">
          <label className="form-label">Institution *</label>
          <input
            type="text"
            className="form-input"
            value={data.institution}
            onChange={(e) => handleChange('institution', e.target.value)}
            placeholder="University Name"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Degree *</label>
          <input
            type="text"
            className="form-input"
            value={data.degree}
            onChange={(e) => handleChange('degree', e.target.value)}
            placeholder="Bachelor of Science"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Field of Study *</label>
          <input
            type="text"
            className="form-input"
            value={data.field}
            onChange={(e) => handleChange('field', e.target.value)}
            placeholder="Computer Science"
          />
        </div>

        <div className="form-group">
          <label className="form-label">GPA</label>
          <input
            type="text"
            className="form-input"
            value={data.gpa || ''}
            onChange={(e) => handleChange('gpa', e.target.value)}
            placeholder="3.8/4.0"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Start Date *</label>
          <input
            type="month"
            className="form-input"
            value={data.startDate}
            onChange={(e) => handleChange('startDate', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">End Date *</label>
          <input
            type="month"
            className="form-input"
            value={data.endDate}
            onChange={(e) => handleChange('endDate', e.target.value)}
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Description / Achievements</label>
        <textarea
          className="form-textarea"
          value={data.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Relevant coursework, honors, activities, etc."
        />
      </div>
    </div>
  );
};

export default EducationForm;