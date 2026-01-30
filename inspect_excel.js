import XLSX from 'xlsx';
const excelPath = '/home/hrjung/Downloads/수능영어단어장(지천명영어)v180718.xls';
const workbook = XLSX.readFile(excelPath);
const sheet = workbook.Sheets['ALL_Word'];
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

for (const row of rows) {
    if (row[1] === 'ability') {
        console.log('Found ability:', row[4]);
    }
}
