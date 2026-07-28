const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /row\.getCell\(5\)\.numFmt = '#,##0';\n\s*row\.getCell\(6\)\.numFmt = '#,##0';\n\s*row\.getCell\(7\)\.numFmt = '#,##0';\n\s*row\.getCell\(8\)\.numFmt = '#,##0';/,
  `row.getCell(6).numFmt = '#,##0';
        row.getCell(7).numFmt = '#,##0';
        row.getCell(8).numFmt = '#,##0';
        row.getCell(9).numFmt = '#,##0';`
);

code = code.replace(
  /'TỔNG TỚI THỜI ĐIỂM BÁO CÁO', \n\s*'', \n\s*'', \n\s*'',\n\s*totalRevenue,/,
  `'TỔNG TỚI THỜI ĐIỂM BÁO CÁO', 
        '', 
        '', 
        '',
        '',
        totalRevenue,`
);

code = code.replace(
  /if \(colNumber >= 5 && colNumber <= 8\) {/,
  `if (colNumber >= 6 && colNumber <= 9) {`
);

code = code.replace(
  /worksheet\.mergeCells\(\`A\$\{totalRow\.number\}:D\$\{totalRow\.number\}\`\);/,
  `worksheet.mergeCells(\`A\$\{totalRow.number\}:E\$\{totalRow.number\}\`);`
);

code = code.replace(
  /const maxColRev = 9;/,
  `const maxColRev = 10;`
);

fs.writeFileSync('server.ts', code);
