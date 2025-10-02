import React, { useState, useRef, useEffect } from 'react';
import { ProfileData } from '../types';
import { downloadResumePDF } from '../services/pdfService';
import { ResumeImprovementSuggestion } from '../services/aiResumeEditor';

interface EditableResumePreviewProps {
  profileData: ProfileData;
  isCustomized: boolean;
  onProfileUpdate: (updatedProfile: ProfileData) => void;
  improvements?: ResumeImprovementSuggestion[];
}

const EditableResumePreview: React.FC<EditableResumePreviewProps> = ({
  profileData,
  isCustomized,
  onProfileUpdate,
  improvements = []
}) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string>('');
  const editRef = useRef<HTMLTextAreaElement>(null);

  // Helper function to find all improvements that match text content
  const findMatchingImprovements = (value: string): ResumeImprovementSuggestion[] => {
    if (!value || !improvements.length) return [];

    const cleanValue = value.toLowerCase().trim();
    const matches: ResumeImprovementSuggestion[] = [];

    improvements.forEach(imp => {
      const originalText = imp.original.toLowerCase().trim();

      // Check if the improvement text is contained within the value
      if (cleanValue.includes(originalText) || originalText.includes(cleanValue)) {
        matches.push(imp);
      }
    });

    return matches;
  };

  // Helper function to highlight text content with problematic phrases
  const highlightText = (text: string, fieldPath: string): React.ReactNode => {
    if (!text || !improvements.length) {
      return text;
    }

    const matchingImprovements = findMatchingImprovements(text);
    if (matchingImprovements.length === 0) {
      return text;
    }

    let highlightedText = text;
    const highlights: Array<{ start: number; end: number; improvement: ResumeImprovementSuggestion }> = [];

    // Find all positions where improvements should be highlighted
    matchingImprovements.forEach(improvement => {
      const originalText = improvement.original;
      const regex = new RegExp(originalText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      let match;

      while ((match = regex.exec(text)) !== null) {
        highlights.push({
          start: match.index,
          end: match.index + match[0].length,
          improvement
        });
      }
    });

    // Sort highlights by position
    highlights.sort((a, b) => a.start - b.start);

    if (highlights.length === 0) {
      return text;
    }

    // Create highlighted text elements
    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    highlights.forEach((highlight, index) => {
      // Add text before highlight
      if (highlight.start > lastIndex) {
        elements.push(text.substring(lastIndex, highlight.start));
      }

      // Add highlighted text
      const highlightedPortion = text.substring(highlight.start, highlight.end);
      const colors = getHighlightColors(highlight.improvement.impact);

      elements.push(
        <span
          key={`${fieldPath}-highlight-${index}`}
          style={{
            backgroundColor: colors.background,
            color: colors.color,
            padding: '2px 4px',
            borderRadius: '3px',
            border: `1px solid ${colors.border}`,
            fontWeight: 'bold',
            position: 'relative',
            cursor: 'pointer'
          }}
          title={`${colors.icon} ${highlight.improvement.impact.toUpperCase()}: ${highlight.improvement.reason}`}
          onClick={(e) => {
            e.stopPropagation();
            startEdit(fieldPath, text);
          }}
        >
          <span style={{ marginRight: '2px', fontSize: '10px' }}>{colors.icon}</span>
          {highlightedPortion}
        </span>
      );

      lastIndex = highlight.end;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      elements.push(text.substring(lastIndex));
    }

    return elements;
  };

  // Get highlighting colors based on impact level
  const getHighlightColors = (impact: string) => {
    switch (impact) {
      case 'high':
        return {
          background: '#fef2f2',
          border: '#dc2626',
          color: '#7f1d1d',
          icon: '🚨'
        };
      case 'medium':
        return {
          background: '#fffbeb',
          border: '#f59e0b',
          color: '#92400e',
          icon: '⚠️'
        };
      case 'low':
        return {
          background: '#f0fdf4',
          border: '#22c55e',
          color: '#166534',
          icon: '💡'
        };
      default:
        return {
          background: '#fef2f2',
          border: '#dc2626',
          color: '#7f1d1d',
          icon: '🚨'
        };
    }
  };

  useEffect(() => {
    if (editingField && editRef.current) {
      editRef.current.focus();
      editRef.current.select();
    }
  }, [editingField]);

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

  const startEdit = (fieldPath: string, currentValue: string) => {
    setEditingField(fieldPath);
    setTempValue(currentValue);
  };

  const saveEdit = () => {
    if (!editingField) return;

    const updatedProfile = { ...profileData };
    const pathParts = editingField.split('.');

    if (pathParts[0] === 'personalInfo') {
      (updatedProfile.personalInfo as any)[pathParts[1]] = tempValue;
    } else if (pathParts[0] === 'aboutMe') {
      updatedProfile.aboutMe = tempValue;
    } else if (pathParts[0] === 'workExperience') {
      const index = parseInt(pathParts[1]);
      if (pathParts[2] === 'description') {
        const descIndex = parseInt(pathParts[3]);
        updatedProfile.workExperience[index].description[descIndex] = tempValue;
      } else {
        (updatedProfile.workExperience[index] as any)[pathParts[2]] = tempValue;
      }
    } else if (pathParts[0] === 'projects') {
      const index = parseInt(pathParts[1]);
      (updatedProfile.projects[index] as any)[pathParts[2]] = tempValue;
    } else if (pathParts[0] === 'education') {
      const index = parseInt(pathParts[1]);
      (updatedProfile.education[index] as any)[pathParts[2]] = tempValue;
    }

    onProfileUpdate(updatedProfile);
    setEditingField(null);
    setTempValue('');
  };

  const cancelEdit = () => {
    setEditingField(null);
    setTempValue('');
  };

  const EditableText: React.FC<{
    fieldPath: string;
    value: string;
    multiline?: boolean;
    style?: React.CSSProperties;
    placeholder?: string;
  }> = ({ fieldPath, value, multiline = false, style, placeholder }) => {
    const isEditing = editingField === fieldPath;

    if (isEditing) {
      return (
        <div style={{ position: 'relative' }}>
          {multiline ? (
            <textarea
              ref={editRef}
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              onBlur={saveEdit}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  saveEdit();
                } else if (e.key === 'Escape') {
                  cancelEdit();
                }
              }}
              style={{
                ...style,
                width: '100%',
                minHeight: '60px',
                border: '2px solid #3b82f6',
                borderRadius: '4px',
                padding: '8px',
                fontSize: 'inherit',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
              placeholder={placeholder}
            />
          ) : (
            <input
              ref={editRef as any}
              type="text"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              onBlur={saveEdit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  saveEdit();
                } else if (e.key === 'Escape') {
                  cancelEdit();
                }
              }}
              style={{
                ...style,
                width: '100%',
                border: '2px solid #3b82f6',
                borderRadius: '4px',
                padding: '4px 8px',
                fontSize: 'inherit',
                fontFamily: 'inherit'
              }}
              placeholder={placeholder}
            />
          )}
          <div style={{
            position: 'absolute',
            bottom: '-20px',
            left: '0',
            fontSize: '11px',
            color: '#666'
          }}>
            Press Enter to save, Esc to cancel
          </div>
        </div>
      );
    }

    // Use text highlighting to show specific words/sentences that need improvement
    return (
      <span
        onClick={() => startEdit(fieldPath, value)}
        style={{
          ...style,
          cursor: 'pointer',
          padding: '2px 4px',
          borderRadius: '3px',
          transition: 'background-color 0.2s',
          display: 'inline-block',
          lineHeight: '1.5'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        title="Click to edit"
      >
        {value ? highlightText(value, fieldPath) : (
          <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>
            {placeholder}
          </span>
        )}
      </span>
    );
  };

  return (
    <div>
      {/* CSS Animations for highlighting */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.8; }
          }

          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-3px); }
            60% { transform: translateY(-2px); }
          }

          .highlight-flash {
            animation: highlightFlash 3s ease-in-out;
          }

          @keyframes highlightFlash {
            0% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7); }
            50% { box-shadow: 0 0 0 10px rgba(220, 38, 38, 0); }
            100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
          }
        `}
      </style>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h3 style={{ margin: 0, color: '#1f2937' }}>
            {isCustomized ? 'AI-Customized Resume' : 'Editable Resume Preview'}
          </h3>
          {isCustomized && (
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#059669' }}>
              ✓ Optimized for job requirements
            </p>
          )}
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#3b82f6' }}>
            📝 Click any text to edit inline
          </p>
          {improvements.length > 0 && (
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#dc2626', fontWeight: 'bold' }}>
              🎯 Problematic text highlighted in resume content
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
          <div className="resume-name">
            <EditableText
              fieldPath="personalInfo.name"
              value={profileData.personalInfo.name}
              placeholder="Your Name"
              style={{ fontSize: '24px', fontWeight: 'bold' }}
            />
          </div>
          <div className="resume-contact">
            <EditableText
              fieldPath="personalInfo.email"
              value={profileData.personalInfo.email}
              placeholder="email@example.com"
            />
            {' • '}
            <EditableText
              fieldPath="personalInfo.phone"
              value={profileData.personalInfo.phone}
              placeholder="(555) 123-4567"
            />
            {' • '}
            <EditableText
              fieldPath="personalInfo.location"
              value={profileData.personalInfo.location}
              placeholder="City, State"
            />
            {(profileData.personalInfo.linkedin || editingField === 'personalInfo.linkedin') && (
              <>
                <br />
                LinkedIn: <EditableText
                  fieldPath="personalInfo.linkedin"
                  value={profileData.personalInfo.linkedin}
                  placeholder="linkedin.com/in/yourprofile"
                />
              </>
            )}
            {(profileData.personalInfo.portfolio || editingField === 'personalInfo.portfolio') && (
              <>
                {!profileData.personalInfo.linkedin ? <br /> : ' • '}
                Portfolio: <EditableText
                  fieldPath="personalInfo.portfolio"
                  value={profileData.personalInfo.portfolio}
                  placeholder="yourportfolio.com"
                />
              </>
            )}
          </div>
        </div>

        {/* Education */}
        {profileData.education.length > 0 && (
          <div className="resume-section">
            <div className="resume-section-title">Education</div>
            {profileData.education.map((edu, eduIndex) => (
              <div key={edu.id} className="resume-item">
                <div className="resume-item-header">
                  <span>
                    <strong>
                      <EditableText
                        fieldPath={`education.${eduIndex}.degree`}
                        value={edu.degree}
                        placeholder="Degree"
                      />
                      {' in '}
                      <EditableText
                        fieldPath={`education.${eduIndex}.field`}
                        value={edu.field}
                        placeholder="Field of Study"
                      />
                    </strong>
                  </span>
                  <span>{formatDate(edu.startDate)} - {formatDate(edu.endDate)}</span>
                </div>
                <div className="resume-item-subtitle">
                  <EditableText
                    fieldPath={`education.${eduIndex}.institution`}
                    value={edu.institution}
                    placeholder="Institution Name"
                  />
                  {edu.gpa && ` • GPA: ${edu.gpa}`}
                </div>
                {(edu.description || editingField === `education.${eduIndex}.description`) && (
                  <EditableText
                    fieldPath={`education.${eduIndex}.description`}
                    value={edu.description || ''}
                    multiline={true}
                    placeholder="Additional details about your education..."
                    style={{ margin: '5px 0', display: 'block' }}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Work Experience */}
        {profileData.workExperience.length > 0 && (
          <div className="resume-section">
            <div className="resume-section-title">Professional Experience</div>
            {profileData.workExperience.map((work, workIndex) => (
              <div key={work.id} className="resume-item">
                <div className="resume-item-header">
                  <span>
                    <strong>
                      <EditableText
                        fieldPath={`workExperience.${workIndex}.position`}
                        value={work.position}
                        placeholder="Job Title"
                      />
                    </strong>
                    {' at '}
                    <EditableText
                      fieldPath={`workExperience.${workIndex}.company`}
                      value={work.company}
                      placeholder="Company Name"
                    />
                  </span>
                  <span>{formatDate(work.startDate)} - {formatDate(work.endDate)}</span>
                </div>
                <div className="resume-item-subtitle">
                  <EditableText
                    fieldPath={`workExperience.${workIndex}.location`}
                    value={work.location}
                    placeholder="City, State"
                  />
                </div>
                <ul style={{ marginLeft: '20px', marginTop: '5px' }}>
                  {work.description.map((point, pointIndex) => (
                    <li key={pointIndex} style={{ marginBottom: '3px' }}>
                      <EditableText
                        fieldPath={`workExperience.${workIndex}.description.${pointIndex}`}
                        value={point}
                        placeholder="Describe your achievement or responsibility..."
                      />
                    </li>
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
            {profileData.projects.map((project, projectIndex) => (
              <div key={project.id} className="resume-item">
                <div className="resume-item-header">
                  <span>
                    <strong>
                      <EditableText
                        fieldPath={`projects.${projectIndex}.name`}
                        value={project.name}
                        placeholder="Project Name"
                      />
                    </strong>
                  </span>
                  <span>{formatDate(project.startDate)} - {formatDate(project.endDate || '')}</span>
                </div>
                {project.technologies.length > 0 && (
                  <div className="resume-item-subtitle">
                    Technologies: {project.technologies.join(', ')}
                  </div>
                )}
                <EditableText
                  fieldPath={`projects.${projectIndex}.description`}
                  value={project.description}
                  multiline={true}
                  placeholder="Describe the project, your role, and the impact..."
                  style={{ margin: '5px 0', display: 'block' }}
                />
                {project.link && (
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    Link: {project.link}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {profileData.skills.length > 0 && (
          <div className="resume-section">
            <div className="resume-section-title">Skills</div>
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
                  <span>{formatDate(volunteer.startDate)} - {formatDate(volunteer.endDate)}</span>
                </div>
                <p style={{ margin: '5px 0' }}>{volunteer.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* About Me */}
        <div className="resume-section">
          <div className="resume-section-title">About Me</div>
          <EditableText
            fieldPath="aboutMe"
            value={profileData.aboutMe}
            multiline={true}
            placeholder="Write a compelling summary that highlights your key achievements and value proposition..."
            style={{
              margin: 0,
              textAlign: 'justify',
              display: 'block',
              minHeight: profileData.aboutMe ? 'auto' : '60px',
              lineHeight: '1.5'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default EditableResumePreview;