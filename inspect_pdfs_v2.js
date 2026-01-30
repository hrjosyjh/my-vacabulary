import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfLib = require('pdf-parse');

const { PDFParse } = pdfLib;

console.log('PDFParse type:', typeof PDFParse);

const files = [
  '/home/hrjung/Downloads/수능 필수 단어 1200.pdf'
];

async function inspectPdfs() {
  // If it's a class, instantiate it.
  // If it's a function, call it?
  
  // Try assuming it is a class based on "new PDFParse()" pattern seen in similar libraries
  
  for (const file of files) {
    try {
      const dataBuffer = fs.readFileSync(file);
      // Wait, standard pdf-parse (v1.1.1) was just `pdf(buffer)`.
      // This new one seems different.
      
      // Let's try to see if it has a static method or instance method.
      // If PDFParse is a class:
      try {
        const parser = new PDFParse();
        console.log('Instance created. Methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(parser)));
        
        // Try extract or load
        if (parser.extractText) {
             const text = await parser.extractText(dataBuffer);
             console.log('Extracted text length:', text.length);
             console.log(text.substring(0, 200));
        } else if (parser.load) {
             const doc = await parser.load(dataBuffer);
             console.log('Loaded doc:', doc);
        }
      } catch (err) {
        console.log('Instantiation failed or not a class:', err.message);
      }
      
    } catch (e) {
      console.error("Error:", e);
    }
  }
}

inspectPdfs();
