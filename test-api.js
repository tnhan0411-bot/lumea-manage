fetch('http://localhost:3000/api/ai-financial-report', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ invoices: [], period: '2026-07' })
}).then(res => res.text().then(text => console.log('STATUS:', res.status, 'BODY:', text)));
