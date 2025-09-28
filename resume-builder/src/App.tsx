import React, { useState, useEffect } from 'react';
import ProfileBuilder from './components/ProfileBuilder';
import ResumeGenerator from './components/ResumeGenerator';
import ResumeComparison from './components/ResumeComparison';
import SaveStatus from './components/SaveStatus';
import { ProfileData } from './types';
import { StorageService } from './services/storageService';

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
  const [activeTab, setActiveTab] = useState<'profile' | 'resume' | 'comparison'>('profile');
  const [profileData, setProfileData] = useState<ProfileData>(defaultProfile);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showSaveStatus, setShowSaveStatus] = useState(false);

  useEffect(() => {
    const saved = StorageService.loadProfile();
    if (saved) {
      setProfileData(saved);
      console.log('Profile loaded from storage');
    }
  }, []);

  const saveProfile = (data: ProfileData) => {
    setProfileData(data);
    try {
      StorageService.saveProfile(data);
      const now = new Date();
      setLastSaved(now);
      setShowSaveStatus(true);
      setTimeout(() => setShowSaveStatus(false), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile: ' + (error as Error).message);
    }
  };

  const exportProfile = () => {
    try {
      StorageService.exportProfile(profileData);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export profile.');
    }
  };

  const importProfile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const imported = await StorageService.importProfile(file);
        setProfileData(imported);
        StorageService.saveProfile(imported);
        const now = new Date();
        setLastSaved(now);
        setShowSaveStatus(true);
        setTimeout(() => setShowSaveStatus(false), 3000);
        alert('Profile imported successfully!');
      } catch (error) {
        alert('Import failed: ' + (error as Error).message);
      }
      // Clear the input
      event.target.value = '';
    }
  };

  return (
    <div className="container">
      {showSaveStatus && <SaveStatus lastSaved={lastSaved} isAutoSave={true} />}

      <h1 style={{ textAlign: 'center', marginBottom: '30px', fontSize: '32px', color: '#1f2937' }}>
        AI Resume Builder
      </h1>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div className="tabs" style={{ marginBottom: 0 }}>
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
          <button
            className={`tab ${activeTab === 'comparison' ? 'active' : ''}`}
            onClick={() => setActiveTab('comparison')}
          >
            Resume Analysis
          </button>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button className="btn btn-secondary" onClick={exportProfile}>
            Export Profile
          </button>
          <label className="btn btn-secondary" style={{ cursor: 'pointer', margin: 0 }}>
            Import Profile
            <input
              type="file"
              accept=".json"
              onChange={importProfile}
              style={{ display: 'none' }}
            />
          </label>
        </div>
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

      {activeTab === 'comparison' && (
        <ResumeComparison
          profileData={profileData}
        />
      )}
    </div>
  );
}

export default App;