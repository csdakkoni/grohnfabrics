'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface BeforeAfterSliderProps {
    beforeLabel?: string;
    afterLabel?: string;
    beforeImage?: string | null;
    afterImage?: string | null;
}

export default function BeforeAfterSlider({
    beforeLabel = 'ÖNCE',
    afterLabel = 'SONRA',
    beforeImage,
    afterImage,
}: BeforeAfterSliderProps) {
    const [sliderPos, setSliderPos] = useState(50);
    const containerRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);

    const updatePosition = useCallback((clientX: number) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
        setSliderPos(percent);
    }, []);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        isDragging.current = true;
        updatePosition(e.clientX);
    }, [updatePosition]);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        isDragging.current = true;
        updatePosition(e.touches[0].clientX);
    }, [updatePosition]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging.current) return;
            updatePosition(e.clientX);
        };
        const handleTouchMove = (e: TouchEvent) => {
            if (!isDragging.current) return;
            updatePosition(e.touches[0].clientX);
        };
        const handleEnd = () => {
            isDragging.current = false;
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleEnd);
        document.addEventListener('touchmove', handleTouchMove, { passive: true });
        document.addEventListener('touchend', handleEnd);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleEnd);
            document.removeEventListener('touchmove', handleTouchMove);
            document.removeEventListener('touchend', handleEnd);
        };
    }, [updatePosition]);

    const hasRealImages = beforeImage && afterImage;

    return (
        <div
            ref={containerRef}
            className="relative w-full aspect-[16/10] md:aspect-[16/9] rounded-2xl overflow-hidden cursor-col-resize select-none shadow-lg"
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
        >
            {/* Before (left side) */}
            <div className="absolute inset-0">
                {hasRealImages ? (
                    <img src={beforeImage} alt={beforeLabel} className="w-full h-full object-cover" />
                ) : (
                    <CSSRoomBefore />
                )}
            </div>

            {/* After (right side) */}
            <div
                className="absolute inset-0"
                style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}
            >
                {hasRealImages ? (
                    <img src={afterImage} alt={afterLabel} className="w-full h-full object-cover" />
                ) : (
                    <CSSRoomAfter />
                )}
            </div>

            {/* Slider Line */}
            <div
                className="absolute top-0 bottom-0 w-[3px] bg-white shadow-lg z-10"
                style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}
            >
                {/* Handle */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M6 10L2 10M2 10L4.5 7.5M2 10L4.5 12.5" stroke="#5C7A58" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M14 10L18 10M18 10L15.5 7.5M18 10L15.5 12.5" stroke="#5C7A58" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            </div>

            {/* Labels */}
            <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/50 text-white text-xs font-medium rounded-full backdrop-blur-sm z-10">
                {beforeLabel}
            </div>
            <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/50 text-white text-xs font-medium rounded-full backdrop-blur-sm z-10">
                {afterLabel}
            </div>
        </div>
    );
}

// CSS-generated room illustration (fallback when no images uploaded)
function CSSRoomBefore() {
    return (
        <div className="w-full h-full bg-gradient-to-br from-[#E8E4DB] via-[#D8D4CB] to-[#C8C4BB]">
            <div className="relative w-full h-full">
                <div className="absolute inset-0 bg-gradient-to-b from-[#F5F1E8] to-[#E8E4DB]" />
                <div className="absolute bottom-0 left-0 right-0 h-[20%] bg-gradient-to-t from-[#C9A86C]/40 to-[#D4B87C]/20" />
                <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[40%] h-[55%] border-[6px] border-[#8B7355] rounded-sm bg-gradient-to-b from-[#C5DEF0] to-[#A8C8E8]">
                    <div className="absolute inset-1 grid grid-cols-2 grid-rows-2 gap-1">
                        <div className="bg-[#B8D4F0]/60 rounded-sm" />
                        <div className="bg-[#B8D4F0]/60 rounded-sm" />
                        <div className="bg-[#A8C4E0]/60 rounded-sm" />
                        <div className="bg-[#A8C4E0]/60 rounded-sm" />
                    </div>
                </div>
                <div className="absolute bottom-[20%] right-[15%]">
                    <div className="w-6 md:w-8 h-8 md:h-10 bg-[#7A9B76]/50 rounded-full" />
                    <div className="w-4 md:w-5 h-5 md:h-6 bg-[#8B6B4A]/40 rounded-sm mx-auto -mt-1" />
                </div>
            </div>
        </div>
    );
}

function CSSRoomAfter() {
    return (
        <div className="w-full h-full bg-gradient-to-br from-[#F2EFE8] via-[#E8E4DB] to-[#DED9D0]">
            <div className="relative w-full h-full">
                <div className="absolute inset-0 bg-gradient-to-b from-[#F5F1E8] to-[#E8E4DB]" />
                <div className="absolute bottom-0 left-0 right-0 h-[20%] bg-gradient-to-t from-[#C9A86C]/40 to-[#D4B87C]/20" />
                <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[40%] h-[55%] border-[6px] border-[#8B7355] rounded-sm bg-gradient-to-b from-[#C5DEF0] to-[#A8C8E8]">
                    <div className="absolute inset-1 grid grid-cols-2 grid-rows-2 gap-1">
                        <div className="bg-[#B8D4F0]/60 rounded-sm" />
                        <div className="bg-[#B8D4F0]/60 rounded-sm" />
                        <div className="bg-[#A8C4E0]/60 rounded-sm" />
                        <div className="bg-[#A8C4E0]/60 rounded-sm" />
                    </div>
                </div>
                <div className="absolute top-[12%] left-[20%] right-[20%] h-[3px] bg-[#8B7355] rounded-full shadow-sm" />
                <div className="absolute top-[12%] left-[20%] w-[16%] h-[60%] bg-gradient-to-r from-[#7A9B76]/70 via-[#8BAA85]/60 to-[#7A9B76]/50 rounded-b-sm">
                    <div className="absolute inset-0 opacity-30" style={{ background: 'repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(255,255,255,0.2) 8px, rgba(255,255,255,0.2) 10px)' }} />
                </div>
                <div className="absolute top-[12%] right-[20%] w-[16%] h-[60%] bg-gradient-to-l from-[#7A9B76]/70 via-[#8BAA85]/60 to-[#7A9B76]/50 rounded-b-sm">
                    <div className="absolute inset-0 opacity-30" style={{ background: 'repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(255,255,255,0.2) 8px, rgba(255,255,255,0.2) 10px)' }} />
                </div>
                <div className="absolute bottom-[20%] right-[15%]">
                    <div className="w-6 md:w-8 h-8 md:h-10 bg-[#7A9B76]/50 rounded-full" />
                    <div className="w-4 md:w-5 h-5 md:h-6 bg-[#8B6B4A]/40 rounded-sm mx-auto -mt-1" />
                </div>
                <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[30%] h-[40%] bg-[#FFF8E7]/20 rounded-full blur-xl" />
            </div>
        </div>
    );
}
