import fs from 'fs';

const filePath = 'src/data/words.js';
const content = fs.readFileSync(filePath, 'utf-8');
const lines = content.split('\n');

const newLines = lines.map((line, index) => {
  const trimmed = line.trim();
  // If line starts with '{' and ends with '}', it should have a comma if it's not the last item.
  // But actually, in JS array literal, trailing comma is allowed and encouraged.
  // So we can just ensure every object line ends with },
  
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      return line.replace(/}$/, '},');
  }
  return line;
});

// Remove double commas if any appeared by mistake (e.g. if it was already },)
const fixedContent = newLines.map(line => line.replace(/},,$/, '},')).join('\n');

fs.writeFileSync(filePath, fixedContent);
console.log('Fixed syntax in words.js');
