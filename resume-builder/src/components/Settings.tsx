import React, { useState, useEffect } from 'react';

interface SettingsProps {
  darkMode: boolean;
  onDarkModeToggle: (enabled: boolean) => void;
}

const Settings: React.FC<SettingsProps> = ({ darkMode, onDarkModeToggle }) => {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#1f2937', marginBottom: '8px' }}>
          Settings
        </h1>
        <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '24px' }}>
          Customize your experience
        </p>
      </div>

      <div className="card">
        <div style={{ borderBottom: '2px solid #f3f4f6', paddingBottom: '16px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
            Appearance
          </h2>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>
            Customize how the application looks
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
              Dark Mode
            </h3>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
              Switch between light and dark theme
            </p>
          </div>
          <label style={{ position: 'relative', display: 'inline-block', width: '60px', height: '34px' }}>
            <input
              type="checkbox"
              checked={darkMode}
              onChange={(e) => onDarkModeToggle(e.target.checked)}
              style={{ opacity: 0, width: 0, height: 0 }}
            />
            <span
              style={{
                position: 'absolute',
                cursor: 'pointer',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: darkMode ? '#1f2937' : '#d1d5db',
                transition: '0.4s',
                borderRadius: '34px'
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  content: '',
                  height: '26px',
                  width: '26px',
                  left: darkMode ? '30px' : '4px',
                  bottom: '4px',
                  backgroundColor: 'white',
                  transition: '0.4s',
                  borderRadius: '50%'
                }}
              />
            </span>
          </label>
        </div>
      </div>

      <div className="card">
        <div style={{ borderBottom: '2px solid #f3f4f6', paddingBottom: '16px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
            About
          </h2>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>
            Information about this application
          </p>
        </div>

        <div style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.8' }}>
          <p><strong style={{ color: '#1f2937' }}>Version:</strong> 1.0.0</p>
          <p><strong style={{ color: '#1f2937' }}>Description:</strong> AI-powered resume builder with job search and analysis features</p>
          <p style={{ marginTop: '16px' }}>
            This application helps you create professional resumes tailored to specific job postings using AI technology.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
