import fs from 'fs';
import XLSX from 'xlsx';

const excelPath = '/home/hrjung/Downloads/수능영어단어장(지천명영어)v180718.xls';
const targetCategory = 'jicheonmyeong';

async function tagExcelWords() {
  console.log(`Processing ${excelPath}...`);
  const workbook = XLSX.readFile(excelPath);
  const sheetName = 'ALL_Word'; 
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  const dataRows = rows.slice(1);
  const wordSet = new Set();

  for (const row of dataRows) {
    const wordRaw = row[1];
    if (!wordRaw) continue;
    const word = String(wordRaw).trim().toLowerCase();
    if (word.length > 0) {
        wordSet.add(word);
    }
  }
  
  console.log(`Found ${wordSet.size} unique words in Excel.`);

  const wordsPath = 'src/data/words.js';
  const content = fs.readFileSync(wordsPath, 'utf-8');
  const lines = content.split('\n');
  let updatedCount = 0;

  const newLines = lines.map(line => {
      const wordMatch = line.match(/word:\s*'([^']+)'/);
      if (wordMatch) {
          const word = wordMatch[1].toLowerCase();
          
          if (wordSet.has(word)) {
              const catMatch = line.match(/category:\s*'([^']+)'/);
              let currentCats = [];
              if (catMatch) {
                  currentCats = catMatch[1].split(',').map(c => c.trim());
              }
              
              if (!currentCats.includes(targetCategory)) {
                  currentCats.push(targetCategory);
                  updatedCount++;
                  
                  const catString = currentCats.join(',');
                  
                  if (catMatch) {
                      return line.replace(/category:\s*'[^']+'/, `category: '${catString}'`);
                  } else {
                      // Careful with the closing brace logic
                      return line.replace(/},?\s*$/, `, category: '${catString}' },`);
                  }
              }
          }
      }
      return line;
  });

  fs.writeFileSync(wordsPath, newLines.join('\n'));
  console.log(`Updated ${updatedCount} words with category '${targetCategory}'.`);
}

tagExcelWords();