const fs = require('fs');
let code = fs.readFileSync('src/components/Reports.tsx', 'utf8');

code = code.replace(/const { invoices, expenses, issues, rooms } = useAppContext\(\);/, 'const { invoices, expenses, issues, rooms, tenants } = useAppContext();');

// update handleExportExcel
code = code.replace(
  /const invoicesWithRoomNumber = filteredInvoices\.map\(inv => \(\{/,
  `const invoicesWithRoomNumber = filteredInvoices.map(inv => {
        const room = rooms.find(r => r.id === inv.roomId);
        const tenant = tenants.find(t => t.roomId === inv.roomId) || tenants.find(t => t.id === inv.tenantId);
        return {`
);
code = code.replace(
  /roomNumber: rooms\.find\(r => r\.id === inv\.roomId\)\?\.number \|\| '',/,
  `roomNumber: room?.number || '',
        tenantName: tenant?.name || 'Trống',`
);
code = code.replace(
  /paymentDate: inv\.paymentDate \|\| inv\.issueDate \|\| ''\n\s*\}\)\);/,
  `paymentDate: inv.paymentDate || inv.issueDate || ''
        };
      });`
);

// update handleExportPDF header
code = code.replace(
  /<th>Số phòng<\/th>\n\s*<th>Tháng<\/th>/,
  `<th>Số phòng</th>
                <th>Người thuê</th>
                <th>Tháng</th>`
);

// update handleExportPDF body
code = code.replace(
  /const room = rooms\.find\(r => r\.id === inv\.roomId\);/,
  `const room = rooms.find(r => r.id === inv.roomId);
      const tenant = tenants.find(t => t.roomId === inv.roomId) || tenants.find(t => t.id === inv.tenantId);`
);

code = code.replace(
  /<td>P\.\$\{room\?\.number \|\| ''\}<\/td>\n\s*<td>\$\{inv\.month\}<\/td>/,
  `<td>P.\${room?.number || ''}</td>
          <td>\${tenant?.name || 'Trống'}</td>
          <td>\${inv.month}</td>`
);

// update Table in UI
code = code.replace(
  /<th className="px-6 py-3 font-medium">Phòng<\/th>/,
  `<th className="px-6 py-3 font-medium">Phòng</th>
                    <th className="px-6 py-3 font-medium">Người thuê</th>`
);

code = code.replace(
  /<td className="px-6 py-3 text-\[#f8fafc\] font-medium">P\.\{rooms\.find\(r => r\.id === inv\.roomId\)\?\.number\}<\/td>/,
  `<td className="px-6 py-3 text-[#f8fafc] font-medium">P.{rooms.find(r => r.id === inv.roomId)?.number}</td>
                       <td className="px-6 py-3 text-[#94a3b8]">{tenants.find(t => t.roomId === inv.roomId || t.id === inv.tenantId)?.name || 'Trống'}</td>`
);

fs.writeFileSync('src/components/Reports.tsx', code);
