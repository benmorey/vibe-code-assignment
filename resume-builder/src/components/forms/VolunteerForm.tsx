import React from 'react';
import { VolunteerItem } from '../../types';

interface VolunteerFormProps {
  data: VolunteerItem;
  onChange: (data: VolunteerItem) => void;
  onDelete: () => void;
}

const VolunteerForm: React.FC<VolunteerFormProps> = ({ data, onChange, onDelete }) => {
  const handleChange = (field: keyof VolunteerItem, value: string) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  return (
    <div className="profile-item">
      <div className="profile-item-header">
        <div className="profile-item-title">
          {data.role ? `${data.role} at ${data.organization}` : 'New Volunteer Experience'}
        </div>
        <button className="btn btn-danger" onClick={onDelete}>
          Delete
        </button>
      </div>

      <div className="two-column">
        <div className="form-group">
          <label className="form-label">Organization *</label>
          <input
            type="text"
            className="form-input"
            value={data.organization}
            onChange={(e) => handleChange('organization', e.target.value)}
            placeholder="Nonprofit Organization"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Role *</label>
          <input
            type="text"
            className="form-input"
            value={data.role}
            onChange={(e) => handleChange('role', e.target.value)}
            placeholder="Volunteer Coordinator"
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
        <label className="form-label">Description *</label>
        <textarea
          className="form-textarea"
          value={data.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Describe your volunteer work, responsibilities, and impact..."
        />
      </div>
    </div>
  );
};

export default VolunteerForm;