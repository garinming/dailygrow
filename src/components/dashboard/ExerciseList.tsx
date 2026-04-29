'use client';

import { Play, CheckCircle, Circle, ExternalLink } from 'lucide-react';
import { useState } from 'react';

interface ExerciseRecord {
  id: string;
  userId: string;
  title: string;
  youtubeUrl: string;
  dayOfWeek: string[];
  isCompleted: boolean;
  completedDates?: string[];
}

interface ExerciseListProps {
  exercises: ExerciseRecord[];
  todayDayOfWeek: string;
}

export default function ExerciseList({ exercises, todayDayOfWeek }: ExerciseListProps) {
  const [expanded, setExpanded] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);

  // 오늘 해당하는 운동만 필터링
  const todayExercises = exercises.filter(ex => 
    ex.dayOfWeek.includes(todayDayOfWeek)
  );

  // YouTube URL에서 비디오 ID 추출
  const getYoutubeVideoId = (url: string): string | null => {
    const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  };

  // 재생 중인 영상 열기
  const handlePlay = (exercise: ExerciseRecord) => {
    if (playingId === exercise.id) {
      setPlayingId(null);
    } else {
      setPlayingId(exercise.id);
    }
  };

  // YouTube 새 탭에서 열기
  const handleExternalLink = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div>
      {/* 오늘의 운동 목록 */}
      <div className="space-y-3 mb-4">
        {todayExercises.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            오늘 예정된 운동이 없습니다
          </p>
        ) : (
          todayExercises.map((exercise) => {
            const videoId = getYoutubeVideoId(exercise.youtubeUrl);
            const isPlaying = playingId === exercise.id;

            return (
              <div 
                key={exercise.id} 
                className={`p-3 rounded-lg border transition-all ${
                  exercise.isCompleted 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* 완료 상태 아이콘 */}
                  <button
                    onClick={() => {/* 체크 기능은 나중에 구현 */}}
                    className="mt-1 flex-shrink-0"
                  >
                    {exercise.isCompleted ? (
                      <CheckCircle className="text-green-500" size={20} />
                    ) : (
                      <Circle className="text-gray-400" size={20} />
                    )}
                  </button>

                  {/* 운동 정보 */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-medium ${exercise.isCompleted ? 'text-green-700 line-through' : 'text-gray-800'}`}>
                      {exercise.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      요일: {exercise.dayOfWeek.join(', ')}
                    </p>
                  </div>

                  {/* 재생 버튼 */}
                  <div className="flex gap-1">
                    <button
                      onClick={() => handlePlay(exercise)}
                      className="p-2 text-blue-500 hover:bg-blue-100 rounded-lg transition-colors"
                      title={isPlaying ? '닫기' : '재생'}
                    >
                      <Play size={18} />
                    </button>
                    <button
                      onClick={() => handleExternalLink(exercise.youtubeUrl)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="YouTube에서 열기"
                    >
                      <ExternalLink size={18} />
                    </button>
                  </div>
                </div>

                {/* 인라인 YouTube 플레이어 */}
                {isPlaying && videoId && (
                  <div className="mt-3">
                    <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-lg">
                      <iframe
                        className="absolute top-0 left-0 w-full h-full"
                        src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                        title={exercise.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 전체 운동 보기 */}
      {exercises.length > todayExercises.length && (
        <div className="border-t border-gray-100 pt-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <span>전체 운동 목록 ({exercises.length}개)</span>
            <span className={`transform transition-transform ${expanded ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>

          {expanded && (
            <div className="mt-3 space-y-2">
              {exercises
                .filter(ex => !ex.dayOfWeek.includes(todayDayOfWeek))
                .map((exercise) => (
                  <div 
                    key={exercise.id} 
                    className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center gap-3">
                      {exercise.isCompleted ? (
                        <CheckCircle className="text-green-500" size={18} />
                      ) : (
                        <Circle className="text-gray-400" size={18} />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-gray-700">{exercise.title}</p>
                        <p className="text-xs text-gray-500">
                          {exercise.dayOfWeek.join(', ')}요일
                        </p>
                      </div>
                      <button
                        onClick={() => handleExternalLink(exercise.youtubeUrl)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <ExternalLink size={16} />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}