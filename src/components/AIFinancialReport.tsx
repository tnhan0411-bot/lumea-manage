import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, Badge, Button } from './ui';
import { Sparkles, DollarSign, Download, ArrowUpRight, Calculator, RefreshCw, BarChart3, TrendingUp, CheckCircle2, AlertTriangle, ShieldCheck, FileSpreadsheet } from 'lucide-react';
import { useAppContext } from '../lib/context';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export function AIFinancialReport() {
  const { invoices, expenses } = useAppContext();
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiInsights, setAiInsights] = useState<string>('');
  const [aiSource, setAiSource] = useState<'gemini' | 'local'>('local');
  
  // Period Modes: 'quarter' (default), 'year', 'month'
  const [periodMode, setPeriodMode] = useState<'quarter' | 'year' | 'month'>('quarter');
  
  const currentActualYear = new Date().getFullYear();
  const currentActualQuarter = Math.floor(new Date().getMonth() / 3) + 1;
  const currentActualMonth = new Date().toISOString().slice(0, 7);

  const [selectedYear, setSelectedYear] = useState<number>(currentActualYear);
  const [selectedQuarter, setSelectedQuarter] = useState<number>(currentActualQuarter);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentActualMonth);

  // Label for active period
  const activePeriodLabel = useMemo(() => {
    if (periodMode === 'quarter') {
      return `Năm ${selectedYear} - Quý ${selectedQuarter} (T${(selectedQuarter - 1) * 3 + 1} - T${selectedQuarter * 3})`;
    }
    if (periodMode === 'year') {
      return `Cả Năm ${selectedYear} (Toàn bộ 12 tháng)`;
    }
    const [y, m] = selectedMonth.split('-');
    return `Tháng ${parseInt(m)}/${y}`;
  }, [periodMode, selectedYear, selectedQuarter, selectedMonth]);

  const activePeriodCode = useMemo(() => {
    if (periodMode === 'quarter') return `${selectedYear}-Q${selectedQuarter}`;
    if (periodMode === 'year') return `${selectedYear}`;
    return selectedMonth;
  }, [periodMode, selectedYear, selectedQuarter, selectedMonth]);

  // Client-side instant tax and financial calculation engine
  const calculationData = useMemo(() => {
    const ONE_BILLION = 1_000_000_000;
    let targetYear = selectedYear;

    // Helper to calculate YTD revenue up to a given month in targetYear
    const getRevenueUpToMonth = (yr: number, upToM: number) => {
      let ytd = 0;
      for (let m = 1; m <= upToM; m++) {
        const mStr = m.toString().padStart(2, '0');
        const pStr = `${yr}-${mStr}`;
        invoices.forEach((inv: any) => {
          if (inv.status === 'paid' && inv.month === pStr && inv.total) {
            ytd += Number(inv.total);
          }
        });
      }
      return ytd;
    };

    let grossRevenue = 0;
    let totalExpense = 0;
    let prevYTD = 0;
    let currentYTD = 0;
    let vatTax = 0;
    let pitTax = 0;

    if (periodMode === 'quarter') {
      const startMonth = (selectedQuarter - 1) * 3 + 1;
      const endMonth = selectedQuarter * 3;

      // Revenue for the quarter (paid invoices)
      for (let m = startMonth; m <= endMonth; m++) {
        const mStr = m.toString().padStart(2, '0');
        const pStr = `${targetYear}-${mStr}`;
        invoices.forEach((inv: any) => {
          if (inv.status === 'paid' && inv.month === pStr && inv.total) {
            grossRevenue += Number(inv.total);
          }
        });
      }

      // Expenses for the quarter
      expenses.forEach((exp: any) => {
        if (exp.date) {
          const [y, m] = exp.date.split('-');
          const eYear = parseInt(y);
          const eMonth = parseInt(m);
          if (eYear === targetYear && eMonth >= startMonth && eMonth <= endMonth) {
            totalExpense += Number(exp.amount || 0);
          }
        }
      });

      prevYTD = getRevenueUpToMonth(targetYear, startMonth - 1);
      currentYTD = prevYTD + grossRevenue;

      // Thuế GTGT = 5% doanh thu trong quý
      vatTax = Math.round(grossRevenue * 0.05);

      // Thuế TNCN = Doanh thu cả năm lũy kế vượt 1 tỷ đồng thì phần vượt chịu 2%
      const prevPIT = Math.max(0, prevYTD - ONE_BILLION) * 0.02;
      const currentCumulativePIT = Math.max(0, currentYTD - ONE_BILLION) * 0.02;
      pitTax = Math.round(currentCumulativePIT - prevPIT);

    } else if (periodMode === 'year') {
      targetYear = selectedYear;

      // All 12 months
      for (let m = 1; m <= 12; m++) {
        const mStr = m.toString().padStart(2, '0');
        const pStr = `${targetYear}-${mStr}`;
        invoices.forEach((inv: any) => {
          if (inv.status === 'paid' && inv.month === pStr && inv.total) {
            grossRevenue += Number(inv.total);
          }
        });
      }

      expenses.forEach((exp: any) => {
        if (exp.date && exp.date.startsWith(`${targetYear}-`)) {
          totalExpense += Number(exp.amount || 0);
        }
      });

      prevYTD = 0;
      currentYTD = grossRevenue;

      // Thuế GTGT = 5% doanh thu cả năm
      vatTax = Math.round(grossRevenue * 0.05);

      // Thuế TNCN = (Doanh thu cả năm - 1 tỷ) x 2%
      pitTax = Math.round(Math.max(0, grossRevenue - ONE_BILLION) * 0.02);

    } else {
      // Month mode
      const [yearStr, monthStr] = selectedMonth.split('-');
      targetYear = parseInt(yearStr);
      const targetMonth = parseInt(monthStr);

      invoices.forEach((inv: any) => {
        if (inv.status === 'paid' && inv.month === selectedMonth && inv.total) {
          grossRevenue += Number(inv.total);
        }
      });

      expenses.forEach((exp: any) => {
        if (exp.date && exp.date.startsWith(selectedMonth)) {
          totalExpense += Number(exp.amount || 0);
        }
      });

      prevYTD = getRevenueUpToMonth(targetYear, targetMonth - 1);
      currentYTD = prevYTD + grossRevenue;

      vatTax = Math.round(grossRevenue * 0.05);
      const prevPIT = Math.max(0, prevYTD - ONE_BILLION) * 0.02;
      const currentCumulativePIT = Math.max(0, currentYTD - ONE_BILLION) * 0.02;
      pitTax = Math.round(currentCumulativePIT - prevPIT);
    }

    const totalTax = vatTax + pitTax;
    const netRevenue = grossRevenue - totalExpense - totalTax;

    return {
      grossRevenue,
      totalExpense,
      prevYTD,
      currentYTD,
      vatTax,
      pitTax,
      totalTax,
      netRevenue,
      targetYear
    };
  }, [invoices, expenses, periodMode, selectedYear, selectedQuarter, selectedMonth]);

  // 12-Month Chart data for the selected year
  const chartData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const month = i + 1;
      const pStr = `${calculationData.targetYear}-${month.toString().padStart(2, '0')}`;
      let revenue = 0;
      let expense = 0;

      invoices.forEach((inv: any) => {
        if (inv.status === 'paid' && inv.month === pStr && inv.total) {
          revenue += Number(inv.total);
        }
      });

      expenses.forEach((exp: any) => {
        if (exp.date && exp.date.startsWith(pStr)) {
          expense += Number(exp.amount || 0);
        }
      });

      return {
        name: `T${month}`,
        'Doanh thu': revenue,
        'Chi phí': expense
      };
    });
  }, [invoices, expenses, calculationData.targetYear]);

  // Local AI CFO Analysis Generator (Always available, instant, 100% reliable)
  const generateLocalCFOInsights = useMemo(() => {
    const { grossRevenue, totalExpense, currentYTD, vatTax, pitTax, totalTax, netRevenue } = calculationData;
    const ONE_BILLION = 1_000_000_000;

    let ytdAssessment = "";
    if (currentYTD === 0) {
      ytdAssessment = "Trong kỳ này, cơ sở chưa phát sinh doanh thu thu tiền thực tế. Doanh thu lũy kế YTD vẫn ở mức 0 đ và chưa chạm ngưỡng chịu thuế TNCN 1 tỷ đồng.";
    } else if (currentYTD < ONE_BILLION) {
      const pct = ((currentYTD / ONE_BILLION) * 100).toFixed(1);
      const remaining = (ONE_BILLION - currentYTD).toLocaleString('vi-VN');
      ytdAssessment = `Doanh thu lũy kế từ đầu năm (YTD) đạt ${currentYTD.toLocaleString('vi-VN')} đ (tương đương ${pct}% ngưỡng 1 tỷ đồng), hiện còn thiếu ${remaining} đ để chạm mốc chịu thuế TNCN.`;
    } else {
      const exceeded = (currentYTD - ONE_BILLION).toLocaleString('vi-VN');
      ytdAssessment = `Doanh thu lũy kế YTD đã chính thức vượt ngưỡng 1 tỷ đồng (vượt ${exceeded} đ). Căn cứ theo quy định thuế hộ kinh doanh cá thể, toàn bộ phần doanh thu vượt ngưỡng phát sinh trong kỳ phải tính 2% Thuế TNCN.`;
    }

    let taxObligation = "";
    if (vatTax > 0 || pitTax > 0) {
      taxObligation = `Nghĩa vụ thuế trong kỳ: Thuế GTGT (5%) là ${vatTax.toLocaleString('vi-VN')} đ, Thuế TNCN (2%) là ${pitTax.toLocaleString('vi-VN')} đ (Tổng cộng thuế phải nộp: ${totalTax.toLocaleString('vi-VN')} đ). Cơ sở nên chủ động trích quỹ tài chính dự phòng đúng số tiền này để nộp ngân sách đúng hạn.`;
    } else {
      taxObligation = `Kỳ này cơ sở không phát sinh nghĩa vụ nộp thuế GTGT (5%) và thuế TNCN (2%) do chưa có doanh thu tính thuế trong kỳ.`;
    }

    let businessStrategy = "";
    if (grossRevenue > 0 && totalExpense > 0) {
      const profitMargin = ((netRevenue / grossRevenue) * 100).toFixed(1);
      businessStrategy = `Lợi nhuận ròng sau thuế và chi phí đạt ${netRevenue.toLocaleString('vi-VN')} đ (Biên lợi nhuận ròng ${profitMargin}%). Cơ sở nên tiếp tục duy trì tỷ lệ lấp đầy phòng cao và kiểm soát chặt các khoản biến phí điện nước, bảo trì định kỳ.`;
    } else if (grossRevenue > 0) {
      businessStrategy = `Dòng tiền doanh thu ghi nhận tích cực. Bạn nên rà soát và cập nhật đầy đủ các khoản chi phí thực tế phát sinh để số liệu lợi nhuận ròng được hạch toán chuẩn xác nhất.`;
    } else {
      businessStrategy = `Cơ sở cần đẩy mạnh các hoạt động marketing cho thuê phòng, kiểm tra các hợp đồng sắp hết hạn để tái ký hoặc tìm khách mới nhằm tạo lập dòng tiền doanh thu cho các kỳ tiếp theo.`;
    }

    return `${activePeriodLabel}: Tổng doanh thu ghi nhận ${grossRevenue.toLocaleString('vi-VN')} đ, tổng chi phí vận hành là ${totalExpense.toLocaleString('vi-VN')} đ, lợi nhuận ròng đạt ${netRevenue.toLocaleString('vi-VN')} đ.\n\n${ytdAssessment}\n\n${taxObligation}\n\n${businessStrategy}`;
  }, [calculationData, activePeriodLabel]);

  // Attempt to fetch AI report from Gemini via server API, fallback to local seamlessly
  const fetchGeminiReport = async () => {
    setLoadingAI(true);
    try {
      const res = await fetch('/api/ai-financial-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          invoices, 
          expenses, 
          period: activePeriodCode 
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.insights) {
          setAiInsights(data.insights);
          setAiSource('gemini');
          return;
        }
      }
      // If server returned non-OK or 404, gracefully fall back to local CFO analysis
      setAiInsights(generateLocalCFOInsights);
      setAiSource('local');
    } catch (e) {
      // Network/offline error: fallback without showing any disruptive 404 error
      setAiInsights(generateLocalCFOInsights);
      setAiSource('local');
    } finally {
      setLoadingAI(false);
    }
  };

  // When active period changes, update insights
  useEffect(() => {
    setAiInsights(generateLocalCFOInsights);
    setAiSource('local');
    // Attempt Gemini in background
    fetchGeminiReport();
  }, [activePeriodCode]);

  // Export / Print handler
  const handleExport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <html>
        <head>
          <title>Báo cáo Thuế & Tài chính - ${activePeriodLabel}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; color: #1e293b; background: #fff; }
            h1 { color: #0284c7; margin-bottom: 4px; font-size: 22px; }
            p.sub { color: #64748b; font-size: 14px; margin-top: 0; margin-bottom: 20px; }
            .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-top: 15px; margin-bottom: 25px; }
            .card { border: 1px solid #cbd5e1; padding: 14px; border-radius: 8px; background: #f8fafc; }
            .card h3 { margin: 0 0 6px 0; font-size: 12px; color: #64748b; text-transform: uppercase; }
            .card p { margin: 0; font-size: 20px; font-weight: bold; }
            .tax-section { background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin-bottom: 25px; }
            .tax-section h2 { margin-top: 0; color: #991b1b; font-size: 16px; margin-bottom: 10px; }
            .tax-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
            .ai-box { margin-top: 25px; padding: 18px; border-radius: 8px; background: #f0f9ff; border: 1px solid #bae6fd; }
            .ai-box h2 { margin-top: 0; color: #0369a1; font-size: 16px; margin-bottom: 8px; }
            .ai-box p { line-height: 1.6; color: #0c4a6e; font-size: 14px; white-space: pre-line; }
            .formula { font-size: 12px; color: #64748b; margin-top: 4px; font-style: italic; }
            @media print { body { padding: 10px; } }
          </style>
        </head>
        <body>
          <h1>BÁO CÁO THUẾ & TÀI CHÍNH HỘ KINH DOANH</h1>
          <p class="sub">Kỳ báo cáo: <strong>${activePeriodLabel}</strong> | Cơ sở: Quản Lý Căn Hộ</p>
          
          <div class="grid">
            <div class="card">
              <h3>Tổng Doanh Thu (Gross)</h3>
              <p style="color: #0284c7;">${calculationData.grossRevenue.toLocaleString('vi-VN')} đ</p>
              <div class="formula">Các hóa đơn đã thu tiền trong kỳ</div>
            </div>
            <div class="card">
              <h3>Tổng Chi Phí</h3>
              <p style="color: #d97706;">${calculationData.totalExpense.toLocaleString('vi-VN')} đ</p>
              <div class="formula">Chi phí vận hành thực tế</div>
            </div>
            <div class="card">
              <h3>Doanh Thu Lũy Kế YTD</h3>
              <p style="color: #7c3aed;">${calculationData.currentYTD.toLocaleString('vi-VN')} đ</p>
              <div class="formula">Mốc tính thuế TNCN: 1 tỷ đồng</div>
            </div>
          </div>

          <div class="tax-section">
            <h2>CHI TIẾT NGHĨA VỤ THUẾ PHẢI NỘP TRONG KỲ</h2>
            <div class="tax-grid">
              <div>
                <strong>Thuế GTGT (5%):</strong>
                <p style="font-size: 18px; color: #dc2626; margin: 4px 0 0 0; font-weight: bold;">${calculationData.vatTax.toLocaleString('vi-VN')} đ</p>
                <div class="formula">= 5% × Doanh thu kỳ (${calculationData.grossRevenue.toLocaleString('vi-VN')} đ)</div>
              </div>
              <div>
                <strong>Thuế TNCN (2%):</strong>
                <p style="font-size: 18px; color: #dc2626; margin: 4px 0 0 0; font-weight: bold;">${calculationData.pitTax.toLocaleString('vi-VN')} đ</p>
                <div class="formula">= 2% × Phần vượt 1 tỷ lũy kế cả năm</div>
              </div>
              <div>
                <strong>Tổng Thuế Phải Nộp:</strong>
                <p style="font-size: 18px; color: #b91c1c; margin: 4px 0 0 0; font-weight: bold;">${calculationData.totalTax.toLocaleString('vi-VN')} đ</p>
                <div class="formula">= Thuế GTGT + Thuế TNCN</div>
              </div>
            </div>
          </div>

          <div class="card" style="margin-bottom: 25px; background: #ecfdf5; border-color: #a7f3d0;">
            <h3 style="color: #065f46;">LỢI NHUẬN RÒNG (NET PROFIT)</h3>
            <p style="color: #059669; font-size: 26px;">${calculationData.netRevenue.toLocaleString('vi-VN')} đ</p>
            <div class="formula" style="color: #047857;">= Doanh Thu - Chi Phí - Tổng Thuế</div>
          </div>

          <div class="ai-box">
            <h2>Ý KIẾN TƯ VẤN TÀI CHÍNH (AI CFO)</h2>
            <p>${aiInsights || generateLocalCFOInsights}</p>
          </div>

          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const ONE_BILLION = 1_000_000_000;
  const ytdPercentage = Math.min(100, Math.round((calculationData.currentYTD / ONE_BILLION) * 100));

  return (
    <div className="space-y-6">
      {/* Header & Period Selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#1e293b]/60 border border-[#334155] p-5 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-xl bg-[#38bdf8]/10 text-[#38bdf8]">
              <Sparkles className="w-5 h-5 text-[#38bdf8]" />
            </div>
            <h2 className="text-xl font-bold text-[#f8fafc]">
              Báo cáo Thuế & Tài chính Hộ Kinh Doanh
            </h2>
          </div>
          <p className="text-sm text-[#94a3b8]">
            Tự động tổng hợp doanh thu theo từng quý, tính thuế GTGT (5%) và thuế TNCN (2% phần vượt 1 tỷ/năm)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Period Mode Selector */}
          <div className="bg-[#0f172a] border border-[#334155] rounded-xl p-1 flex">
            <button 
              onClick={() => setPeriodMode('quarter')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${periodMode === 'quarter' ? "bg-[#38bdf8] text-[#0f172a] shadow" : "text-[#94a3b8] hover:text-[#f8fafc]"}`}
            >
              Theo Quý
            </button>
            <button 
              onClick={() => setPeriodMode('year')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${periodMode === 'year' ? "bg-[#38bdf8] text-[#0f172a] shadow" : "text-[#94a3b8] hover:text-[#f8fafc]"}`}
            >
              Cả Năm
            </button>
            <button 
              onClick={() => setPeriodMode('month')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${periodMode === 'month' ? "bg-[#38bdf8] text-[#0f172a] shadow" : "text-[#94a3b8] hover:text-[#f8fafc]"}`}
            >
              Theo Tháng
            </button>
          </div>

          {/* Quarter Controls */}
          {periodMode === 'quarter' && (
            <div className="flex items-center gap-2">
              <select 
                value={selectedYear}
                onChange={e => setSelectedYear(parseInt(e.target.value))}
                className="bg-[#0f172a] border border-[#334155] text-[#f8fafc] px-3 py-1.5 rounded-xl text-sm font-medium outline-none focus:border-[#38bdf8]"
              >
                {[0, 1, 2, 3].map(offset => {
                  const y = currentActualYear - offset;
                  return <option key={y} value={y}>Năm {y}</option>;
                })}
              </select>

              <select 
                value={selectedQuarter}
                onChange={e => setSelectedQuarter(parseInt(e.target.value))}
                className="bg-[#0f172a] border border-[#334155] text-[#38bdf8] px-3 py-1.5 rounded-xl text-sm font-semibold outline-none focus:border-[#38bdf8]"
              >
                <option value={1}>Quý 1 (T1 - T3)</option>
                <option value={2}>Quý 2 (T4 - T6)</option>
                <option value={3}>Quý 3 (T7 - T9)</option>
                <option value={4}>Quý 4 (T10 - T12)</option>
              </select>
            </div>
          )}

          {/* Year Controls */}
          {periodMode === 'year' && (
            <select 
              value={selectedYear}
              onChange={e => setSelectedYear(parseInt(e.target.value))}
              className="bg-[#0f172a] border border-[#334155] text-[#38bdf8] px-3 py-1.5 rounded-xl text-sm font-semibold outline-none focus:border-[#38bdf8]"
            >
              {[0, 1, 2, 3].map(offset => {
                const y = currentActualYear - offset;
                return <option key={y} value={y}>Toàn bộ Năm {y}</option>;
              })}
            </select>
          )}

          {/* Month Controls */}
          {periodMode === 'month' && (
            <input 
              type="month" 
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="bg-[#0f172a] border border-[#334155] text-[#38bdf8] px-3 py-1.5 rounded-xl text-sm font-medium outline-none focus:border-[#38bdf8]"
            />
          )}

          <Button 
            onClick={fetchGeminiReport} 
            disabled={loadingAI} 
            className="bg-[#1e293b] hover:bg-[#334155] text-[#f8fafc] border border-[#334155] h-9"
            title="Lấy phân tích nâng cao từ Gemini AI"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loadingAI ? 'animate-spin text-[#38bdf8]' : ''}`} />
            Làm mới AI
          </Button>
          
          <Button 
            onClick={handleExport} 
            className="bg-[#38bdf8] text-[#0f172a] hover:bg-[#0284c7] font-semibold h-9"
          >
            <Download className="w-4 h-4 mr-2" />
            In / Xuất PDF
          </Button>
        </div>
      </div>

      {/* Threshold 1 Billion Progress Banner */}
      <div className="bg-gradient-to-r from-[#1e293b] via-[#0f172a] to-[#1e293b] border border-[#334155] p-5 rounded-2xl">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-2 mb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#8b5cf6]" />
            <span className="text-sm font-bold text-[#f8fafc]">
              Tiến Độ Doanh Thu Lũy Kế (YTD) So Với Ngưỡng Chịu Thuế TNCN (1 Tỷ VNĐ)
            </span>
          </div>
          <div className="text-xs font-medium text-[#94a3b8]">
            Công thức: <span className="text-[#38bdf8] font-semibold">Thuế TNCN = (Doanh thu năm - 1.000.000.000 đ) × 2%</span>
          </div>
        </div>

        <div className="w-full bg-[#334155]/60 rounded-full h-3.5 overflow-hidden p-0.5 border border-white/5">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${
              calculationData.currentYTD >= ONE_BILLION 
                ? 'bg-gradient-to-r from-[#ef4444] to-[#dc2626]' 
                : 'bg-gradient-to-r from-[#38bdf8] to-[#8b5cf6]'
            }`}
            style={{ width: `${Math.max(3, ytdPercentage)}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-xs mt-2 text-[#94a3b8]">
          <span>0 đ</span>
          <span className="font-semibold text-[#f8fafc]">
            Lũy kế hiện tại: <span className="text-[#8b5cf6] font-bold">{calculationData.currentYTD.toLocaleString('vi-VN')} đ</span> ({ytdPercentage}%)
            {calculationData.currentYTD >= ONE_BILLION ? (
              <span className="ml-2 text-rose-400 font-bold">(Đã vượt {(calculationData.currentYTD - ONE_BILLION).toLocaleString('vi-VN')} đ)</span>
            ) : (
              <span className="ml-2 text-emerald-400 font-bold">(Còn {(ONE_BILLION - calculationData.currentYTD).toLocaleString('vi-VN')} đ để chạm 1 tỷ)</span>
            )}
          </span>
          <span>1.000.000.000 đ</span>
        </div>
      </div>

      {/* 6 Key Financial & Tax Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Gross Revenue */}
        <Card className="bg-[#0f172a]/70 border-[#334155]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-[#38bdf8]/10 text-[#38bdf8]">
                <DollarSign className="w-5 h-5" />
              </div>
              <Badge variant="default" className="border-[#38bdf8]/30 text-[#38bdf8]">Doanh thu</Badge>
            </div>
            <h3 className="text-[#94a3b8] text-xs font-bold uppercase tracking-wider mb-1">Tổng Doanh Thu</h3>
            <div className="text-xl font-extrabold text-[#f8fafc] truncate">
              {calculationData.grossRevenue.toLocaleString('vi-VN')} <span className="text-xs font-normal text-[#94a3b8]">đ</span>
            </div>
            <p className="text-[11px] text-[#64748b] mt-1.5">Hóa đơn đã thu tiền trong kỳ</p>
          </CardContent>
        </Card>

        {/* Total Expense */}
        <Card className="bg-[#0f172a]/70 border-[#f59e0b]/30">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-[#f59e0b]/10 text-[#f59e0b]">
                <DollarSign className="w-5 h-5" />
              </div>
              <Badge variant="default" className="border-[#f59e0b]/30 text-[#f59e0b]">Chi phí</Badge>
            </div>
            <h3 className="text-[#94a3b8] text-xs font-bold uppercase tracking-wider mb-1">Tổng Chi Phí</h3>
            <div className="text-xl font-extrabold text-[#f59e0b] truncate">
              {calculationData.totalExpense.toLocaleString('vi-VN')} <span className="text-xs font-normal text-[#94a3b8]">đ</span>
            </div>
            <p className="text-[11px] text-[#64748b] mt-1.5">Điện, nước, vận hành, bảo trì</p>
          </CardContent>
        </Card>

        {/* YTD Revenue */}
        <Card className="bg-[#0f172a]/70 border-[#8b5cf6]/30">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-[#8b5cf6]/10 text-[#8b5cf6]">
                <ArrowUpRight className="w-5 h-5" />
              </div>
              <Badge variant="default" className="border-[#8b5cf6]/30 text-[#8b5cf6]">YTD</Badge>
            </div>
            <h3 className="text-[#94a3b8] text-xs font-bold uppercase tracking-wider mb-1">Doanh Thu YTD</h3>
            <div className="text-xl font-extrabold text-[#8b5cf6] truncate">
              {calculationData.currentYTD.toLocaleString('vi-VN')} <span className="text-xs font-normal text-[#94a3b8]">đ</span>
            </div>
            <p className="text-[11px] text-[#64748b] mt-1.5">Lũy kế từ đầu năm đến hết kỳ</p>
          </CardContent>
        </Card>
        
        {/* VAT (5%) */}
        <Card className="bg-[#0f172a]/70 border-[#ef4444]/40">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-[#ef4444]/10 text-[#ef4444]">
                <Calculator className="w-5 h-5" />
              </div>
              <Badge variant="danger" className="font-bold">5% GTGT</Badge>
            </div>
            <h3 className="text-[#94a3b8] text-xs font-bold uppercase tracking-wider mb-1">Thuế GTGT (VAT)</h3>
            <div className="text-xl font-extrabold text-[#ef4444] truncate">
              {calculationData.vatTax.toLocaleString('vi-VN')} <span className="text-xs font-normal text-[#94a3b8]">đ</span>
            </div>
            <p className="text-[11px] text-[#ef4444]/80 mt-1.5">5% × Doanh thu kỳ này</p>
          </CardContent>
        </Card>

        {/* PIT (2%) */}
        <Card className="bg-[#0f172a]/70 border-[#ef4444]/40">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-[#ef4444]/10 text-[#ef4444]">
                <Calculator className="w-5 h-5" />
              </div>
              <Badge variant="danger" className="font-bold">2% TNCN</Badge>
            </div>
            <h3 className="text-[#94a3b8] text-xs font-bold uppercase tracking-wider mb-1">Thuế TNCN (PIT)</h3>
            <div className="text-xl font-extrabold text-[#ef4444] truncate">
              {calculationData.pitTax.toLocaleString('vi-VN')} <span className="text-xs font-normal text-[#94a3b8]">đ</span>
            </div>
            <p className="text-[11px] text-[#ef4444]/80 mt-1.5">
              {calculationData.currentYTD > ONE_BILLION ? "2% phần YTD vượt 1 tỷ" : "Chưa vượt 1 tỷ (0 đ)"}
            </p>
          </CardContent>
        </Card>

        {/* Net Profit */}
        <Card className="bg-[#0f172a]/70 border-[#10b981]/40">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-[#10b981]/10 text-[#10b981]">
                <TrendingUp className="w-5 h-5" />
              </div>
              <Badge variant="success" className="font-bold">Lãi Ròng</Badge>
            </div>
            <h3 className="text-[#94a3b8] text-xs font-bold uppercase tracking-wider mb-1">Lợi Nhuận Ròng</h3>
            <div className="text-xl font-extrabold text-[#10b981] truncate">
              {calculationData.netRevenue.toLocaleString('vi-VN')} <span className="text-xs font-normal text-[#94a3b8]">đ</span>
            </div>
            <p className="text-[11px] text-[#10b981]/80 mt-1.5">Sau khi trừ chi phí & 2 khoản thuế</p>
          </CardContent>
        </Card>
      </div>

      {/* Tax Breakdown Detail Banner */}
      <div className="bg-[#1e293b]/70 border border-[#334155] rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="text-xs text-[#94a3b8] uppercase font-bold tracking-wider mb-1 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Tổng Kết Nghĩa Vụ Thuế Trong Kỳ ({activePeriodLabel})
          </div>
          <div className="text-sm text-[#cbd5e1]">
            Thuế GTGT (5%): <strong className="text-rose-400">{calculationData.vatTax.toLocaleString('vi-VN')} đ</strong> + Thuế TNCN (2%): <strong className="text-rose-400">{calculationData.pitTax.toLocaleString('vi-VN')} đ</strong>
          </div>
        </div>
        <div className="bg-[#0f172a] px-4 py-2.5 rounded-xl border border-rose-500/20 text-right">
          <div className="text-xs text-[#94a3b8]">Tổng thuế phải nộp</div>
          <div className="text-xl font-black text-rose-400">
            {calculationData.totalTax.toLocaleString('vi-VN')} đ
          </div>
        </div>
      </div>

      {/* 12-Month Bar Chart */}
      <Card className="bg-[#0f172a] border-[#334155]">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#38bdf8]" />
              <h3 className="text-lg font-bold text-[#f8fafc]">
                Biểu Đồ Doanh Thu & Chi Phí Năm {calculationData.targetYear}
              </h3>
            </div>
            <span className="text-xs text-[#94a3b8]">Đơn vị: Triệu VNĐ (M)</span>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#94a3b8" 
                  tick={{ fill: '#94a3b8', fontSize: 12 }} 
                  axisLine={{ stroke: '#334155' }}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#94a3b8" 
                  tick={{ fill: '#94a3b8', fontSize: 12 }} 
                  axisLine={{ stroke: '#334155' }}
                  tickLine={false}
                  tickFormatter={(value) => `${(value / 1000000).toLocaleString('vi-VN')}M`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', borderRadius: '10px' }}
                  itemStyle={{ color: '#e2e8f0' }}
                  formatter={(value: number) => [`${value.toLocaleString('vi-VN')} đ`, undefined]}
                />
                <Legend wrapperStyle={{ paddingTop: '15px' }} />
                <Bar dataKey="Doanh thu" fill="#38bdf8" radius={[4, 4, 0, 0]} maxBarSize={36} />
                <Bar dataKey="Chi phí" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* AI CFO Insights Card */}
      <Card className="bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] border-[#38bdf8]/30 shadow-lg shadow-[#38bdf8]/5">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5 border-b border-[#334155] pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#38bdf8]/20 rounded-xl">
                <Sparkles className="w-6 h-6 text-[#38bdf8]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#f8fafc] flex items-center gap-2">
                  Góc Nhìn Tài Chính (AI CFO)
                  {aiSource === 'gemini' ? (
                    <Badge variant="info" className="text-[10px] font-medium">Gemini AI</Badge>
                  ) : (
                    <Badge variant="ghost" className="text-[10px] font-medium">Tự động tính</Badge>
                  )}
                </h3>
                <p className="text-xs text-[#94a3b8]">Tư vấn phân tích doanh thu, chi phí, quỹ dự phòng thuế và tối ưu hóa lợi nhuận</p>
              </div>
            </div>
            <Button 
              onClick={fetchGeminiReport} 
              disabled={loadingAI}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loadingAI ? 'animate-spin text-[#38bdf8]' : ''}`} />
              {loadingAI ? 'Đang phân tích...' : 'Làm mới phân tích'}
            </Button>
          </div>

          <div className="text-[#cbd5e1] leading-relaxed text-sm whitespace-pre-line space-y-3">
            {aiInsights || generateLocalCFOInsights}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
