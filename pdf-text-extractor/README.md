# PDF Text Extractor

A simple web application to extract text from PDF files.

## Features

- 📄 Extract text from PDF files
- 🖱️ Drag and drop interface
- 📊 Display file statistics (pages, words, characters)
- 📋 Copy extracted text to clipboard
- 💾 Download extracted text as TXT file
- 🎨 Clean, responsive UI

## How to Use

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open your browser** to the URL shown (usually http://localhost:5173)

3. **Upload a PDF:**
   - Drag and drop a PDF file onto the upload area, OR
   - Click "Choose File" to select a PDF

4. **View the extracted text** and statistics

5. **Copy or download** the extracted text

## File Size Limit

- Maximum file size: 10MB
- Supported format: PDF only

## Development

- Built with Vite for fast development
- Uses pdf-parse library for text extraction
- No external dependencies for UI (vanilla HTML/CSS/JS)

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build