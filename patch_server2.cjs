const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /inv\.roomNumber \|\| '',\n\s*inv\.month \|\| '',/,
  `inv.roomNumber || '',
          inv.tenantName || 'Trống',
          inv.month || '',`
);

fs.writeFileSync('server.ts', code);
