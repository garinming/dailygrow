'use client';

import { CheckCircle, Circle, Star } from 'lucide-react';
import { useState } from 'react';

interface SkincareItem {
  id: string;
  userId: string;
  title: string;
  session: 'morning' | 'evening';
  dayOfWeek: string[];
  isSpecial?: boolean;
  specialDay?: string;
}

interface SkincareChecklistProps {
  items: SkincareItem[];
  todayDayOfWeek: string;
}

export default function SkincareChecklist({ items, todayDayOfWeek }: SkincareChecklistProps) {
  const [session, setSession] = useState<'morning' | 'evening'>('evening');
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  // 오늘 해당하는 스킨케어 아이템 필터링
  const todayItems = items.filter(item => 
    item.dayOfWeek.includes(todayDayOfWeek) || (item.isSpecial && item.specialDay === todayDayOfWeek)
  );

  // 세션별 필터링
  const sessionItems = todayItems.filter(item => item.session === session);

  // 체크 토글
  const toggleCheck = (itemId: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(itemId)) {
      newChecked.delete(itemId);
    } else {
      newChecked.add(itemId);
    }
    setCheckedItems(newChecked);
  };

  // 체크 완료율 계산
  const completedCount = sessionItems.filter(item => checkedItems.has(item.id)).length;
  const totalCount = sessionItems.length;
  const completionRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // 특별 아이템 확인 (예: 수요일 각질제거)
  const specialItems = sessionItems.filter(item => item.isSpecial);

  return (
    <div>
      {/* 세션 선택 탭 */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setSession('morning')}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            session === 'morning'
              ? 'bg-purple-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          🌅 아침
        </button>
        <button
          onClick={() => setSession('evening')}
          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
            session === 'evening'
              ? 'bg-purple-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          🌙 저녁
        </button>
      </div>

      {/* 진행률 바 */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">진행률</span>
          <span className="font-medium text-purple-600">
            {completedCount}/{totalCount} ({Math.round(completionRate)}%)
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-purple-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>

      {/* 특별 아이템 (如果有) */}
      {specialItems.length > 0 && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Star className="text-amber-500" size={16} />
            <span className="text-sm font-medium text-amber-700">오늘의 특별 케어</span>
          </div>
          <div className="space-y-2">
            {specialItems.map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                <button
                  onClick={() => toggleCheck(item.id)}
                  className="flex-shrink-0"
                >
                  {checkedItems.has(item.id) ? (
                    <CheckCircle className="text-amber-500" size={20} />
                  ) : (
                    <Circle className="text-amber-400" size={20} />
                  )}
                </button>
                <span className={`text-sm ${checkedItems.has(item.id) ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                  {item.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 일반 스킨케어 아이템 */}
      <div className="space-y-2">
        {sessionItems.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            오늘의 스킨케어 루틴이 없습니다
          </p>
        ) : (
          sessionItems
            .filter(item => !item.isSpecial)
            .map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <button
                  onClick={() => toggleCheck(item.id)}
                  className="flex-shrink-0"
                >
                  {checkedItems.has(item.id) ? (
                    <CheckCircle className="text-purple-500" size={22} />
                  ) : (
                    <Circle className="text-gray-400" size={22} />
                  )}
                </button>
                <span className={`flex-1 ${checkedItems.has(item.id) ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                  {item.title}
                </span>
              </div>
            ))
        )}
      </div>

      {/* 완료 메시지 */}
      {completedCount === totalCount && totalCount > 0 && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-center">
          <p className="text-green-600 font-medium">🎉 오늘의 스킨케어 완료!</p>
        </div>
      )}
    </div>
  );
}