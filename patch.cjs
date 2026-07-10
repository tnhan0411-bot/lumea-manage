const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

// Replace top-level ai declaration
content = content.replace(
  /const ai = new GoogleGenAI\(\{\s*apiKey: process\.env\.GEMINI_API_KEY,\s*httpOptions: \{ headers: \{ 'User-Agent': 'aistudio-build' \} \}\s*\}\);/,
  `let aiClient: any = null;
function getAI() {
  if (!aiClient) {
    if (!process.env.GEMINI_API_KEY) throw new Error("Chưa cấu hình API Key Gemini. Vui lòng cấu hình trong Settings > Secrets.");
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
    });
  }
  return aiClient;
}`
);

// Replace ai.models usage
content = content.replace(/ai\.models\.generateContent/g, 'getAI().models.generateContent');

fs.writeFileSync('server.ts', content, 'utf8');
