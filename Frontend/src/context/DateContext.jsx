import React, { createContext, useState, useContext, useEffect } from 'react';

const DateContext = createContext();

// Helper functions
const formatDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseDateString = (dateString) => {
  const [year, month, day] = dateString.split('-').map(num => parseInt(num, 10));
  return new Date(year, month - 1, day);
};

const STORAGE_KEY = 'selectedTodoDate';

export const DateProvider = ({ children }) => {
  // Initialize state from localStorage or default to today
  const [selectedDate, setSelectedDate] = useState(() => {
    try {
      const savedDate = localStorage.getItem(STORAGE_KEY);
      if (savedDate) {
        const parsedDate = parseDateString(savedDate);
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate;
        }
      }
    } catch (error) {
      console.error('Error loading date from localStorage:', error);
    }
    return new Date();
  });

  // Sync to localStorage whenever date changes
  useEffect(() => {
    try {
      const dateString = formatDateString(selectedDate);
      localStorage.setItem(STORAGE_KEY, dateString);
    } catch (error) {
      console.error('Error saving date to localStorage:', error);
    }
  }, [selectedDate]);

  // Update selected date
  const updateSelectedDate = (newDate) => {
    if (newDate instanceof Date && !isNaN(newDate.getTime())) {
      setSelectedDate(newDate);
    }
  };

  // Go to today
  const goToToday = () => {
    setSelectedDate(new Date());
  };

  // Clear date (useful for logout)
  const clearSelectedDate = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setSelectedDate(new Date());
    } catch (error) {
      console.error('Error clearing date from localStorage:', error);
    }
  };

  // Get formatted date string
  const getFormattedDate = () => {
    return formatDateString(selectedDate);
  };

  const value = {
    selectedDate,
    updateSelectedDate,
    goToToday,
    clearSelectedDate,
    getFormattedDate,
    // Helper functions for components
    formatDateString,
    parseDateString
  };

  return (
    <DateContext.Provider value={value}>
      {children}
    </DateContext.Provider>
  );
};

export const useDate = () => {
  const context = useContext(DateContext);
  if (context === undefined) {
    throw new Error('useDate must be used within a DateProvider');
  }
  return context;
}; 