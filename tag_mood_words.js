import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

const targetFile = '/home/hrjung/Downloads/분위기 심경 단어.pdf';

// Helper from previous script
function isJunk(line) {
  const l = line.trim();
  if (l.length === 0) return true;
  if (l.includes('목표가 다른 상위권 영어')) return true;
  if (l.includes('The')) return true;
  if (l.includes('English')) return true;
  if (l.includes('해석에 논리를 입히다')) return true;
  if (l.match(/^-\s*\d+\s*-$/)) return true;
  if (l.includes('분위기\u0000심경\u0000단어')) return true;
  return false;
}

async function getMoodWords() {
  const moodWords = new Set();
  
  console.log(`Processing ${targetFile}...`);
  const dataBuffer = fs.readFileSync(targetFile);
  const data = await pdf(dataBuffer);
  const text = data.text;
  const lines = text.split('\n');
  
  let pendingWord = null;
  
  for (const line of lines) {
      if (isJunk(line)) continue;
      
      const trimmed = line.trim().replace(/\u0000/g, '');
      if (!trimmed) continue;

      const sameLineMatch = trimmed.match(/^([a-zA-Z][a-zA-Z\s-]+?)\s+([가-힣[\(].*)$/);
      
      if (sameLineMatch) {
          moodWords.add(sameLineMatch[1].trim().toLowerCase());
          pendingWord = null;
      } else if (/^[a-zA-Z\s-]+$/.test(trimmed)) {
          pendingWord = trimmed.trim().toLowerCase();
      } else {
          if (pendingWord) {
              moodWords.add(pendingWord);
              pendingWord = null;
          }
      }
  }
  return moodWords;
}

async function updateWordsFile() {
    const moodSet = await getMoodWords();
    console.log(`Found ${moodSet.size} mood words.`);
    
    const wordsPath = 'src/data/words.js';
    const content = fs.readFileSync(wordsPath, 'utf-8');
    
    // We parse the file line by line to preserve structure.
    const lines = content.split('\n');
    let updatedCount = 0;
    
    const newLines = lines.map(line => {
        const wordMatch = line.match(/word:\s*'([^']+)'/);
        if (wordMatch) {
            const word = wordMatch[1].toLowerCase();
            // Check if this word is in our mood set
            // Also need to be careful not to double-add keys if we run this multiple times.
            // But we are just adding `category: 'mood'`
            
            if (moodSet.has(word)) {
                // If it already has a category, maybe append? But for now let's just set/overwrite or add.
                // The current structure is `... exampleKo: '' }` or `... exampleKo: '' , category: '...' }` ?
                // Current lines end with `... exampleKo: '' }` or similar.
                
                if (!line.includes('category:')) {
                     // Insert category before the closing brace
                     updatedCount++;
                     return line.replace(/}\s*,?$/, ", category: 'mood' }");
                } else {
                    // Update existing category? Or just leave it if it's already tagged?
                    // Let's assume we overwrite to ensure it's marked.
                    if (!line.includes("'mood'")) {
                         updatedCount++;
                         return line.replace(/category:\s*'[^']+'/, "category: 'mood'");
                    }
                }
            }
        }
        return line;
    });
    
    fs.writeFileSync(wordsPath, newLines.join('\n'));
    console.log(`Updated ${updatedCount} words with category: 'mood'.`);
}

updateWordsFile();
