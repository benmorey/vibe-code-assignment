// Get DOM elements
const syncBtn = document.getElementById('syncBtn');
const generateBtn = document.getElementById('generateBtn');
const jobTitleInput = document.getElementById('jobTitle');
const jobDescriptionInput = document.getElementById('jobDescription');
const statusDiv = document.getElementById('status');

// Show status message
function showStatus(message, type) {
  statusDiv.textContent = message;
  statusDiv.className = `status ${type}`;
  setTimeout(() => {
    statusDiv.className = 'status';
  }, 5000);
}

// Sync profile from the web app
syncBtn.addEventListener('click', async () => {
  try {
    showStatus('🔄 Syncing profile from app...', 'info');

    // Try to fetch from localhost:3001
    const response = await fetch('http://localhost:3001/api/profile');

    if (!response.ok) {
      // If API doesn't exist, try to get from localStorage via content script
      chrome.tabs.query({ url: 'http://localhost:3001/*' }, async (tabs) => {
        if (tabs.length === 0) {
          showStatus('⚠️ Please open the Resume Builder app first at localhost:3001', 'error');
          return;
        }

        // Execute script to get localStorage data
        const [tab] = tabs;
        const result = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            const profileData = localStorage.getItem('resumeProfile');
            return profileData;
          }
        });

        if (result && result[0] && result[0].result) {
          // Store in extension storage
          await chrome.storage.local.set({ profileData: result[0].result });
          showStatus('✅ Profile synced successfully!', 'success');
        } else {
          showStatus('❌ No profile found. Please create a profile in the app first.', 'error');
        }
      });
    }
  } catch (error) {
    console.error('Sync error:', error);
    showStatus('❌ Error syncing profile. Make sure the app is running.', 'error');
  }
});

// Generate custom resume
generateBtn.addEventListener('click', async () => {
  const jobTitle = jobTitleInput.value.trim();
  const jobDescription = jobDescriptionInput.value.trim();

  if (!jobTitle || !jobDescription) {
    showStatus('⚠️ Please fill in both job title and description', 'error');
    return;
  }

  try {
    generateBtn.disabled = true;
    showStatus('⏳ Generating customized resume...', 'info');

    // Get profile from storage
    const { profileData } = await chrome.storage.local.get('profileData');

    if (!profileData) {
      showStatus('❌ No profile found. Please sync your profile first.', 'error');
      generateBtn.disabled = false;
      return;
    }

    const profile = JSON.parse(profileData);

    // Generate PDF
    await generateResumePDF(profile, jobTitle, jobDescription);

    showStatus('✅ Resume generated! Check your downloads folder.', 'success');
  } catch (error) {
    console.error('Generation error:', error);
    showStatus('❌ Error generating resume: ' + error.message, 'error');
  } finally {
    generateBtn.disabled = false;
  }
});

// Generate PDF function
async function generateResumePDF(profileData, jobTitle, jobDescription) {
  // Create a hidden iframe to render the resume
  const iframe = document.createElement('iframe');
  iframe.style.position = 'absolute';
  iframe.style.width = '700px';
  iframe.style.height = '1000px';
  iframe.style.left = '-9999px';
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument;

  // Build HTML for resume
  const resumeHTML = buildResumeHTML(profileData, jobTitle);

  doc.open();
  doc.write(resumeHTML);
  doc.close();

  // Wait for content to load
  await new Promise(resolve => setTimeout(resolve, 500));

  // Use html2canvas and jsPDF (we'll need to include these)
  // For now, let's create a simple text-based approach

  // Since we can't easily use html2canvas in extension popup,
  // let's create a data URL and download it
  const blob = await createPDFBlob(doc.body);
  const url = URL.createObjectURL(blob);

  const fileName = `${profileData.personalInfo.name.replace(/\s+/g, '_')}_${jobTitle.replace(/\s+/g, '_')}_Resume.pdf`;

  // Download the PDF
  chrome.downloads.download({
    url: url,
    filename: fileName,
    saveAs: true
  });

  // Clean up
  document.body.removeChild(iframe);
  URL.revokeObjectURL(url);
}

