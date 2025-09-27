import React from 'react';
import { SkillItem } from '../../types';

interface SkillsFormProps {
  data: SkillItem;
  onChange: (data: SkillItem) => void;
  onDelete: () => void;
}

const SkillsForm: React.FC<SkillsFormProps> = ({ data, onChange, onDelete }) => {
  const handleChange = (field: keyof SkillItem, value: string | string[]) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  const handleSkillsChange = (value: string) => {
    const skills = value.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0);
    handleChange('skills', skills);
  };

  return (
    <div className="profile-item">
      <div className="profile-item-header">
        <div className="profile-item-title">
          {data.category || 'New Skill Category'}
        </div>
        <button className="btn btn-danger" onClick={onDelete}>
          Delete
        </button>
      </div>

      <div className="form-group">
        <label className="form-label">Category *</label>
        <input
          type="text"
          className="form-input"
          value={data.category}
          onChange={(e) => handleChange('category', e.target.value)}
          placeholder="Programming Languages, Tools, Frameworks, etc."
        />
      </div>

      <div className="form-group">
        <label className="form-label">Skills *</label>
        <input
          type="text"
          className="form-input"
          value={data.skills.join(', ')}
          onChange={(e) => handleSkillsChange(e.target.value)}
          placeholder="JavaScript, Python, React, Node.js (comma-separated)"
        />
      </div>
    </div>
  );
};

export default SkillsForm;