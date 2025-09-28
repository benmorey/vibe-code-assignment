import React, { useState, useEffect } from 'react';
import { ProfileData, ExperienceType } from '../types';
import PersonalInfoForm from './PersonalInfoForm';
import AboutMeForm from './AboutMeForm';
import ExperienceSection from './ExperienceSection';
import AddExperienceDropdown from './AddExperienceDropdown';
import ResumeUpload from './ResumeUpload';

interface ProfileBuilderProps {
  profileData: ProfileData;
  onSave: (data: ProfileData) => void;
}

const ProfileBuilder: React.FC<ProfileBuilderProps> = ({ profileData, onSave }) => {
  const [currentData, setCurrentData] = useState<ProfileData>(profileData);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Update local state when profileData prop changes
  useEffect(() => {
    setCurrentData(profileData);
  }, [profileData]);

  // Auto-save functionality
  useEffect(() => {
    const timer = setTimeout(() => {
      if (saveStatus === 'idle') {
        handleAutoSave();
      }
    }, 2000); // Auto-save after 2 seconds of no changes

    return () => clearTimeout(timer);
  }, [currentData]);

  const handleAutoSave = () => {
    setSaveStatus('saving');
    onSave(currentData);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 1500);
  };

  const handlePersonalInfoChange = (personalInfo: ProfileData['personalInfo']) => {
    setCurrentData(prev => ({ ...prev, personalInfo }));
    setSaveStatus('idle');
  };

  const handleAboutMeChange = (aboutMe: string) => {
    setCurrentData(prev => ({ ...prev, aboutMe }));
    setSaveStatus('idle');
  };

  const handleExperienceChange = (type: ExperienceType, data: any[]) => {
    setCurrentData(prev => ({ ...prev, [type]: data }));
    setSaveStatus('idle');
  };

  const handleSave = () => {
    setSaveStatus('saving');
    onSave(currentData);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 1500);
  };

  const addExperience = (type: ExperienceType) => {
    const newItem = createNewExperienceItem(type);
    const currentItems = currentData[type] as any[];
    setCurrentData(prev => ({
      ...prev,
      [type]: [...currentItems, newItem]
    }));
    setSaveStatus('idle');
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

  const handleResumeDataParsed = (parsedData: ProfileData) => {
    setCurrentData(parsedData);
    setSaveStatus('idle');
  };

  return (
    <div>
      <ResumeUpload
        onDataParsed={handleResumeDataParsed}
        currentProfile={currentData}
      />

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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            style={{ fontSize: '16px', padding: '12px 24px' }}
            disabled={saveStatus === 'saving'}
          >
            {saveStatus === 'saving' ? 'Saving...' : 'Save Profile'}
          </button>
          {saveStatus === 'saved' && (
            <span style={{ color: '#059669', fontSize: '14px', fontWeight: '500' }}>
              ✓ Auto-saved
            </span>
          )}
        </div>
        <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '10px' }}>
          Your profile is automatically saved as you type
        </p>
      </div>
    </div>
  );
};

export default ProfileBuilder;