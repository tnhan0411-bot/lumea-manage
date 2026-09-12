const express = require('express');
const app = express();
app.use(express.json({ limit: '50mb' }));
app.post("/api/ai-financial-report", express.json({ limit: '50mb' }), (req, res) => {
  res.json({ ok: true });
});
app.use((req, res) => res.status(404).send('Not found'));
app.listen(3001, () => {
  console.log('Test server running');
});
