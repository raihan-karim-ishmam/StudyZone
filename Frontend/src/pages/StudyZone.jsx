import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Spotlight } from '@mantine/spotlight';
import { IconSearch } from '@tabler/icons-react';
import { useUser } from '../context/UserContext';
import Sidebar from '../components/StudyZone/macro/Sidebar';
import ChatContainer from '../components/StudyZone/macro/ChatContainer';
import mockChatMessages from '../_data_test/mockChatMessages';
import { NoteSearch } from '../components/Notities/macro/NoteSearch';
import { Tooltip, Button, Modal, PinInput, RingProgress } from '@mantine/core';
import { Carousel } from '@mantine/carousel';
import { useParams, useNavigate } from 'react-router-dom';

import chevronRight from '../assets/svg/global/chevron.svg';
import pomodoroIcon from '../assets/svg/studyzone/pomodoro.svg';
import clockIcon from '../assets/svg/studyzone/clock.svg';
import minusIcon from '../assets/svg/studyzone/minus.svg';
import plusIcon from '../assets/svg/studyzone/plus.svg';
import focusIcon from '../assets/svg/studyzone/focus.svg';
import bookIcon from '../assets/svg/studyzone/book.svg';
import breakIcon from '../assets/svg/studyzone/break.svg';
import SearchIcon from '../assets/svg/global/search.svg';

import '../styles/StudyZone/StudyZone.scss';
import '../styles/App.scss';

import subjectIcons from '../subject-icons/subjectIcons';
import mockNotes from '../_data_test/mockNotes.js';

