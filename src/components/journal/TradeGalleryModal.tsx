
import { useEffect, useState, useCallback, useMemo } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Trade } from "@/types";
import { Button } from "@/components/ui/button";
import {
    ChevronLeft, ChevronRight, X, Calendar,
    TrendingUp, TrendingDown, Tag
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface TradeGalleryModalProps {
    isOpen: boolean;
    onClose: () => void;
    trades: Trade[];
    initialTradeId: string | null;
}

type FlatItem = {
    trade: Trade;
    photoUrl: string;
    photoIndex: number;
    totalPhotos: number;
};

export const TradeGalleryModal = ({
    isOpen,
    onClose,
    trades,
    initialTradeId
}: TradeGalleryModalProps) => {
    const [currentFlatIndex, setCurrentFlatIndex] = useState(0);

    const flatItems = useMemo<FlatItem[]>(() =>
        trades.flatMap(trade => {
            const urls = (trade.screenshot_urls ?? []).filter(Boolean);
            return urls.map((photoUrl, photoIndex) => ({
                trade,
                photoUrl,
                photoIndex,
                totalPhotos: urls.length,
            }));
        }),
    [trades]);

    useEffect(() => {
        if (isOpen && initialTradeId) {
            const idx = flatItems.findIndex(item => item.trade.id === initialTradeId);
            if (idx !== -1) setCurrentFlatIndex(idx);
        }
    }, [isOpen, initialTradeId, flatItems]);

    const handleNext = useCallback(() => {
        setCurrentFlatIndex(prev => (prev + 1) % flatItems.length);
    }, [flatItems.length]);

    const handlePrev = useCallback(() => {
        setCurrentFlatIndex(prev => (prev - 1 + flatItems.length) % flatItems.length);
    }, [flatItems.length]);

    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight") handleNext();
            if (e.key === "ArrowLeft") handlePrev();
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, handleNext, handlePrev, onClose]);

    if (!flatItems.length) return null;

    const currentItem = flatItems[currentFlatIndex] ?? flatItems[0];
    const currentTrade = currentItem.trade;
    const isWin = Number(currentTrade.pnl) >= 0;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-[95vw] w-full h-[90vh] p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-white/10 flex flex-col md:flex-row gap-0 [&>button]:hidden">

                {/* --- COLUMNA IZQUIERDA: IMAGEN --- */}
                <div className="flex-1 relative bg-black/40 flex items-center justify-center p-4 group overflow-hidden">

                    <AnimatePresence mode="wait">
                        <motion.img
                            key={`${currentTrade.id}-${currentItem.photoIndex}`}
                            src={currentItem.photoUrl || "https://placehold.co/1920x1080/1a1a1a/FFF?text=No+Screenshot"}
                            alt="Trade Screenshot"
                            className="max-h-full max-w-full object-contain rounded-md shadow-2xl"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            transition={{ duration: 0.2 }}
                        />
                    </AnimatePresence>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/50 hover:bg-white/20 text-white backdrop-blur-md border border-white/10 shadow-xl opacity-0 group-hover:opacity-100 transition-all z-20"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => { e.stopPropagation(); handleNext(); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/50 hover:bg-white/20 text-white backdrop-blur-md border border-white/10 shadow-xl opacity-0 group-hover:opacity-100 transition-all z-20"
                    >
                        <ChevronRight className="h-6 w-6" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="absolute top-4 right-4 md:hidden bg-black/50 text-white z-50 rounded-full"
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* --- COLUMNA DERECHA: INFO --- */}
                <div className="w-full md:w-[400px] border-l border-white/10 bg-card p-6 flex flex-col h-full overflow-y-auto relative">

                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-2xl font-bold font-display tracking-tight flex items-center gap-2">
                                {currentTrade.symbol}
                                <span className={`text-xs px-2 py-0.5 rounded-full border ${currentTrade.direction === 'long'
                                    ? 'border-profit/20 bg-profit/10 text-profit'
                                    : 'border-loss/20 bg-loss/10 text-loss'
                                    } uppercase font-bold tracking-wider`}>
                                    {currentTrade.direction}
                                </span>
                            </h2>
                            <p className="text-muted-foreground text-sm flex items-center gap-2 mt-2">
                                <Calendar className="w-4 h-4" />
                                {format(new Date(currentTrade.entry_date), "PPP p", { locale: es })}
                            </p>
                        </div>

                        <Button variant="ghost" size="icon" onClick={onClose} className="hidden md:flex -mr-2 -mt-2 hover:bg-white/10 text-muted-foreground hover:text-white">
                            <X className="w-5 h-5" />
                        </Button>
                    </div>

                    <div className={`p-6 rounded-2xl mb-6 shadow-glow-sm relative overflow-hidden ${isWin
                        ? 'bg-gradient-to-br from-profit/20 to-transparent border border-profit/20'
                        : 'bg-gradient-to-br from-loss/20 to-transparent border border-loss/20'
                        }`}>
                        <div className="relative z-10">
                            <span className="text-sm font-medium uppercase text-muted-foreground/80 tracking-widest">Net PnL</span>
                            <div className={`text-4xl font-mono font-bold mt-1 ${isWin ? 'text-profit' : 'text-loss'}`}>
                                {Number(currentTrade.pnl) >= 0 ? "+" : ""}{Number(currentTrade.pnl).toFixed(2)}
                            </div>
                        </div>
                        <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4">
                            {isWin ? <TrendingUp className="w-24 h-24" /> : <TrendingDown className="w-24 h-24" />}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="p-4 rounded-xl bg-secondary/30 border border-white/5">
                            <span className="text-xs text-muted-foreground uppercase">Entry Price</span>
                            <p className="text-lg font-mono font-bold mt-1">{currentTrade.entry_price}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-secondary/30 border border-white/5">
                            <span className="text-xs text-muted-foreground uppercase">Exit Price</span>
                            <p className="text-lg font-mono font-bold mt-1">{currentTrade.exit_price || "-"}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-secondary/30 border border-white/5">
                            <span className="text-xs text-muted-foreground uppercase">Size</span>
                            <p className="text-lg font-mono font-bold mt-1">{currentTrade.size}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-secondary/30 border border-white/5">
                            <span className="text-xs text-muted-foreground uppercase">Commission</span>
                            <p className="text-lg font-mono font-bold mt-1 text-muted-foreground">
                                ${Number(currentTrade.commission || 0).toFixed(2)}
                            </p>
                        </div>
                    </div>

                    {currentTrade.tags && currentTrade.tags.length > 0 && (
                        <div className="mb-6">
                            <span className="text-sm font-medium text-muted-foreground mb-3 block flex items-center gap-2">
                                <Tag className="w-4 h-4" /> Etiquetas
                            </span>
                            <div className="flex flex-wrap gap-2">
                                {currentTrade.tags.map(tag => (
                                    <span key={tag} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300 hover:bg-white/10 transition-colors cursor-default">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {currentTrade.notes && (
                        <div className="flex-1 min-h-[100px] p-4 rounded-xl bg-secondary/20 border border-white/5 text-sm leading-relaxed text-gray-300 overflow-y-auto">
                            <p className="whitespace-pre-wrap font-sans">{currentTrade.notes}</p>
                        </div>
                    )}

                    <div className="mt-auto pt-6 flex justify-between items-center text-xs text-muted-foreground font-mono uppercase">
                        <span>Trade ID: <span className="text-gray-500">{currentTrade.id.slice(0, 8)}</span></span>
                        <div className="flex flex-col items-end gap-1">
                            {currentItem.totalPhotos > 1 && (
                                <span className="text-primary/70">
                                    Foto {currentItem.photoIndex + 1}/{currentItem.totalPhotos}
                                </span>
                            )}
                            <span>{currentFlatIndex + 1} de {flatItems.length}</span>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
