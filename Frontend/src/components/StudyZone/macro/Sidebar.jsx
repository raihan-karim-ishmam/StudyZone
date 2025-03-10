import React, { useState, useEffect } from 'react';
import { Drawer, Accordion, Menu, Button } from '@mantine/core';
import { spotlight } from '@mantine/spotlight';
import { useUser } from '../../../context/UserContext';
import ContextMenu from '../../ContextMenu.jsx';
import '../../../styles/StudyZone/macro/Sidebar.scss';
import { IconDots, IconPlus } from '@tabler/icons-react';

import chevronLeft from '../../../assets/svg/studyzone/chevron-left.svg';
import headerChat from '../../../assets/svg/studyzone/header-chat.svg';
import searchIcon from '../../../assets/svg/global/search.svg';

const subjectIcons = {
  algemeen: require('../../../assets/svg/global/subjects/General.svg').default,
  scheikunde: require('../../../assets/svg/global/subjects/Chemistry.svg').default,
  aardrijkskunde: require('../../../assets/svg/global/subjects/Geography.svg').default,
  'wiskunde b': require('../../../assets/svg/global/subjects/Math.svg').default,
  biologie: require('../../../assets/svg/global/subjects/Biology.svg').default,
  engels: require('../../../assets/svg/global/subjects/English.svg').default,
  natuurkunde: require('../../../assets/svg/global/subjects/Physics.svg').default,
};

