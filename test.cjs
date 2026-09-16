const express = require('express');
const app = express();
app.all('/api/ai-financial-report', (req, res) => res.send('ok'));
app.listen(3001, () => {
  require('http').get('http://localhost:3001/api/ai-financial-report?_t=123', (res) => {
    console.log('Status:', res.statusCode);
    process.exit(0);
  });
});