const StudyZone = (props) => {
  const { 
    onViewNote, 
    inSplitView = false,
    // State passed from App.jsx
    activeSubject,
    setActiveSubject,
    activeChat,
    setActiveChat,
    getCurrentMessage,
    updateCurrentMessage,
    getCurrentConversation,
    updateConversation,
    getCurrentSelectedNotes,
    updateCurrentSelectedNotes,
    getCurrentSelectedImages,
    updateCurrentSelectedImages,
    onOpenSplitView,
    // Pomodoro functions from App.jsx
    pomodoro,
    sidebarOpened,
    setSidebarOpened,
    openAccordions,
    setOpenAccordions
  } = props;
  
  const { user } = useUser();
  
  const { subject: urlSubject, chatId: urlChatId } = useParams();
  const navigate = useNavigate();
  
  // Only use local state for things not passed from App
  const [chatsBySubject, setChatsBySubject] = useState({});
  const [dynamicActions, setDynamicActions] = useState([]);
  const [allNotes, setAllNotes] = useState(mockNotes);
  const [activeSpotlight, setActiveSpotlight] = useState('main');
  const [pomodoroModalOpened, setPomodoroModalOpened] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [embla, setEmbla] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [sessionLengthInput, setSessionLengthInput] = useState('0025');
  const [sessionLength, setSessionLength] = useState({ hours: 0, minutes: 25 });
  const [sessionLengthError, setSessionLengthError] = useState('');
  const [pauseLengthInput, setPauseLengthInput] = useState('0005');
  const [pauseLength, setPauseLength] = useState({ hours: 0, minutes: 5 });
  const [pauseLengthError, setPauseLengthError] = useState('');
  const [thirdSlideInput, setThirdSlideInput] = useState('04');
  const [thirdSlideValue, setThirdSlideValue] = useState(0);
  const [thirdSlideError, setThirdSlideError] = useState('');
  const [isHoveringButton, setIsHoveringButton] = useState(false);

  const chatContainerRef = useRef(null);
  const carouselRef = useRef(null);

  // Destructure pomodoro functions from props (now includes slide animation)
  const {
    isTimerActive,
    currentTime,
    isBreakTime,
    formatTime,
    convertToSeconds,
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
    clearPomodoroState,
    savedSessionCount,
    // Add slide animation props from App.jsx
    showSlideCountdown,
    slideCountdownText,
    triggerSlideAnimation
  } = pomodoro;


  // Initialize chats from mockChatMessages and handle URL parameters
  useEffect(() => {
    console.log('=== INITIAL CHAT LOADING USEEFFECT ===');
    
    const initialChats = {};
    Object.entries(mockChatMessages).forEach(([subject, chats]) => {
      initialChats[subject] = Object.keys(chats).map(chatId => {
        const chatData = chats[chatId];
        return {
          id: chatId,
          name: chatData.name || (chatId.split('-')[1] === '1' ? `${subject} Chat` : `${subject} Chat ${chatId.split('-')[1]}`)
        };
      });
    });
    
    console.log('initialChats created:', initialChats);
    setChatsBySubject(initialChats);
    console.log('setChatsBySubject called with:', initialChats);

    // Handle URL parameters
    if (urlSubject && urlChatId) {
      // Find the chat from URL
      const chats = initialChats[urlSubject];
      const chat = chats?.find(c => c.id === urlChatId);
      if (chat) {
        setActiveSubject(urlSubject);
        setActiveChat(chat);
        // Save to localStorage for future fallback
        localStorage.setItem('lastActiveChat', JSON.stringify({ subject: urlSubject, chatId: urlChatId }));
        return;
      }
    }

    // Fallback: Try to restore from localStorage first
    const savedChat = localStorage.getItem('lastActiveChat');
    if (savedChat) {
      try {
        const { subject, chatId } = JSON.parse(savedChat);
        const chats = initialChats[subject];
        const chat = chats?.find(c => c.id === chatId);
        if (chat) {
          setActiveSubject(subject);
          setActiveChat(chat);
          navigate(`/studyzone/chat/${subject}/${chatId}`, { replace: true });
          return;
        }
      } catch (e) {
        // Invalid saved data, continue to default
      }
    }

    // Final fallback: Auto-select first chat from Algemeen
    if (initialChats['Algemeen'] && initialChats['Algemeen'].length > 0) {
      const firstChat = initialChats['Algemeen'][0];
      setActiveSubject('Algemeen');
      setActiveChat(firstChat);
      localStorage.setItem('lastActiveChat', JSON.stringify({ subject: 'Algemeen', chatId: firstChat.id }));
      navigate(`/studyzone/chat/Algemeen/${firstChat.id}`, { replace: true });
    }
  }, [urlSubject, urlChatId, navigate]);

  // Update localStorage when active chat changes
  useEffect(() => {
    if (activeSubject && activeChat) {
      localStorage.setItem('lastActiveChat', JSON.stringify({ subject: activeSubject, chatId: activeChat.id }));
      const currentPath = `/studyzone/chat/${activeSubject}/${activeChat.id}`;
      if (window.location.pathname !== currentPath) {
        navigate(currentPath, { replace: true });
      }
    }
  }, [activeSubject, activeChat, navigate]);

  // Configure spotlight search actions based on chats
  useEffect(() => {
    console.log('=== SPOTLIGHT USEEFFECT RUNNING ===');
    console.log('chatsBySubject:', chatsBySubject);
    
    const actions = [];
    
    // Add actions for each chat
    Object.entries(chatsBySubject).forEach(([subject, chats]) => {
      console.log('Processing subject:', subject, 'with chats:', chats);
      chats.forEach(chat => {
        console.log('Adding action for chat:', chat);
        actions.push({
          id: `chat-${subject}-${chat.id}`,
          label: chat.name,
          description: `${subject} chat`,
          onClick: () => {
            console.log('=== SPOTLIGHT CHAT CLICKED ===', subject, chat);
            setActiveSubject(subject);
            setActiveChat(chat);
            setSidebarOpened(false);
          },
          leftSection: (
            <img 
              src={subjectIcons[(subject || 'algemeen').toLowerCase()]} 
              alt={subject}
              style={{ width: 38, height: 38 }} 
            />
          )
        });
      });
    });
    
    console.log('Final actions array:', actions);
    setDynamicActions(actions);
  }, [chatsBySubject]);

  // Function to handle note selection from NoteSearch
  const handleNoteSelect = (note) => {
    console.log('Note selected:', note);
    
    // Pass the selected note to ChatContainer via a ref
    if (chatContainerRef.current && chatContainerRef.current.handleAddNoteFromSpotlight) {
      chatContainerRef.current.handleAddNoteFromSpotlight(note);
    }
    
    // Close spotlight after selection
    setActiveSpotlight('none');
  };

  const closeDrawer = () => setSidebarOpened(false);

  // Sort subjects with Algemeen at the top
  const sortedSubjects = Object.keys(chatsBySubject).sort((a, b) => {
    if (a.toLowerCase() === 'algemeen') return -1;
    if (b.toLowerCase() === 'algemeen') return 1;
    return a.localeCompare(b);
  });

  const handlePomodoroClick = () => {
    if (isTimerActive) {
      // Timer is running, open timer modal
      setTimerModalOpened(true);
    } else {
      // No timer running, open setup modal
      setCurrentSlide(0);
      setPomodoroModalOpened(true);
    }
  };

  const handleNextSlide = () => {
    if (embla && !isTransitioning) {
      // If we're on slide 0, process the session length input
      if (currentSlide === 0) {
        if (sessionLengthInput.length === 4) {
          const hours = parseInt(sessionLengthInput.substring(0, 2), 10);
          const minutes = parseInt(sessionLengthInput.substring(2, 4), 10);
          if (hours === 0 && minutes === 0) {
            setSessionLengthError('Vul een waarde boven 0 in');
            return;
          } else if (hours < 0 || hours > 23) {
            console.log('Invalid hours format');
            setSessionLengthError('Selecteer maximaal 23 uur');
            return;
          } else if (minutes < 0 || minutes > 59) {
            console.log('Invalid minutes format');
            setSessionLengthError('Selecteer maximaal 59 minuten');
            return;
          } else {
            setSessionLength({ hours, minutes });
            setSessionLengthError('');
            console.log(`Session length set to: ${hours} hours and ${minutes} minutes`);
          }
        } else {
          console.log('Please enter 4 digits (HHMM format)');
          setSessionLengthError('Vul alle velden in');
          return;
        }
      }
      else if (currentSlide === 1) {
        if (thirdSlideInput.length === 2) {
          const value = parseInt(thirdSlideInput, 10);
          if (value > 0) {
            setThirdSlideValue(value);
            setThirdSlideError('');
          } else {
            setThirdSlideError('Vul een waarde boven 0 in');
            return;
          }
        } else {
          setThirdSlideError('Vul alle velden in');
          return;
        }
      }

      else if (currentSlide === 2) {
        if (pauseLengthInput.length === 4) {
          const hours = parseInt(pauseLengthInput.substring(0, 2), 10);
          const minutes = parseInt(pauseLengthInput.substring(2, 4), 10);
          
          if (hours === 0 && minutes === 0) {
            setPauseLengthError('Vul een waarde boven 0 in');
            return;
          } else if (hours < 0 || hours > 23) {
            setPauseLengthError('Selecteer maximaal 23 uur');
            return;
          } else if (minutes < 0 || minutes > 59) {
            setPauseLengthError('Selecteer maximaal 59 minuten');
            return;
          } else {
            setPauseLength({ hours, minutes });
            setPauseLengthError('');
          }
        } else {
          setPauseLengthError('Vul alle velden in');
          return;
        }
      }

      setIsTransitioning(true);
      setTimeout(() => {
        embla.scrollNext();
        setTimeout(() => {
          setIsTransitioning(false);
        }, 300);
      }, 50);
    }
  };

  const handlePreviousSlide = () => {
    if (embla && !isTransitioning) {
      setIsTransitioning(true);
      setTimeout(() => {
        embla.scrollPrev();
        setTimeout(() => {
          setIsTransitioning(false);
        }, 300); // Animation duration
      }, 50);
    }
  };

  // Handle embla events with delays
  useEffect(() => {
    if (embla) {
      const onSelect = () => {
        setTimeout(() => {
          setCurrentSlide(embla.selectedScrollSnap());
        }, 100); // Small delay to ensure state is settled
      };

      embla.on('select', onSelect);
      
      // Set initial state with delay
      setTimeout(() => {
        onSelect();
      }, 100);

      return () => embla.off('select', onSelect);
    }
  }, [embla]);

  // Reset carousel when modal opens with proper delays
  useEffect(() => {
    if (embla && pomodoroModalOpened) {
      setTimeout(() => {
        embla.scrollTo(0, true);
        setTimeout(() => {
          setCurrentSlide(0);
        }, 100);
      }, 200); // Wait for modal animation
    }
  }, [embla, pomodoroModalOpened]);

  const handleStartPomodoro = () => {
    // Save the entered values
    setSavedSessionLength(sessionLength);
    setSavedPauseLength(pauseLength);
    setSavedSessionCount(thirdSlideValue);
    
    // Start the timer
    const sessionSeconds = convertToSeconds(sessionLength.hours, sessionLength.minutes);
    const targetEnd = Date.now() + (sessionSeconds * 1000);
    
    setCurrentTime(sessionSeconds);
    setTotalTime(sessionSeconds);
    setCurrentSessionNumber(1);
    setIsBreakTime(false);
    setIsTimerActive(true);
    setTargetEndTime(targetEnd);
    setIsPaused(false);
    
    // Close setup modal
    setPomodoroModalOpened(false);
    
    // Trigger slide animation after modal closes - use the App.jsx function
    setTimeout(() => {
      triggerSlideAnimation();
    }, 200);
  };

  // Reset error when user starts typing
  const handleSessionLengthChange = (value) => {
    setSessionLengthInput(value);
    if (sessionLengthError) {
      setSessionLengthError('');
    }
  };

  const handleMinutesIncrement = () => {
    let currentInput = sessionLengthInput.padEnd(4, '0');
    if (currentInput.length < 4) currentInput = '0000';
    
    let hours = parseInt(currentInput.substring(0, 2), 10);
    let minutes = parseInt(currentInput.substring(2, 4), 10);
    
    minutes += 1;
    if (minutes >= 60) {
      minutes = 0;
      hours += 1;
      if (hours >= 23) {
        hours = 0;
      }
    }
    
    const formattedInput = hours.toString().padStart(2, '0') + minutes.toString().padStart(2, '0');
    setSessionLengthInput(formattedInput);
    
    // Clear error if any
    if (sessionLengthError) {
      setSessionLengthError('');
    }
  };

  const handleMinutesDecrement = () => {
    let currentInput = sessionLengthInput.padEnd(4, '0');
    if (currentInput.length < 4) currentInput = '0000';
    
    let hours = parseInt(currentInput.substring(0, 2), 10);
    let minutes = parseInt(currentInput.substring(2, 4), 10);
    
    minutes -= 1;
    if (minutes < 0) {
      minutes = 59;
      hours -= 1;
      if (hours < 0) {
        hours = 23;
      }
    }
    
    const formattedInput = hours.toString().padStart(2, '0') + minutes.toString().padStart(2, '0');
    setSessionLengthInput(formattedInput);
    
    // Clear error if any
    if (sessionLengthError) {
      setSessionLengthError('');
    }
  };

  // Add these new functions for pause length
  const handlePauseMinutesIncrement = () => {
    let currentInput = pauseLengthInput.padEnd(4, '0');
    if (currentInput.length < 4) currentInput = '0000';
    
    let hours = parseInt(currentInput.substring(0, 2), 10);
    let minutes = parseInt(currentInput.substring(2, 4), 10);
    
    minutes += 1;
    if (minutes >= 60) {
      minutes = 0;
      hours += 1;
      if (hours >= 24) {
        hours = 0;
      }
    }
    
    const formattedInput = hours.toString().padStart(2, '0') + minutes.toString().padStart(2, '0');
    setPauseLengthInput(formattedInput);
    
    if (pauseLengthError) {
      setPauseLengthError('');
    }
  };

  const handlePauseMinutesDecrement = () => {
    let currentInput = pauseLengthInput.padEnd(4, '0');
    if (currentInput.length < 4) currentInput = '0000';
    
    let hours = parseInt(currentInput.substring(0, 2), 10);
    let minutes = parseInt(currentInput.substring(2, 4), 10);
    
    minutes -= 1;
    if (minutes < 0) {
      minutes = 59;
      hours -= 1;
      if (hours < 0) {
        hours = 23;
      }
    }
    
    const formattedInput = hours.toString().padStart(2, '0') + minutes.toString().padStart(2, '0');
    setPauseLengthInput(formattedInput);
    
    if (pauseLengthError) {
      setPauseLengthError('');
    }
  };

  const handlePauseLengthChange = (value) => {
    setPauseLengthInput(value);
    if (pauseLengthError) {
      setPauseLengthError('');
    }
  };

  const handleThirdSlideIncrement = () => {
    let currentInput = thirdSlideInput.padEnd(2, '0');
    if (currentInput.length < 2) currentInput = '00';
    
    let value = parseInt(currentInput, 10);
    value += 1;
    if (value >= 100) {
      value = 0;
    }
    
    const formattedInput = value.toString().padStart(2, '0');
    setThirdSlideInput(formattedInput);
    
    if (thirdSlideError) {
      setThirdSlideError('');
    }
  };
  
  const handleThirdSlideDecrement = () => {
    let currentInput = thirdSlideInput.padEnd(2, '0');
    if (currentInput.length < 2) currentInput = '00';
    
    let value = parseInt(currentInput, 10);
    value -= 1;
    if (value < 0) {
      value = 99;
    }
    
    const formattedInput = value.toString().padStart(2, '0');
    setThirdSlideInput(formattedInput);
    
    if (thirdSlideError) {
      setThirdSlideError('');
    }
  };
  
  const handleThirdSlideChange = (value) => {
    setThirdSlideInput(value);
    if (thirdSlideError) {
      setThirdSlideError('');
    }
  };

  const renderModalButtons = () => {
    if (currentSlide === 0) {
      return (
        <div style={{ display: 'flex', gap: '10px', marginTop: '4px', marginBottom: '42px' }}>
          <Button color='#000460' style={{borderRadius: '100px', width: '100px'}} variant="outline" onClick={() => setPomodoroModalOpened(false)} disabled={isTransitioning}>
            Sluit
          </Button>
          <Button color='#000460' style={{borderRadius: '100px', width: '100px'}} onClick={handleNextSlide} disabled={isTransitioning}>
            Volgende
          </Button>
        </div>
      );
    } else if (currentSlide === 1) {
      return (
        <div style={{ display: 'flex', gap: '10px', marginTop: '4px', marginBottom: '42px' }}>
          <Button color='#000460' style={{borderRadius: '100px', width: '100px'}} variant="outline" onClick={handlePreviousSlide} disabled={isTransitioning}>
            Terug
          </Button>
          <Button color='#000460' style={{borderRadius: '100px', width: '100px'}} onClick={handleNextSlide} disabled={isTransitioning}>
            Volgende
          </Button>
        </div>
      );
    } else if (currentSlide === 2) {
      return (
        <div style={{ display: 'flex', gap: '10px', marginTop: '4px', marginBottom: '42px' }}>
          <Button color='#000460' style={{borderRadius: '100px', width: '100px'}} variant="outline" onClick={handlePreviousSlide} disabled={isTransitioning}>
            Terug
          </Button>
          <Button color='#000460' style={{borderRadius: '100px', width: '100px'}} onClick={handleNextSlide} disabled={isTransitioning}>
            Volgende
          </Button>
        </div>
      );
    } else if (currentSlide === 3) {
      return (
        <div style={{ display: 'flex', gap: '10px', marginTop: '4px', marginBottom: '42px' }}>
          <Button color='#000460' style={{borderRadius: '100px', width: '100px'}} variant="outline" onClick={handlePreviousSlide} disabled={isTransitioning}>
            Terug
          </Button>
          <Button color='#000460' style={{borderRadius: '100px', width: '100px'}} onClick={handleStartPomodoro}>
            Start
          </Button>
        </div>
      );
    }
  };

  const getCarouselHeight = () => {
    if (currentSlide === 3) {
      return 280;
    }
    // return 190; // For slides 0 and 1
    return 240;
  };

  // Add this function to refresh chats from mock data
  const refreshChatsFromMockData = () => {
    const initialChats = {};
    Object.entries(mockChatMessages).forEach(([subject, chats]) => {
      initialChats[subject] = Object.keys(chats).map(chatId => {
        const chatData = chats[chatId];
        return {
          id: chatId,
          // Use stored name if available, fallback to old pattern
          name: chatData.name || (chatId.split('-')[1] === '1' ? `${subject} Chat` : `${subject} Chat ${chatId.split('-')[1]}`)
        };
      });
    });
    setChatsBySubject(initialChats);
  };

  return (
    <div className="studyzone-container">
      {/* Conditionally render the main spotlight */}
      {activeSpotlight === 'main' && (
      <Spotlight
        actions={dynamicActions}
        searchProps={{
          leftSection: <img src={SearchIcon} alt="Search" style={{ width: 20, height: 20 }} />,
            placeholder: "Search chats...",
          }}
          styles={{
            overlay: {
              backdropFilter: 'blur(0px)',
              backgroundColor: 'rgba(0, 0, 0, 0.65)',
            },
          }}
        />
      )}
      
      {/* Conditionally render the notes spotlight */}
      {activeSpotlight === 'notes' && (
        <NoteSearch 
          allNotes={allNotes}
          onNoteSelect={handleNoteSelect}
      />
      )}
      
      <div className="active-chat-header flex-row">
        <div className="active-chat flex-row" onClick={() => setSidebarOpened(true)} >
          {activeSubject && (
            <div className="active-subject-container button flex-row">
              <img
                className="active-subject-icon"
                src={subjectIcons[activeSubject.toLowerCase()]}
                alt={`${activeSubject} icon`}
              />
              <div>{activeSubject}</div>
            </div>
          )}
          {activeChat && (
            <div className="button flex-row active-chat-container">
              <img className='chevron-right' src={chevronRight} alt="" />
              <div className='active-chat-name'>{activeChat.name}</div>
            </div>
          )}
        </div>
        
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <div 
              className="pomodoro-button flex-row" 
              onClick={handlePomodoroClick}
              onMouseEnter={() => setIsHoveringButton(true)}
              onMouseLeave={() => setIsHoveringButton(false)}
            >
              <img src={pomodoroIcon} alt="Pomodoro" />
              <div 
                className="indicator" 
                style={{
                  backgroundColor: isTimerActive 
                    ? (isBreakTime ? '#28a745' : '#FF6601') 
                    : '#89939E', 
                  position: 'absolute', 
                  top: '20px', 
                  left: '22px', 
                  width: '10px', 
                  height: '10px', 
                  borderRadius: '100px',
                  opacity: isTimerActive ? 1 : 0,
                }}
              />
            </div>
          
          {/* Sliding countdown - now uses App.jsx state */}
          <div 
            style={{
              position: 'absolute',
              right: (showSlideCountdown || isHoveringButton) ? '42px' : '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#000000',
              borderRadius: '4px',
              fontSize: '17px',
              fontWeight: '500',
              opacity: (showSlideCountdown || isHoveringButton) ? 1 : 0,
              transition: 'right 0.3s ease-in-out, opacity 0.2s ease-in-out',
              whiteSpace: 'nowrap',
              zIndex: 999,
              pointerEvents: 'none'
            }}
          >
            {showSlideCountdown ? formatTime(currentTime) : 
            isHoveringButton ? (isTimerActive ? formatTime(currentTime) : 'Start!') : 
            isTimerActive ? formatTime(currentTime) : 'Start!'}
        </div>
        </div>
      </div>

      <Sidebar
        opened={sidebarOpened}
        close={closeDrawer}
        activeSubject={activeSubject}
        setActiveSubject={setActiveSubject}
        activeChat={activeChat}
        setActiveChat={setActiveChat}
        chatsBySubject={chatsBySubject}
        setChatsBySubject={setChatsBySubject}
        sortedSubjects={sortedSubjects}
        setActiveSpotlight={setActiveSpotlight}
        openAccordions={openAccordions}
        setOpenAccordions={setOpenAccordions}
        refreshChats={refreshChatsFromMockData}
      />
      
      <ChatContainer
        ref={chatContainerRef}
        activeSubject={activeSubject}
        activeChat={activeChat}
        allNotes={allNotes}
        setActiveSpotlight={setActiveSpotlight}
        onViewNote={onViewNote}
        inSplitView={inSplitView}
        getCurrentMessage={getCurrentMessage}
        updateCurrentMessage={updateCurrentMessage}
        getCurrentConversation={getCurrentConversation}
        updateConversation={updateConversation}
        getCurrentSelectedNotes={getCurrentSelectedNotes}
        updateCurrentSelectedNotes={updateCurrentSelectedNotes}
        getCurrentSelectedImages={getCurrentSelectedImages}
        updateCurrentSelectedImages={updateCurrentSelectedImages}
        onOpenSplitView={(note) => {
          if (onOpenSplitView) {
            const noteWithTimestamp = {
              ...note,
              clickTimestamp: Date.now()
            };
            onOpenSplitView(noteWithTimestamp);
          }
        }}
      />

      <Modal
        className='settings-modal'
        opened={pomodoroModalOpened}
        onClose={() => {
          setPomodoroModalOpened(false);
          setTimeout(() => {
            setCurrentSlide(0);
            setIsTransitioning(false);
          }, 100);
        }}
        centered
        withCloseButton={true}
        zIndex={99999}
        styles={{
          overlay: {
            zIndex: 99998,
          },
          inner: {
            zIndex: 99999,
          }
        }}
      >
        <div className="pomodoro-modal-content">
          <Carousel 
            withIndicators
            height={getCarouselHeight()}
            getEmblaApi={setEmbla}
            draggable={false}
            speed={15}
          >
            <Carousel.Slide>
              <div className="pomodoro-modal-slide-content flex-row">
                <div className="pomodoro-modal-slide-content-container session-slide">
                  <div className="pomodoro-modal-slide-content-title">
                    Ronde Lengte
                  </div>
                  <div className="pomodoro-modal-slide-content-description" style={{ color: sessionLengthError ? 'red' : '#FF6601' }}>
                    {sessionLengthError || 'Vul het aantal uren en minuten in'}
                  </div>
                  <div className="pomodoro-modal-slide-content-input flex-row">
                    <div className="pomodoro-modal-slide-content-input-button minus-button flex-row" onClick={handleMinutesDecrement}>
                      <img src={minusIcon} alt="Minus Icon" />
                    </div>
                    <PinInput 
                      type="number" 
                      placeholder="0" 
                      length={4} 
                      value={sessionLengthInput}
                      onChange={handleSessionLengthChange}
                    />
                    <div className="pomodoro-modal-slide-content-input-button plus-button flex-row" onClick={handleMinutesIncrement}>
                      <img src={plusIcon} alt="Plus Icon" />
                    </div>
                  </div>
                </div>
              </div>
            </Carousel.Slide>
            <Carousel.Slide>
              <div className="pomodoro-modal-slide-content flex-row">
                <div className="pomodoro-modal-slide-content-container session-amount-slide">
                  <div className="pomodoro-modal-slide-content-title">
                    Ronde Aantal
                  </div>
                  <div className="pomodoro-modal-slide-content-description" style={{ color: thirdSlideError ? 'red' : '#FF6601' }}>
                    {thirdSlideError || 'Vul het aantal rondes in'}
                  </div>
                  <div className="pomodoro-modal-slide-content-input flex-row">
                    <div className="pomodoro-modal-slide-content-input-button minus-button flex-row" onClick={handleThirdSlideDecrement}>
                      <img src={minusIcon} alt="Minus Icon" />
                    </div>
                    <PinInput 
                      type="number" 
                      placeholder="0" 
                      length={2} 
                      value={thirdSlideInput}
                      onChange={handleThirdSlideChange}
                    />
                    <div className="pomodoro-modal-slide-content-input-button plus-button flex-row" onClick={handleThirdSlideIncrement}>
                      <img src={plusIcon} alt="Plus Icon" />
                    </div>
                  </div>
                </div>
              </div>
            </Carousel.Slide>
            <Carousel.Slide>
              <div className="pomodoro-modal-slide-content flex-row">
                <div className="pomodoro-modal-slide-content-container pause-slide">
                  <div className="pomodoro-modal-slide-content-title">
                    Pauze Lengte
                  </div>
                  <div className="pomodoro-modal-slide-content-description" style={{ color: pauseLengthError ? 'red' : '#FF6601' }}>
                    {pauseLengthError || 'Vul het aantal uur en minuten in'}
                  </div>
                  <div className="pomodoro-modal-slide-content-input flex-row">
                    <div className="pomodoro-modal-slide-content-input-button minus-button flex-row" onClick={handlePauseMinutesDecrement}>
                      <img src={minusIcon} alt="Minus Icon" />
                    </div>
                    <PinInput 
                      type="number" 
                      placeholder="0" 
                      length={4} 
                      value={pauseLengthInput}
                      onChange={handlePauseLengthChange}
                    />
                    <div className="pomodoro-modal-slide-content-input-button plus-button flex-row" onClick={handlePauseMinutesIncrement}>
                      <img src={plusIcon} alt="Plus Icon" />
                    </div>
                  </div>
                </div>
              </div>
            </Carousel.Slide>
            <Carousel.Slide>
              <div className="pomodoro-modal-slide-content flex-row">
                <div className="pomodoro-modal-slide-content-container">
                  <div className="pomodoro-modal-slide-content-ring-progress">
                    <RingProgress 
                      size={230}
                      thickness={4}
                      roundCaps
                      sections={[{ value: 0, color: '#FF6601' }]} 

                    />
                  </div>
                  <div className="ring-progress-content">
                    <img src={focusIcon} className='focus-icon' alt="Book Icon" />
                    <div className="ring-progress-content-time">
                      <div className="ring-progress-content-time-value">
                        {sessionLength.hours.toString().padStart(2, '0')}<span className='ring-progress-content-time-value-unit'>u</span> : {sessionLength.minutes.toString().padStart(2, '0')}<span className='ring-progress-content-time-value-unit'>m</span>
                      </div>
                      <div className="ring-progress-content-time-description">
                        FOCUS
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Carousel.Slide>
          </Carousel>
          {
            <div className="pomodoro-modal-buttons flex-row" style={{justifyContent: 'center'}}>
              {renderModalButtons()}
            </div>
          }
        </div>
      </Modal>
    </div>
  );
};

export default StudyZone;