import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';

import "./styles/App.scss"
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/spotlight/styles.css';

import Navigation from './components/Navigation';

import Login from './pages/Login';
import Notities from './pages/Notities';
import StudyZone from './pages/StudyZone';
import Todo from './pages/To-do';
import Welcome from './pages/Welcome';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';

function App() {
  // Split view state
  const [splitViewNote, setSplitViewNote] = useState(null);
  
  // Track active chat and subject
  const [activeSubject, setActiveSubject] = useState('Algemeen');
  const [activeChat, setActiveChat] = useState(null);
  
  // Store chat-specific data
  const [messageMap, setMessageMap] = useState({});
  const [conversationMap, setConversationMap] = useState({});
  const [selectedNotesMap, setSelectedNotesMap] = useState({});
  const [selectedImagesMap, setSelectedImagesMap] = useState({});
  
  // Get current data for active chat
  const getCurrentMessage = () => {
    if (!activeChat) return '';
    const chatKey = `${activeSubject}-${activeChat.id}`;
    return messageMap[chatKey] || '';
  };
  
  const updateCurrentMessage = (newMessage) => {
    if (!activeChat) return;
    const chatKey = `${activeSubject}-${activeChat.id}`;
    setMessageMap(prev => ({
      ...prev,
      [chatKey]: newMessage
    }));
  };
  
  // Get selected notes for current chat
  const getCurrentSelectedNotes = () => {
    if (!activeChat) return [];
    const chatKey = `${activeSubject}-${activeChat.id}`;
    return selectedNotesMap[chatKey] || [];
  };
  
  // Update selected notes for current chat
  const updateCurrentSelectedNotes = (newSelectedNotes) => {
    if (!activeChat) return;
    // Ensure it's an array
    const notesArray = Array.isArray(newSelectedNotes) ? newSelectedNotes : [];
    const chatKey = `${activeSubject}-${activeChat.id}`;
    setSelectedNotesMap(prev => ({
      ...prev,
      [chatKey]: notesArray
    }));
  };
  
  // Get selected images for current chat
  const getCurrentSelectedImages = () => {
    if (!activeChat) return [];
    const chatKey = `${activeSubject}-${activeChat.id}`;
    return selectedImagesMap[chatKey] || [];
  };
  
  // Update selected images for current chat
  const updateCurrentSelectedImages = (newSelectedImages) => {
    if (!activeChat) return;
    const imagesArray = Array.isArray(newSelectedImages) ? newSelectedImages : [];
    const chatKey = `${activeSubject}-${activeChat.id}`;
    setSelectedImagesMap(prev => ({
      ...prev,
      [chatKey]: imagesArray
    }));
  };
  
  // Get current conversation based on active chat
  const getCurrentConversation = () => {
    if (!activeChat) return [];
    const chatKey = `${activeSubject}-${activeChat.id}`;
    return conversationMap[chatKey] || [];
  };
  
  // Update a specific conversation
  const updateConversation = (newConversation) => {
    if (!activeChat) return;
    const chatKey = `${activeSubject}-${activeChat.id}`;
    setConversationMap(prev => ({
      ...prev,
      [chatKey]: newConversation
    }));
  };
  
  // Close split view when chat changes
  useEffect(() => {
    // If activeChat changes and split view is open, close it
    if (splitViewNote) {
      setSplitViewNote(null);
    }
  }, [activeSubject, activeChat?.id]);
  
  // Add state for the click timestamp
  const [noteClickTimestamp, setNoteClickTimestamp] = useState(0);
  
  // Modify the handleOpenSplitView function
  const handleOpenSplitView = (note) => {
    if (note) {
      setSplitViewNote(note);
      // Set a new timestamp for this click
      setNoteClickTimestamp(Date.now());
    } else {
      setSplitViewNote(null);
    }
  };
  
  // Handler to close split view
  const handleCloseSplitView = () => {
    setSplitViewNote(null);
  };
  
  // Handler for note changes in Notities
  const handleNoteChange = (note) => {
    if (note && note.id) {
      setSplitViewNote(note);
    }
  };

  return (
    <BrowserRouter>
      <MantineProvider withGlobalStyles withNormalizeCSS>
        <ModalsProvider>
          <Notifications position="bottom-right" zIndex={100000} />
          <UserProvider>
            <div className="App">
              <Navigation />
              
              {splitViewNote ? (
                // Split view mode
                <div style={{ 
                  display: 'flex', 
                  width: '100%', 
                  height: 'calc(100vh - 60px)',
                  overflow: 'hidden'
                }}>
                  {/* Left side - StudyZone */}
                  <div style={{ 
                    width: '50%', 
                    height: '100%', 
                    overflow: 'auto',
                    borderRight: '1px solid #eaeaea'
                  }}>
                    <StudyZone 
                      onViewNote={handleOpenSplitView}
                      onOpenSplitView={handleOpenSplitView}
                      inSplitView={true}
                      // Pass persisted state
                      activeSubject={activeSubject}
                      setActiveSubject={setActiveSubject}
                      activeChat={activeChat}
                      setActiveChat={setActiveChat}
                      getCurrentMessage={getCurrentMessage}
                      updateCurrentMessage={updateCurrentMessage}
                      getCurrentConversation={getCurrentConversation}
                      updateConversation={updateConversation}
                      getCurrentSelectedNotes={getCurrentSelectedNotes}
                      updateCurrentSelectedNotes={updateCurrentSelectedNotes}
                      getCurrentSelectedImages={getCurrentSelectedImages}
                      updateCurrentSelectedImages={updateCurrentSelectedImages}
                    />
                  </div>
                  
                  {/* Right side - Notities */}
                  <div style={{ 
                    width: '50%', 
                    height: '100%', 
                    overflow: 'auto',
                    position: 'relative'
                  }}>
                    <button 
                      onClick={handleCloseSplitView}
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '16px',
                        zIndex: 9999,
                        background: '#000460',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        fontWeight: 'bold'
                      }}
                    >
                      ✕
                    </button>
                    <Notities 
                      splitViewMode={true}
                      openNoteId={splitViewNote.id}
                      onNoteChange={handleNoteChange}
                      onTabChange={handleNoteChange}
                      clickTimestamp={noteClickTimestamp}
                    />
                  </div>
                </div>
              ) : (
                // Normal single-page mode
                <Routes>
                  <Route path="/" element={<Navigate to="/StudyZone" replace />} />
                  <Route path="/Account" element={<Welcome />} />
                  <Route path="/Notities" element={<Notities />} />
                  <Route path="/StudyZone" element={
                    <StudyZone 
                      onViewNote={handleOpenSplitView}
                      onOpenSplitView={handleOpenSplitView}
                      inSplitView={true}
                      // Pass persisted state
                      activeSubject={activeSubject}
                      setActiveSubject={setActiveSubject}
                      activeChat={activeChat}
                      setActiveChat={setActiveChat}
                      getCurrentMessage={getCurrentMessage}
                      updateCurrentMessage={updateCurrentMessage}
                      getCurrentConversation={getCurrentConversation}
                      updateConversation={updateConversation}
                      getCurrentSelectedNotes={getCurrentSelectedNotes}
                      updateCurrentSelectedNotes={updateCurrentSelectedNotes}
                      getCurrentSelectedImages={getCurrentSelectedImages}
                      updateCurrentSelectedImages={updateCurrentSelectedImages}
                    />
                  } />
                  <Route path="/To-do" element={<Todo />} />
                  <Route path="/Welcome" element={<Welcome />} />
                  <Route path="/Privacy" element={<Privacy />} />
                  <Route path="/Terms" element={<Terms />} />
                  <Route path="*" element={<Navigate to="/StudyZone" replace />} />
                </Routes>
              )}
            </div>
          </UserProvider>
        </ModalsProvider>
      </MantineProvider>
    </BrowserRouter>
  );
}

export default App;