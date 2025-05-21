import React, { useState, useEffect, useRef } from 'react';
import { Spotlight } from '@mantine/spotlight';
import { IconSearch } from '@tabler/icons-react';
import { useUser } from '../context/UserContext';
import Sidebar from '../components/StudyZone/macro/Sidebar';
import ChatContainer from '../components/StudyZone/macro/ChatContainer';
import mockChatMessages from '../_data_test/mockChatMessages';
import { NoteSearch } from '../components/Notities/macro/NoteSearch';

import chevronRight from '../assets/svg/global/chevron.svg';

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
    onOpenSplitView
  } = props;
  
  const { user } = useUser();
  // Only use local state for things not passed from App
  const [chatsBySubject, setChatsBySubject] = useState({});
  const [drawerOpened, setDrawerOpened] = useState(false);
  const [dynamicActions, setDynamicActions] = useState([]);
  const [allNotes, setAllNotes] = useState(mockNotes);
  const [activeSpotlight, setActiveSpotlight] = useState('main');

  const chatContainerRef = useRef(null);

  // Initialize chats from mockChatMessages
  useEffect(() => {
    const initialChats = {};
    Object.entries(mockChatMessages).forEach(([subject, chats]) => {
      initialChats[subject] = Object.keys(chats).map(chatId => ({
        id: chatId,
        name: chatId.split('-')[1] === '1' ? `${subject} Chat` : `${subject} Chat ${chatId.split('-')[1]}`
      }));
    });
    setChatsBySubject(initialChats);
  }, []);

  // Configure spotlight search actions based on chats
  useEffect(() => {
    const actions = [];
    
    // Add actions for each chat
    Object.entries(chatsBySubject).forEach(([subject, chats]) => {
      chats.forEach(chat => {
        actions.push({
          id: `chat-${subject}-${chat.id}`,
          label: chat.name,
          description: `${subject} chat`,
          onTrigger: () => {
            setActiveSubject(subject);
            setActiveChat(chat);
            setDrawerOpened(false);
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

  const closeDrawer = () => setDrawerOpened(false);

  // Sort subjects with Algemeen at the top
  const sortedSubjects = Object.keys(chatsBySubject).sort((a, b) => {
    if (a.toLowerCase() === 'algemeen') return -1;
    if (b.toLowerCase() === 'algemeen') return 1;
    return a.localeCompare(b);
  });

  return (
    <div className="studyzone-container">
      {/* Conditionally render the main spotlight */}
      {activeSpotlight === 'main' && (
      <Spotlight
        actions={dynamicActions}
        searchProps={{
          leftSection: <IconSearch size={20} stroke={1.5} />,
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
      
      <div className="active-chat-header">
        <div className="active-chat flex-row" onClick={() => setDrawerOpened(true)} >
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
      </div>

      <Sidebar
        opened={drawerOpened}
        close={closeDrawer}
        activeSubject={activeSubject}
        setActiveSubject={setActiveSubject}
        activeChat={activeChat}
        setActiveChat={setActiveChat}
        chatsBySubject={chatsBySubject}
        sortedSubjects={sortedSubjects}
        setActiveSpotlight={setActiveSpotlight}
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
    </div>
  );
};

export default StudyZone;