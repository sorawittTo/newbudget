import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui/Card';
import { Trophy, TrendingUp, TrendingDown, Minus, Crown, Medal, Award } from 'lucide-react';
import { EmployeePerformance } from '../../types';

interface PerformanceCardProps {
  employee: EmployeePerformance;
  rank: number;
  onClick?: () => void;
}

export const PerformanceCard: React.FC<PerformanceCardProps> = ({
  employee,
  rank,
  onClick
}) => {
  const getRankIcon = () => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />;
    return <Trophy className="w-5 h-5 text-blue-500" />;
  };

  const getRankColor = () => {
    if (rank === 1) return 'from-yellow-400 to-yellow-600';
    if (rank === 2) return 'from-gray-300 to-gray-500';
    if (rank === 3) return 'from-amber-400 to-amber-600';
    return 'from-blue-400 to-blue-600';
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceGradient = (score: number) => {
    if (score >= 90) return 'from-green-500 to-green-600';
    if (score >= 80) return 'from-blue-500 to-blue-600';
    if (score >= 70) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      className="cursor-pointer"
      onClick={onClick}
    >
      <Card className="p-4 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getRankColor()} flex items-center justify-center text-white font-bold text-sm`}>
              {rank}
            </div>
            <div>
              <p className="font-semibold text-gray-800">{employee.name}</p>
              <p className="text-sm text-gray-600">Level {employee.level}</p>
            </div>
          </div>
          {getRankIcon()}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Overall Score</span>
            <span className={`text-lg font-bold ${getPerformanceColor(employee.totalScore)}`}>
              {employee.totalScore}
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full bg-gradient-to-r ${getPerformanceGradient(employee.totalScore)} transition-all duration-500`}
              style={{ width: `${Math.min(employee.totalScore, 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Streak: {employee.streak} days</span>
            <span className="text-gray-600">XP: {employee.experience}</span>
          </div>
        </div>

        {/* Top 3 metrics */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          {Object.entries(employee.metrics)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([key, value]) => (
              <div key={key} className="text-center p-2 bg-gray-50 rounded">
                <p className="text-xs text-gray-600 capitalize">{key}</p>
                <p className="text-sm font-semibold">{Math.round(value)}%</p>
              </div>
            ))}
        </div>

        {/* Badges */}
        <div className="mt-3 flex flex-wrap gap-1">
          {employee.badges.slice(0, 2).map((badge, index) => (
            <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {badge}
            </span>
          ))}
          {employee.badges.length > 2 && (
            <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
              +{employee.badges.length - 2}
            </span>
          )}
        </div>
      </Card>
    </motion.div>
  );
};