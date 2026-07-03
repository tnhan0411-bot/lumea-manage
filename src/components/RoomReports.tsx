import React, { useState, useEffect } from 'react';
import ExcelJS from 'exceljs';
import { Card, CardContent, Button } from './ui';
import { 
  Calendar, Search, Plus, Download, FileText, RefreshCw, 
  AlertTriangle, Filter, ChevronLeft, ChevronRight, CheckCircle, ShieldAlert 
} from 'lucide-react';
import { cn } from '../lib/utils';

export interface RoomReportRecord {
  id: string;
  room_number: string;
  guest_name: string;
  rental_price: number;
  initial_electricity: number;
  passport_number?: string;
  visa_expiry?: string;
  check_in: string;
  check_out: string;
  createdAt?: string;
}

interface PaginationInfo {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export function RoomReports() {
  const [reports, setReports] = useState<RoomReportRecord[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    totalCount: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10
  });

  // Filters
  const [roomNumberFilter, setRoomNumberFilter] = useState('');
  const [checkInStart, setCheckInStart] = useState('');
  const [checkInEnd, setCheckInEnd] = useState('');
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  
  // Add Report Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRoomNumber, setNewRoomNumber] = useState('101');
  const [newGuestName, setNewGuestName] = useState('');
  const [newRentalPrice, setNewRentalPrice] = useState('8000000');
  const [newInitialElectricity, setNewInitialElectricity] = useState('1200');
  const [newPassportNumber, setNewPassportNumber] = useState('');
  const [newVisaExpiry, setNewVisaExpiry] = useState('');
  const [newCheckIn, setNewCheckIn] = useState('2026-06-26');
  const [newCheckOut, setNewCheckOut] = useState('2026-07-26');
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalSuccess, setModalSuccess] = useState<string | null>(null);

  const availableRooms = ['101', '201', '202', '301', '302', '401', '402', '501', '502'];

  const fetchReports = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        room_number: roomNumberFilter,
        check_in_start: checkInStart,
        check_in_end: checkInEnd,
        page: page.toString(),
        limit: '10'
      });

      const res = await fetch(`/api/room-reports?${queryParams.toString()}`);
      if (!res.ok) {
        throw new Error('Không thể tải danh sách báo cáo');
      }
      const data = await res.json();
      setReports(data.reports);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching room reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [roomNumberFilter, checkInStart, checkInEnd, page]);

  const handleClearFilters = () => {
    setRoomNumberFilter('');
    setCheckInStart('');
    setCheckInEnd('');
    setPage(1);
  };

  // Check if Visa expires in under 3 days (relative to 2026-06-26)
  const checkVisaWarning = (expiryDateStr: string | undefined | null) => {
    if (!expiryDateStr) return false;
    try {
      const expiry = new Date(expiryDateStr);
      if (isNaN(expiry.getTime())) return false;
      
      const today = new Date('2026-06-26'); // Use the exact contextual mock date
      const diffTime = expiry.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return diffDays <= 3;
    } catch (e) {
      return false;
    }
  };

  const handleAddReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setModalSuccess(null);

    if (!newGuestName.trim()) {
      setModalError('Vui lòng nhập tên khách hàng');
      return;
    }

    try {
      const res = await fetch('/api/room-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_number: newRoomNumber,
          guest_name: newGuestName.trim(),
          rental_price: Number(newRentalPrice),
          initial_electricity: Number(newInitialElectricity),
          passport_number: newPassportNumber.trim(),
          visa_expiry: newVisaExpiry,
          check_in: new Date(newCheckIn).toISOString(),
          check_out: newCheckOut ? new Date(newCheckOut).toISOString() : ''
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Thêm báo cáo thất bại');
      }

      setModalSuccess('Đã thêm hồ sơ thuê phòng vào báo cáo thành công!');
      setNewGuestName('');
      setNewPassportNumber('');
      setNewVisaExpiry('');
      
      // Reload reports
      fetchReports();
      
      setTimeout(() => {
        setShowAddModal(false);
        setModalSuccess(null);
      }, 1500);

    } catch (err: any) {
      setModalError(err.message || 'Lỗi hệ thống');
    }
  };

  const handleExportExcel = async () => {
    try {
      setExporting(true);
      // Fetch ALL filtered reports for exporting (without pagination limit)
      const queryParams = new URLSearchParams({
        room_number: roomNumberFilter,
        check_in_start: checkInStart,
        check_in_end: checkInEnd,
        page: '1',
        limit: '1000' // Max limit to get all filtered records
      });

      const res = await fetch(`/api/room-reports?${queryParams.toString()}`);
      if (!res.ok) throw new Error('Không thể tải dữ liệu xuất');
      const data = await res.json();
      
      const reports = data.reports || [];
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Lịch sử lưu trú');

      worksheet.addRow([
        'STT', 
        'Số phòng', 
        'Tên khách', 
        'Giá thuê (VND)', 
        'Số điện đầu',
        'Số Passport',
        'Hạn Visa', 
        'Ngày check-in', 
        'Ngày check-out'
      ]);

      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).alignment = { horizontal: 'center' };

      reports.forEach((row: any, index: number) => {
        const itemRow = worksheet.addRow([
          index + 1,
          row.room_number,
          row.guest_name,
          row.rental_price,
          row.initial_electricity,
          row.passport_number || 'N/A',
          row.visa_expiry ? new Date(row.visa_expiry).toLocaleDateString('vi-VN') : 'N/A',
          row.check_in ? new Date(row.check_in).toLocaleDateString('vi-VN') : '',
          row.check_out ? new Date(row.check_out).toLocaleDateString('vi-VN') : ''
        ]);
        
        itemRow.getCell(4).numFmt = '#,##0';
      });

      worksheet.columns.forEach(column => {
        let maxLength = 0;
        column.eachCell?.({ includeEmpty: true }, (cell) => {
          const columnLength = cell.value ? cell.value.toString().length : 12;
          if (columnLength > maxLength) maxLength = columnLength;
        });
        column.width = maxLength < 12 ? 12 : maxLength + 2;
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      
      link.setAttribute("download", `Bao_Cao_Luu_Tru_Excel_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Lỗi khi xuất file Excel');
    } finally {
      setExporting(false);
    }
  };

  const handlePrintPDF = async () => {
    try {
      // Fetch all reports within filters
      const queryParams = new URLSearchParams({
        room_number: roomNumberFilter,
        check_in_start: checkInStart,
        check_in_end: checkInEnd,
        page: '1',
        limit: '1000'
      });

      const res = await fetch(`/api/room-reports?${queryParams.toString()}`);
      if (!res.ok) throw new Error('Lỗi lấy dữ liệu');
      const data = await res.json();
      const allReports: RoomReportRecord[] = data.reports;

      // Opens a clean print helper block
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert("Vui lòng cho phép popup để xuất báo cáo PDF!");
        return;
      }

      let html = `
        <html>
          <head>
            <title>Báo cáo Quản lý phòng & Khai báo tạm trú</title>
            <style>
              body { font-family: 'Segoe UI', Arial, sans-serif; color: #0f172a; padding: 40px; line-height: 1.4; }
              table { width: 100%; border-collapse: collapse; margin-top: 25px; }
              th, td { border: 1px solid #cbd5e1; padding: 12px 10px; text-align: left; font-size: 13px; }
              th { background-color: #f8fafc; font-weight: bold; color: #1e293b; text-transform: uppercase; font-size: 11px; tracking: 0.05em; }
              .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; border-bottom: 3px double #0f172a; padding-bottom: 20px; }
              .title { color: #0f172a; font-size: 24px; font-weight: 800; margin: 0; text-transform: uppercase; }
              .meta { font-size: 12px; color: #475569; line-height: 1.6; }
              .warning { color: #ef4444; font-weight: bold; background-color: #fef2f2; }
              .footer { margin-top: 50px; display: flex; justify-content: space-between; font-size: 13px; }
              .sign-box { text-align: center; width: 250px; }
              .stamp-space { margin-top: 80px; color: #94a3b8; font-style: italic; font-size: 12px; }
            </style>
          </head>
          <body onload="window.print();">
            <div class="header">
              <div>
                <h1 class="title">BÁO CÁO CHI TIẾT LƯU TRÚ &amp; TẠM TRÚ</h1>
                <div class="meta" style="margin-top: 8px;">
                  Hệ thống Quản lý Khách sạn / Căn hộ dịch vụ Nam Cầu Trần Thị Lý<br/>
                  Tự động cảnh báo gia hạn hộ chiếu, visa của khách quốc tế
                </div>
              </div>
              <div class="meta" style="text-align: right;">
                <div><b>Ngày xuất báo cáo:</b> ${new Date().toLocaleDateString('vi-VN')}</div>
                <div><b>Trạng thái bộ lọc:</b> ${roomNumberFilter ? `Phòng ${roomNumberFilter}` : 'Tất cả phòng'}</div>
                <div><b>Nhân viên lập:</b> Ban Quản Trị Hệ Thống</div>
              </div>
            </div>
            
            <table>
              <thead>
                <tr>
                  <th style="width: 70px; text-align: center;">Số phòng</th>
                  <th>Họ tên khách hàng</th>
                  <th style="text-align: right;">Giá thuê phòng</th>
                  <th style="text-align: center;">Điện đầu</th>
                  <th>Số Passport</th>
                  <th>Hạn Visa</th>
                  <th>Ngày nhận phòng</th>
                  <th>Ngày trả phòng</th>
                </tr>
              </thead>
              <tbody>
      `;

      allReports.forEach((rep) => {
        const isVisaWarning = checkVisaWarning(rep.visa_expiry);
        html += `
          <tr>
            <td style="font-weight: bold; text-align: center; font-size: 14px;">P.${rep.room_number}</td>
            <td style="font-weight: 500;">${rep.guest_name}</td>
            <td style="text-align: right; font-weight: 600;">${rep.rental_price ? rep.rental_price.toLocaleString('vi-VN') + ' đ' : '-'}</td>
            <td style="text-align: center;">${rep.initial_electricity || 0} kWh</td>
            <td>${rep.passport_number || '-'}</td>
            <td class="${isVisaWarning ? 'warning' : ''}">
              ${rep.visa_expiry ? new Date(rep.visa_expiry).toLocaleDateString('vi-VN') : '-'}
              ${isVisaWarning ? ' ⚠️ (SẮP HẾT HẠN)' : ''}
            </td>
            <td>${rep.check_in ? new Date(rep.check_in).toLocaleDateString('vi-VN') : '-'}</td>
            <td>${rep.check_out ? new Date(rep.check_out).toLocaleDateString('vi-VN') : '-'}</td>
          </tr>
        `;
      });

      html += `
              </tbody>
            </table>

            <div style="margin-top: 30px; font-size: 11px; color: #64748b; background: #f8fafc; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0;">
              <b>Ghi chú cảnh báo an ninh lưu trú:</b> Các trường hợp có ký hiệu ⚠️ yêu cầu cán bộ phụ trách liên hệ trực tiếp khách hàng để kiểm tra tính hợp pháp của thị thực cư trú trong ngày hôm nay.
            </div>

            <div class="footer">
              <div class="sign-box">
                <p><b>Người lập biểu</b></p>
                <p style="color: #64748b; font-size: 11px;">(Ký và ghi rõ họ tên)</p>
                <div class="stamp-space">Đã kiểm tra đối chiếu</div>
              </div>
              <div class="sign-box">
                <p><b>Xác nhận Ban Giám Đốc / Chủ Quản</b></p>
                <p style="color: #64748b; font-size: 11px;">(Ký tên, đóng dấu văn phòng)</p>
                <div class="stamp-space" style="margin-top: 60px;">................................................</div>
              </div>
            </div>
          </body>
        </html>
      `;

      printWindow.document.write(html);
      printWindow.document.close();
    } catch (err) {
      console.error(err);
      alert('Không thể khởi tạo biểu in PDF.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action cards & Filters */}
      <div className="bg-[#1e293b]/50 border border-white/5 rounded-xl p-5 space-y-4">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Filter className="text-[#38bdf8]" size={18} />
              Bộ lọc &amp; Tra cứu hồ sơ lưu trú
            </h3>
            <p className="text-xs text-[#94a3b8]">
              Tìm kiếm khách thuê theo số phòng, thời gian check-in hoặc tìm kiếm nhanh hộ chiếu
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2 w-full xl:w-auto">
            <Button 
              onClick={() => setShowAddModal(true)}
              className="bg-[#38bdf8] text-[#0f172a] hover:bg-[#0ea5e9] gap-1.5 font-semibold text-xs py-2 px-3 flex-1 sm:flex-initial"
            >
              <Plus size={15} /> Thêm lượt thuê
            </Button>
            <Button 
              onClick={handleExportExcel}
              disabled={exporting}
              className="bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5 font-semibold text-xs py-2 px-3 flex-1 sm:flex-initial"
            >
              <Download size={15} /> Xuất Excel
            </Button>
            <Button 
              onClick={handlePrintPDF}
              className="bg-slate-700 hover:bg-slate-600 text-white gap-1.5 font-semibold text-xs py-2 px-3 flex-1 sm:flex-initial"
            >
              <FileText size={15} /> Xuất PDF
            </Button>
          </div>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* Room Filter */}
          <div>
            <label className="block text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-1.5">Số phòng</label>
            <select
              value={roomNumberFilter}
              onChange={(e) => {
                setRoomNumberFilter(e.target.value);
                setPage(1);
              }}
              className="w-full bg-[#0f172a] border border-[#334155] rounded-lg p-2.5 text-sm text-[#f8fafc] focus:outline-none focus:ring-1 focus:ring-[#38bdf8]"
            >
              <option value="">Tất cả phòng</option>
              {availableRooms.map(rm => (
                <option key={rm} value={rm}>Phòng {rm}</option>
              ))}
            </select>
          </div>

          {/* Check-In Start */}
          <div>
            <label className="block text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-1.5">Từ ngày Check-in</label>
            <input
              type="date"
              value={checkInStart}
              onChange={(e) => {
                setCheckInStart(e.target.value);
                setPage(1);
              }}
              className="w-full bg-[#0f172a] border border-[#334155] rounded-lg p-2.5 text-sm text-[#f8fafc] focus:outline-none focus:ring-1 focus:ring-[#38bdf8]"
            />
          </div>

          {/* Check-In End */}
          <div className="flex items-end gap-2">
            <div className="flex-grow">
              <label className="block text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-1.5">Đến ngày Check-in</label>
              <input
                type="date"
                value={checkInEnd}
                onChange={(e) => {
                  setCheckInEnd(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-[#0f172a] border border-[#334155] rounded-lg p-2.5 text-sm text-[#f8fafc] focus:outline-none focus:ring-1 focus:ring-[#38bdf8]"
              />
            </div>
            <div className="flex gap-1 shrink-0">
              {(roomNumberFilter || checkInStart || checkInEnd) && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 px-3 h-[42px] rounded-lg text-xs font-semibold transition-colors"
                  title="Xóa bộ lọc"
                >
                  Xóa lọc
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Main Table */}
      <div className="bg-[#1e293b]/30 border border-white/5 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1e293b]/70 border-b border-white/5 text-[10px] uppercase tracking-wider font-extrabold text-[#94a3b8]">
                <th className="py-4 px-5 text-center">Số phòng</th>
                <th className="py-4 px-4">Tên khách hàng</th>
                <th className="py-4 px-4 text-right">Giá thuê</th>
                <th className="py-4 px-4 text-center">Số điện đầu</th>
                <th className="py-4 px-4">Số Passport</th>
                <th className="py-4 px-4">Hạn Visa</th>
                <th className="py-4 px-4">Check-in</th>
                <th className="py-4 px-4">Check-out (Dự kiến/Thực tế)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm text-[#cbd5e1]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#94a3b8]">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="animate-spin text-[#38bdf8]" size={16} />
                      Đang truy xuất bảng dữ liệu lưu trú...
                    </div>
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#64748b] italic">
                    Không tìm thấy bản ghi lưu trú nào khớp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                reports.map((rec) => {
                  const isVisaWarning = checkVisaWarning(rec.visa_expiry);
                  return (
                    <tr 
                      key={rec.id} 
                      className={cn(
                        "hover:bg-white/[0.02] transition-colors duration-150",
                        isVisaWarning && "bg-rose-950/10 hover:bg-rose-950/15"
                      )}
                    >
                      <td className="py-4 px-5 text-center font-bold text-white">
                        <span className="bg-slate-800 text-slate-200 border border-slate-700 px-2.5 py-1 rounded text-xs">
                          {rec.room_number}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-semibold text-white">
                        {rec.guest_name}
                      </td>
                      <td className="py-4 px-4 text-right text-[#10b981] font-mono font-bold">
                        {rec.rental_price ? rec.rental_price.toLocaleString('vi-VN') : '0'} đ
                      </td>
                      <td className="py-4 px-4 text-center text-[#38bdf8] font-mono">
                        {rec.initial_electricity || 0} kWh
                      </td>
                      <td className="py-4 px-4 font-medium font-mono text-slate-300">
                        {rec.passport_number || <span className="text-[#475569] italic">-</span>}
                      </td>
                      <td className="py-4 px-4">
                        {rec.visa_expiry ? (
                          <div className="flex items-center gap-1.5">
                            <span className={cn(
                              "font-mono text-xs px-2 py-0.5 rounded border font-semibold",
                              isVisaWarning 
                                ? "text-rose-400 bg-rose-500/10 border-rose-500/30 shadow-[0_0_8px_rgba(239,68,68,0.1)]" 
                                : "text-[#94a3b8] bg-slate-800 border-white/5"
                            )}>
                              {new Date(rec.visa_expiry).toLocaleDateString('vi-VN')}
                            </span>
                            {isVisaWarning && (
                              <span 
                                className="text-rose-400 cursor-help" 
                                title="🚨 Cảnh báo thị thực: Hết hạn dưới 3 ngày hoặc đã quá hạn!"
                              >
                                ⚠️
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[#475569] italic">- (Khách nội địa)</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-[#94a3b8] text-xs">
                        {rec.check_in ? new Date(rec.check_in).toLocaleDateString('vi-VN') : '-'}
                      </td>
                      <td className="py-4 px-4 text-[#94a3b8] text-xs">
                        {rec.check_out ? new Date(rec.check_out).toLocaleDateString('vi-VN') : <span className="text-[#10b981] font-semibold">Đang ở lâu dài</span>}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {pagination.totalPages > 1 && (
          <div className="p-4 bg-[#1e293b]/40 border-t border-white/5 flex items-center justify-between">
            <span className="text-xs text-[#64748b]">
              Hiển thị trang {pagination.currentPage} / {pagination.totalPages} ({pagination.totalCount} bản ghi)
            </span>
            <div className="flex gap-1.5">
              <Button
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-1.5 h-auto text-xs"
              >
                <ChevronLeft size={16} />
              </Button>
              {Array.from({ length: pagination.totalPages }).map((_, idx) => (
                <Button
                  key={idx}
                  onClick={() => setPage(idx + 1)}
                  className={cn(
                    "px-3 py-1 h-auto text-xs",
                    page === idx + 1 
                      ? "bg-[#38bdf8] text-[#0f172a] hover:bg-[#38bdf8]" 
                      : "bg-[#0f172a]/50 text-[#cbd5e1] border border-white/5"
                  )}
                >
                  {idx + 1}
                </Button>
              ))}
              <Button
                variant="outline"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage(page + 1)}
                className="p-1.5 h-auto text-xs"
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Manual Check-in Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="bg-[#1e293b] border border-[#38bdf8]/40 shadow-2xl max-w-lg w-full rounded-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-[#1e293b]/90 border-b border-white/5 px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldAlert className="text-[#38bdf8]" size={20} />
                Thêm lượt lưu trú mới (Khai báo tạm trú)
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-[#94a3b8] hover:text-white transition-colors font-bold text-xl"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleAddReport} className="p-6 space-y-4">
              {modalError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-lg text-xs font-semibold">
                  {modalError}
                </div>
              )}
              {modalSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                  <CheckCircle size={14} />
                  {modalSuccess}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-1">Số phòng</label>
                  <select
                    value={newRoomNumber}
                    onChange={(e) => setNewRoomNumber(e.target.value)}
                    className="w-full bg-[#0f172a] border border-[#334155] rounded-lg p-2.5 text-sm text-[#f8fafc] focus:outline-none focus:ring-1 focus:ring-[#38bdf8]"
                  >
                    {availableRooms.map(rm => (
                      <option key={rm} value={rm}>Phòng {rm}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-1">Tên khách hàng</label>
                  <input
                    type="text"
                    required
                    placeholder="Nguyễn Văn A"
                    value={newGuestName}
                    onChange={(e) => setNewGuestName(e.target.value)}
                    className="w-full bg-[#0f172a] border border-[#334155] rounded-lg p-2.5 text-sm text-[#f8fafc] focus:outline-none focus:ring-1 focus:ring-[#38bdf8]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-1">Giá thuê (VND/tháng)</label>
                  <input
                    type="number"
                    required
                    value={newRentalPrice}
                    onChange={(e) => setNewRentalPrice(e.target.value)}
                    className="w-full bg-[#0f172a] border border-[#334155] rounded-lg p-2.5 text-sm text-[#f8fafc] focus:outline-none focus:ring-1 focus:ring-[#38bdf8]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-1">Chỉ số điện đầu</label>
                  <input
                    type="number"
                    required
                    value={newInitialElectricity}
                    onChange={(e) => setNewInitialElectricity(e.target.value)}
                    className="w-full bg-[#0f172a] border border-[#334155] rounded-lg p-2.5 text-sm text-[#f8fafc] focus:outline-none focus:ring-1 focus:ring-[#38bdf8]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-1">Số Passport (Hộ chiếu)</label>
                  <input
                    type="text"
                    placeholder="Bỏ trống nếu là khách Việt Nam"
                    value={newPassportNumber}
                    onChange={(e) => setNewPassportNumber(e.target.value)}
                    className="w-full bg-[#0f172a] border border-[#334155] rounded-lg p-2.5 text-sm text-[#f8fafc] focus:outline-none focus:ring-1 focus:ring-[#38bdf8]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-1">Hạn Visa (Nếu có)</label>
                  <input
                    type="date"
                    value={newVisaExpiry}
                    onChange={(e) => setNewVisaExpiry(e.target.value)}
                    className="w-full bg-[#0f172a] border border-[#334155] rounded-lg p-2.5 text-sm text-[#f8fafc] focus:outline-none focus:ring-1 focus:ring-[#38bdf8]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-1">Ngày Check-in</label>
                  <input
                    type="date"
                    required
                    value={newCheckIn}
                    onChange={(e) => setNewCheckIn(e.target.value)}
                    className="w-full bg-[#0f172a] border border-[#334155] rounded-lg p-2.5 text-sm text-[#f8fafc] focus:outline-none focus:ring-1 focus:ring-[#38bdf8]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-1">Ngày Check-out (Dự kiến)</label>
                  <input
                    type="date"
                    required
                    value={newCheckOut}
                    onChange={(e) => setNewCheckOut(e.target.value)}
                    className="w-full bg-[#0f172a] border border-[#334155] rounded-lg p-2.5 text-sm text-[#f8fafc] focus:outline-none focus:ring-1 focus:ring-[#38bdf8]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddModal(false)}
                >
                  Hủy bỏ
                </Button>
                <Button 
                  type="submit" 
                  className="bg-[#38bdf8] text-[#0f172a] hover:bg-[#0ea5e9] font-bold"
                >
                  Lưu hồ sơ
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
