// src/hooks/useImportantNotes.ts
import { useState, useCallback } from 'react';

export const useImportantNotes = () => {
  const [notes, setNotes] = useState<string[]>([]);

  // Add new notes, avoiding duplicates
  const addNotes = useCallback((newNotes: string[]) => {
    setNotes(prevNotes => {
      const uniqueNewNotes = newNotes.filter(note => !prevNotes.includes(note));
      return [...prevNotes, ...uniqueNewNotes];
    });
  }, []);

  // Clear all notes
  const clearNotes = useCallback(() => {
    setNotes([]);
  }, []);

  return {
    notes,
    addNotes,
    clearNotes
  };
};