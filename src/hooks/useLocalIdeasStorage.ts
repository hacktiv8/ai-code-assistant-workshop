import { useState, useEffect } from 'react';

const LOCAL_STORAGE_KEY = 'ideas';

interface Idea {
  id: string;
  text: string;
  timestamp: number;
}

export const useLocalIdeasStorage = () => {
  const [ideas, setIdeas] = useState<Idea[]>(() => {
    // Load ideas from localStorage on initialization
    try {
      const storedIdeas = localStorage.getItem(LOCAL_STORAGE_KEY);
      return storedIdeas ? JSON.parse(storedIdeas) : [];
    } catch (error) {
      console.error('Error loading ideas from localStorage:', error);
      return [];
    }
  });

  // Update localStorage whenever ideas change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(ideas));
    } catch (error) {
      console.error('Error saving ideas to localStorage:', error);
    }
  }, [ideas]);

  const addIdea = (text: string) => {
    const newIdea: Idea = {
      id: crypto.randomUUID(),
      text,
      timestamp: Date.now(),
    };
    setIdeas(prevIdeas => [...prevIdeas, newIdea]);
  };

  const updateIdea = (id: string, text: string) => {
    setIdeas(prevIdeas =>
      prevIdeas.map(idea =>
        idea.id === id
          ? { ...idea, text }
          : idea
      )
    );
  };

  const deleteIdea = (id: string) => {
    setIdeas(prevIdeas => prevIdeas.filter(idea => idea.id !== id));
  };

  return {
    ideas,
    setIdeas,
    addIdea,
    updateIdea,
    deleteIdea
  };
};
