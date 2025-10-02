# Resume Builder Chrome Extension

A Chrome extension that generates customized resumes from your profile data for quick job applications.

## Installation

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked"
4. Select the `resume-chrome-extension` folder
5. The extension icon should appear in your toolbar

## Usage

### 1. Sync Your Profile
- Make sure your Resume Builder app is running at `http://localhost:3001`
- Click the extension icon in your toolbar
- Click "🔄 Sync Profile from App" to pull your resume data

### 2. Generate Custom Resume
- Enter the **Job Title** you're applying for
- Paste the **Job Description**
- Click "✨ Generate Custom Resume PDF"
- The customized resume will be downloaded to your Downloads folder

## Features

- 📄 Quick resume generation from browser
- 🎯 Pull profile data directly from your Resume Builder app
- 💾 Store profile locally in extension for offline use
- 📥 Instant PDF download
- ✨ Clean, professional resume format

## Notes

- The extension pulls data from `localStorage` in your Resume Builder app
- Make sure you have created a profile in the web app before syncing
- The PDF is generated in letter size format optimized for one page
- Profile data is stored locally in your browser for privacy

## Troubleshooting

**"No profile found" error:**
- Make sure the Resume Builder app is open at localhost:3001
- Create or update your profile in the web app
- Click the Sync button again

**PDF not downloading:**
- Check if Chrome is blocking downloads
- Make sure you have write permissions to your Downloads folder
- Try clicking the button again

## Future Enhancements

- AI-powered resume customization based on job description
- Auto-fill from job posting pages
- Multiple resume templates
- Direct upload to job application sites
