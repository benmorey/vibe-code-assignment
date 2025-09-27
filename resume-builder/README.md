# AI Resume Builder

A powerful React-based resume builder that uses Google's Gemini AI to customize resumes and generate cover letters based on job descriptions.

## Features

- **Profile Builder**: Create and manage your professional profile with:
  - Personal information
  - About Me section
  - Education history
  - Work experience
  - Projects
  - Volunteer work
  - Skills

- **Smart Data Management**:
  - Auto-save as you type (every 2 seconds)
  - Manual save with visual feedback
  - Automatic backups (keeps last 5 versions)
  - Export/Import profile data as JSON
  - Data validation and error handling
  - Real-time save status notifications

- **AI-Powered Customization**:
  - Paste job descriptions to get AI-customized resumes
  - Generate tailored cover letters
  - Keyword optimization for ATS systems

- **Export Options**:
  - Download resumes as PDF
  - Download cover letters as PDF
  - Copy cover letter text to clipboard

## Setup Instructions

### 1. Install Dependencies

```bash
cd resume-builder
npm install
```

### 2. Get Google AI API Key

1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click "Get API key" and create a new key
4. Copy the API key

### 3. Configure Environment Variables

1. Copy the `.env.example` file to `.env`:
   ```bash
   copy .env.example .env
   ```

2. Edit the `.env` file and add your Google AI API key:
   ```
   VITE_GOOGLE_API_KEY=your_actual_api_key_here
   ```

### 4. Start the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## How to Use

### Building Your Profile

1. **Personal Information**: Fill in your basic contact details
2. **About Me**: Write a general professional summary
3. **Add Experience**: Use the dropdown to add different types of experience:
   - Education: Schools, degrees, and academic achievements
   - Work Experience: Jobs with detailed responsibilities
   - Projects: Personal or professional projects
   - Volunteer Work: Community involvement
   - Skills: Organized by category (Programming Languages, Tools, etc.)

4. **Auto-Save**: Your profile is automatically saved as you type
5. **Manual Save**: Click "Save Profile" for immediate save with confirmation
6. **Export/Import**: Use the header buttons to backup or restore your profile data

### Generating Custom Resumes

1. **Switch to Resume Tab**: Click "Generate Resume"
2. **Add Job Description**: Paste the full job posting in the left panel
3. **Generate AI Resume**: Click to create a customized version optimized for the job
4. **Generate Cover Letter**: Click to create a tailored cover letter
5. **Download**: Export both as PDFs

## Technical Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **AI Integration**: Google Gemini AI API
- **PDF Generation**: jsPDF + html2canvas
- **Styling**: Custom CSS with responsive design

## API Usage Notes

- The app uses Google's Gemini Pro model for text generation
- API key is required for AI features to work
- Free tier available with rate limits
- Resume data is stored locally in browser storage

## Troubleshooting

### API Key Issues
- Make sure your `.env` file is in the root directory
- Ensure the API key starts with `VITE_` prefix
- Restart the development server after adding the API key

### PDF Generation Issues
- Ensure you have content in your profile before generating
- Try refreshing the page if download fails
- PDFs are generated client-side for privacy

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- JavaScript must be enabled
- Local storage required for saving profiles (5MB+ recommended)
- File API support needed for import/export features

## Development

To build for production:

```bash
npm run build
```

To preview the production build:

```bash
npm run preview
```

## Data Storage & Security

- **Local Storage**: All profile data is stored in your browser's localStorage
- **Automatic Backups**: App keeps 5 automatic backups with timestamps
- **Export/Import**: Full control over your data with JSON export/import
- **API Security**: API keys stored in environment variables only
- **Privacy**: Profile data never leaves your device except for AI processing
- **Data Validation**: Imported data is validated for security and structure

## Storage Management

- Your data persists between browser sessions
- Automatic cleanup of old backups
- Export your data anytime for backup
- Import previously exported profiles
- Clear all data option available in browser developer tools