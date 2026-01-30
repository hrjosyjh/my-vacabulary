import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

const files = [
  '/home/hrjung/Downloads/수능 필수 단어 1200.pdf',
  '/home/hrjung/Downloads/평가원 필수 단어 1200.pdf',
  '/home/hrjung/Downloads/분위기 심경 단어.pdf'
];

// Helper to remove headers/footers
function isJunk(line) {
  const l = line.trim();
  if (l.length === 0) return true;
  if (l.includes('목표가 다른 상위권 영어')) return true;
  if (l.includes('The')) return true;
  if (l.includes('English')) return true;
  if (l.includes('해석에 논리를 입히다')) return true;
  if (l.match(/^-\s*\d+\s*-$/)) return true; // Page numbers like "- 1 -"
  if (l.includes('고등\u0000필수\u0000단어')) return true;
  if (l.includes('평가원\u0000필수\u0000단어')) return true;
  if (l.includes('분위기\u0000심경\u0000단어')) return true;
  return false;
}

async function extractWords() {
  const allWords = [];

  for (const file of files) {
    console.log(`Processing ${file}...`);
    const dataBuffer = fs.readFileSync(file);
    const data = await pdf(dataBuffer);
    const text = data.text;
    
    // Split into lines
    let lines = text.split('\n');
    
    // Special handling for "평가원" which seems to have merged columns
    const isPyeongGaWon = file.includes('평가원');

    if (isPyeongGaWon) {
        // This file is tricky. It seems to have lines like "WordMeaningWordMeaning".
        // Strategy: Use Regex to find [English] [Korean] sequences.
        // Pattern: ([a-zA-Z][a-zA-Z\s-]*?)([가-힣][^\na-zA-Z]*)(?=[a-zA-Z]|$)
        // Explanation:
        // [a-zA-Z][a-zA-Z\s-]*?  : Starts with alphabet, allows spaces/hyphens (English Word)
        // [가-힣]                : Starts with a Korean char (Meaning start)
        // [^\na-zA-Z]*           : Continues until newline or next English char
        
        // However, the text output from pdf-parse might have joined things weirdly.
        // Let's try to match all occurrences in the full text (minus headers).
        
        // First, clean up headers from the raw text might be hard.
        // Let's iterate lines, remove junk, then join back, then regex.
        
        const cleanLines = lines.filter(l => !isJunk(l));
        const cleanText = cleanLines.join('\n');
        
        // Regex to capture Word and Meaning pairs
        // Assuming Word starts with English char, Meaning starts with Korean char.
        // Note: Some meanings might contain numbers or symbols.
        // Note: Some words might be phrases "a good deal of".
        
        // This regex looks for: (English phrase) followed by (Korean-starting phrase)
        // It consumes until it hits another English letter that looks like a new word start.
        // This is risky if meaning includes English, but usually definitions are Korean.
        const regex = /([a-zA-Z][a-zA-Z\s-]+?)\s*([가-힣][^a-zA-Z\n]*)/g;
        
        let match;
        while ((match = regex.exec(cleanText)) !== null) {
            let word = match[1].trim();
            let meaning = match[2].trim();
            // Cleanup null bytes
            word = word.replace(/\u0000/g, '');
            meaning = meaning.replace(/\u0000/g, '');
            
            if (word && meaning && word.length > 1) {
                allWords.push({ word, meaning });
            }
        }

    } else {
        // For the other files, the structure seemed to be "Word \n Meaning".
        // Or "Word Meaning" on one line?
        // Let's look at "수능 필수":
        // "abandon\n그만두다..."
        // So line i is Word, line i+1 is Meaning?
        // But columns might mix it up: "Word1\nMeaning1\nWord2\nMeaning2"
        
        // Let's try a simple state machine.
        // If line matches English word pattern -> pending word.
        // If next line matches Korean meaning -> complete pair.
        
        // Also handle "Word Meaning" on same line if applicable.
        
        let pendingWord = null;
        
        for (const line of lines) {
            if (isJunk(line)) continue;
            
            const trimmed = line.trim().replace(/\u0000/g, '');
            if (!trimmed) continue;

            // Check if line is purely English (Word)
            // or starts with English and has Korean (Word + Meaning on same line)
            
            // Regex for "Word Meaning" on same line
            // e.g. "acceptable 받아들일 수 있는..."
            const sameLineMatch = trimmed.match(/^([a-zA-Z][a-zA-Z\s-]+?)\s+([가-힣\[\(].*)$/);
            
            if (sameLineMatch) {
                if (pendingWord) {
                     // We had a pending word but found a new pair.
                     // Maybe the previous line was just a word without meaning found?
                     // Or maybe the previous line was part of a column.
                     // It's safer to discard pending or assume it was noise.
                     pendingWord = null;
                }
                allWords.push({
                    word: sameLineMatch[1].trim(),
                    meaning: sameLineMatch[2].trim()
                });
            } else if (/^[a-zA-Z\s-]+$/.test(trimmed)) {
                // Looks like just a word
                if (pendingWord) {
                   // Previous word didn't get a meaning. Maybe it was a header or noise.
                   // Or maybe the meaning was missing.
                }
                pendingWord = trimmed;
            } else {
                // Likely a meaning (contains Korean or symbols)
                if (pendingWord) {
                    allWords.push({
                        word: pendingWord,
                        meaning: trimmed
                    });
                    pendingWord = null;
                }
            }
        }
    }
  }
  
  return allWords;
}

async function updateWordsFile() {
    const newEntries = await extractWords();
    console.log(`Extracted ${newEntries.length} new entries.`);
    
    // Load existing words
    const wordsFile = 'src/data/words.js';
    const content = fs.readFileSync(wordsFile, 'utf-8');
    
    // Extract existing array
    // We'll verify existing words to avoid duplicates.
    // Note: We need to parse the file content properly.
    // Since we are running in node, we can't import 'src/data/words.js' directly easily without type module issues if not careful.
    // But we can just use regex to extract words.
    
    const existingWords = new Set();
    const idMatch = content.match(/id:\s*(\d+)/g);
    let maxId = 0;
    if (idMatch) {
        maxId = Math.max(...idMatch.map(s => parseInt(s.match(/\d+/)[0])));
    }

    const wordMatchRegex = /word:\s*'([^']+)'/g;
    let m;
    while ((m = wordMatchRegex.exec(content)) !== null) {
        existingWords.add(m[1]);
    }
    
    console.log(`Existing words: ${existingWords.size}, Max ID: ${maxId}`);
    
    const toAdd = [];
    for (const entry of newEntries) {
        if (!entry.word || entry.word.length < 2) continue; // Skip single chars
        const w = entry.word.toLowerCase(); // Normalize?
        // Check if we already have it (case-insensitive check?)
        // The existing set is from the file strings, which might be mixed case.
        // Let's assume we want case-insensitive uniqueness.
        
        // Actually, let's keep original casing if possible, but check formatted.
        // Simple check:
        let exists = false;
        // This is O(N*M) but N=3000, M=1000, so it's fine.
        // Better:
        // existingWords is Set of strings found in file.
        
        if (existingWords.has(entry.word) || existingWords.has(entry.word.toLowerCase())) {
            continue; 
        }
        
        toAdd.push({
            id: ++maxId,
            word: entry.word,
            meaning: entry.meaning,
            exampleEn: '', // No examples extracted
            exampleKo: ''
        });
        existingWords.add(entry.word); // Add to set to prevent internal duplicates
    }
    
    console.log(`Adding ${toAdd.length} unique new words.`);
    
    if (toAdd.length === 0) {
        console.log('No new words to add.');
        return;
    }
    
    // Create strings
    const newLines = toAdd.map(w => {
        const safeWord = w.word.replace(/'/g, "\'");
        const safeMeaning = w.meaning.replace(/'/g, "\'");
        return `  { id: ${w.id}, word: '${safeWord}', pronunciation: '', meaning: '${safeMeaning}', exampleEn: '', exampleKo: '' }`;
    });
    
    // Append
    const updatedContent = content.replace(
        /\s*\];\s*$/, 
        ',\n' + newLines.join(',\n') + '\n];\n'
    );
    
    fs.writeFileSync(wordsFile, updatedContent);
    console.log('Updated words.js');
}

updateWordsFile();
