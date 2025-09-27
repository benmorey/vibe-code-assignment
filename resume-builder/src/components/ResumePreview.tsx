import React from 'react';
import { ProfileData } from '../types';
import { downloadResumePDF } from '../services/pdfService';

interface ResumePreviewProps {
  profileData: ProfileData;
  isCustomized: boolean;
}

const ResumePreview: React.FC<ResumePreviewProps> = ({ profileData, isCustomized }) => {
  const handleDownloadPDF = async () => {
    try {
      await downloadResumePDF(profileData);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF. Please try again.');
    }
  };

  const formatDate = (date: string) => {
    if (!date) return 'Present';
    const [year, month] = date.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h3 style={{ margin: 0, color: '#1f2937' }}>
            {isCustomized ? 'AI-Customized Resume' : 'Resume Preview'}
          </h3>
          {isCustomized && (
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#059669' }}>
              ✓ Optimized for job requirements
            </p>
          )}
        </div>
        <button
          className="btn btn-primary"
          onClick={handleDownloadPDF}
        >
          Download PDF
        </button>
      </div>

      <div id="resume-content" className="resume-preview">
        {/* Header */}
        <div className="resume-header">
          <div className="resume-name">{profileData.personalInfo.name}</div>
          <div className="resume-contact">
            {profileData.personalInfo.email} • {profileData.personalInfo.phone} • {profileData.personalInfo.location}
            {profileData.personalInfo.linkedin && (
              <>
                <br />
                LinkedIn: {profileData.personalInfo.linkedin}
              </>
            )}
            {profileData.personalInfo.portfolio && (
              <>
                {!profileData.personalInfo.linkedin ? <br /> : ' • '}
                Portfolio: {profileData.personalInfo.portfolio}
              </>
            )}
          </div>
        </div>

        {/* About Me / Professional Summary */}
        {profileData.aboutMe && (
          <div className="resume-section">
            <div className="resume-section-title">Professional Summary</div>
            <p style={{ margin: 0, textAlign: 'justify' }}>{profileData.aboutMe}</p>
          </div>
        )}

        {/* Work Experience */}
        {profileData.workExperience.length > 0 && (
          <div className="resume-section">
            <div className="resume-section-title">Professional Experience</div>
            {profileData.workExperience.map((work) => (
              <div key={work.id} className="resume-item">
                <div className="resume-item-header">
                  <span><strong>{work.position}</strong> at {work.company}</span>
                  <span>{formatDate(work.startDate)} - {formatDate(work.endDate)}</span>
                </div>
                <div className="resume-item-subtitle">{work.location}</div>
                <ul style={{ marginLeft: '20px', marginTop: '5px' }}>
                  {work.description.map((point, index) => (
                    <li key={index} style={{ marginBottom: '3px' }}>{point}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Projects */}
        {profileData.projects.length > 0 && (
          <div className="resume-section">
            <div className="resume-section-title">Projects</div>
            {profileData.projects.map((project) => (
              <div key={project.id} className="resume-item">
                <div className="resume-item-header">
                  <span><strong>{project.name}</strong></span>
                  <span>{formatDate(project.startDate)} - {formatDate(project.endDate || '')}</span>
                </div>
                {project.technologies.length > 0 && (
                  <div className="resume-item-subtitle">
                    Technologies: {project.technologies.join(', ')}
                  </div>
                )}
                <p style={{ margin: '5px 0' }}>{project.description}</p>
                {project.link && (
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    Link: {project.link}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {profileData.education.length > 0 && (
          <div className="resume-section">
            <div className="resume-section-title">Education</div>
            {profileData.education.map((edu) => (
              <div key={edu.id} className="resume-item">
                <div className="resume-item-header">
                  <span><strong>{edu.degree} in {edu.field}</strong></span>
                  <span>{formatDate(edu.startDate)} - {formatDate(edu.endDate)}</span>
                </div>
                <div className="resume-item-subtitle">
                  {edu.institution}
                  {edu.gpa && ` • GPA: ${edu.gpa}`}
                </div>
                {edu.description && (
                  <p style={{ margin: '5px 0' }}>{edu.description}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {profileData.skills.length > 0 && (
          <div className="resume-section">
            <div className="resume-section-title">Technical Skills</div>
            {profileData.skills.map((skillGroup) => (
              <div key={skillGroup.id} style={{ marginBottom: '8px' }}>
                <strong>{skillGroup.category}:</strong> {skillGroup.skills.join(', ')}
              </div>
            ))}
          </div>
        )}

        {/* Volunteer Work */}
        {profileData.volunteerWork.length > 0 && (
          <div className="resume-section">
            <div className="resume-section-title">Volunteer Experience</div>
            {profileData.volunteerWork.map((volunteer) => (
              <div key={volunteer.id} className="resume-item">
                <div className="resume-item-header">
                  <span><strong>{volunteer.role}</strong> at {volunteer.organization}</span>
                  <span>{formatDate(volunteer.startDate)} - {formatDate(volunteer.endDate || '')}</span>
                </div>
                <p style={{ margin: '5px 0' }}>{volunteer.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumePreview;