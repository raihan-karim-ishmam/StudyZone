import React, { useState, useEffect } from 'react';
import { Spotlight } from '@mantine/spotlight';
import { Textarea } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { useUser } from '../context/UserContext';
import Sidebar from '../components/StudyZone/macro/Sidebar';

import logo from '../assets/image/navigation/logo.png';
import chevronRight from '../assets/svg/global/chevron.svg';
import selectImage from '../assets/svg/studyzone/select-image.svg';
import sendImage from '../assets/svg/studyzone/send-arrow.svg';

import '../styles/StudyZone/StudyZone.scss';
import '../styles/App.scss';

const subjectIcons = {
  algemeen: require('../assets/svg/global/subjects/General.svg').default,
  scheikunde: require('../assets/svg/global/subjects/Chemistry.svg').default,
  aardrijkskunde: require('../assets/svg/global/subjects/Geography.svg').default,
  'wiskunde b': require('../assets/svg/global/subjects/Math.svg').default,
  biologie: require('../assets/svg/global/subjects/Biology.svg').default,
  engels: require('../assets/svg/global/subjects/English.svg').default,
  natuurkunde: require('../assets/svg/global/subjects/Physics.svg').default,
};

const initialChatsBySubject = {
  Algemeen: [{ id: 'alg-1', name: 'General Chat' }],
  Scheikunde: [
    { id: 'chem-1', name: 'Organic Chemistry Chat' },
    { id: 'chem-2', name: 'Inorganic Chemistry Chat' },
  ],
  Aardrijkskunde: [
    { id: 'geo-1', name: 'Population Geography Chat' },
    { id: 'geo-2', name: 'Physical Geography Chat' },
  ],
  'Wiskunde B': [
    { id: 'math-1', name: 'Calculus Chat' },
    { id: 'math-2', name: 'Statistics Chat' },
  ],
  Biologie: [{ id: 'bio-1', name: 'Cell Biology Chat' }],
  Engels: [{ id: 'eng-1', name: 'Literature Chat' }],
  Natuurkunde: [{ id: 'phys-1', name: 'Mechanics Chat' }],
};

// const buildSpotlightActions = (
//   user,
//   chatsBySubject,
//   setActiveSubject,
//   setActiveChat,
//   close
// ) => {
//   const actions = [];
//   if (user && user.subjects) {
//     user.subjects.forEach((subjectStr) => {
//       const trimmedSubject = subjectStr.trim();
//       const subjectKey = Object.keys(chatsBySubject).find(
//         (key) => key.trim().toLowerCase() === trimmedSubject.toLowerCase()
//       );
//       console.log("Processing subject:", trimmedSubject, "=>", subjectKey);
//       if (subjectKey) {
//         const subjectChats = chatsBySubject[subjectKey];
//         subjectChats.forEach((chat) => {
//           actions.push({
//             id: `${subjectKey}-${chat.id}`,
//             label: chat.name,
//             description: `Subject: ${subjectKey}`,
//             onClick: () => {
//               console.log(`Action clicked: ${chat.name} under ${subjectKey}`);
//               setActiveSubject(subjectKey);
//               setActiveChat(chat);
//               if (typeof close === 'function') close();
//             },
//             leftSection: subjectIcons[subjectKey.toLowerCase()] ? (
//               <img
//                 src={subjectIcons[subjectKey.toLowerCase()]}
//                 alt={`${subjectKey} icon`}
//                 style={{ width: 24, height: 24 }}
//               />
//             ) : null,
//           });
//         });
//       }
//     });
//   }
//   return actions;
// };

const StudyZone = () => {
  const { user } = useUser();
  const [chatsBySubject, setChatsBySubject] = useState(initialChatsBySubject);
  const [activeSubject, setActiveSubject] = useState('Algemeen');
  const [activeChat, setActiveChat] = useState(null);
  const [drawerOpened, setDrawerOpened] = useState(false);
  const [query, setQuery] = useState("");
  const [dynamicActions, setDynamicActions] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState(null);

  useEffect(() => {
    const dynamicActions = [];
    Object.keys(chatsBySubject).forEach((subject) => {
      (chatsBySubject[subject] || []).forEach((chat) => {
        dynamicActions.push({
          id: `${subject}-${chat.id}`,
          title: chat.name,
          description: `Subject: ${subject} ${chat.name}`,
          onTrigger: () => {
            setActiveSubject(subject);
            setActiveChat(chat);
          },
          leftSection: subjectIcons[subject.toLowerCase()]
            ? <img src={subjectIcons[subject.toLowerCase()]} alt={`${subject} icon`} style={{ width: 24, height: 24 }} />
            : null,
        });
      });
    });
    setDynamicActions(dynamicActions);
  }, [chatsBySubject, subjectIcons, setActiveSubject, setActiveChat]);

  const closeDrawer = () => setDrawerOpened(false);
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState([]);

  useEffect(() => {
    if (activeChat) {
      console.log('Chat:', activeChat.id);
      // Fetch API call for conversation.
      // For now; clear simulation.
      setConversation([]);
    } else {
      // Clear the conversation when no chat is selected.
      setConversation([]);
    }
  }, [activeChat]);

  const handleSendMessage = () => {
    if (message.trim() === '') return;

    setConversation((prev) => [
      ...prev,
      { id: Date.now(), text: message, sender: 'user' },
    ]);

    setMessage('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
      setMessage('');
    }
  };

  const effectiveChats = { Algemeen: [], ...chatsBySubject };

  const sortedSubjects = Object.keys(effectiveChats).sort((a, b) => {
    if (a.toLowerCase() === 'algemeen') return -1;
    if (b.toLowerCase() === 'algemeen') return 1;
    return a.localeCompare(b);
  });

  const hardcodedNotes = {
    Algemeen: [
      { id: 'a1', title: 'Algemeen Note 1', content: 'Content for Algemeen note 1' },
      { id: 'a2', title: 'Algemeen Note 2', content: 'Content for Algemeen note 2' },
      { id: 'a3', title: 'Algemeen Note 3', content: 'Content for Algemeen note 3' },
      { id: 'a4', title: 'Algemeen Note 4', content: 'Content for Algemeen note 4' },
    ],
    Biologie: [
      { id: 'b1', title: 'Biologie Note 1', content: 'Content for Biologie note 1' },
      { id: 'b2', title: 'Biologie Note 2', content: 'Content for Biologie note 2' },
      { id: 'b3', title: 'Biologie Note 3', content: 'Content for Biologie note 3' },
      { id: 'b4', title: 'Biologie Note 4', content: 'Content for Biologie note 4' },
    ],
    Aardrijkskunde: [
      { id: 'c1', title: 'Aardrijkskunde Note 1', content: 'Content for Aardrijkskunde note 1' },
      { id: 'c2', title: 'Aardrijkskunde Note 2', content: 'Content for Aardrijkskunde note 2' },
      { id: 'c3', title: 'Aardrijkskunde Note 3', content: 'Content for Aardrijkskunde note 3' },
      { id: 'c4', title: 'Aardrijkskunde Note 4', content: 'Content for Aardrijkskunde note 4' },
    ],
    Scheikunde: [
      { id: 'd1', title: 'Scheikunde Note 1', content: 'Content for Scheikunde note 1' },
      { id: 'd2', title: 'Scheikunde Note 2', content: 'Content for Scheikunde note 2' },
      { id: 'd3', title: 'Scheikunde Note 3', content: 'Content for Scheikunde note 3' },
      { id: 'd4', title: 'Scheikunde Note 4', content: 'Content for Scheikunde note 4' },
    ], 
    'Wiskunde B': [
      { id: 'e1', title: 'Wiskunde B Note 1', content: 'Content for Wiskunde B note 1' },
      { id: 'e2', title: 'Wiskunde B Note 2', content: 'Content for Wiskunde B note 2' },
      { id: 'e3', title: 'Wiskunde B Note 3', content: 'Content for Wiskunde B note 3' },
      { id: 'e4', title: 'Wiskunde B Note 4', content: 'Content for Wiskunde B note 4' },
    ],
    Engels: [
      { id: 'f1', title: 'Engels Note 1', content: 'Content for Engels note 1' },
      { id: 'f2', title: 'Engels Note 2', content: 'Content for Engels note 2' },
      { id: 'f3', title: 'Engels Note 3', content: 'Content for Engels note 3' },
      { id: 'f4', title: 'Engels Note 4', content: 'Content for Engels note 4' },
    ],
    Natuurkunde: [  
      { id: 'g1', title: 'Natuurkunde Note 1', content: 'Content for Natuurkunde note 1' },
      { id: 'g2', title: 'Natuurkunde Note 2', content: 'Content for Natuurkunde note 2' },
      { id: 'g3', title: 'Natuurkunde Note 3', content: 'Content for Natuurkunde note 3' },
      { id: 'g4', title: 'Natuurkunde Note 4', content: 'Content for Natuurkunde note 4' },
    ], 
  };

  const notesForActiveSubject = hardcodedNotes[activeSubject] || [];

  return (
    <div className="studyzone-container">
      <Spotlight
        actions={dynamicActions}
        searchProps={{
          leftSection: <IconSearch size={20} stroke={1.5} />,
          placeholder: 'Search chats...',
          onKeyDown: handleKeyDown
        }}
      />
      <div className="active-chat-header flex-row">
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
      <div className='new-chat-container flex-row'>
        {conversation.length === 0 ? (
          <div className='new-chat-placeholder flex-column'>
            <img className='logo' src={logo} alt="StudyZone Logo" />
            <div className="new-chat-placeholder-title">Start Met Leren!</div>
            <div className="new-chat-placeholder-description">
              Begin met een eigen vraag of ga verder met een
              van je notities voor dit vak
            </div>
            <div className="choose-note flex-column">
              <div className="choose-note-title">Recente Notities</div>
              <div className="choose-note-blocks flex-row">
                {notesForActiveSubject.slice(0, 3).map((note) => (
                  <div
                    key={note.id}
                    className={`choose-note-block button flex-row ${selectedNoteId === note.id ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedNoteId(note.id);
                      setMessage(`${note.title}\n${note.content}`);
                    }}
                  >
                    <div className="note-title">{note.title}</div>
                    <img
                      className="active-subject-icon-quick-note"
                      src={subjectIcons[activeSubject.toLowerCase()]}
                      alt={`${activeSubject} icon`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          conversation.map((msg) => (
            <div 
              key={msg.id} 
              className={`message ${msg.sender}`} 
              style={{ 
                margin: '8px 0', 
                padding: '8px', 
                background: msg.sender === 'user' ? '#e6f7ff' : '#f1f0f0', 
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', 
                borderRadius: '4px', 
                maxWidth: '70%' 
              }}
            >
              {msg.text}
            </div>
          ))
        )}
      </div>
      <div className="typebar-container flex-row">
        <div className="input-container flex-row">
          <img src={selectImage} className='select-image button' alt="Select Image" />
          <Textarea
            className="typebar"
            type="text"
            placeholder="Type hier..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            autosize
            minRows={1}
            maxRows={7}
            styles={{
              padding: 0,
              input: {
                border: 'none',
              },
            }}
          />
        </div>
        <div className='send-button flex-row button' onClick={handleSendMessage}>
          <img src={sendImage} alt="Send" />
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
        setChatsBySubject={setChatsBySubject}
      />
    </div>
  );
};

export default StudyZone;