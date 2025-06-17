import React, { createContext, useState, useContext } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    isAuthenticated: false,
    email: null,
    password: null,
    firstName: null,
    lastName: null,
    dateOfBirth: null,
    school: null,
    educationLevel: null,
    grade: null,
    subjects: ['Algemeen', 'Aardrijkskunde', 'Scheikunde', 'Wiskunde B', 'Biologie', 'Engels', 'Natuurkunde', 'Uncategorized'],
    profileImage: null
  });

  const setUserData = (userData) => {
    setUser(prevUser => ({
      ...prevUser,
      ...userData,
      isAuthenticated: true
    }));
  };

  const updateUserField = (field, value) => {
    setUser(prevUser => ({
      ...prevUser,
      [field]: value
    }));
  };

  const updateUserFields = (updates) => {
    setUser(prevUser => ({
      ...prevUser,
      ...updates
    }));
  };

  const clearUser = () => {
    setUser({
      isAuthenticated: false,
      email: null,
      password: null,
      firstName: null,
      lastName: null,
      dateOfBirth: null,
      school: null,
      educationLevel: null,
      grade: null,
      subjects: [],
      profileImage: null
    });
    
    // Clear date selection on logout
    try {
      localStorage.removeItem('selectedTodoDate');
    } catch (error) {
      console.error('Error clearing date on logout:', error);
    }
  };

  const value = {
    user,
    setUserData,
    updateUserField,
    updateUserFields,
    clearUser
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
