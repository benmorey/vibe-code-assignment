import React from 'react';

interface SaveStatusProps {
  lastSaved: Date | null;
  isAutoSave?: boolean;
}

const SaveStatus: React.FC<SaveStatusProps> = ({ lastSaved, isAutoSave = false }) => {
  if (!lastSaved) return null;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: isAutoSave ? '#10b981' : '#3b82f6',
      color: 'white',
      padding: '8px 16px',
      borderRadius: '6px',
      fontSize: '14px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      zIndex: 1000,
      animation: 'fadeInOut 3s ease-in-out'
    }}>
      ✓ {isAutoSave ? 'Auto-saved' : 'Saved'} at {formatTime(lastSaved)}
      <style>{`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(-10px); }
          15% { opacity: 1; transform: translateY(0); }
          85% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
};

export default SaveStatus;