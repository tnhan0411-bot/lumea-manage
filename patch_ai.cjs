const fs = require('fs');
let code = fs.readFileSync('src/components/AIFinancialReport.tsx', 'utf8');

code = code.replace(/variant="outline"/g, 'variant="default"');

fs.writeFileSync('src/components/AIFinancialReport.tsx', code);
