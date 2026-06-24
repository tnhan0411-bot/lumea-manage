import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, Button, Badge } from './ui';
import { Newspaper, RefreshCw, ExternalLink, Clock, Tag } from 'lucide-react';
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

    useEffect(() => {
        // Fetch real-time updates from Firestore 'news' collection
        const q = query(collection(db, 'news'), orderBy('addedAt', 'desc'), limit(30));
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

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-[#f8fafc] flex items-center gap-2">
                        <Newspaper className="text-[#38bdf8]" />
                        Bảng tin Du lịch Đà Nẵng
                    </h2>
                    <p className="text-[#94a3b8] text-sm mt-1">Cập nhật xu hướng khách quốc tế và tin tức lưu trú (Tự động cập nhật 6:00 sáng)</p>
                </div>
                
                <Button 
                    onClick={handleManualSync} 
                    disabled={syncing}
                    className="flex items-center gap-2 bg-[#38bdf8] text-[#0f172a] hover:bg-[#0ea5e9]"
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

            {loading ? (
                <div className="text-center py-12 text-[#94a3b8]">Đang tải bảng tin...</div>
            ) : news.length === 0 ? (
                <div className="text-center py-12 bg-[#1e293b] rounded-xl border border-[#334155] border-dashed text-[#94a3b8]">
                    <Newspaper className="mx-auto h-12 w-12 text-[#475569] mb-3" />
                    <p>Chưa có bản tin nào được tóm tắt hôm nay.</p>
                    <button onClick={handleManualSync} className="text-[#38bdf8] hover:underline mt-2 text-sm">Bấm vào LÀM MỚI NGAY để AI lấy tin tức mới nhất.</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {news.map(item => (
                        <Card key={item.id} className="hover:bg-white/5 transition-colors flex flex-col border-white/5">
                            <CardContent className="p-5 flex flex-col flex-grow">
                                <div className="flex justify-between items-start mb-3">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#38bdf8] bg-[#38bdf8]/10 px-2 py-1 rounded">
                                        {item.source}
                                    </span>
                                    <div className="flex items-center text-xs text-[#64748b] gap-1">
                                        <Clock size={12} />
                                        {formatDate(item.pubDate)}
                                    </div>
                                </div>
                                
                                <h3 className="font-bold text-[#f8fafc] text-lg leading-tight mb-3 line-clamp-2" title={item.title}>
                                    {item.title}
                                </h3>
                                
                                <p className="text-sm text-[#cbd5e1] mb-5 flex-grow line-clamp-4">
                                    {item.summary}
                                </p>
                                
                                <div className="mt-auto">
                                    <div className="flex flex-wrap gap-2 mb-4">
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
                                        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-[#334155]/50 hover:bg-[#334155] text-[#e2e8f0] text-sm font-medium transition-colors"
                                    >
                                        Đọc chi tiết <ExternalLink size={14} />
                                    </a>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
