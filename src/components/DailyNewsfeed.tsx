import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, Button, Badge } from './ui';
import { Newspaper, RefreshCw, ExternalLink, Clock, Tag, AlertTriangle, ShieldAlert } from 'lucide-react';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/context';
import { cn } from '../lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

export interface NewsArticle {
    id: string;
    title: string;
    link: string;
    summary: string;
    sentiment?: 'positive' | 'negative';
    warnings?: string[];
    tags: string[];
    pubDate: string;
    source: string;
    addedAt: string;
}

export function DailyNewsfeed() {
    const [news, setNews] = useState<NewsArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'positive' | 'negative'>('all');

    useEffect(() => {
        // Fetch real-time updates from Firestore 'news' collection
        const q = query(collection(db, 'news'), orderBy('addedAt', 'desc'), limit(40));
        const unsub = onSnapshot(q, (snapshot) => {
            const fetched = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as NewsArticle));
            setNews(fetched);
            setLoading(false);
        }, (err) => {
            console.error('Error fetching news:', err);
            setLoading(false);
        });

        return () => unsub();
    }, []);

    const handleManualSync = async () => {
        setSyncing(true);
        setError(null);
        try {
            const res = await fetch('/api/news/sync', { method: 'POST' });
            
            let data;
            try {
                data = await res.json();
            } catch (e) {
                throw new Error('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
            }

            if (!res.ok) {
                throw new Error(data.error || 'Cập nhật tin tức thất bại');
            }
            
            setSyncing(false);
            
        } catch (err: any) {
            setError(err.message);
            setSyncing(false);
        }
    };

    const formatDate = (dateStr: string) => {
        try {
            return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: vi });
        } catch (e) {
            return dateStr;
        }
    };

    const filteredNews = news.filter(item => {
        if (filter === 'all') return true;
        if (filter === 'positive') return item.sentiment === 'positive' || !item.sentiment;
        if (filter === 'negative') return item.sentiment === 'negative';
        return true;
    });

    const totalPositive = news.filter(n => n.sentiment !== 'negative').length;
    const totalNegative = news.filter(n => n.sentiment === 'negative').length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-[#f8fafc] flex items-center gap-2">
                        <Newspaper className="text-[#38bdf8]" />
                        Bảng tin Hàng ngày (Daily Newsfeed) Toàn quốc
                    </h2>
                    <p className="text-[#94a3b8] text-sm mt-1">
                        Phân tích an ninh lưu trú & Du lịch Việt Nam bằng AI (Tự động cập nhật 6:00 sáng)
                    </p>
                </div>
                
                <Button 
                    onClick={handleManualSync} 
                    disabled={syncing}
                    className="flex items-center gap-2 bg-[#38bdf8] text-[#0f172a] hover:bg-[#0ea5e9] shrink-0"
                >
                    <RefreshCw size={16} className={cn(syncing && 'animate-spin')} />
                    {syncing ? 'Đang cập nhật AI...' : 'Làm mới ngay'}
                </Button>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-sm">
                    Có lỗi xảy ra: {error}
                </div>
            )}

            {/* AI Sentiment Filters */}
            <div className="flex flex-wrap gap-2 border-b border-white/5 pb-4">
                <button
                    onClick={() => setFilter('all')}
                    className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                        filter === 'all' 
                            ? "bg-[#334155] text-white border border-[#475569]" 
                            : "text-[#94a3b8] hover:text-white hover:bg-white/5"
                    )}
                >
                    <Newspaper size={16} />
                    Tất cả tin tức ({news.length})
                </button>
                <button
                    onClick={() => setFilter('positive')}
                    className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                        filter === 'positive' 
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold" 
                            : "text-[#94a3b8] hover:text-white hover:bg-white/5"
                    )}
                >
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                    Tin tích cực ({totalPositive})
                </button>
                <button
                    onClick={() => setFilter('negative')}
                    className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                        filter === 'negative' 
                            ? "bg-rose-500/20 text-rose-400 border border-rose-500/30 font-semibold shadow-[0_0_12px_rgba(244,63,94,0.15)] animate-pulse" 
                            : "text-[#94a3b8] hover:text-white hover:bg-white/5"
                    )}
                >
                    <span className="w-2 h-2 rounded-full bg-rose-500 inline-block animate-ping" />
                    🚨 Cảnh báo an ninh ({totalNegative})
                </button>
            </div>

            {loading ? (
                <div className="text-center py-12 text-[#94a3b8]">Đang tải bảng tin...</div>
            ) : filteredNews.length === 0 ? (
                <div className="text-center py-12 bg-[#1e293b] rounded-xl border border-[#334155] border-dashed text-[#94a3b8]">
                    <Newspaper className="mx-auto h-12 w-12 text-[#475569] mb-3" />
                    <p>Chưa có bản tin nào thuộc danh mục này.</p>
                    <button onClick={handleManualSync} className="text-[#38bdf8] hover:underline mt-2 text-sm">
                        Bấm vào LÀM MỚI NGAY để AI lấy tin tức mới nhất.
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredNews.map(item => {
                        const isWarning = item.sentiment === 'negative';
                        return (
                            <Card 
                                key={item.id} 
                                className={cn(
                                    "hover:bg-white/5 transition-all flex flex-col duration-300 border",
                                    isWarning 
                                        ? "border-rose-500/40 bg-rose-950/10 hover:bg-rose-950/15 hover:border-rose-500/60 shadow-[0_4px_20px_rgba(244,63,94,0.08)]" 
                                        : "border-white/5 bg-white/[0.02]"
                                )}
                            >
                                <CardContent className="p-5 flex flex-col flex-grow relative">
                                    <div className="flex justify-between items-start mb-3 gap-2">
                                        <div className="flex gap-2 flex-wrap">
                                            <span className={cn(
                                                "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border",
                                                isWarning 
                                                    ? "text-rose-400 bg-rose-500/10 border-rose-500/20" 
                                                    : "text-[#38bdf8] bg-[#38bdf8]/10 border-[#38bdf8]/20"
                                            )}>
                                                {item.source}
                                            </span>
                                            {isWarning && (
                                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-100 bg-rose-600 px-2 py-0.5 rounded flex items-center gap-1 shadow-sm border border-rose-500/50 animate-pulse">
                                                    <ShieldAlert size={10} /> CẢNH BÁO AN NINH
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center text-xs text-[#64748b] gap-1 shrink-0">
                                            <Clock size={12} />
                                            {formatDate(item.pubDate)}
                                        </div>
                                    </div>
                                    
                                    <h3 className={cn(
                                        "font-bold text-lg leading-snug mb-3 line-clamp-2 transition-colors",
                                        isWarning ? "text-rose-200 hover:text-rose-100" : "text-[#f8fafc]"
                                    )} title={item.title}>
                                        {item.title}
                                    </h3>
                                    
                                    <p className="text-sm text-[#cbd5e1] mb-5 flex-grow line-clamp-4 leading-relaxed">
                                        {item.summary}
                                    </p>
                                    
                                    <div className="mt-auto space-y-4">
                                        {/* Warnings List if Negative */}
                                        {isWarning && item.warnings && item.warnings.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 p-2 bg-rose-500/5 rounded-lg border border-rose-500/10">
                                                {item.warnings.map((warn, wIdx) => (
                                                    <span 
                                                        key={wIdx} 
                                                        className="text-[11px] font-semibold text-rose-300 bg-rose-950/40 px-2 py-0.5 rounded flex items-center gap-1 border border-rose-500/20 shadow-sm"
                                                    >
                                                        🚨 {warn}
                                                    </span>
                                                ))}
                                            </div>
                                        )}

                                        {/* Regular tags */}
                                        <div className="flex flex-wrap gap-1.5">
                                            {item.tags?.slice(0, 3).map((tag, idx) => (
                                                <span key={idx} className="flex items-center gap-1 text-xs text-[#94a3b8] bg-[#0f172a] px-2 py-1 rounded-md border border-[#334155]">
                                                    <Tag size={10} />
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                        
                                        <a 
                                            href={item.link} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className={cn(
                                                "flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                                                isWarning 
                                                    ? "bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 border border-rose-500/20" 
                                                    : "bg-[#334155]/50 hover:bg-[#334155] text-[#e2e8f0]"
                                            )}
                                        >
                                            Đọc chi tiết <ExternalLink size={14} />
                                        </a>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
