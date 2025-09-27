import { useState, useEffect } from 'react';
import ProfileBuilder from './components/ProfileBuilder';
import ResumeGenerator from './components/ResumeGenerator';
import { ProfileData } from './types';

const defaultProfile: ProfileData = {
  personalInfo: {
    name: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    portfolio: ''
  },
  aboutMe: '',
  education: [],
  workExperience: [],
  projects: [],
  volunteerWork: [],
  skills: []
};

function App() {
  const [activeTab, setActiveTab] = useState<'profile' | 'resume'>('profile');
  const [profileData, setProfileData] = useState<ProfileData>(defaultProfile);

  useEffect(() => {
    const saved = localStorage.getItem('resumeProfile');
    if (saved) {
      try {
        setProfileData(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading saved profile:', error);
      }
    }
  }, []);

  const saveProfile = (data: ProfileData) => {
    setProfileData(data);
    localStorage.setItem('resumeProfile', JSON.stringify(data));
  };

  return (
    <div className="container">
      <h1 style={{ textAlign: 'center', marginBottom: '30px', fontSize: '32px', color: '#1f2937' }}>
        AI Resume Builder
      </h1>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Build Profile
        </button>
        <button
          className={`tab ${activeTab === 'resume' ? 'active' : ''}`}
          onClick={() => setActiveTab('resume')}
        >
          Generate Resume
        </button>
      </div>

      {activeTab === 'profile' && (
        <ProfileBuilder
          profileData={profileData}
          onSave={saveProfile}
        />
      )}

      {activeTab === 'resume' && (
        <ResumeGenerator
          profileData={profileData}
        />
      )}
    </div>
  );
}

export default App;