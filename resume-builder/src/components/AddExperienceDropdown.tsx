import React, { useState } from 'react';
import { ExperienceType } from '../types';

interface AddExperienceDropdownProps {
  onAdd: (type: ExperienceType) => void;
}

const experienceTypes = [
  { key: 'education' as ExperienceType, label: 'Education' },
  { key: 'workExperience' as ExperienceType, label: 'Work Experience' },
  { key: 'projects' as ExperienceType, label: 'Projects' },
  { key: 'volunteerWork' as ExperienceType, label: 'Volunteer Work' },
  { key: 'skills' as ExperienceType, label: 'Skills' }
];

const AddExperienceDropdown: React.FC<AddExperienceDropdownProps> = ({ onAdd }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleAdd = (type: ExperienceType) => {
    onAdd(type);
    setIsOpen(false);
  };

  return (
    <div className={`dropdown ${isOpen ? 'active' : ''}`}>
      <button
        className="btn btn-primary"
        onClick={() => setIsOpen(!isOpen)}
      >
        Add Experience +
      </button>
      <div className="dropdown-content">
        {experienceTypes.map((type) => (
          <div
            key={type.key}
            className="dropdown-item"
            onClick={() => handleAdd(type.key)}
          >
            {type.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AddExperienceDropdown;