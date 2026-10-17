'use client';

import React from 'react';

interface SparklineGraphProps {
  color?: 'emerald' | 'purple' | 'amber' | 'rose' | 'blue';
  trend?: 'up' | 'down' | 'steady';
  className?: string;
  height?: number;
}

export const SparklineGraph: React.FC<SparklineGraphProps> = ({
  color = 'emerald',
  trend = 'up',
  className = '',
  height = 42,
}) => {
  // Pre-calculated smooth bezier curves for different trends
  const pathUp = 'M 0 32 C 30 35, 55 18, 90 24 C 130 30, 160 8, 200 16 C 240 24, 270 4, 300 2';
  const pathUpFill = `${pathUp} L 300 48 L 0 48 Z`;

  const pathDown = 'M 0 8 C 40 10, 70 25, 110 18 C 150 12, 180 32, 220 28 C 260 24, 280 40, 300 44';
  const pathDownFill = `${pathDown} L 300 48 L 0 48 Z`;

  const pathSteady = 'M 0 24 C 40 18, 70 30, 110 22 C 150 16, 190 28, 230 20 C 270 14, 285 24, 300 22';
  const pathSteadyFill = `${pathSteady} L 300 48 L 0 48 Z`;

  const strokePath = trend === 'up' ? pathUp : trend === 'down' ? pathDown : pathSteady;
  const fillPath = trend === 'up' ? pathUpFill : trend === 'down' ? pathDownFill : pathSteadyFill;

  const colorMap = {
    emerald: {
      stroke: '#10b981',
      stopColor: '#10b981',
      glow: 'rgba(16, 185, 129, 0.4)',
    },
    purple: {
      stroke: '#8b5cf6',
      stopColor: '#8b5cf6',
      glow: 'rgba(139, 92, 246, 0.4)',
    },
    amber: {
      stroke: '#f59e0b',
      stopColor: '#f59e0b',
      glow: 'rgba(245, 158, 11, 0.4)',
    },
    rose: {
      stroke: '#f43f5e',
      stopColor: '#f43f5e',
      glow: 'rgba(244, 63, 94, 0.4)',
    },
    blue: {
      stroke: '#38bdf8',
      stopColor: '#38bdf8',
      glow: 'rgba(56, 189, 248, 0.4)',
    },
  };

  const selectedColor = colorMap[color];
  const gradientId = `sparkline-grad-${color}-${trend}`;

  return (
    <div className={`w-full overflow-hidden select-none pointer-events-none ${className}`} style={{ height }}>
      <svg
        viewBox="0 0 300 48"
        preserveAspectRatio="none"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={selectedColor.stopColor} stopOpacity="0.28" />
            <stop offset="85%" stopColor={selectedColor.stopColor} stopOpacity="0.04" />
            <stop offset="100%" stopColor={selectedColor.stopColor} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Faint Dotted Baseline */}
        <line
          x1="0"
          y1="24"
          x2="300"
          y2="24"
          stroke="rgba(255, 255, 255, 0.06)"
          strokeDasharray="3 3"
          strokeWidth="1"
        />

        {/* Area fill */}
        <path d={fillPath} fill={`url(#${gradientId})`} />

        {/* Curve stroke */}
        <path
          d={strokePath}
          fill="none"
          stroke={selectedColor.stroke}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: `drop-shadow(0 0 4px ${selectedColor.glow})` }}
        />

        {/* Trend end dot */}
        <circle
          cx={300}
          cy={trend === 'up' ? 2 : trend === 'down' ? 44 : 22}
          r="3"
          fill={selectedColor.stroke}
          style={{ filter: `drop-shadow(0 0 6px ${selectedColor.stroke})` }}
        />
      </svg>
    </div>
  );
};