const Sidebar = ({
  opened,
  close,
  activeSubject,
  setActiveSubject,
  activeChat,
  setActiveChat,
  chatsBySubject,
  setChatsBySubject,
}) => {
  const { user, updateUserField } = useUser();
  const subjects = user.subjects;
  const [subjectOrder, setSubjectOrder] = useState(Object.keys(chatsBySubject));
  const [contextMenuOpened, setContextMenuOpened] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [contextMenuSubject, setContextMenuSubject] = useState(null);

  useEffect(() => {
    const keys = Object.keys(chatsBySubject);
    if (JSON.stringify(keys) !== JSON.stringify(subjectOrder)) {
      setSubjectOrder(keys);
    }
  }, [chatsBySubject]);

  const toggleSubjectExpansion = (subject) => {
    if (activeSubject === subject) {
      setActiveSubject(null);
      setActiveChat(null);
    } else {
      setActiveSubject(subject);
      setActiveChat(null);
    }
  };

  const handleChatClick = (subject, chat) => {
    setActiveSubject(subject);
    setActiveChat(chat);
    close && close();
  };

  const handleContextMenu = (event, subject) => {
    event.preventDefault();
    setContextMenuSubject(subject);
    setContextMenuPosition({ x: event.clientX, y: event.clientY });
    setContextMenuOpened(true);
  };

  const handleCloseContextMenu = () => {
    setContextMenuOpened(false);
    setContextMenuSubject(null);
  };

  const handleDeleteSubject = () => {
    if (!contextMenuSubject) return;
    const newOrder = subjectOrder.filter(s => s !== contextMenuSubject);
    setSubjectOrder(newOrder);
    const { [contextMenuSubject]: removed, ...newChats } = chatsBySubject;
    setChatsBySubject(newChats);
    handleCloseContextMenu();
  };

  const handleRenameSubject = () => {
    if (!contextMenuSubject) return;
    const newName = window.prompt('Enter new subject name', contextMenuSubject);
    if (newName && newName !== contextMenuSubject) {
      const newOrder = subjectOrder.map(s => s === contextMenuSubject ? newName : s);
      setSubjectOrder(newOrder);
      const newChats = {};
      Object.keys(chatsBySubject).forEach(key => {
        if (key === contextMenuSubject) {
          newChats[newName] = chatsBySubject[key];
        } else {
          newChats[key] = chatsBySubject[key];
        }
      });
      setChatsBySubject(newChats);
      if (activeSubject === contextMenuSubject) setActiveSubject(newName);
    }
    handleCloseContextMenu();
  };

  const handleMoveSubjectUp = () => {
    if (!contextMenuSubject) return;
    const index = subjectOrder.indexOf(contextMenuSubject);
    if (index <= 0) return;
    const newOrder = [...subjectOrder];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    setSubjectOrder(newOrder);
    const newChats = {};
    newOrder.forEach(key => {
      newChats[key] = chatsBySubject[key];
    });
    setChatsBySubject(newChats);
    handleCloseContextMenu();
  };

  const handleMoveSubjectDown = () => {
    if (!contextMenuSubject) return;
    const index = subjectOrder.indexOf(contextMenuSubject);
    if (index < 0 || index >= subjectOrder.length - 1) return;
    const newOrder = [...subjectOrder];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    setSubjectOrder(newOrder);
    const newChats = {};
    newOrder.forEach(key => {
      newChats[key] = chatsBySubject[key];
    });
    setChatsBySubject(newChats);
    handleCloseContextMenu();
  };

  const handleAddSubject = () => {
    const newSubject = window.prompt("Enter new subject name");
    if (newSubject) {
      if (chatsBySubject[newSubject] !== undefined) {
        window.alert("Subject already exists");
      } else {
        setChatsBySubject({ ...chatsBySubject, [newSubject]: [] });
        setSubjectOrder([...subjectOrder, newSubject]);
      }
    }
  };

  const effectiveChatsBySubject = { Algemeen: [], ...chatsBySubject };

  const sortedSubjects = Object.keys(effectiveChatsBySubject).sort((a, b) => {
    if (a.toLowerCase() === 'algemeen') return -1;
    if (b.toLowerCase() === 'algemeen') return 1;
    return a.localeCompare(b);
  });

  const handleNewChat = (subject) => {
    const newChatName = window.prompt('Enter the new chat name:');
    if (newChatName && newChatName.trim() !== '') {
      const newChat = {
        id: `${subject}-${Date.now()}`, // Simple ID generation
        name: newChatName.trim(),
      };
      setChatsBySubject((prev) => ({
        ...prev,
        [subject]: [...(prev[subject] || []), newChat],
      }));
    }
  };

  const handleRenameChat = (subject, chat) => {
    const newName = window.prompt('Enter new chat name:', chat.name);
    if (newName && newName.trim() !== '') {
      setChatsBySubject((prev) => ({
        ...prev,
        [subject]: prev[subject].map((c) =>
          c.id === chat.id ? { ...c, name: newName.trim() } : c
        ),
      }));
      if (activeChat && activeChat.id === chat.id) {
        setActiveChat({ ...activeChat, name: newName.trim() });
      }
    }
  };

  const handleDeleteChat = (subject, chat) => {
    if (window.confirm('Are you sure you want to delete this chat?')) {
      setChatsBySubject((prev) => ({
        ...prev,
        [subject]: prev[subject].filter((c) => c.id !== chat.id),
      }));
      if (activeChat && activeChat.id === chat.id) {
        setActiveChat(null);
      }
    }
  };

  return (
    <Drawer
      opened={opened}
      onClose={() => {
        close && close();
        handleCloseContextMenu();
      }}
      position="left"
      size="325px"
      withCloseButton={false}
      withOverlay={false}
      styles={{
        inner: { top: '85px', height: 'calc(100vh - 80px)' },
        content: { boxShadow: '0px 0px 20px 0px rgba(0,0,0,0.06)' },
      }}
    >
      <div className="drawer-header-container flex-row">
        <div className="drawer-header flex-row">
          <img className='drawer-header-icon' src={headerChat} alt="Chat Icon" />
          <div className='drawer-header-title'>Mijn Chats</div>
        </div>
        <img className='drawer-header-close button' onClick={() => { close && close(); handleCloseContextMenu(); }} src={chevronLeft} alt="Close" />
      </div>

      <div className="spotlight-search-container flex-row button" onClick={() => spotlight.open()}>
        <img className='spotlight-search-icon' src={searchIcon} alt="Search Icon" />
        <div className="spotlight-search-text">
          Zoek...
        </div>
      </div>

      <div className="divider"></div>

      <Accordion>
        {subjectOrder.map((subject) => (
          <Accordion.Item value={subject} key={subject}>
            <Accordion.Control onContextMenu={(e) => handleContextMenu(e, subject)}>
              {subjectIcons[subject.toLowerCase()] && (
                    <img
                      src={subjectIcons[subject.toLowerCase()]}
                      alt={`${subject} icon`}
                      style={{ width: 24, height: 24, marginRight: 8, verticalAlign: 'middle' }}
                    />
                  )
              }
              {subject}
            </Accordion.Control>
            <Accordion.Panel>
              <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
                {(effectiveChatsBySubject[subject] || []).map((chat) => (
                  <li
                    key={chat.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 0',
                      borderBottom: '1px solid #eee'
                    }}
                  >
                    <div
                      onClick={() => {
                        setActiveSubject(subject);
                        setActiveChat(chat);
                        close();
                      }}
                      style={{
                        cursor: 'pointer',
                        flexGrow: 1,
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {chat.name}
                    </div>
                    <div onClick={(e) => e.stopPropagation()} style={{ flexShrink: 0, marginLeft: '8px' }}>
                      <Menu>
                        <Menu.Target>
                          <div onClick={(e) => e.stopPropagation()}>
                            <IconDots size={16} style={{ cursor: 'pointer' }} />
                          </div>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRenameChat(subject, chat);
                            }}
                          >
                            Rename Chat
                          </Menu.Item>
                          <Menu.Item
                            color="red"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteChat(subject, chat);
                            }}
                          >
                            Delete Chat
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </div>
                  </li>
                ))}
                <li style={{ marginTop: '8px' }}>
                  <Button
                    variant="light"
                    size="xs"
                    fullWidth
                    leftIcon={<IconPlus size={16} />}
                    onClick={() => handleNewChat(subject)}
                  >
                    New Chat
                  </Button>
                </li>
              </ul>
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
      <div className='add-subject-container button' onClick={handleAddSubject}>
        Add Subject
      </div>
      {contextMenuOpened && (
        <div
          style={{
            position: 'fixed',
            top: contextMenuPosition.y,
            left: contextMenuPosition.x,
            backgroundColor: 'white',
            border: '1px solid #ccc',
            zIndex: 1000,
          }}
        >
          <div onClick={handleDeleteSubject} style={{ padding: '8px', cursor: 'pointer' }}>
            Delete
          </div>
          <div onClick={handleRenameSubject} style={{ padding: '8px', cursor: 'pointer' }}>
            Rename
          </div>
          {(() => {
            const index = subjectOrder.indexOf(contextMenuSubject);
            if (index > 0) {
              return (
                <div onClick={handleMoveSubjectUp} style={{ padding: '8px', cursor: 'pointer' }}>
                  Move Up
                </div>
              );
            }
            return null;
          })()}
          {(() => {
            const index = subjectOrder.indexOf(contextMenuSubject);
            if (index < subjectOrder.length - 1) {
              return (
                <div onClick={handleMoveSubjectDown} style={{ padding: '8px', cursor: 'pointer' }}>
                  Move Down
                </div>
              );
            }
            return null;
          })()}
        </div>
      )}
    </Drawer>
  );
};

export default Sidebar;