import React from 'react';
import { ProjectItem } from '../../types';

interface ProjectFormProps {
  data: ProjectItem;
  onChange: (data: ProjectItem) => void;
  onDelete: () => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ data, onChange, onDelete }) => {
  const handleChange = (field: keyof ProjectItem, value: string | string[]) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  const handleTechnologiesChange = (value: string) => {
    const technologies = value.split(',').map(tech => tech.trim()).filter(tech => tech.length > 0);
    handleChange('technologies', technologies);
  };

  return (
    <div className="profile-item">
      <div className="profile-item-header">
        <div className="profile-item-title">
          {data.name || 'New Project'}
        </div>
        <button className="btn btn-danger" onClick={onDelete}>
          Delete
        </button>
      </div>

      <div className="two-column">
        <div className="form-group">
          <label className="form-label">Project Name *</label>
          <input
            type="text"
            className="form-input"
            value={data.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="My Awesome Project"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Project Link</label>
          <input
            type="url"
            className="form-input"
            value={data.link || ''}
            onChange={(e) => handleChange('link', e.target.value)}
            placeholder="https://github.com/user/project"
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
          <label className="form-label">End Date</label>
          <input
            type="month"
            className="form-input"
            value={data.endDate || ''}
            onChange={(e) => handleChange('endDate', e.target.value)}
            placeholder="Leave blank if ongoing"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Technologies Used</label>
        <input
          type="text"
          className="form-input"
          value={data.technologies.join(', ')}
          onChange={(e) => handleTechnologiesChange(e.target.value)}
          placeholder="React, Node.js, MongoDB, AWS (comma-separated)"
        />
      </div>

      <div className="form-group">
        <label className="form-label">Project Description *</label>
        <textarea
          className="form-textarea"
          value={data.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Describe what this project does, your role, key features, and impact..."
        />
      </div>
    </div>
  );
};

export default ProjectForm;