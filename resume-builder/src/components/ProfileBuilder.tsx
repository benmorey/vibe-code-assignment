import React, { useState } from 'react';
import { ProfileData, ExperienceType } from '../types';
import PersonalInfoForm from './PersonalInfoForm';
import AboutMeForm from './AboutMeForm';
import ExperienceSection from './ExperienceSection';
import AddExperienceDropdown from './AddExperienceDropdown';

interface ProfileBuilderProps {
  profileData: ProfileData;
  onSave: (data: ProfileData) => void;
}

const ProfileBuilder: React.FC<ProfileBuilderProps> = ({ profileData, onSave }) => {
  const [currentData, setCurrentData] = useState<ProfileData>(profileData);

  const handlePersonalInfoChange = (personalInfo: ProfileData['personalInfo']) => {
    setCurrentData(prev => ({ ...prev, personalInfo }));
  };

  const handleAboutMeChange = (aboutMe: string) => {
    setCurrentData(prev => ({ ...prev, aboutMe }));
  };

  const handleExperienceChange = (type: ExperienceType, data: any[]) => {
    setCurrentData(prev => ({ ...prev, [type]: data }));
  };

  const handleSave = () => {
    onSave(currentData);
    alert('Profile saved successfully!');
  };

  const addExperience = (type: ExperienceType) => {
    const newItem = createNewExperienceItem(type);
    const currentItems = currentData[type] as any[];
    setCurrentData(prev => ({
      ...prev,
      [type]: [...currentItems, newItem]
    }));
  };

  const createNewExperienceItem = (type: ExperienceType) => {
    const id = Date.now().toString();

    switch (type) {
      case 'education':
        return {
          id,
          institution: '',
          degree: '',
          field: '',
          startDate: '',
          endDate: '',
          gpa: '',
          description: ''
        };
      case 'workExperience':
        return {
          id,
          company: '',
          position: '',
          startDate: '',
          endDate: '',
          location: '',
          description: ['']
        };
      case 'projects':
        return {
          id,
          name: '',
          description: '',
          technologies: [],
          link: '',
          startDate: '',
          endDate: ''
        };
      case 'volunteerWork':
        return {
          id,
          organization: '',
          role: '',
          startDate: '',
          endDate: '',
          description: ''
        };
      case 'skills':
        return {
          id,
          category: '',
          skills: []
        };
      default:
        return { id };
    }
  };

  return (
    <div>
      <div className="card">
        <h2 style={{ marginBottom: '20px', color: '#1f2937' }}>Personal Information</h2>
        <PersonalInfoForm
          data={currentData.personalInfo}
          onChange={handlePersonalInfoChange}
        />
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '20px', color: '#1f2937' }}>About Me</h2>
        <AboutMeForm
          data={currentData.aboutMe}
          onChange={handleAboutMeChange}
        />
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: '#1f2937' }}>Experience & Skills</h2>
          <AddExperienceDropdown onAdd={addExperience} />
        </div>

        <ExperienceSection
          title="Education"
          type="education"
          items={currentData.education}
          onChange={(data) => handleExperienceChange('education', data)}
        />

        <ExperienceSection
          title="Work Experience"
          type="workExperience"
          items={currentData.workExperience}
          onChange={(data) => handleExperienceChange('workExperience', data)}
        />

        <ExperienceSection
          title="Projects"
          type="projects"
          items={currentData.projects}
          onChange={(data) => handleExperienceChange('projects', data)}
        />

        <ExperienceSection
          title="Volunteer Work"
          type="volunteerWork"
          items={currentData.volunteerWork}
          onChange={(data) => handleExperienceChange('volunteerWork', data)}
        />

        <ExperienceSection
          title="Skills"
          type="skills"
          items={currentData.skills}
          onChange={(data) => handleExperienceChange('skills', data)}
        />
      </div>

      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <button className="btn btn-primary" onClick={handleSave} style={{ fontSize: '16px', padding: '12px 24px' }}>
          Save Profile
        </button>
      </div>
    </div>
  );
};

export default ProfileBuilder;