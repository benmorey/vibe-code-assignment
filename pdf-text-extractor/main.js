import * as pdfjsLib from 'pdfjs-dist';

// Set the worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

class PDFTextExtractor {
    constructor() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');

        // File input change event
        fileInput.addEventListener('change', (e) => {
            console.log('File input changed');
            const file = e.target.files[0];
            console.log('Selected file:', file);
            if (file) {
                console.log('File details:', {
                    name: file.name,
                    size: file.size,
                    type: file.type
                });
                this.extractText(file);
            } else {
                console.log('No file selected');
            }
        });

        // Drag and drop events
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');

            const files = e.dataTransfer.files;
            if (files.length > 0) {
                const file = files[0];
                if (file.type === 'application/pdf') {
                    this.extractText(file);
                } else {
                    this.showError('Please select a PDF file only.');
                }
            }
        });

        // Click to select file
        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });
    }

    async extractText(file) {
        try {
            console.log('extractText called with file:', file.name);

            // Validate file
            if (!file) {
                throw new Error('No file selected');
            }

            console.log('File type check:', file.type);
            if (file.type !== 'application/pdf') {
                throw new Error('Please select a PDF file only');
            }

            console.log('File size check:', file.size);
            if (file.size > 10 * 1024 * 1024) { // 10MB limit
                throw new Error('File size must be less than 10MB');
            }

            console.log('Validation passed, showing loading...');
            // Show loading
            this.showLoading(true);
            this.clearResult();

            console.log('Loading state set, checking PDF.js...');
            console.log('pdfjsLib available:', !!pdfjsLib);

            // Convert file to array buffer
            const arrayBuffer = await this.fileToArrayBuffer(file);

            // Extract text using PDF.js
            console.log('Loading PDF...');
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

            console.log(`PDF loaded. Pages: ${pdf.numPages}`);
            let fullText = '';

            // Extract text from each page
            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                console.log(`Processing page ${pageNum}...`);
                const page = await pdf.getPage(pageNum);
                const textContent = await page.getTextContent();

                const pageText = textContent.items
                    .map(item => item.str)
                    .join(' ') + '\n\n';

                fullText += pageText;
            }

            // Create data object similar to pdf-parse format
            const data = {
                text: fullText,
                numpages: pdf.numPages
            };

            console.log('Text extraction complete');
            this.displayResult(data, file);

        } catch (error) {
            console.error('Error extracting text:', error);
            this.showError(`Error: ${error.message}`);
        } finally {
            this.showLoading(false);
        }
    }

    fileToArrayBuffer(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsArrayBuffer(file);
        });
    }

    displayResult(data, file) {
        const resultDiv = document.getElementById('result');

        const wordCount = data.text.split(/\s+/).filter(word => word.length > 0).length;
        const charCount = data.text.length;
        const lineCount = data.text.split('\n').length;

        resultDiv.innerHTML = `
            <div class="result">
                <h3>✅ Text Extraction Complete</h3>

                <div class="stats">
                    <strong>File:</strong> ${file.name}<br>
                    <strong>Size:</strong> ${this.formatFileSize(file.size)}<br>
                    <strong>Pages:</strong> ${data.numpages || 'Unknown'}<br>
                    <strong>Characters:</strong> ${charCount.toLocaleString()}<br>
                    <strong>Words:</strong> ${wordCount.toLocaleString()}<br>
                    <strong>Lines:</strong> ${lineCount.toLocaleString()}
                </div>

                <h4>Extracted Text:</h4>
                <div class="extracted-text">${this.escapeHtml(data.text)}</div>

                <div style="margin-top: 15px;">
                    <button class="btn" onclick="navigator.clipboard.writeText(\`${data.text.replace(/`/g, '\\`')}\`)">
                        📋 Copy Text
                    </button>
                    <button class="btn" onclick="pdftextextractor.downloadText(\`${data.text.replace(/`/g, '\\`')}\`, '${file.name}')">
                        💾 Download as TXT
                    </button>
                </div>
            </div>
        `;
    }

    downloadText(text, originalFileName) {
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = originalFileName.replace('.pdf', '.txt');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showLoading(show) {
        const loading = document.getElementById('loading');
        loading.style.display = show ? 'block' : 'none';
    }

    showError(message) {
        const resultDiv = document.getElementById('result');
        resultDiv.innerHTML = `<div class="error">${message}</div>`;
    }

    clearResult() {
        const resultDiv = document.getElementById('result');
        resultDiv.innerHTML = '';
    }
}

// Initialize the app
const pdftextextractor = new PDFTextExtractor();

// Make it globally available for button clicks
window.pdftextextractor = pdftextextractor;