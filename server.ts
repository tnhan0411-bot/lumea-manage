import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import cron from "node-cron";
import Parser from "rss-parser";
import { GoogleGenAI, Type } from "@google/genai";
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import fs from 'fs';
import ExcelJS from 'exceljs';

let db: any = null;

try {
  const firebaseConfig = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'firebase-applet-config.json'), 'utf8'));
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
} catch (error) {
  console.warn("Could not initialize Firebase in server.ts (config might be missing):", error);
}

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
});

const parser = new Parser();
// Use Google News RSS to find Da Nang international tourism news
const RSS_URL = 'https://news.google.com/rss/search?q=%22%C4%90%C3%A0+N%E1%BA%B5ng%22+AND+(%22kh%C3%A1ch+qu%E1%BB%91c+t%E1%BA%BF%22+OR+%22kh%C3%A1ch+n%C6%B0%E1%BB%9Bc+ngo%C3%A0i%22)&hl=vi&gl=VN&ceid=VN:vi';

async function fetchAndProcessNews() {
  if (!db) {
     console.error("Database not initialized, skipping news fetch.");
     return { success: false, error: "DB not initialized" };
  }
  
  if (!process.env.GEMINI_API_KEY) {
     console.error("Gemini API key not configured");
     return { success: false, error: "No API Key" };
  }

  console.log("Starting to fetch news from RSS...");
  try {
    const feed = await parser.parseURL(RSS_URL);
    let addedCount = 0;
    
    // Process top 5 items instead of 10 to reduce quota usage, wait 2 seconds between them
    const itemsToProcess = feed.items.slice(0, 5);
    for (const item of itemsToProcess) {
       // Check duplication
       const q = query(collection(db, 'news'), where('link', '==', item.link));
       const docs = await getDocs(q);
       if (!docs.empty) continue; // Already exists
       
       const prompt = `Bạn là một biên tập viên AI. Hãy đọc Tiêu đề và Mô tả của bài báo sau đây.
Nếu bài báo KHÔNG liên quan đến "khách du lịch nước ngoài", "khách du lịch quốc tế" hoặc "du lịch" tại "Đà Nẵng", hãy đánh dấu isRelevant = false.
Nếu liên quan, hãy tóm tắt ngắn gọn thành 2-3 câu (bao gồm: ý chính, xu hướng nếu có). Phải dùng tiếng Việt.
Gán cho bài báo các thẻ Hashtag phù hợp (ví dụ: #ThốngKê, #SựKiện, #ChínhSách, #XuHướng, #ThịTrường). Không dùng khoảng trắng trong thẻ, bắt đầu bằng '#'.

Tiêu đề: ${item.title}
Mô tả: ${item.contentSnippet || item.content}
Ngày đăng: ${item.pubDate}
`;
       
       try {
           const response = await ai.models.generateContent({
               model: 'gemini-3.5-flash',
               contents: prompt,
               config: {
                   responseMimeType: 'application/json',
                   responseSchema: {
                       type: Type.OBJECT,
                       properties: {
                           isRelevant: { type: Type.BOOLEAN, description: "True nếu bài báo liên quan đến khách du lịch nước ngoài tới Đà Nẵng." },
                           summary: { type: Type.STRING, description: "Tóm tắt từ 2-3 câu." },
                           tags: { 
                               type: Type.ARRAY,
                               items: { type: Type.STRING },
                               description: "Danh sách các hashtags."
                           }
                       },
                       required: ['isRelevant', 'summary', 'tags']
                   }
               }
           });
           
           const resultText = response.text;
           if (!resultText) continue;
           
           const json = JSON.parse(resultText.trim());
           if (json.isRelevant) {
               const newsDoc = {
                   title: item.title,
                   link: item.link,
                   summary: json.summary,
                   tags: json.tags,
                   pubDate: item.pubDate || new Date().toISOString(),
                   source: item.source || feed.title || 'Google News',
                   addedAt: new Date().toISOString()
               };
               await addDoc(collection(db, 'news'), newsDoc);
               addedCount++;
           }
       } catch (err: any) {
           console.error('Failed to process article:', err.message);
       }
       
       // Sleep 3 seconds to avoid rate limits
       await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    console.log(`Finished processing news. Added ${addedCount} new articles.`);
    return { success: true, addedCount };
  } catch (err: any) {
    console.error("Error during news fetching:", err);
    return { success: false, error: err.message };
  }
}

// Set up the Cron job to run at 6:00 AM every day
cron.schedule('0 6 * * *', () => {
    console.log("Running scheduled daily news fetching job at 06:00 AM");
    fetchAndProcessNews();
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API triggers

  app.post("/api/news/sync", (req, res) => {
    // Run in background to avoid browser timeouts
    fetchAndProcessNews().catch(console.error);
    res.json({ success: true, message: "Sync started in background" });
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Provide a catch-all for React router in SPA mode
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
