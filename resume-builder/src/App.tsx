import React, { useState, useEffect } from 'react';
import ProfileBuilder from './components/ProfileBuilder';
import ResumeGenerator from './components/ResumeGenerator';
import ResumeComparison from './components/ResumeComparison';
import JobSearch from './components/JobSearch';
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
  const [activeTab, setActiveTab] = useState<'profile' | 'resume' | 'comparison' | 'jobs'>('profile');
  const [profileData, setProfileData] = useState<ProfileData>(defaultProfile);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showSaveStatus, setShowSaveStatus] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);

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

      <div className="sidebar">
        <h1 style={{ textAlign: 'center', padding: '0 20px', marginBottom: '30px', fontSize: '28px', color: '#1f2937', fontWeight: '700' }}>
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
          <button
            className={`tab ${activeTab === 'comparison' ? 'active' : ''}`}
            onClick={() => setActiveTab('comparison')}
          >
            Resume Analysis
          </button>
          <button
            className={`tab ${activeTab === 'jobs' ? 'active' : ''}`}
            onClick={() => setActiveTab('jobs')}
          >
            Job Search
          </button>
        </div>

        <div style={{ padding: '20px', marginTop: '30px', borderTop: '1px solid #e5e7eb' }}>
          <button className="btn btn-secondary" onClick={exportProfile} style={{ width: '100%', marginBottom: '10px' }}>
            Export Profile
          </button>
          <label className="btn btn-secondary" style={{ cursor: 'pointer', margin: 0, width: '100%', display: 'block', textAlign: 'center' }}>
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

      <div className="main-content">
        <div className="page-transition">
          {activeTab === 'profile' && (
            <ProfileBuilder
              profileData={profileData}
              onSave={saveProfile}
            />
          )}

          {activeTab === 'resume' && (
            <ResumeGenerator
              profileData={profileData}
              onProfileUpdated={saveProfile}
            />
          )}

          {activeTab === 'comparison' && (
            <ResumeComparison
              profileData={profileData}
            />
          )}

          {activeTab === 'jobs' && (
            <JobSearch
              profileData={profileData}
              onJobSelect={(job) => {
                setSelectedJob(job);
                alert(`Job selected: ${job.title} at ${job.company}\n\nYou can now generate a custom resume for this position!`);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;