const invoices = Array.from({length: 2000}).map((_, i) => ({
  id: i,
  month: '2026-07',
  rent: 5000000,
  water: 100000,
  other: 50000,
  total: 5150000,
  status: 'paid'
}));
fetch('http://localhost:3000/api/ai-financial-report', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ invoices, period: '2026-07' })
}).then(res => res.text().then(text => console.log('STATUS:', res.status, 'BODY:', text.slice(0, 100))));
