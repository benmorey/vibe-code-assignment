import React from 'react';
import { WorkExperienceItem } from '../../types';

interface WorkExperienceFormProps {
  data: WorkExperienceItem;
  onChange: (data: WorkExperienceItem) => void;
  onDelete: () => void;
}

const WorkExperienceForm: React.FC<WorkExperienceFormProps> = ({ data, onChange, onDelete }) => {
  const handleChange = (field: keyof WorkExperienceItem, value: string | string[]) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  const handleDescriptionChange = (index: number, value: string) => {
    const newDescription = [...data.description];
    newDescription[index] = value;
    handleChange('description', newDescription);
  };

  const addDescriptionPoint = () => {
    handleChange('description', [...data.description, '']);
  };

  const removeDescriptionPoint = (index: number) => {
    const newDescription = data.description.filter((_, i) => i !== index);
    handleChange('description', newDescription);
  };

  const autoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  return (
    <div className="profile-item">
      <div className="profile-item-header">
        <div className="profile-item-title">
          {data.position ? `${data.position} at ${data.company}` : 'New Work Experience'}
        </div>
        <button className="btn btn-danger" onClick={onDelete}>
          Delete
        </button>
      </div>

      <div className="two-column">
        <div className="form-group">
          <label className="form-label">Company *</label>
          <input
            type="text"
            className="form-input"
            value={data.company}
            onChange={(e) => handleChange('company', e.target.value)}
            placeholder="Company Name"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Position *</label>
          <input
            type="text"
            className="form-input"
            value={data.position}
            onChange={(e) => handleChange('position', e.target.value)}
            placeholder="Software Engineer"
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
            value={data.endDate}
            onChange={(e) => handleChange('endDate', e.target.value)}
            placeholder="Leave blank if current position"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Job Description & Achievements</label>
        {data.description.map((point, index) => (
          <div key={index} style={{ display: 'flex', marginBottom: '8px' }}>
            <textarea
              className="form-textarea"
              value={point}
              onChange={(e) => {
                handleDescriptionChange(index, e.target.value);
                autoResize(e);
              }}
              onInput={autoResize}
              placeholder="• Describe your responsibilities and achievements..."
              style={{ marginRight: '8px', minHeight: '60px', resize: 'vertical', overflow: 'hidden' }}
              rows={2}
            />
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => removeDescriptionPoint(index)}
              style={{ height: 'fit-content' }}
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          className="btn btn-secondary"
          onClick={addDescriptionPoint}
        >
          Add Point
        </button>
      </div>
    </div>
  );
};

export default WorkExperienceForm;