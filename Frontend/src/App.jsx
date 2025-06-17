import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import { DateProvider } from './context/DateContext';
import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { Modal, Button, RingProgress } from '@mantine/core';
import confetti from 'canvas-confetti';

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

// Import pomodoro icons
import focusIcon from './assets/svg/studyzone/focus.svg';
import breakIcon from './assets/svg/studyzone/break.svg';
import breakMessageIcon from './assets/svg/studyzone/break_message.svg';

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

  // GLOBAL POMODORO STATE
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [currentSessionNumber, setCurrentSessionNumber] = useState(1);
  const [isBreakTime, setIsBreakTime] = useState(false);
  const [savedSessionLength, setSavedSessionLength] = useState(null);
  const [savedPauseLength, setSavedPauseLength] = useState(null);
  const [savedSessionCount, setSavedSessionCount] = useState(null);
  const [targetEndTime, setTargetEndTime] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [timerModalOpened, setTimerModalOpened] = useState(false);
  
  // Add state for break message fade
  const [breakMessageVisible, setBreakMessageVisible] = useState(true);

  // Move slide animation state to App level
  const [showSlideCountdown, setShowSlideCountdown] = useState(false);
  const [slideCountdownText, setSlideCountdownText] = useState('');

  // Add sidebar state at App level
  const [sidebarOpened, setSidebarOpened] = useState(() => {
    // Load from localStorage on mount
    const saved = localStorage.getItem('sidebarOpened');
    return saved ? JSON.parse(saved) : false;
  });

  // Save to localStorage whenever sidebar state changes
  useEffect(() => {
    localStorage.setItem('sidebarOpened', JSON.stringify(sidebarOpened));
  }, [sidebarOpened]);

  // Add accordion state
  const [openAccordions, setOpenAccordions] = useState(() => {
    // Load from localStorage on mount
    const saved = localStorage.getItem('openAccordions');
    return saved ? JSON.parse(saved) : [];
  });

  // Save accordion state to localStorage
  useEffect(() => {
    localStorage.setItem('openAccordions', JSON.stringify(openAccordions));
  }, [openAccordions]);

  // Auto-open accordion when active chat changes
  useEffect(() => {
    if (activeChat && activeSubject) {
      // Only auto-open when chat changes, not when accordions change
      setOpenAccordions(prev => {
        if (!prev.includes(activeSubject)) {
          return [...prev, activeSubject];
        }
        return prev; // Don't change if already open
      });
    }
  }, [activeChat, activeSubject]); // Remove openAccordions from dependencies

  // Define memoized helper functions FIRST
  const memoizedFormatTime = useCallback((seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const memoizedConvertToSeconds = useCallback((hours, minutes) => {
    return (hours * 60 * 60) + (minutes * 60);
  }, []);

  const memoizedClearPomodoroState = useCallback(() => {
    localStorage.removeItem('pomodoroState');
    setTargetEndTime(null);
    setIsPaused(false);
  }, []);

  // Memoized triggerSlideAnimation function
  const triggerSlideAnimation = useCallback(() => {
    setSlideCountdownText(memoizedFormatTime(currentTime));
    setShowSlideCountdown(true);
    setTimeout(() => {
      setShowSlideCountdown(false);
    }, 2500);
  }, [currentTime, memoizedFormatTime]);

  // GLOBAL POMODORO FUNCTIONS
  const handleTimerComplete = () => {
    if (isBreakTime) {
      // Break finished
      if (currentSessionNumber >= savedSessionCount) {
        // All sessions completed
        setIsTimerActive(false);
        memoizedClearPomodoroState();
        setTimerModalOpened(true);
        console.log('Pomodoro completed!');
      } else {
        // Start next work session
        const sessionSeconds = memoizedConvertToSeconds(savedSessionLength.hours, savedSessionLength.minutes);
        const newTargetEnd = Date.now() + (sessionSeconds * 1000);
        setCurrentTime(sessionSeconds);
        setTotalTime(sessionSeconds);
        setCurrentSessionNumber(prev => prev + 1);
        setIsBreakTime(false);
        setTargetEndTime(newTargetEnd);
        setTimerModalOpened(true);
      }
    } else {
      // Work session finished, start break
      setTimeout(() => {
        fire();
      }, 100);
      const breakSeconds = memoizedConvertToSeconds(savedPauseLength.hours, savedPauseLength.minutes);
      const newTargetEnd = Date.now() + (breakSeconds * 1000);
      setCurrentTime(breakSeconds);
      setTotalTime(breakSeconds);
      setIsBreakTime(true);
      setTargetEndTime(newTargetEnd);
      setTimerModalOpened(true);
    }
  };

  const loadPomodoroState = () => {
    try {
      const saved = localStorage.getItem('pomodoroState');
      if (!saved) return false;
      
      const state = JSON.parse(saved);
      
      if (state.isTimerActive && state.targetEndTime && state.savedSessionLength && state.savedPauseLength && state.savedSessionCount) {
        const now = Date.now();
        let timeLeft = Math.ceil((state.targetEndTime - now) / 1000);
        
        setSavedSessionLength(state.savedSessionLength);
        setSavedPauseLength(state.savedPauseLength);
        setSavedSessionCount(state.savedSessionCount);
        
        let newSessionNumber = state.currentSessionNumber;
        let newIsBreakTime = state.isBreakTime;
        let newTotalTime = state.totalTime;
        let shouldShowModal = false;
        
        while (timeLeft <= 0 && newSessionNumber <= state.savedSessionCount) {
          shouldShowModal = true;
          
          if (newIsBreakTime) {
            if (newSessionNumber >= state.savedSessionCount) {
              memoizedClearPomodoroState();
              setTimeout(() => {
                setTimerModalOpened(true);
              }, 500);
              return false;
            } else {
              const sessionSeconds = memoizedConvertToSeconds(state.savedSessionLength.hours, state.savedSessionLength.minutes);
              timeLeft += sessionSeconds;
              newTotalTime = sessionSeconds;
              newSessionNumber++;
              newIsBreakTime = false;
            }
          } else {
            const breakSeconds = memoizedConvertToSeconds(state.savedPauseLength.hours, state.savedPauseLength.minutes);
            timeLeft += breakSeconds;
            newTotalTime = breakSeconds;
            newIsBreakTime = true;
          }
        }
        
        if (timeLeft > 0 && newSessionNumber <= state.savedSessionCount) {
          setIsTimerActive(true);
          setCurrentTime(timeLeft);
          setTotalTime(newTotalTime);
          setCurrentSessionNumber(newSessionNumber);
          setIsBreakTime(newIsBreakTime);
          setTargetEndTime(now + (timeLeft * 1000));
          setIsPaused(false);
          
          if (shouldShowModal) {
            setTimeout(() => {
              setTimerModalOpened(true);
            }, 500);
          }
          
          return true;
        } else {
          memoizedClearPomodoroState();
          return false;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error loading pomodoro state:', error);
      memoizedClearPomodoroState();
      return false;
    }
  };

  const handleSkipToNext = () => {
    if (isBreakTime) {
      if (currentSessionNumber >= savedSessionCount) {
        const sessionSeconds = memoizedConvertToSeconds(savedSessionLength.hours, savedSessionLength.minutes);
        const targetEnd = Date.now() + (sessionSeconds * 1000);
        
        setCurrentTime(sessionSeconds);
        setTotalTime(sessionSeconds);
        setCurrentSessionNumber(1);
        setIsBreakTime(false);
        setIsTimerActive(true);
        setTargetEndTime(targetEnd);
        setIsPaused(false);
        
        setTimerModalOpened(false);
      } else {
        const sessionSeconds = memoizedConvertToSeconds(savedSessionLength.hours, savedSessionLength.minutes);
        const targetEnd = Date.now() + (sessionSeconds * 1000);
        
        setCurrentTime(sessionSeconds);
        setTotalTime(sessionSeconds);
        setCurrentSessionNumber(prev => prev + 1);
        setIsBreakTime(false);
        setTargetEndTime(targetEnd);
        if (!isTimerActive) {
          setIsTimerActive(true);
          setIsPaused(false);
        }
      }
    } else {
      fire();
      const breakSeconds = memoizedConvertToSeconds(savedPauseLength.hours, savedPauseLength.minutes);
      const targetEnd = Date.now() + (breakSeconds * 1000);
      
      setCurrentTime(breakSeconds);
      setTotalTime(breakSeconds);
      setIsBreakTime(true);
      setTargetEndTime(targetEnd);
      if (!isTimerActive) {
        setIsTimerActive(true);
        setIsPaused(false);
      }
    }
  };

  // Global timer countdown effect
  useEffect(() => {
    let interval = null;
    
    if (isTimerActive && !isPaused && targetEndTime) {
      interval = setInterval(() => {
        const now = Date.now();
        const timeLeft = Math.max(0, Math.ceil((targetEndTime - now) / 1000));
        
        setCurrentTime(timeLeft);
        
        if (timeLeft <= 0) {
          handleTimerComplete();
        }
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerActive, isPaused, targetEndTime, isBreakTime, currentSessionNumber, savedSessionCount, savedSessionLength, savedPauseLength]);

  // Load pomodoro state on mount
  useEffect(() => {
    loadPomodoroState();
  }, []);

  // Centralized save effect
  useEffect(() => {
    if (
      isTimerActive ||
      savedSessionLength ||
      savedPauseLength ||
      savedSessionCount
    ) {
      const pomodoroState = {
        isTimerActive,
        currentTime,
        totalTime,
        currentSessionNumber,
        isBreakTime,
        savedSessionLength,
        savedPauseLength,
        savedSessionCount,
        targetEndTime,
        isPaused,
        lastSaved: Date.now()
      };
      localStorage.setItem('pomodoroState', JSON.stringify(pomodoroState));
    }
  }, [
    isTimerActive,
    currentTime,
    totalTime,
    currentSessionNumber,
    isBreakTime,
    savedSessionLength,
    savedPauseLength,
    savedSessionCount,
    targetEndTime,
    isPaused
  ]);

  // Create the memoized pomodoroFunctions object
  const pomodoroFunctions = useMemo(() => ({
    isTimerActive,
    currentTime,
    totalTime,
    currentSessionNumber,
    isBreakTime,
    savedSessionLength,
    savedPauseLength,
    savedSessionCount,
    formatTime: memoizedFormatTime,
    convertToSeconds: memoizedConvertToSeconds,
    setSavedSessionLength,
    setSavedPauseLength,
    setSavedSessionCount,
    setCurrentTime,
    setTotalTime,
    setCurrentSessionNumber,
    setIsBreakTime,
    setIsTimerActive,
    setTargetEndTime,
    setIsPaused,
    setTimerModalOpened,
    clearPomodoroState: memoizedClearPomodoroState,
    showSlideCountdown,
    slideCountdownText,
    triggerSlideAnimation
  }), [
    isTimerActive,
    currentTime,
    totalTime,
    currentSessionNumber,
    isBreakTime,
    savedSessionLength,
    savedPauseLength,
    savedSessionCount,
    showSlideCountdown,
    slideCountdownText,
    memoizedFormatTime,
    memoizedConvertToSeconds,
    memoizedClearPomodoroState,
    triggerSlideAnimation
  ]);

  // Memoize other functions that get passed to components
  const memoizedGetCurrentMessage = useCallback(() => {
    if (!activeChat) return '';
    const chatKey = `${activeSubject}-${activeChat.id}`;
    return messageMap[chatKey] || '';
  }, [activeChat, activeSubject, messageMap]);
  
  const memoizedUpdateCurrentMessage = useCallback((newMessage) => {
    if (!activeChat) return;
    const chatKey = `${activeSubject}-${activeChat.id}`;
    setMessageMap(prev => ({
      ...prev,
      [chatKey]: newMessage
    }));
  }, [activeChat, activeSubject]);
  
  // Get selected notes for current chat
  const getCurrentSelectedNotes = () => {
    if (!activeChat) return [];
    const chatKey = `${activeSubject}-${activeChat.id}`;
    return selectedNotesMap[chatKey] || [];
  };
  
  // Update selected notes for current chat
  const updateCurrentSelectedNotes = (newSelectedNotes) => {
    if (!activeChat) return;
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
    if (splitViewNote) {
      setSplitViewNote(null);
    }
  }, [activeSubject, activeChat?.id]);
  
  // Add state for the click timestamp
  const [noteClickTimestamp, setNoteClickTimestamp] = useState(0);
  
  // Memoize the callbacks passed to Notities
  const memoizedHandleOpenSplitView = useCallback((note) => {
    if (note) {
      setSplitViewNote(note);
      setNoteClickTimestamp(Date.now());
    } else {
      setSplitViewNote(null);
    }
  }, []);

  const memoizedHandleCloseSplitView = useCallback(() => {
    setSplitViewNote(null);
  }, []);

  const memoizedHandleNoteChange = useCallback((note) => {
    if (note && note.id) {
      setSplitViewNote(note);
    }
  }, []);

  // Create a confetti instance with workers disabled
  const createConfetti = (canvas) => {
    return confetti.create(canvas, {
      resize: true,
      useWorker: false
    });
  };

  const fire = () => {
    console.log('Firing confetti');
    
    const canvas = document.getElementById('confetti-canvas');
    
    if (!canvas) {
      console.log('Modal canvas not found');
      return;
    }
    
    const myConfetti = createConfetti(canvas);
    
    // Custom colors array
    const colors = ['#FF6601', '#000460', '#E3E5FF'];
    
    myConfetti({
      particleCount: 50,
      spread: 26,
      startVelocity: 55,
      origin: { y: 0.6 },
      colors: colors  // Add custom colors
    });

    myConfetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 },
      colors: colors  // Add custom colors
    });

    myConfetti({
      particleCount: 70,
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
      origin: { y: 0.6 },
      colors: colors  // Add custom colors
    });

    myConfetti({
      particleCount: 20,
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
      origin: { y: 0.6 },
      colors: colors  // Add custom colors
    });

    myConfetti({
      particleCount: 20,
      spread: 120,
      startVelocity: 45,
      origin: { y: 0.6 },
      colors: colors  // Add custom colors
    });
  };

  // Add useEffect to handle break message fade out
  useEffect(() => {
    if (isBreakTime) {
      // Reset visibility when break starts
      setBreakMessageVisible(true);
      
      // Fade out after 1 second
      const fadeTimer = setTimeout(() => {
        setBreakMessageVisible(false);
      }, 1700);
      
      return () => clearTimeout(fadeTimer);
    }
  }, [isBreakTime]);

  return (
    <BrowserRouter>
      <MantineProvider withGlobalStyles withNormalizeCSS>
        <ModalsProvider>
          <Notifications position="bottom-right" zIndex={100000} />
          <UserProvider>
            <DateProvider>
              <div className="App">
                <Navigation />
                
                {/* GLOBAL POMODORO MODAL */}
                <Modal
                  className='timer-modal'
                  opened={timerModalOpened}
                  onClose={() => {
                    setTimerModalOpened(false);
                    setTimeout(() => {
                      triggerSlideAnimation();
                    }, 100);
                  }}
                  centered
                  withCloseButton={true}
                  zIndex={999999}
                  styles={{
                    overlay: {
                      zIndex: 999998,
                    },
                    inner: {
                      zIndex: 999999,
                    }
                  }}
                >
                  <div className="timer-modal-content" style={{ position: 'relative' }}>
                    {/* Add canvas for confetti inside modal */}
                    <canvas
                      id="confetti-canvas"
                      style={{
                        position: 'absolute',
                        top: '-38px',
                        left: 0,
                        width: '100%',
                        height: 'calc(100% + 38px)',
                        pointerEvents: 'none',
                        zIndex: 999999999
                      }}
                    />
                    {isBreakTime && (
                    <div 
                      className="timer-modal-content-break-message flex-row"
                      style={{
                        position: 'absolute',
                        top: '-38px',
                        left: 0,
                        width: '100%',
                        height: 'calc(100% + 38px)',
                        pointerEvents: 'none',
                        backgroundColor: '#fefefe',
                        zIndex: 99999999,
                        justifyContent: 'center',
                        alignItems: 'center',
                        textAlign: 'center',
                        opacity: breakMessageVisible ? 1 : 0,
                        transition: 'opacity 0.5s ease-out'
                      }}
                    >
                      <div style={{fontSize: '32px', fontWeight: '600', color: '#000000', width: '280px', alignItems: 'center', justifyContent: 'center', gap: '20px'}} className="timer-modal-content-break-message-text flex-column">
                        <div>Goed gedaan!</div>
                        <div style={{width: '180px', height: '180px', borderRadius: '50%', backgroundColor: '#D9FEEC', alignItems: 'center', justifyContent: 'center', marginTop: '2px'}} className="break-message-icon flex-row">
                          <img style={{width: '140px', height: '140px'}} src={breakMessageIcon} alt="Break Icon" />
                        </div>
                        <div style={{fontSize: '18px', fontWeight: '400', color: '#89939E', marginTop: '4px'}}>Je hebt nu {
                          savedPauseLength.hours > 0 
                            ? `${savedPauseLength.hours} ${savedPauseLength.hours === 1 ? 'uur' : 'uur'} en ${savedPauseLength.minutes} ${savedPauseLength.minutes === 1 ? 'minuut' : 'minuten'}`
                            : `${savedPauseLength.minutes} ${savedPauseLength.minutes === 1 ? 'minuut' : 'minuten'}`
                        } pauze!</div>
                      </div>
                    </div>)}
                    
                    <div className="timer-modal-ring-progress flex-row">
                      <RingProgress
                        size={230}
                        thickness={4}
                        roundCaps
                        transitionDuration={250}
                        sections={[{ 
                          value: totalTime > 0 ? ((totalTime - currentTime) / totalTime) * 100 : 0, 
                          color: isBreakTime ? '#32D175' : '#FF6601' 
                        }]}
                        label={
                          <div style={{ fontSize: '32px', fontWeight: '500', textAlign: 'center' }}>
                            <div className='timer-modal-ring-progress-icon'>
                              <img src={isBreakTime ? breakIcon : focusIcon} alt="Focus Icon" />
                            </div>
                            <div className='timer-modal-ring-progress-time' style={{color: isBreakTime ? '#32D175' : '#FF6601'}}>{memoizedFormatTime(currentTime)}</div>
                            <div className='timer-modal-ring-progress-description'>
                              {isBreakTime ? 'PAUZE' : 'FOCUS'}
                            </div>
                          </div>
                        }
                      />
                    </div>
                    <div style={{textAlign: 'center', fontSize: '16px', fontWeight: '600', color: '#000000', marginTop: '10px'}} className='timer-modal-session-count'>
                      Ronde {currentSessionNumber} van {savedSessionCount}
                    </div>
                    <div className='timer-modal-buttons' style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                      <Button 
                        color='red' 
                        style={{borderRadius: '100px', width: '100px'}} 
                        variant="outline"
                        onClick={() => {
                          setIsTimerActive(false);
                          setCurrentTime(0);
                          setTimerModalOpened(false);
                          memoizedClearPomodoroState();
                        }}
                      >
                        Stop
                      </Button>
                      <Button 
                        color='#000460' 
                        style={{borderRadius: '100px', width: '100px'}}
                        onClick={handleSkipToNext}
                      >
                        {isBreakTime && currentSessionNumber >= savedSessionCount ? 'Opnieuw': 
                         isBreakTime ? 'Focus' : 'Pauze'}
                      </Button>
                    </div>
                  </div>
                </Modal>
                
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
                        onViewNote={memoizedHandleOpenSplitView}
                        onOpenSplitView={memoizedHandleOpenSplitView}
                        inSplitView={true}
                        // Pass persisted state
                        activeSubject={activeSubject}
                        setActiveSubject={setActiveSubject}
                        activeChat={activeChat}
                        setActiveChat={setActiveChat}
                        getCurrentMessage={memoizedGetCurrentMessage}
                        updateCurrentMessage={memoizedUpdateCurrentMessage}
                        getCurrentConversation={getCurrentConversation}
                        updateConversation={updateConversation}
                        getCurrentSelectedNotes={getCurrentSelectedNotes}
                        updateCurrentSelectedNotes={updateCurrentSelectedNotes}
                        getCurrentSelectedImages={getCurrentSelectedImages}
                        updateCurrentSelectedImages={updateCurrentSelectedImages}
                        // Pass pomodoro functions
                        pomodoro={pomodoroFunctions}
                        // Pass sidebar state
                        sidebarOpened={sidebarOpened}
                        setSidebarOpened={setSidebarOpened}
                        openAccordions={openAccordions}
                        setOpenAccordions={setOpenAccordions}
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
                        onClick={memoizedHandleCloseSplitView}
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
                        onNoteChange={memoizedHandleNoteChange}
                        onTabChange={memoizedHandleNoteChange}
                        clickTimestamp={noteClickTimestamp}
                      />
                    </div>
                  </div>
                ) : (
                  // Normal single-page mode
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/studyzone" element={
                      <StudyZone 
                        pomodoro={pomodoroFunctions}
                        // Pass other required props
                        onViewNote={memoizedHandleOpenSplitView}
                        onOpenSplitView={memoizedHandleOpenSplitView}
                        inSplitView={false}
                        activeSubject={activeSubject}
                        setActiveSubject={setActiveSubject}
                        activeChat={activeChat}
                        setActiveChat={setActiveChat}
                        getCurrentMessage={memoizedGetCurrentMessage}
                        updateCurrentMessage={memoizedUpdateCurrentMessage}
                        getCurrentConversation={getCurrentConversation}
                        updateConversation={updateConversation}
                        getCurrentSelectedNotes={getCurrentSelectedNotes}
                        updateCurrentSelectedNotes={updateCurrentSelectedNotes}
                        getCurrentSelectedImages={getCurrentSelectedImages}
                        updateCurrentSelectedImages={updateCurrentSelectedImages}
                        sidebarOpened={sidebarOpened}
                        setSidebarOpened={setSidebarOpened}
                        openAccordions={openAccordions}
                        setOpenAccordions={setOpenAccordions}
                      />
                    } />
                    <Route path="/studyzone/chat/:subject/:chatId" element={
                      <StudyZone 
                        pomodoro={pomodoroFunctions}
                        // Pass other required props
                        onViewNote={memoizedHandleOpenSplitView}
                        onOpenSplitView={memoizedHandleOpenSplitView}
                        inSplitView={false}
                        activeSubject={activeSubject}
                        setActiveSubject={setActiveSubject}
                        activeChat={activeChat}
                        setActiveChat={setActiveChat}
                        getCurrentMessage={memoizedGetCurrentMessage}
                        updateCurrentMessage={memoizedUpdateCurrentMessage}
                        getCurrentConversation={getCurrentConversation}
                        updateConversation={updateConversation}
                        getCurrentSelectedNotes={getCurrentSelectedNotes}
                        updateCurrentSelectedNotes={updateCurrentSelectedNotes}
                        getCurrentSelectedImages={getCurrentSelectedImages}
                        updateCurrentSelectedImages={updateCurrentSelectedImages}
                        sidebarOpened={sidebarOpened}
                        setSidebarOpened={setSidebarOpened}
                        openAccordions={openAccordions}
                        setOpenAccordions={setOpenAccordions}
                      />
                    } />
                    <Route path="/notities" element={<Notities onOpenSplitView={memoizedHandleOpenSplitView} />} />
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="/Account" element={<Welcome />} />
                    <Route path="/To-do" element={<Todo />} />
                    <Route path="/Welcome" element={<Welcome />} />
                    <Route path="/Privacy" element={<Privacy />} />
                    <Route path="/Terms" element={<Terms />} />
                    <Route path="*" element={<Navigate to="/StudyZone" replace />} />
                  </Routes>
                )}
              </div>
            </DateProvider>
          </UserProvider>
        </ModalsProvider>
      </MantineProvider>
    </BrowserRouter>
  );
}

export default App;