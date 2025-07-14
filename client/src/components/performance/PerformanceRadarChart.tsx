import React from 'react';
import { Card } from '../ui/Card';
import { PerformanceMetrics } from '../../types';

interface PerformanceRadarChartProps {
  metrics: PerformanceMetrics;
  title: string;
  size?: 'sm' | 'md' | 'lg';
}

export const PerformanceRadarChart: React.FC<PerformanceRadarChartProps> = ({
  metrics,
  title,
  size = 'md'
}) => {
  const dimensions = {
    sm: { radius: 80, center: 100 },
    md: { radius: 100, center: 120 },
    lg: { radius: 120, center: 150 }
  };

  const { radius, center } = dimensions[size];
  
  const categories = Object.keys(metrics) as (keyof PerformanceMetrics)[];
  const values = Object.values(metrics);
  
  // Calculate points for the radar chart
  const points = categories.map((category, index) => {
    const angle = (index * 2 * Math.PI) / categories.length - Math.PI / 2;
    const value = metrics[category];
    const r = (value / 100) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y, value, category };
  });

  // Calculate grid lines
  const gridLines = [20, 40, 60, 80, 100].map(level => {
    return categories.map((_, index) => {
      const angle = (index * 2 * Math.PI) / categories.length - Math.PI / 2;
      const r = (level / 100) * radius;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      return { x, y };
    });
  });

  // Calculate axis lines
  const axisLines = categories.map((_, index) => {
    const angle = (index * 2 * Math.PI) / categories.length - Math.PI / 2;
    const x = center + radius * Math.cos(angle);
    const y = center + radius * Math.sin(angle);
    return { x, y };
  });

  const pathData = points.map((point, index) => {
    return `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`;
  }).join(' ') + ' Z';

  return (
    <Card className="p-4">
      <h4 className="text-lg font-semibold mb-4 text-center">{title}</h4>
      <div className="flex justify-center">
        <svg width={center * 2} height={center * 2} className="overflow-visible">
          {/* Grid circles */}
          {[20, 40, 60, 80, 100].map(level => (
            <circle
              key={level}
              cx={center}
              cy={center}
              r={(level / 100) * radius}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          ))}
          
          {/* Axis lines */}
          {axisLines.map((line, index) => (
            <line
              key={index}
              x1={center}
              y1={center}
              x2={line.x}
              y2={line.y}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          ))}
          
          {/* Data area */}
          <path
            d={pathData}
            fill="rgba(59, 130, 246, 0.2)"
            stroke="rgba(59, 130, 246, 0.8)"
            strokeWidth="2"
          />
          
          {/* Data points */}
          {points.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="4"
              fill="#3b82f6"
              stroke="white"
              strokeWidth="2"
            />
          ))}
          
          {/* Labels */}
          {categories.map((category, index) => {
            const angle = (index * 2 * Math.PI) / categories.length - Math.PI / 2;
            const labelRadius = radius + 20;
            const x = center + labelRadius * Math.cos(angle);
            const y = center + labelRadius * Math.sin(angle);
            const value = metrics[category];
            
            return (
              <g key={index}>
                <text
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-xs font-medium fill-gray-700"
                >
                  {category}
                </text>
                <text
                  x={x}
                  y={y + 12}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-xs fill-blue-600 font-bold"
                >
                  {Math.round(value)}%
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </Card>
  );
};