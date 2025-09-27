import React from 'react';
import { ExperienceType } from '../types';
import EducationForm from './forms/EducationForm';
import WorkExperienceForm from './forms/WorkExperienceForm';
import ProjectForm from './forms/ProjectForm';
import VolunteerForm from './forms/VolunteerForm';
import SkillsForm from './forms/SkillsForm';

interface ExperienceSectionProps {
  title: string;
  type: ExperienceType;
  items: any[];
  onChange: (items: any[]) => void;
}

const ExperienceSection: React.FC<ExperienceSectionProps> = ({ title, type, items, onChange }) => {
  const handleItemChange = (index: number, updatedItem: any) => {
    const newItems = [...items];
    newItems[index] = updatedItem;
    onChange(newItems);
  };

  const handleItemDelete = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onChange(newItems);
  };

  const renderForm = (item: any, index: number) => {
    const commonProps = {
      data: item,
      onChange: (updatedItem: any) => handleItemChange(index, updatedItem),
      onDelete: () => handleItemDelete(index)
    };

    switch (type) {
      case 'education':
        return <EducationForm key={item.id} {...commonProps} />;
      case 'workExperience':
        return <WorkExperienceForm key={item.id} {...commonProps} />;
      case 'projects':
        return <ProjectForm key={item.id} {...commonProps} />;
      case 'volunteerWork':
        return <VolunteerForm key={item.id} {...commonProps} />;
      case 'skills':
        return <SkillsForm key={item.id} {...commonProps} />;
      default:
        return null;
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div style={{ marginBottom: '30px' }}>
      <h3 style={{ color: '#374151', marginBottom: '15px', fontSize: '18px' }}>{title}</h3>
      {items.map((item, index) => renderForm(item, index))}
    </div>
  );
};

export default ExperienceSection;