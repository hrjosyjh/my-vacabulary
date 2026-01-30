import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

const files = [
  '/home/hrjung/Downloads/수능 필수 단어 1200.pdf',
  '/home/hrjung/Downloads/평가원 필수 단어 1200.pdf',
  '/home/hrjung/Downloads/분위기 심경 단어.pdf'
];

async function inspectPdfs() {
  for (const file of files) {
    console.log("--- Inspecting: " + file + " ---");
    try {
      const dataBuffer = fs.readFileSync(file);
      const data = await pdf(dataBuffer);
      
      console.log("--- First 500 chars ---");
      console.log(JSON.stringify(data.text.substring(0, 500)));
      
      const middle = Math.floor(data.text.length / 2);
      console.log("--- Middle 500 chars ---");
      console.log(JSON.stringify(data.text.substring(middle, middle + 500)));

    } catch (e) {
      console.error("Error reading " + file + ":", e.message);
    }
  }
}

inspectPdfs();