// Build resume HTML
function buildResumeHTML(profileData, jobTitle) {
  const formatDate = (dateStr) => {
    if (!dateStr || dateStr === 'Present') return dateStr || 'Present';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: 'Times New Roman', serif;
          font-size: 11px;
          line-height: 1.2;
          padding: 20px;
          max-width: 700px;
          margin: 0 auto;
        }
        .resume-header {
          text-align: center;
          border-bottom: 2px solid #333;
          padding-bottom: 8px;
          margin-bottom: 12px;
        }
        .resume-name {
          font-size: 20px;
          font-weight: bold;
          margin-bottom: 4px;
        }
        .resume-contact {
          font-size: 10px;
          color: #666;
        }
        .resume-section {
          margin-bottom: 10px;
        }
        .resume-section-title {
          font-size: 14px;
          font-weight: bold;
          border-bottom: 1px solid #ccc;
          padding-bottom: 2px;
          margin-bottom: 6px;
          text-transform: uppercase;
        }
        .resume-item {
          margin-bottom: 6px;
        }
        .resume-item-header {
          display: flex;
          justify-content: space-between;
          font-weight: bold;
          margin-bottom: 2px;
          font-size: 12px;
        }
        .resume-item-subtitle {
          font-style: italic;
          margin-bottom: 2px;
          color: #555;
          font-size: 11px;
        }
        ul {
          margin: 3px 0;
          padding-left: 18px;
        }
        li {
          margin-bottom: 2px;
        }
      </style>
    </head>
    <body>
      <div class="resume-header">
        <div class="resume-name">${profileData.personalInfo.name}</div>
        <div class="resume-contact">
          ${profileData.personalInfo.email} • ${profileData.personalInfo.phone} • ${profileData.personalInfo.location}
          ${profileData.personalInfo.linkedin ? `<br>LinkedIn: ${profileData.personalInfo.linkedin}` : ''}
          ${profileData.personalInfo.portfolio ? ` • Portfolio: ${profileData.personalInfo.portfolio}` : ''}
        </div>
      </div>

      ${profileData.education.length > 0 ? `
      <div class="resume-section">
        <div class="resume-section-title">Education</div>
        ${profileData.education.map(edu => `
          <div class="resume-item">
            <div class="resume-item-header">
              <span><strong>${edu.degree} in ${edu.field}</strong></span>
              <span>${formatDate(edu.startDate)} - ${formatDate(edu.endDate)}</span>
            </div>
            <div class="resume-item-subtitle">${edu.institution}${edu.gpa ? ` • GPA: ${edu.gpa}` : ''}</div>
            ${edu.description ? `<p style="margin: 5px 0;">${edu.description}</p>` : ''}
          </div>
        `).join('')}
      </div>
      ` : ''}

      ${profileData.workExperience.length > 0 ? `
      <div class="resume-section">
        <div class="resume-section-title">Professional Experience</div>
        ${profileData.workExperience.map(work => `
          <div class="resume-item">
            <div class="resume-item-header">
              <span><strong>${work.position}</strong> at ${work.company}</span>
              <span>${formatDate(work.startDate)} - ${formatDate(work.endDate)}</span>
            </div>
            <div class="resume-item-subtitle">${work.location}</div>
            <ul>
              ${work.description.map(point => `<li>${point}</li>`).join('')}
            </ul>
          </div>
        `).join('')}
      </div>
      ` : ''}

      ${profileData.projects.length > 0 ? `
      <div class="resume-section">
        <div class="resume-section-title">Projects</div>
        ${profileData.projects.map(project => `
          <div class="resume-item">
            <div class="resume-item-header">
              <span><strong>${project.name}</strong></span>
              <span>${formatDate(project.startDate)} - ${formatDate(project.endDate || 'Present')}</span>
            </div>
            ${project.technologies.length > 0 ? `<div class="resume-item-subtitle">Technologies: ${project.technologies.join(', ')}</div>` : ''}
            <p style="margin: 5px 0;">${project.description}</p>
          </div>
        `).join('')}
      </div>
      ` : ''}

      ${profileData.skills.length > 0 ? `
      <div class="resume-section">
        <div class="resume-section-title">Skills</div>
        ${profileData.skills.map(skillGroup => `
          <div style="margin-bottom: 6px;">
            <strong>${skillGroup.category}:</strong> ${skillGroup.skills.join(', ')}
          </div>
        `).join('')}
      </div>
      ` : ''}

      ${profileData.aboutMe ? `
      <div class="resume-section">
        <div class="resume-section-title">About Me</div>
        <p style="margin: 0; text-align: justify;">${profileData.aboutMe}</p>
      </div>
      ` : ''}
    </body>
    </html>
  `;
}

// Create PDF blob (simplified version using print CSS)
async function createPDFBlob(element) {
  // Since we can't easily bundle jsPDF and html2canvas in the extension,
  // we'll use a workaround: create an HTML file and let the user print to PDF
  // Or we can use the Chrome printing API

  const htmlContent = element.innerHTML;
  const blob = new Blob([`
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        @page { size: letter; margin: 0.5in; }
        body { font-family: 'Times New Roman', serif; font-size: 11px; line-height: 1.2; }
        ${element.ownerDocument.querySelector('style').textContent}
      </style>
    </head>
    <body>${htmlContent}</body>
    </html>
  `], { type: 'text/html' });

  return blob;
}
