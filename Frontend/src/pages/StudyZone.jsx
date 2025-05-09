import React, { useState, useEffect } from 'react';
import { Spotlight } from '@mantine/spotlight';
import { IconSearch } from '@tabler/icons-react';
import { useUser } from '../context/UserContext';
import Sidebar from '../components/StudyZone/macro/Sidebar';
import ChatContainer from '../components/StudyZone/macro/ChatContainer';

import chevronRight from '../assets/svg/global/chevron.svg';

import '../styles/StudyZone/StudyZone.scss';
import '../styles/App.scss';

import subjectIcons from '../subject-icons/subjectIcons';

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

const StudyZone = () => {
  const { user } = useUser();
  const [chatsBySubject, setChatsBySubject] = useState(initialChatsBySubject);
  const [activeSubject, setActiveSubject] = useState('Algemeen');
  const [activeChat, setActiveChat] = useState(null);
  const [drawerOpened, setDrawerOpened] = useState(false);
  const [dynamicActions, setDynamicActions] = useState([]);

  // Configure spotlight search actions based on chats
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
  }, [chatsBySubject, setActiveSubject, setActiveChat]);

  const closeDrawer = () => setDrawerOpened(false);

  // Sort subjects with Algemeen at the top
  const sortedSubjects = Object.keys(chatsBySubject).sort((a, b) => {
    if (a.toLowerCase() === 'algemeen') return -1;
    if (b.toLowerCase() === 'algemeen') return 1;
    return a.localeCompare(b);
  });

  return (
    <div className="studyzone-container">
      <Spotlight
        actions={dynamicActions}
        searchProps={{
          leftSection: <IconSearch size={20} stroke={1.5} />,
          placeholder: 'Search chats...',
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
      
      <ChatContainer 
        activeSubject={activeSubject}
        activeChat={activeChat}
      />
      
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