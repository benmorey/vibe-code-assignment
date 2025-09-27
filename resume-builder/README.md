# 🚀 AI Resume Builder

An intelligent, feature-rich resume builder powered by Google's Gemini AI that helps you create tailored resumes and cover letters for specific job applications.

![Resume Builder Demo](https://img.shields.io/badge/React-18.0-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue) ![Google AI](https://img.shields.io/badge/Google%20AI-Gemini-green) ![Vite](https://img.shields.io/badge/Vite-4.0-purple)

## ✨ Features

### 📝 **Comprehensive Profile Builder**
- **Personal Information**: Contact details, LinkedIn, portfolio links
- **Professional Summary**: About Me section for career highlights
- **Education**: Schools, degrees, GPA, achievements
- **Work Experience**: Companies, positions, responsibilities with bullet points
- **Projects**: Technical projects with technologies and links
- **Volunteer Work**: Community involvement and leadership roles
- **Skills**: Categorized technical and soft skills

### 🤖 **AI-Powered Customization**
- **Smart Resume Optimization**: Paste any job description to get an AI-customized resume
- **Keyword Integration**: Automatically incorporates relevant keywords for ATS systems
- **Cover Letter Generation**: Creates compelling, job-specific cover letters
- **Content Enhancement**: Rewrites experience descriptions for maximum impact
- **Industry Alignment**: Adapts language and focus to match job requirements

### 💾 **Advanced Data Management**
- **Auto-Save**: Continuous saving every 2 seconds as you type
- **Manual Save**: Instant save with visual confirmation
- **Automatic Backups**: Maintains 5 timestamped backup versions
- **Export/Import**: Download and restore profile data as JSON
- **Data Validation**: Ensures imported data integrity and security
- **Real-time Notifications**: Visual feedback for all save operations

### 📄 **Professional Export Options**
- **PDF Resume**: High-quality PDF generation with professional formatting
- **PDF Cover Letter**: Clean, ATS-friendly cover letter downloads
- **Copy to Clipboard**: Quick text copying for online applications
- **Print-Ready**: Optimized layouts for professional printing

### 🎨 **User Experience**
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Intuitive Interface**: Clean, modern design with easy navigation
- **Dynamic Forms**: Add/remove experience sections with dropdown menu
- **Tab-Based Navigation**: Separate tabs for building profile and generating resumes
- **Loading States**: Clear feedback during AI processing

## 🛠️ Quick Start

### Prerequisites
- Node.js 18+ (20.11+ recommended)
- npm or yarn package manager
- Google AI API key (free tier available)

### Installation

1. **Clone and Navigate**
   ```bash
   cd vibe-code-assignment/resume-builder
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Environment**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your Google AI API key:
   ```env
   VITE_GOOGLE_API_KEY=your_google_ai_api_key_here
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Open in Browser**
   ```
   http://localhost:3000 (or the port shown in terminal)
   ```

### Getting Your Google AI API Key

1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click "Get API key" in the navigation
4. Create a new API key or use existing project
5. Copy the key and add to your `.env` file

## 📖 How to Use

### Building Your Profile

1. **Start with Personal Info**
   - Fill in your name, email, phone, and location
   - Add LinkedIn and portfolio URLs (optional)

2. **Write Your About Me**
   - Create a general professional summary
   - This will be customized by AI for each job application

3. **Add Experience Sections**
   - Use the "Add Experience +" dropdown to add:
     - Education entries
     - Work experience with detailed bullet points
     - Personal/professional projects
     - Volunteer work
     - Skill categories

4. **Save Your Profile**
   - Data auto-saves as you type
   - Click "Save Profile" for manual save confirmation
   - Use Export/Import for data backup and portability

### Generating Custom Resumes

1. **Switch to Resume Tab**
   - Click "Generate Resume" in the top navigation

2. **Input Job Description**
   - Paste the complete job posting in the left panel
   - Include requirements, qualifications, and company info

3. **Generate AI Resume**
   - Click "Generate AI Resume" for optimized version
   - AI will enhance your experience descriptions
   - Keywords will be naturally integrated

4. **Create Cover Letter**
   - Click "Generate Cover Letter" for personalized letter
   - Switch to cover letter tab to view and edit

5. **Download & Use**
   - Download both as PDFs
   - Copy cover letter text for online applications

## 🏗️ Technical Architecture

### Frontend Stack
- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Full type safety and better developer experience
- **Vite**: Fast build tool with hot module replacement
- **CSS3**: Custom styling with responsive design principles

### AI Integration
- **Google Gemini AI**: State-of-the-art language model for content generation
- **Prompt Engineering**: Carefully crafted prompts for optimal results
- **Error Handling**: Robust error handling with user-friendly messages
- **Rate Limiting**: Built-in respect for API limits

### Data Management
- **LocalStorage**: Browser-based storage for privacy and speed
- **JSON Structure**: Clean, portable data format
- **Backup System**: Automatic versioning and cleanup
- **Data Validation**: Security-focused input validation

### PDF Generation
- **jsPDF**: Client-side PDF creation for privacy
- **html2canvas**: High-quality visual rendering
- **Print Optimization**: Professional formatting for all output

## 🔧 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Project Structure

```
resume-builder/
├── src/
│   ├── components/          # React components
│   │   ├── forms/          # Form components for each experience type
│   │   ├── ProfileBuilder.tsx
│   │   ├── ResumeGenerator.tsx
│   │   └── ...
│   ├── services/           # Business logic
│   │   ├── aiService.ts    # Google AI integration
│   │   ├── pdfService.ts   # PDF generation
│   │   └── storageService.ts # Data persistence
│   ├── types.ts            # TypeScript definitions
│   └── App.tsx             # Main application component
├── public/                 # Static assets
├── .env.example           # Environment template
└── README.md              # This file
```

### Adding New Features

1. **New Experience Types**: Add to `types.ts` and create form component
2. **AI Prompts**: Modify prompts in `aiService.ts` for different outputs
3. **PDF Styling**: Update CSS classes for resume formatting
4. **Storage Options**: Extend `StorageService` for new data operations

## 🔒 Security & Privacy

### Data Protection
- **Local Storage**: All personal data stays on your device
- **No Server Storage**: Profile information never stored on external servers
- **Secure AI Processing**: Only job descriptions sent to Google AI (not personal data)
- **API Key Security**: Environment variables prevent key exposure

### Best Practices
- **Input Validation**: All user inputs validated and sanitized
- **Error Boundaries**: Graceful handling of unexpected errors
- **Type Safety**: TypeScript prevents runtime errors
- **CSP Ready**: Content Security Policy compatible

## 🚀 Deployment

### Production Build

```bash
npm run build
```

### Deployment Options

1. **Static Hosting**: Deploy `dist/` folder to:
   - Netlify
   - Vercel
   - GitHub Pages
   - AWS S3 + CloudFront

2. **Environment Variables**: Set `VITE_GOOGLE_API_KEY` in hosting platform

3. **Custom Domain**: Configure DNS and SSL certificates

## 📱 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Requirements
- JavaScript enabled
- LocalStorage support (5MB+ recommended)
- File API support for import/export
- Canvas API for PDF generation

## 🛠️ Troubleshooting

### Common Issues

**API Key Problems**
```bash
# Check environment file exists
ls -la .env

# Verify key format
echo $VITE_GOOGLE_API_KEY
```

**Build Errors**
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Storage Issues**
- Check browser storage limits in Developer Tools
- Clear localStorage if corrupted: `localStorage.clear()`
- Export data before clearing for backup

**PDF Generation Issues**
- Ensure profile has content before generating
- Try refreshing page if download fails
- Check browser popup blockers

### Performance Tips

- **Large Profiles**: Export/import instead of keeping everything in one session
- **Slow AI**: Check internet connection and API key validity
- **Memory Usage**: Clear browser cache if app becomes slow

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes with proper TypeScript types
4. Test thoroughly with different browsers
5. Commit with clear messages (`git commit -m 'Add amazing feature'`)
6. Push to your branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development Guidelines

- Follow existing code style and TypeScript patterns
- Add proper error handling for new features
- Update README for significant changes
- Test with various profile sizes and job descriptions

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google AI**: For providing the Gemini API
- **React Team**: For the excellent React framework
- **TypeScript Team**: For type safety and developer experience
- **Vite Team**: For the blazing fast build tool
- **Open Source Community**: For the amazing libraries and tools

## 📞 Support

Having issues? Here are your options:

1. **Check Documentation**: Read through this README carefully
2. **Search Issues**: Look through existing GitHub issues
3. **Create Issue**: Open a new issue with detailed description
4. **Community**: Ask questions in discussions section

---

**Built with ❤️ for job seekers everywhere**

*Transform your job applications with AI-powered resume customization*