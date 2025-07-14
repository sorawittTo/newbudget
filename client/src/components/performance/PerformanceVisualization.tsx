import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { NeumorphismIconButton } from '../ui/NeumorphismIconButton';
import { PerformanceCard } from './PerformanceCard';
import { PerformanceRadarChart } from './PerformanceRadarChart';
import { 
  Trophy, 
  TrendingUp, 
  Star, 
  Award, 
  Target, 
  Users, 
  Zap, 
  Crown,
  Medal,
  Flame,
  ChevronRight,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { EmployeePerformance, PerformanceMetrics, Achievement, TeamPerformance } from '../../types';

interface PerformanceVisualizationProps {
  employees: any[];
  onSave: () => void;
}

export const PerformanceVisualization: React.FC<PerformanceVisualizationProps> = ({
  employees,
  onSave
}) => {
  const [activeView, setActiveView] = useState<'overview' | 'individual' | 'team' | 'achievements'>('overview');
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [performanceData, setPerformanceData] = useState<EmployeePerformance[]>([]);

  // Generate mock performance data based on existing employees
  useEffect(() => {
    const generatePerformanceData = () => {
      return employees.map((emp, index) => {
        const baseScore = 60 + Math.random() * 35; // Base score 60-95
        const levelMultiplier = parseFloat(emp.level) * 2; // Higher level = better performance
        const experienceYears = 2568 - emp.startYear;
        
        return {
          ...emp,
          metrics: {
            productivity: Math.min(100, baseScore + levelMultiplier + Math.random() * 10),
            collaboration: Math.min(100, baseScore + Math.random() * 15),
            innovation: Math.min(100, baseScore + Math.random() * 12),
            leadership: Math.min(100, baseScore + levelMultiplier + Math.random() * 8),
            reliability: Math.min(100, baseScore + experienceYears + Math.random() * 5),
            adaptability: Math.min(100, baseScore + Math.random() * 18)
          },
          achievements: generateAchievements(emp.level, experienceYears),
          totalScore: Math.round(baseScore + levelMultiplier + experienceYears),
          rank: index + 1,
          level: Math.floor((baseScore + levelMultiplier) / 15) + 1,
          experience: Math.round(baseScore * 10 + experienceYears * 50),
          nextLevelXp: 1000,
          streak: Math.floor(Math.random() * 30) + 1,
          badges: generateBadges(emp.level, experienceYears),
          lastUpdated: new Date()
        } as EmployeePerformance;
      });
    };

    setPerformanceData(generatePerformanceData());
  }, [employees]);

  const generateAchievements = (level: string, experience: number): Achievement[] => {
    const achievements: Achievement[] = [];
    const levelNum = parseFloat(level);
    
    // Level-based achievements
    if (levelNum >= 6) {
      achievements.push({
        id: 'leadership_master',
        title: 'Master Leader',
        description: 'Achieved senior management level',
        icon: '👑',
        category: 'leadership',
        rarity: 'epic',
        unlockedAt: new Date()
      });
    }
    
    // Experience-based achievements
    if (experience >= 20) {
      achievements.push({
        id: 'veteran',
        title: 'Veteran Employee',
        description: '20+ years of dedicated service',
        icon: '🏆',
        category: 'milestone',
        rarity: 'legendary',
        unlockedAt: new Date()
      });
    }
    
    // Random achievements
    if (Math.random() > 0.3) {
      achievements.push({
        id: 'innovator',
        title: 'Innovation Champion',
        description: 'Contributed to process improvements',
        icon: '💡',
        category: 'innovation',
        rarity: 'rare',
        unlockedAt: new Date()
      });
    }
    
    return achievements;
  };

  const generateBadges = (level: string, experience: number): string[] => {
    const badges: string[] = [];
    const levelNum = parseFloat(level);
    
    if (levelNum >= 7) badges.push('🥇 Top Performer');
    if (levelNum >= 5) badges.push('⭐ Team Leader');
    if (experience >= 15) badges.push('🔥 Veteran');
    if (Math.random() > 0.5) badges.push('🚀 Innovator');
    
    return badges;
  };

  const getOverallTeamStats = (): TeamPerformance => {
    const sortedByScore = [...performanceData].sort((a, b) => b.totalScore - a.totalScore);
    const averageScore = performanceData.reduce((sum, emp) => sum + emp.totalScore, 0) / performanceData.length;
    
    return {
      averageScore: Math.round(averageScore),
      topPerformers: sortedByScore.slice(0, 5),
      improvementLeaders: sortedByScore.slice(0, 3).map(emp => ({
        employeeId: emp.id,
        previousScore: emp.totalScore - Math.floor(Math.random() * 10),
        currentScore: emp.totalScore,
        improvement: Math.floor(Math.random() * 10) + 1,
        trend: 'up' as const
      })),
      departmentRankings: [
        { department: 'วิศวกรรม', score: Math.round(averageScore + 5) },
        { department: 'บริหาร', score: Math.round(averageScore + 2) },
        { department: 'ปฏิบัติการ', score: Math.round(averageScore - 2) }
      ]
    };
  };

  const renderOverview = () => {
    const teamStats = getOverallTeamStats();
    
    return (
      <div className="space-y-6">
        {/* Team Performance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Team Average Score</p>
                <p className="text-3xl font-bold text-blue-800">{teamStats.averageScore}</p>
              </div>
              <div className="p-3 bg-blue-200 rounded-full">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Top Performers</p>
                <p className="text-3xl font-bold text-green-800">{teamStats.topPerformers.length}</p>
              </div>
              <div className="p-3 bg-green-200 rounded-full">
                <Trophy className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Active Employees</p>
                <p className="text-3xl font-bold text-purple-800">{performanceData.length}</p>
              </div>
              <div className="p-3 bg-purple-200 rounded-full">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Top Performers Grid */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Top Performers
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teamStats.topPerformers.map((employee, index) => (
              <PerformanceCard
                key={employee.id}
                employee={employee}
                rank={index + 1}
                onClick={() => {
                  setSelectedEmployee(employee.id);
                  setActiveView('individual');
                }}
              />
            ))}
          </div>
        </Card>

        {/* Performance Metrics Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" />
            Team Performance Metrics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.keys(performanceData[0]?.metrics || {}).map((metric) => {
              const average = performanceData.reduce((sum, emp) => sum + emp.metrics[metric as keyof PerformanceMetrics], 0) / performanceData.length;
              return (
                <div key={metric} className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-600 capitalize">{metric}</p>
                  <p className="text-2xl font-bold text-gray-800">{Math.round(average)}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${average}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    );
  };

  const renderIndividualPerformance = () => {
    if (!selectedEmployee) {
      return (
        <Card className="p-6 text-center">
          <p className="text-gray-500">Select an employee to view their performance details</p>
        </Card>
      );
    }

    const employee = performanceData.find(emp => emp.id === selectedEmployee);
    if (!employee) return null;

    return (
      <div className="space-y-6">
        {/* Employee Header */}
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {employee.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-2xl font-bold">{employee.name}</h2>
                <p className="text-gray-600">Level {employee.level} • {employee.streak} day streak</p>
                <div className="flex items-center gap-2 mt-1">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="text-sm text-gray-600">{employee.experience} XP</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-blue-600">{employee.totalScore}</p>
              <p className="text-sm text-gray-600">Overall Score</p>
            </div>
          </div>
        </Card>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PerformanceRadarChart 
            metrics={employee.metrics} 
            title="Performance Radar"
            size="lg"
          />
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Detailed Metrics</h3>
            <div className="space-y-4">
              {Object.entries(employee.metrics).map(([key, value]) => (
                <div key={key} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-600 capitalize">{key}</p>
                    <p className="text-lg font-bold text-gray-800">{Math.round(value)}%</p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Achievements */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" />
            Achievements ({employee.achievements.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {employee.achievements.map((achievement) => (
              <div key={achievement.id} className="p-4 border rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{achievement.icon}</span>
                  <div>
                    <p className="font-medium">{achievement.title}</p>
                    <p className="text-sm text-gray-600">{achievement.description}</p>
                    <span className={`text-xs px-2 py-1 rounded ${
                      achievement.rarity === 'legendary' ? 'bg-purple-100 text-purple-800' :
                      achievement.rarity === 'epic' ? 'bg-orange-100 text-orange-800' :
                      achievement.rarity === 'rare' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {achievement.rarity}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Badges */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Medal className="w-5 h-5 text-blue-500" />
            Badges
          </h3>
          <div className="flex flex-wrap gap-2">
            {employee.badges.map((badge, index) => (
              <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {badge}
              </span>
            ))}
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={activeView === 'overview' ? 'primary' : 'secondary'}
            onClick={() => setActiveView('overview')}
            className="flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            Overview
          </Button>
          <Button
            variant={activeView === 'individual' ? 'primary' : 'secondary'}
            onClick={() => setActiveView('individual')}
            className="flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            Individual
          </Button>
          <Button
            variant={activeView === 'team' ? 'primary' : 'secondary'}
            onClick={() => setActiveView('team')}
            className="flex items-center gap-2"
          >
            <Trophy className="w-4 h-4" />
            Team
          </Button>
          <Button
            variant={activeView === 'achievements' ? 'primary' : 'secondary'}
            onClick={() => setActiveView('achievements')}
            className="flex items-center gap-2"
          >
            <Award className="w-4 h-4" />
            Achievements
          </Button>
        </div>
      </Card>

      {/* Employee Selection for Individual View */}
      {activeView === 'individual' && (
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Select Employee</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {performanceData.map((employee) => (
              <Button
                key={employee.id}
                variant={selectedEmployee === employee.id ? 'primary' : 'secondary'}
                onClick={() => setSelectedEmployee(employee.id)}
                className="justify-start"
              >
                {employee.name}
              </Button>
            ))}
          </div>
        </Card>
      )}

      {/* Content Based on Active View */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeView === 'overview' && renderOverview()}
          {activeView === 'individual' && renderIndividualPerformance()}
          {activeView === 'team' && renderOverview()}
          {activeView === 'achievements' && renderOverview()}
        </motion.div>
      </AnimatePresence>

      {/* Action Buttons */}
      <Card className="p-4">
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <NeumorphismIconButton
              icon={Target}
              label="Set Goals"
              onClick={() => {}}
              variant="secondary"
              size="md"
            />
            <NeumorphismIconButton
              icon={TrendingUp}
              label="View Trends"
              onClick={() => {}}
              variant="secondary"
              size="md"
            />
          </div>
          <div className="flex gap-2">
            <NeumorphismIconButton
              icon={Activity}
              label="Export Report"
              onClick={() => {}}
              variant="secondary"
              size="md"
            />
            <NeumorphismIconButton
              icon={Trophy}
              label="Save"
              onClick={onSave}
              variant="success"
              size="md"
            />
          </div>
        </div>
      </Card>
    </div>
  );
};