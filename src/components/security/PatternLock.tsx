import React, { useState, useRef } from 'react';

interface Props {
  onComplete: (pattern: string) => void;
  minDots?: number;
}

export const PatternLock: React.FC<Props> = ({ onComplete, minDots = 4 }) => {
  const [selected, setSelected] = useState<number[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [errorShake, setErrorShake] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const dots = [0, 1, 2, 3, 4, 5, 6, 7, 8];

  const dotPos = (i: number) => ({
    x: (i % 3) * 100 + 50,
    y: Math.floor(i / 3) * 100 + 50,
  });

  const findNearestDot = (clientX: number, clientY: number): number | null => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const relX = ((clientX - rect.left) / rect.width) * 300;
    const relY = ((clientY - rect.top) / rect.height) * 300;
    for (const i of dots) {
      const pos = dotPos(i);
      if (Math.hypot(pos.x - relX, pos.y - relY) < 45) return i;
    }
    return null;
  };

  const handleStart = (x: number, y: number) => {
    setSelected([]);
    setDrawing(true);
    const dot = findNearestDot(x, y);
    if (dot !== null) setSelected([dot]);
  };

  const handleMove = (x: number, y: number) => {
    if (!drawing) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setMousePos({
        x: ((x - rect.left) / rect.width) * 300,
        y: ((y - rect.top) / rect.height) * 300,
      });
    }
    const dot = findNearestDot(x, y);
    if (dot !== null && !selected.includes(dot)) {
      setSelected(prev => [...prev, dot]);
    }
  };

  const handleEnd = () => {
    if (!drawing) return;
    setDrawing(false);
    setMousePos(null);

    if (selected.length >= minDots) {
      onComplete(selected.join('-'));
    } else if (selected.length > 0) {
      setErrorShake(true);
      setTimeout(() => {
        setErrorShake(false);
        setSelected([]);
      }, 400);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4" dir="rtl">
      <div
        ref={containerRef}
        className={`relative w-64 h-64 sm:w-72 sm:h-72 select-none touch-none ${errorShake ? 'animate-shake' : ''}`}
        onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
        onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={(e) => {
          e.preventDefault();
          const t = e.touches[0];
          handleStart(t.clientX, t.clientY);
        }}
        onTouchMove={(e) => {
          e.preventDefault();
          const t = e.touches[0];
          handleMove(t.clientX, t.clientY);
        }}
        onTouchEnd={handleEnd}
      >
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {selected.length > 1 && selected.slice(0, -1).map((dot, i) => {
            const next = selected[i + 1];
            const p1 = dotPos(dot);
            const p2 = dotPos(next);
            return (
              <line
                key={i}
                x1={`${(p1.x / 300) * 100}%`}
                y1={`${(p1.y / 300) * 100}%`}
                x2={`${(p2.x / 300) * 100}%`}
                y2={`${(p2.y / 300) * 100}%`}
                stroke="rgb(99 102 241)"
                strokeWidth="6"
                strokeLinecap="round"
              />
            );
          })}
          {drawing && mousePos && selected.length > 0 && (
            <line
              x1={`${(dotPos(selected[selected.length - 1]).x / 300) * 100}%`}
              y1={`${(dotPos(selected[selected.length - 1]).y / 300) * 100}%`}
              x2={`${(mousePos.x / 300) * 100}%`}
              y2={`${(mousePos.y / 300) * 100}%`}
              stroke="rgb(99 102 241)"
              strokeWidth="6"
              strokeLinecap="round"
              opacity="0.4"
            />
          )}
        </svg>

        {dots.map(i => {
          const pos = dotPos(i);
          const isSelected = selected.includes(i);
          const idx = selected.indexOf(i);
          return (
            <div
              key={i}
              className={`absolute w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all duration-150 ${
                isSelected
                  ? 'bg-indigo-500 border-indigo-400 scale-110'
                  : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600'
              }`}
              style={{
                left: `calc(${(pos.x / 300) * 100}% - 28px)`,
                top: `calc(${(pos.y / 300) * 100}% - 28px)`,
              }}
            >
              {isSelected && <span className="text-white text-sm font-bold">{idx + 1}</span>}
            </div>
          );
        })}
      </div>

      <p className="text-xs opacity-60 text-center">
        برای باز کردن، الگو را رسم کن (حداقل {minDots} نقطه)
      </p>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        .animate-shake { animation: shake 0.4s ease-in-out; }
      `}</style>
    </div>
  );
};

export default PatternLock;
