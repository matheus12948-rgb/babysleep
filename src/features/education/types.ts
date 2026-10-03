export type ContentType = 'LESSON' | 'ARTICLE';

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  durationMinutes: number;
  summary: string;
  content: string; // Markdown / parágrafos formatados
  keyTakeaways: string[];
  order: number;
}

export interface Course {
  id: string;
  title: string;
  subtitle: string;
  ageRange: string;
  icon: string;
  badgeColor: string;
  description: string;
  lessons: Lesson[];
}

export interface Article {
  id: string;
  title: string;
  subtitle: string;
  category: 'sleep' | 'leaps' | 'feeding' | 'wellbeing';
  readTimeMinutes: number;
  tags: string[];
  icon: string;
  summary: string;
  content: string;
}

export interface UserEducationProgress {
  id: string;
  userId: string;
  contentType: ContentType;
  contentId: string;
  courseId?: string;
  isCompleted: boolean;
  isBookmarked: boolean;
  lastReadAt: string;
}
