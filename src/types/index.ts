export interface DietEntry {
  id: string;
  userId: string;
  date: string;
  foodName: string;
  calories: number;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

export interface ExerciseRoutine {
  id: string;
  userId: string;
  type: 'exercise';
  title: string;
  youtubeUrl: string;
  dayOfWeek: string[];
  completedDates: string[];
}

export interface SkincareRoutine {
  id: string;
  userId: string;
  type: 'skincare';
  title: string;
  session: 'morning' | 'evening';
  dayOfWeek: string[];
  completedDates: string[];
}
