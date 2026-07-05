import { GoogleGenAI } from '@google/genai';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: "Chưa cấu hình API Key Gemini." });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const { invoices = [], period = "Tất cả" } = req.body;
    
    let currentMonthRevenue = 0;
    let currentYTD = 0;
    let pitTax = 0;
    let vatTax = 0;
    let netRevenue = 0;

    if (period !== "Tất cả" && period.length === 7) {
      const [yearStr, monthStr] = period.split('-');
      const targetYear = parseInt(yearStr);
      const targetMonth = parseInt(monthStr);

      const calculateYTDRevenue = (upToMonth: number) => {
        let ytd = 0;
        for (let m = 1; m <= upToMonth; m++) {
          const mStr = m.toString().padStart(2, '0');
          const pStr = `${targetYear}-${mStr}`;
          invoices.forEach((inv: any) => {
            if (inv.status === 'paid' && inv.month === pStr && inv.total) {
              ytd += Number(inv.total);
            }
          });
        }
        return ytd;
      };

      const prevYTD = calculateYTDRevenue(targetMonth - 1);
      currentMonthRevenue = 0;
      invoices.forEach((inv: any) => {
          if (inv.status === 'paid' && inv.month === period && inv.total) {
              currentMonthRevenue += Number(inv.total);
          }
      });
      currentYTD = prevYTD + currentMonthRevenue;

      const prevPIT = Math.max(0, prevYTD - 1000000000) * 0.02;
      const currentCumulativePIT = Math.max(0, currentYTD - 1000000000) * 0.02;

      pitTax = Math.round(currentCumulativePIT - prevPIT);
      vatTax = Math.round(currentMonthRevenue * 0.05);
      netRevenue = currentMonthRevenue - vatTax - pitTax;
    } else {
      invoices.forEach((inv: any) => {
        if (inv.status === 'paid' && inv.total) {
          currentMonthRevenue += Number(inv.total);
        }
      });
      currentYTD = currentMonthRevenue;
      vatTax = Math.round(currentMonthRevenue * 0.05);
      pitTax = Math.round(Math.max(0, currentMonthRevenue - 1000000000) * 0.02);
      netRevenue = currentMonthRevenue - vatTax - pitTax;
    }

    const prompt = `Bạn là một CFO (Giám đốc tài chính) cho một cơ sở cho thuê phòng trọ/căn hộ dịch vụ hộ kinh doanh cá thể.
Dựa vào số liệu tài chính sau của kỳ [${period}]:
- Doanh thu tháng này (Gross): ${currentMonthRevenue.toLocaleString('vi-VN')} VND
- Tổng doanh thu lũy kế từ đầu năm (YTD): ${currentYTD.toLocaleString('vi-VN')} VND (Mốc tính thuế TNCN là 1 tỷ đồng)
- Thuế GTGT phải nộp trong tháng (5%): ${vatTax.toLocaleString('vi-VN')} VND
- Thuế TNCN phải nộp phát sinh trong tháng (2% phần vượt 1 tỷ): ${pitTax.toLocaleString('vi-VN')} VND
- Lợi nhuận gộp tháng này (Net): ${netRevenue.toLocaleString('vi-VN')} VND

Hãy viết một đoạn văn bản tóm tắt ngắn (khoảng 3-4 câu) bằng tiếng Việt bao gồm:
1. Đánh giá tổng quan về doanh thu và tiến độ doanh thu so với mốc 1 tỷ đồng (chưa tới, sắp chạm, hay đã vượt qua mốc phải nộp thuế TNCN).
2. Lời nhắc nhở trích lập quỹ đúng số tiền thuế (GTGT và TNCN) phải nộp cho tháng này.
3. Gợi ý chiến lược tối ưu phòng hoặc tăng doanh thu dựa trên số liệu.
Đoạn văn cần chuyên nghiệp, ngắn gọn, súc tích và mạch lạc. Không sử dụng markdown kiểu danh sách, chỉ viết đoạn văn.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt
    });

    const insights = response.text || "Hệ thống AI không thể trả về phân tích.";

    return res.status(200).json({
      grossRevenue: currentMonthRevenue,
      ytdRevenue: currentYTD,
      vatTax,
      pitTax,
      netRevenue,
      insights
    });
  } catch (error: any) {
    console.error('AI Financial Report error:', error);
    return res.status(500).json({ error: error.message || 'Lỗi khi tạo báo cáo tài chính AI' });
  }
}
