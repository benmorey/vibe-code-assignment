import React, { useState, useEffect } from 'react';
import ProfileBuilder from './components/ProfileBuilder';
import ResumeGenerator from './components/ResumeGenerator';
import JobSearch from './components/JobSearch';
import InterviewTutor from './components/InterviewTutor';
import Settings from './components/Settings';
import SaveStatus from './components/SaveStatus';
import HelpButton from './components/HelpButton';
import ApplicationTracker from './components/ApplicationTracker';
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
  const [activeTab, setActiveTab] = useState<'profile' | 'resume' | 'jobs' | 'interview' | 'tracker' | 'settings'>('profile');
  const [profileData, setProfileData] = useState<ProfileData>(defaultProfile);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showSaveStatus, setShowSaveStatus] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [fadeKey, setFadeKey] = useState(0);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const saved = StorageService.loadProfile();
    if (saved) {
      setProfileData(saved);
      console.log('Profile loaded from storage');
    }

    // Load dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode !== null) {
      setDarkMode(savedDarkMode === 'true');
    }
  }, []);

  useEffect(() => {
    // Apply dark mode class to body
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  const handleDarkModeToggle = (enabled: boolean) => {
    setDarkMode(enabled);
    localStorage.setItem('darkMode', String(enabled));
  };

  const saveProfile = (data: ProfileData, triggerFade: boolean = false) => {
    setProfileData(data);
    try {
      StorageService.saveProfile(data);
      const now = new Date();
      setLastSaved(now);
      setShowSaveStatus(true);
      setTimeout(() => setShowSaveStatus(false), 3000);
      // Trigger fade-in animation only when explicitly requested (e.g., PDF import)
      if (triggerFade) {
        setFadeKey(prev => prev + 1);
      }
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

  const clearProfile = () => {
    if (window.confirm('Are you sure you want to clear your entire profile? This cannot be undone.')) {
      setProfileData(defaultProfile);
      StorageService.saveProfile(defaultProfile);
      setLastSaved(new Date());
      setShowSaveStatus(true);
      setTimeout(() => setShowSaveStatus(false), 3000);
      // Trigger a re-render to show the PDF importer again
      window.location.reload();
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
      <HelpButton />

      <div className="sidebar">
        <div style={{ padding: '20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #16442d 0%, #3a855b 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFB',
            fontSize: '20px',
            fontWeight: '600',
            flexShrink: 0
          }}>
            {profileData.personalInfo.name ? profileData.personalInfo.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#003a1d', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {profileData.personalInfo.name || 'User'}
            </div>
            <div style={{ fontSize: '13px', color: '#3a855b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {profileData.personalInfo.email || 'user@example.com'}
            </div>
          </div>
        </div>

        <div style={{ padding: '0 20px', marginBottom: '20px' }}>
          <button className="btn btn-secondary" onClick={exportProfile} style={{ width: '100%', marginBottom: '10px' }}>
            Export Profile
          </button>
          <label
            className="btn btn-secondary"
            style={{ cursor: 'pointer', margin: 0, width: '100%', display: 'block', textAlign: 'center', marginBottom: '10px' }}
            onClick={(e) => {
              if (activeTab === 'profile') {
                // Trigger the PDF importer in ProfileBuilder
                const fileInput = document.querySelector('input[type="file"][accept=".pdf"]') as HTMLInputElement;
                if (fileInput) {
                  fileInput.click();
                }
                e.preventDefault();
              } else {
                // Switch to profile tab first
                setActiveTab('profile');
                e.preventDefault();
                setTimeout(() => {
                  const fileInput = document.querySelector('input[type="file"][accept=".pdf"]') as HTMLInputElement;
                  if (fileInput) {
                    fileInput.click();
                  }
                }, 100);
              }
            }}
          >
            Populate with Resume
          </label>
          <button className="btn btn-danger" onClick={clearProfile} style={{ width: '100%' }}>
            Clear Profile
          </button>
        </div>

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
            className={`tab ${activeTab === 'jobs' ? 'active' : ''}`}
            onClick={() => setActiveTab('jobs')}
          >
            Job Search
          </button>
          <button
            className={`tab ${activeTab === 'tracker' ? 'active' : ''}`}
            onClick={() => setActiveTab('tracker')}
          >
            Application Tracker
          </button>
          <button
            className={`tab ${activeTab === 'interview' ? 'active' : ''}`}
            onClick={() => setActiveTab('interview')}
          >
            Interview Tutor
          </button>
        </div>

        <div style={{ padding: '20px', marginTop: 'auto', borderTop: '1px solid #e5e7eb' }}>
          <button
            className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
            style={{ width: '100%' }}
          >
            Settings
          </button>
        </div>
      </div>

      <div className="main-content">
        <div key={`${activeTab}-${fadeKey}`} className="page-transition">
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

          {activeTab === 'jobs' && (
            <JobSearch
              profileData={profileData}
              onJobSelect={(job) => {
                setSelectedJob(job);
                alert(`Job selected: ${job.title} at ${job.company}\n\nYou can now generate a custom resume for this position!`);
              }}
            />
          )}

          {activeTab === 'tracker' && (
            <ApplicationTracker />
          )}

          {activeTab === 'interview' && (
            <InterviewTutor
              profileData={profileData}
            />
          )}

          {activeTab === 'settings' && (
            <Settings
              darkMode={darkMode}
              onDarkModeToggle={handleDarkModeToggle}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;