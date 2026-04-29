'use client';

import { Flame, Plus, Minus } from 'lucide-react';
import { useState } from 'react';

interface DietRecord {
  id: string;
  userId: string;
  date: string;
  foodName: string;
  calories: number;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

interface CalorieTrackerProps {
  totalCalories: number;
  goal: number;
  diets: DietRecord[];
}

export default function CalorieTracker({ totalCalories, goal, diets }: CalorieTrackerProps) {
  const [expanded, setExpanded] = useState(false);

  const percentage = Math.min((totalCalories / goal) * 100, 100);
  const remaining = goal - totalCalories;
  const isOver = totalCalories > goal;

  // 식사 유형별 아이콘
  const mealIcons: Record<string, string> = {
    breakfast: '🌅',
    lunch: '☀️',
    dinner: '🌙',
    snack: '🍪',
  };

  // 식사 유형별 라벨
  const mealLabels: Record<string, string> = {
    breakfast: '아침',
    lunch: '점심',
    dinner: '저녁',
    snack: '간식',
  };

  // 그룹화된 식단 데이터
  const groupedDiets = diets.reduce((acc, diet) => {
    if (!acc[diet.type]) {
      acc[diet.type] = [];
    }
    acc[diet.type].push(diet);
    return acc;
  }, {} as Record<string, DietRecord[]>);

  return (
    <div>
      {/* 칼로리 진행률 원형 차트 */}
      <div className="relative flex items-center justify-center mb-6">
        <div className="relative w-40 h-40">
          <svg className="w-full h-full transform -rotate-90">
            {/* 배경 원 */}
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke="#f3f4f6"
              strokeWidth="12"
            />
            {/* 진행 원 */}
            <circle
              cx="80"
              cy="80"
              r="70"
              fill="none"
              stroke={isOver ? '#ef4444' : '#f97316'}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${percentage * 4.4} 440`}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-bold ${isOver ? 'text-red-500' : 'text-gray-800'}`}>
              {totalCalories}
            </span>
            <span className="text-sm text-gray-500">/ {goal} kcal</span>
          </div>
        </div>
      </div>

      {/* 상태 메시지 */}
      <div className="text-center mb-4">
        {isOver ? (
          <p className="text-red-500 font-medium">
            ⚠️ 목표 칼로리를 {totalCalories - goal} kcal 초과했어요!
          </p>
        ) : remaining > 0 ? (
          <p className="text-gray-600">
            남은 칼로리: <span className="font-semibold text-orange-500">{remaining} kcal</span>
          </p>
        ) : (
          <p className="text-green-500 font-medium">
            🎉 오늘의 칼로리 목표 달성!
          </p>
        )}
      </div>

      {/* 식단 상세 목록 */}
      <div className="border-t border-gray-100 pt-4">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <span>식단 상세 보기 ({diets.length}개)</span>
          <span className={`transform transition-transform ${expanded ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>

        {expanded && (
          <div className="mt-3 space-y-2">
            {Object.entries(groupedDiets).map(([type, typeDiets]) => (
              <div key={type} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span>{mealIcons[type]}</span>
                  <span className="font-medium text-gray-700">{mealLabels[type]}</span>
                  <span className="text-sm text-gray-500">
                    ({typeDiets.reduce((sum, d) => sum + d.calories, 0)} kcal)
                  </span>
                </div>
                <div className="space-y-1">
                  {typeDiets.map((diet) => (
                    <div key={diet.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">{diet.foodName}</span>
                      <span className="text-gray-500">{diet.calories} kcal</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}