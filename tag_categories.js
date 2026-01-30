import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

const fileMappings = [
  {
    path: '/home/hrjung/Downloads/수능 필수 단어 1200.pdf',
    category: 'suneung'
  },
  {
    path: '/home/hrjung/Downloads/평가원 필수 단어 1200.pdf',
    category: 'evaluator'
  }
];

// Helper from previous scripts
function isJunk(line) {
  const l = line.trim();
  if (l.length === 0) return true;
  if (l.includes('목표가 다른 상위권 영어')) return true;
  if (l.includes('The')) return true;
  if (l.includes('English')) return true;
  if (l.includes('해석에 논리를 입히다')) return true;
  if (l.match(/^-\s*\d+\s*-$/)) return true;
  if (l.includes('고등\u0000필수\u0000단어')) return true;
  if (l.includes('평가원\u0000필수\u0000단어')) return true;
  return false;
}

async function extractWordsFromFile(filePath) {
  const wordSet = new Set();
  console.log(`Processing ${filePath}...`);
  
  try {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdf(dataBuffer);
      const text = data.text;
      const lines = text.split('\n');
      
      let pendingWord = null;
      
      // Need different strategy for "평가원" vs "수능"?
      // Previous process_pdfs.js used regex for PyeongGaWon.
      const isPyeongGaWon = filePath.includes('평가원');

      if (isPyeongGaWon) {
           const cleanLines = lines.filter(l => !isJunk(l));
           const cleanText = cleanLines.join('\n');
           const regex = /([a-zA-Z][a-zA-Z\s-]+?)\s*([가-힣][^a-zA-Z\n]*)/g;
           let match;
           while ((match = regex.exec(cleanText)) !== null) {
                let word = match[1].trim().toLowerCase();
                word = word.replace(/\u0000/g, '');
                if (word && word.length > 1) {
                    wordSet.add(word);
                }
           }
      } else {
          // Standard parsing for "수능 필수"
          for (const line of lines) {
              if (isJunk(line)) continue;
              const trimmed = line.trim().replace(/\u0000/g, '');
              if (!trimmed) continue;

              const sameLineMatch = trimmed.match(/^([a-zA-Z][a-zA-Z\s-]+?)\s+([가-힣\[\(].*)$/);
              
              if (sameLineMatch) {
                  wordSet.add(sameLineMatch[1].trim().toLowerCase());
                  pendingWord = null;
              } else if (/^[a-zA-Z\s-]+$/.test(trimmed)) {
                  pendingWord = trimmed.trim().toLowerCase();
              } else {
                  if (pendingWord) {
                      wordSet.add(pendingWord);
                      pendingWord = null;
                  }
              }
          }
      }
  } catch (e) {
      console.error(`Error reading ${filePath}:`, e);
  }
  return wordSet;
}

async function updateWordsFile() {
    // 1. Collect words for each category
    const categoryMap = new Map(); // word -> Set(categories)
    
    for (const mapping of fileMappings) {
        const words = await extractWordsFromFile(mapping.path);
        console.log(`Found ${words.size} words for category '${mapping.category}'.`);
        
        for (const word of words) {
            if (!categoryMap.has(word)) {
                categoryMap.set(word, new Set());
            }
            categoryMap.get(word).add(mapping.category);
        }
    }
    
    // 2. Update file
    const wordsPath = 'src/data/words.js';
    const content = fs.readFileSync(wordsPath, 'utf-8');
    const lines = content.split('\n');
    let updatedCount = 0;
    
    const newLines = lines.map(line => {
        const wordMatch = line.match(/word:\s*'([^']+)'/);
        if (wordMatch) {
            const word = wordMatch[1].toLowerCase();
            
            if (categoryMap.has(word)) {
                const newCategories = Array.from(categoryMap.get(word));
                
                // Check if it already has a category
                const catMatch = line.match(/category:\s*'([^']+)'/);
                let currentCats = [];
                if (catMatch) {
                    currentCats = catMatch[1].split(',').map(c => c.trim());
                }
                
                // Merge
                const mergedCats = new Set([...currentCats, ...newCategories]);
                const catString = Array.from(mergedCats).join(',');
                
                updatedCount++;
                
                if (catMatch) {
                    return line.replace(/category:\s*'[^']+'/, `category: '${catString}'`);
                } else {
                    return line.replace(/}\s*,?$/, `, category: '${catString}' }`);
                }
            }
        }
        return line;
    });
    
    fs.writeFileSync(wordsPath, newLines.join('\n'));
    console.log(`Updated words file with categories.`);
}

updateWordsFile();
