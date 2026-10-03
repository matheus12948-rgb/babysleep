import { useState, useEffect, useCallback, useMemo } from 'react';
import { UserEducationProgress, ContentType, Course, Article } from './types';
import { COURSES, ARTICLES } from './educationData';
import { DataService } from '@/services/dataService';
import { useAuth } from '@/features/auth/AuthContext';

export function useEducation() {
  const { user } = useAuth();
  const userId = user?.id || 'local-caregiver';
  
  const [progressList, setProgressList] = useState<UserEducationProgress[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [activeArticleId, setActiveArticleId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Carregar progresso
  const loadProgress = useCallback(async () => {
    setIsLoading(true);
    try {
      const records = await DataService.getEducationProgress(userId);
      setProgressList(records);
    } catch (err) {
      console.warn('Erro ao carregar progresso educacional:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  // Verificar se item foi concluído
  const isCompleted = useCallback((contentType: ContentType, contentId: string): boolean => {
    const item = progressList.find(p => p.contentType === contentType && p.contentId === contentId);
    return !!item?.isCompleted;
  }, [progressList]);

  // Verificar se item está salvo como favorito
  const isBookmarked = useCallback((contentType: ContentType, contentId: string): boolean => {
    const item = progressList.find(p => p.contentType === contentType && p.contentId === contentId);
    return !!item?.isBookmarked;
  }, [progressList]);

  // Marcar como concluído / desmarcar
  const toggleCompleted = useCallback(async (
    contentType: ContentType,
    contentId: string,
    courseId?: string
  ) => {
    const existing = progressList.find(p => p.contentType === contentType && p.contentId === contentId);
    const nextCompleted = existing ? !existing.isCompleted : true;

    const updated: UserEducationProgress = {
      id: existing?.id || `edu-temp-${Date.now()}`,
      userId,
      contentType,
      contentId,
      courseId,
      isCompleted: nextCompleted,
      isBookmarked: existing ? existing.isBookmarked : false,
      lastReadAt: new Date().toISOString(),
    };

    setProgressList(prev => {
      const index = prev.findIndex(p => p.contentType === contentType && p.contentId === contentId);
      if (index >= 0) {
        const copy = [...prev];
        copy[index] = updated;
        return copy;
      }
      return [...prev, updated];
    });

    await DataService.saveEducationProgress(updated);
  }, [progressList, userId]);

  // Alternar favorito
  const toggleBookmark = useCallback(async (
    contentType: ContentType,
    contentId: string,
    courseId?: string
  ) => {
    const existing = progressList.find(p => p.contentType === contentType && p.contentId === contentId);
    const nextBookmarked = existing ? !existing.isBookmarked : true;

    const updated: UserEducationProgress = {
      id: existing?.id || `edu-temp-${Date.now()}`,
      userId,
      contentType,
      contentId,
      courseId,
      isCompleted: existing ? existing.isCompleted : false,
      isBookmarked: nextBookmarked,
      lastReadAt: new Date().toISOString(),
    };

    setProgressList(prev => {
      const index = prev.findIndex(p => p.contentType === contentType && p.contentId === contentId);
      if (index >= 0) {
        const copy = [...prev];
        copy[index] = updated;
        return copy;
      }
      return [...prev, updated];
    });

    await DataService.saveEducationProgress(updated);
  }, [progressList, userId]);

  // Cálculo de progresso de um curso (%)
  const getCourseProgress = useCallback((course: Course) => {
    if (!course.lessons.length) return 0;
    const completedCount = course.lessons.filter(lesson => isCompleted('LESSON', lesson.id)).length;
    return Math.round((completedCount / course.lessons.length) * 100);
  }, [isCompleted]);

  // Artigos filtrados
  const filteredArticles = useMemo(() => {
    return ARTICLES.filter(art => {
      const matchesSearch = searchQuery === '' || 
        art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        art.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat = selectedCategory === 'all' || art.category === selectedCategory;
      const matchesTag = selectedTag === null || art.tags.includes(selectedTag);

      return matchesSearch && matchesCat && matchesTag;
    });
  }, [searchQuery, selectedCategory, selectedTag]);

  // Todas as tags únicas
  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    ARTICLES.forEach(art => art.tags.forEach(t => tagsSet.add(t)));
    return Array.from(tagsSet);
  }, []);

  // Aula ativa
  const activeLesson = useMemo(() => {
    if (!activeLessonId) return null;
    for (const course of COURSES) {
      const found = course.lessons.find(l => l.id === activeLessonId);
      if (found) return found;
    }
    return null;
  }, [activeLessonId]);

  // Artigo ativo
  const activeArticle = useMemo(() => {
    if (!activeArticleId) return null;
    return ARTICLES.find(a => a.id === activeArticleId) || null;
  }, [activeArticleId]);

  return {
    courses: COURSES,
    articles: filteredArticles,
    totalArticlesCount: ARTICLES.length,
    allTags,
    isLoading,
    isCompleted,
    isBookmarked,
    toggleCompleted,
    toggleBookmark,
    getCourseProgress,
    // Estados de seleção
    selectedCourse,
    setSelectedCourse,
    activeLesson,
    setActiveLessonId,
    activeArticle,
    setActiveArticleId,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedTag,
    setSelectedTag,
  };
}
