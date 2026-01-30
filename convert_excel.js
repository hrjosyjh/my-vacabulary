import XLSX from 'xlsx';
import fs from 'fs';

const excelPath = '/home/hrjung/Downloads/수능영어단어장(지천명영어)v180718.xls';
const outputPath = 'src/data/words.js';

try {
  const workbook = XLSX.readFile(excelPath);
  const sheetName = 'ALL_Word'; 
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  // Skip header
  const dataRows = rows.slice(1);
  
  const uniqueWords = new Map();

  for (const row of dataRows) {
    const wordRaw = row[1];
    if (!wordRaw) continue;
    const word = String(wordRaw).trim();

    const meaning = row[2] ? String(row[2]).trim() : '';
    const exampleEn = row[4] ? String(row[4]).trim() : '';
    
    // Quality check: prefer entries with both meaning and example
    const score = (meaning ? 2 : 0) + (exampleEn ? 1 : 0);
    
    if (!uniqueWords.has(word)) {
      uniqueWords.set(word, { word, meaning, exampleEn, score });
    } else {
      const existing = uniqueWords.get(word);
      if (score > existing.score) {
        uniqueWords.set(word, { word, meaning, exampleEn, score });
      } else if (score === existing.score) {
        // Tie-breaker: longer example?
        if (exampleEn.length > existing.exampleEn.length) {
            uniqueWords.set(word, { word, meaning, exampleEn, score });
        }
      }
    }
  }

  const sortedWords = Array.from(uniqueWords.values()).sort((a, b) => a.word.localeCompare(b.word));
  
  console.log(`Prepared ${sortedWords.length} unique words.`);

  // Generate file content
  const entries = sortedWords.map((w, index) => {
    // Escape single quotes in strings
    const safeWord = w.word.replace(/'/g, "\\'");
    const safeMeaning = w.meaning.replace(/'/g, "\\'");
    const safeExampleEn = w.exampleEn.replace(/'/g, "\\'");
    
    return `  { id: ${index + 1}, word: '${safeWord}', pronunciation: '', meaning: '${safeMeaning}', exampleEn: '${safeExampleEn}', exampleKo: '' }`;
  });

  const fileContent = `export const vocabulary = [
${entries.join(',\n')}
];
`;

  fs.writeFileSync(outputPath, fileContent);
  console.log('Successfully wrote words.js');

} catch (error) {
  console.error('Error processing:', error);
}