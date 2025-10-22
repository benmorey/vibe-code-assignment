import React, { useState, useEffect } from 'react';
import { ProfileData, ExperienceType } from '../types';
import PersonalInfoForm from './PersonalInfoForm';
import AboutMeForm from './AboutMeForm';
import ExperienceSection from './ExperienceSection';
import AddExperienceDropdown from './AddExperienceDropdown';
import PDFImporter from './PDFImporter';

interface ProfileBuilderProps {
  profileData: ProfileData;
  onSave: (data: ProfileData, triggerFade?: boolean) => void;
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

  const handlePDFImport = (importedProfile: Partial<ProfileData>) => {
    console.log('Importing profile data from PDF:', importedProfile);

    // Merge imported data with current data, preserving existing data where imported data is empty
    const mergedData: ProfileData = {
      personalInfo: {
        ...currentData.personalInfo,
        ...importedProfile.personalInfo
      },
      aboutMe: importedProfile.aboutMe || currentData.aboutMe,
      education: importedProfile.education && importedProfile.education.length > 0
        ? importedProfile.education
        : currentData.education,
      workExperience: importedProfile.workExperience && importedProfile.workExperience.length > 0
        ? importedProfile.workExperience
        : currentData.workExperience,
      projects: importedProfile.projects && importedProfile.projects.length > 0
        ? importedProfile.projects
        : currentData.projects,
      volunteerWork: importedProfile.volunteerWork && importedProfile.volunteerWork.length > 0
        ? importedProfile.volunteerWork
        : currentData.volunteerWork,
      skills: importedProfile.skills && importedProfile.skills.length > 0
        ? importedProfile.skills
        : currentData.skills
    };

    setCurrentData(mergedData);
    setSaveStatus('idle');

    // Auto-save the imported data with fade-in animation
    setTimeout(() => {
      onSave(mergedData, true);
    }, 100);
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

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <PDFImporter onProfileImported={handlePDFImport} />

      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#1f2937', marginBottom: '8px' }}>
          Build Your Profile
        </h1>
        <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '24px' }}>
          Create a comprehensive professional profile to generate tailored resumes
        </p>
      </div>

      <div className="card">
        <div style={{ borderBottom: '2px solid #f3f4f6', paddingBottom: '16px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
            Personal Information
          </h2>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>
            Basic contact details and professional links
          </p>
        </div>
        <PersonalInfoForm
          data={currentData.personalInfo}
          onChange={handlePersonalInfoChange}
        />
      </div>

      <div className="card">
        <div style={{ borderBottom: '2px solid #f3f4f6', paddingBottom: '16px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
            About Me
          </h2>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>
            A brief professional summary or personal statement
          </p>
        </div>
        <AboutMeForm
          data={currentData.aboutMe}
          onChange={handleAboutMeChange}
        />
      </div>

      <div className="card">
        <div style={{ borderBottom: '2px solid #f3f4f6', paddingBottom: '16px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
              Experience & Skills
            </h2>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>
              Add your education, work history, projects, and skills
            </p>
          </div>
          <AddExperienceDropdown onAdd={addExperience} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
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
      </div>

      <div style={{ textAlign: 'center', marginTop: '40px', marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            style={{ fontSize: '16px', padding: '14px 32px', borderRadius: '8px' }}
            disabled={saveStatus === 'saving'}
          >
            {saveStatus === 'saving' ? 'Saving...' : 'Save Profile'}
          </button>
          {saveStatus === 'saved' && (
            <span style={{ color: '#059669', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '18px' }}>✓</span> Auto-saved
            </span>
          )}
        </div>
        <p style={{ fontSize: '13px', color: '#9ca3af', marginTop: '12px' }}>
          Your profile is automatically saved as you type
        </p>
      </div>
    </div>
  );
};

export default ProfileBuilder;