import React, { useState, useEffect } from 'react';
import { Drawer, Accordion, Menu, Button, Modal, Text, Group, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { spotlight } from '@mantine/spotlight';
import { useUser } from '../../../context/UserContext';
import ContextMenu from '../../ContextMenu.jsx';
import '../../../styles/StudyZone/macro/Sidebar.scss';
import { IconDots, IconPlus } from '@tabler/icons-react';

import chevronLeft from '../../../assets/svg/studyzone/chevron-left.svg';
import headerChat from '../../../assets/svg/studyzone/header-chat.svg';
import searchIcon from '../../../assets/svg/global/search.svg';
import chevronDown from '../../../assets/svg/global/chevron.svg';
import editIcon from '../../../assets/svg/studyzone/edit_chat.svg';
import deleteIcon from '../../../assets/svg/notities/delete_note.svg';
import moveIcon from '../../../assets/svg/studyzone/move.svg';
import deleteModalIcon from '../../../assets/svg/notities/modal_delete.svg';
import renameModalIcon from '../../../assets/svg/studyzone/modal_edit.svg';

import mockChatMessages from '../../../_data_test/mockChatMessages';

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
  setActiveSpotlight,
  openAccordions,
  setOpenAccordions,
  refreshChats
}) => {
  const { user, updateUserField } = useUser();
  const subjects = user.subjects;
  const [subjectOrder, setSubjectOrder] = useState(Object.keys(chatsBySubject));
  const [contextMenuOpened, setContextMenuOpened] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [contextMenuSubject, setContextMenuSubject] = useState(null);
  const [creatingChat, setCreatingChat] = useState(false);
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);
  const [subjectToDeleteFrom, setSubjectToDeleteFrom] = useState(null);
  const [renameModalOpened, setRenameModalOpened] = useState(false);
  const [chatToRename, setChatToRename] = useState(null);
  const [subjectToRenameFrom, setSubjectToRenameFrom] = useState(null);
  const [newChatName, setNewChatName] = useState('');

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
    // close && close();
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

  const handleNewChat = async (subject) => {
    setCreatingChat(true);
    
    const newChatName = `${subject} Nieuw Chat`;
    
    try {
      const response = await createChatAPI({
        subject: subject,
        name: newChatName,
        userId: user?.id
      });

      if (response.success) {
        // Refresh chats from updated mock data
        refreshChats();
        
        // Set the new chat as active
        const newChat = {
          id: response.chatId,
          name: newChatName
        };
        
        setActiveSubject(subject);
        setActiveChat(newChat);
        
        console.log('Chat created successfully:', response);
      }
    } catch (error) {
      console.error('Failed to create chat:', error);
      alert('Failed to create chat. Please try again.');
    } finally {
      setCreatingChat(false);
    }
  };

  // PLACEHOLDER API FUNCTION - Updates mock data for development
  const createChatAPI = async (chatData) => {
    // TODO: Replace with actual backend endpoint when ready
    
    // DEVELOPMENT: Add chat to mock data
    const subject = chatData.subject;
    const subjectKey = subject.toLowerCase();
    
    // Generate chat ID following existing pattern
    const existingChats = mockChatMessages[subject] || {};
    const existingIds = Object.keys(existingChats);
    
    // Get prefix from subject (first 3 letters or use abbreviation)
    const getPrefix = (subj) => {
      const prefixMap = {
        'Algemeen': 'alg',
        'Natuurkunde': 'nat', 
        'Scheikunde': 'chem',
        'Wiskunde B': 'math',
        'Biologie': 'bio',
        'Aardrijkskunde': 'geo',
        'Engels': 'eng'
      };
      return prefixMap[subj] || subj.toLowerCase().substring(0, 3);
    };
    
    const prefix = getPrefix(subject);
    
    // Find next available number
    let nextNumber = 1;
    while (existingIds.includes(`${prefix}-${nextNumber}`)) {
      nextNumber++;
    }
    
    const newChatId = `${prefix}-${nextNumber}`;
    
    // Add to mock data with chat name
    if (!mockChatMessages[subject]) {
      mockChatMessages[subject] = {};
    }
    
    mockChatMessages[subject][newChatId] = {
      name: chatData.name, // Store the actual chat name
      messages: [
        {
          role: "system",
          content: `You are StudyZone AI, a helpful assistant for ${subject.toLowerCase()} students.`
        }
      ]
    };
    
    // Mock response
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          chatId: newChatId,
          createdAt: new Date().toISOString(),
          message: 'Chat created successfully'
        });
      }, 300); // Simulate network delay
    });

    // REAL API CALL - uncomment when backend is ready
    /*
    const response = await fetch('/api/chats', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user?.token}`
      },
      body: JSON.stringify(chatData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
    */
  };

  const effectiveChatsBySubject = { Algemeen: [], ...chatsBySubject };

  const sortedSubjects = Object.keys(effectiveChatsBySubject).sort((a, b) => {
    if (a.toLowerCase() === 'algemeen') return -1;
    if (b.toLowerCase() === 'algemeen') return 1;
    return a.localeCompare(b);
  });

  const handleRenameChat = (subject, chat) => {
    // Store the chat and subject to rename
    setChatToRename(chat);
    setSubjectToRenameFrom(subject);
    setNewChatName(chat.name); // Pre-fill with current name
    setRenameModalOpened(true);
  };

  const handleDeleteChat = (subject, chat) => {
    // Store the chat and subject to delete
    setChatToDelete(chat);
    setSubjectToDeleteFrom(subject);
    setDeleteModalOpened(true);
  };

  const confirmDeleteChat = () => {
    if (chatToDelete && subjectToDeleteFrom) {
      // Remove from chatsBySubject state
      setChatsBySubject((prev) => ({
        ...prev,
        [subjectToDeleteFrom]: prev[subjectToDeleteFrom].filter((c) => c.id !== chatToDelete.id),
      }));

      // Remove from mockChatMessages data
      if (mockChatMessages[subjectToDeleteFrom] && mockChatMessages[subjectToDeleteFrom][chatToDelete.id]) {
        delete mockChatMessages[subjectToDeleteFrom][chatToDelete.id];
      }

      // If the deleted chat was active, clear it
      if (activeChat && activeChat.id === chatToDelete.id) {
        setActiveChat(null);
      }

      // Show success notification
      notifications.show({
        title: 'Chat verwijderd',
        message: `"${chatToDelete.name}" is succesvol verwijderd`,
        color: 'red',
        autoClose: 3000,
      });
    }
    
    // Close modal and reset state
    setDeleteModalOpened(false);
    setChatToDelete(null);
    setSubjectToDeleteFrom(null);
  };

  const cancelDeleteChat = () => {
    // Show cancellation notification
    notifications.show({
      title: 'Geannuleerd',
      message: 'Chat verwijdering is geannuleerd',
      color: '#89939E',
      autoClose: 3000,
    });

    setDeleteModalOpened(false);
    setChatToDelete(null);
    setSubjectToDeleteFrom(null);
  };

  const handleAccordionChange = (value) => {
    if (value === null) {
      // Accordion is being closed
      setOpenAccordions(prev => prev.filter(item => item !== value));
    } else {
      // Accordion is being opened
      setOpenAccordions(prev => [...prev, value]);
    }
  };

  // Add this function to handle moving chats between subjects
  const handleMoveChat = (fromSubject, toSubject, chat) => {
    // Update the chatsBySubject state
    setChatsBySubject((prev) => ({
      ...prev,
      [fromSubject]: prev[fromSubject].filter((c) => c.id !== chat.id),
      [toSubject]: [...(prev[toSubject] || []), chat]
    }));

    // Update the mockChatMessages data
    if (mockChatMessages[fromSubject] && mockChatMessages[fromSubject][chat.id]) {
      const chatData = mockChatMessages[fromSubject][chat.id];
      
      // Remove from old subject
      delete mockChatMessages[fromSubject][chat.id];
      
      // Add to new subject
      if (!mockChatMessages[toSubject]) {
        mockChatMessages[toSubject] = {};
      }
      mockChatMessages[toSubject][chat.id] = chatData;
    }

    // If the moved chat was active, update the active subject
    if (activeChat && activeChat.id === chat.id) {
      setActiveSubject(toSubject);
    }
  };

  // Get all available subjects for the move submenu
  const getAvailableSubjectsForMove = (currentSubject) => {
    const allSubjects = ['Algemeen', ...Object.keys(chatsBySubject).filter(s => s !== 'Algemeen')];
    return allSubjects.filter(subject => subject !== currentSubject);
  };

  const confirmRenameChat = () => {
    if (chatToRename && subjectToRenameFrom && newChatName.trim() !== '') {
      // Update chatsBySubject state
      setChatsBySubject((prev) => ({
        ...prev,
        [subjectToRenameFrom]: prev[subjectToRenameFrom].map((c) =>
          c.id === chatToRename.id ? { ...c, name: newChatName.trim() } : c
        ),
      }));

      // Update mockChatMessages data
      if (mockChatMessages[subjectToRenameFrom] && mockChatMessages[subjectToRenameFrom][chatToRename.id]) {
        mockChatMessages[subjectToRenameFrom][chatToRename.id].name = newChatName.trim();
      }

      // Update active chat if it's the renamed one
      if (activeChat && activeChat.id === chatToRename.id) {
        setActiveChat({ ...activeChat, name: newChatName.trim() });
      }

      // Show success notification
      notifications.show({
        title: 'Chat hernoemd',
        message: `Chat is hernoemd naar "${newChatName.trim()}"`,
        color: 'green',
        autoClose: 3000,
      });
    }
    
    // Close modal and reset state
    setRenameModalOpened(false);
    setChatToRename(null);
    setSubjectToRenameFrom(null);
    setNewChatName('');
  };

  const cancelRenameChat = () => {
    // Show cancellation notification
    notifications.show({
      title: 'Geannuleerd',
      message: 'Chat hernoemen is geannuleerd',
      color: '#89939E',
      autoClose: 3000,
    });

    setRenameModalOpened(false);
    setChatToRename(null);
    setSubjectToRenameFrom(null);
    setNewChatName('');
  };

  // Handle Enter key press in rename input
  const handleRenameKeyPress = (event) => {
    if (event.key === 'Enter') {
      confirmRenameChat();
    }
  };

  return (
    <>
      <Drawer
        className='sidebar-drawer'
        opened={opened}
        onClose={() => {
          close && close();
          handleCloseContextMenu();
        }}
        position="left"
        size="325px"
        withCloseButton={false}
        withOverlay={false}
        lockScroll={false}
        closeOnEscape={false} 
        styles={{
          inner: { top: '75px', height: 'calc(100vh - 75px)' },
          content: { pointerEvents: 'auto' },
          root: { pointerEvents: 'none' }
        }}
      >
        <div className="drawer-header-container flex-row" style={{position: 'sticky', top: '0px', backgroundColor: '#fefefe', zIndex: '1000'}}>
          <div className="drawer-header flex-row">
            <img className='drawer-header-icon' src={headerChat} alt="Chat Icon" />
            <div className='drawer-header-title'>Mijn Chats</div>
          </div>
          <img className='drawer-header-close button' onClick={() => { close && close(); handleCloseContextMenu(); }} src={chevronLeft} alt="Close" />
        </div>

        <div 
          className="spotlight-search-container flex-row button" 
          onClick={() => { 
            setActiveSpotlight('main'); 
            setTimeout(() => { 
              spotlight.open();
            }, 100);
          }}
        >
          <img className='spotlight-search-icon' src={searchIcon} alt="Search Icon" />
          <div className="spotlight-search-text">
            Zoek...
          </div>
        </div>

        <div className="divider"></div>
        <div className="accordion-label-1">Algemeen</div>
        <Accordion
          chevron={<img src={chevronDown} alt="Chevron Down" style={{width: 16, height: 16, transform: 'rotate(90deg)'}} />}
          value={openAccordions.includes('Algemeen') ? 'Algemeen' : null}
          onChange={(value) => {
            if (value === null) {
              // Accordion is being closed
              setOpenAccordions(prev => prev.filter(item => item !== 'Algemeen'));
            } else {
              // Accordion is being opened
              setOpenAccordions(prev => [...prev, 'Algemeen']);
            }
          }}
          style={{ marginBottom: '26px' }}
        >
          <Accordion.Item value="Algemeen" key="Algemeen">
            <Accordion.Control onContextMenu={(e) => handleContextMenu(e, 'Algemeen')}>
              {subjectIcons['algemeen'] && (
                <img
                  src={subjectIcons['algemeen']}
                  alt="Algemeen icon"
                  style={{ width: 24, height: 24, marginRight: 8, verticalAlign: 'middle' }}
                />
              )}
              Algemeen
            </Accordion.Control>
            <Accordion.Panel>
              <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
                {(effectiveChatsBySubject['Algemeen'] || []).map((chat) => (
                  <li
                    key={chat.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 0',
                      backgroundColor: (activeChat && activeChat.id === chat.id) ? '#f6f6f6' : '#fefefe',
                      transition: 'background-color 0.3s ease',
                    }}
                  >
                    <div className="line">
                      <div 
                        className="dot"
                        style={{ 
                          opacity: (activeChat && activeChat.id === chat.id) ? 1 : 0 
                        }}
                      ></div>
                    </div>
                    <div className="chat-icon flex-row">
                      <img src={headerChat} alt="Chat Icon" style={{width: 16, height: 16, justifyContent: 'center', alignItems: 'center'}}/>
                    </div>
                    <div
                      onClick={() => {
                        setActiveSubject('Algemeen');
                        setActiveChat(chat);
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
                    <div className='chat-menu-trigger' onClick={(e) => e.stopPropagation()} style={{ flexShrink: 0, marginLeft: '8px' }}>
                      <Menu className='chat-menu'>
                        <Menu.Target>
                          <div onClick={(e) => e.stopPropagation()}>
                            <IconDots size={16} style={{ cursor: 'pointer' }} />
                          </div>
                        </Menu.Target>
                        <Menu.Dropdown className='chat-menu-dropdown'>
                          <Menu.Item
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRenameChat('Algemeen', chat);
                            }}
                            leftSection={<img src={editIcon} alt="Edit Icon" style={{width: 12, height: 12}} />}
                          >
                            Hernoemen
                          </Menu.Item>
                          <Menu.Item
                            leftSection={<img src={moveIcon} alt="Move Icon" style={{width: 14, height: 14}} />}
                          >
                            <Menu label="Verplaatsen" trigger="hover" position="right-start">
                              <Menu.Target>
                                <div>Verplaatsen</div>
                              </Menu.Target>
                              <Menu.Dropdown>
                                {getAvailableSubjectsForMove('Algemeen').map((subject) => (
                                  <Menu.Item
                                    key={subject}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMoveChat('Algemeen', subject, chat);
                                    }}
                                    leftSection={
                                      subjectIcons[subject.toLowerCase()] && (
                                        <img
                                          src={subjectIcons[subject.toLowerCase()]}
                                          alt={`${subject} icon`}
                                          style={{ width: 16, height: 16 }}
                                        />
                                      )
                                    }
                                  >
                                    {subject}
                                  </Menu.Item>
                                ))}
                              </Menu.Dropdown>
                            </Menu>
                          </Menu.Item>
                          <Menu.Divider />
                          <Menu.Item
                            color="red"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteChat('Algemeen', chat);
                            }}
                            leftSection={<img src={deleteIcon} alt="Delete Icon" style={{width: 14, height: 14}} />}
                          >
                            Verwijderen
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </div>
                  </li>
                ))}
                <li className='new-chat-container flex-row' onClick={() => handleNewChat('Algemeen')}>
                  <IconPlus size={16} disabled={creatingChat} />
                  <div>
                    {creatingChat ? 'Aan het maken...' : 'Nieuwe Chat'}
                  </div>
                </li>
              </ul>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
        <div className="accordion-label-2 flex-row">
          <div className='accordion-label-2-text'>Folders</div>
          <div className='accordion-label-2-icon flex-row'>
            <IconPlus size={14} stroke={3} />
          </div>
        </div>
        <div className="accordion-container folder-accordion">
          <Accordion
            chevron={<img src={chevronDown} alt="Chevron Down" style={{width: 16, height: 16, transform: 'rotate(90deg)'}} />}
            multiple
            value={openAccordions.filter(subject => subject.toLowerCase() !== 'algemeen')}
            onChange={(values) => {
              // Keep Algemeen separate, update only other subjects
              const algemeen = openAccordions.includes('Algemeen') ? ['Algemeen'] : [];
              setOpenAccordions([...algemeen, ...values]);
            }}
          >
            {subjectOrder.filter(subject => subject.toLowerCase() !== 'algemeen').map((subject) => (
              <Accordion.Item value={subject} key={subject}>
                <Accordion.Control onContextMenu={(e) => handleContextMenu(e, subject)}>
                  {subjectIcons[subject.toLowerCase()] && (
                    <img
                      src={subjectIcons[subject.toLowerCase()]}
                      alt={`${subject} icon`}
                      style={{ width: 24, height: 24, marginRight: 8, verticalAlign: 'middle' }}
                    />
                  )}
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
                          backgroundColor: (activeChat && activeChat.id === chat.id) ? '#f6f6f6' : '#fefefe',
                          transition: 'background-color 0.3s ease',
                        }}
                      >
                        <div className="line">
                          <div 
                            className="dot"
                            style={{ 
                              opacity: (activeChat && activeChat.id === chat.id) ? 1 : 0 
                            }}
                          ></div>
                        </div>
                        <div
                          onClick={() => {
                            setActiveSubject(subject);
                            setActiveChat(chat);
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
                        <div className='chat-menu-trigger' onClick={(e) => e.stopPropagation()} style={{ flexShrink: 0, marginLeft: '8px' }}>
                          <Menu className='chat-menu'>
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
                                leftSection={<img src={editIcon} alt="Edit Icon" style={{width: 12, height: 12}} />}
                              >
                                Hernoemen
                              </Menu.Item>
                              <Menu.Item
                                leftSection={<img src={moveIcon} alt="Move Icon" style={{width: 14, height: 14}} />}
                              >
                                <Menu label="Verplaatsen" trigger="hover" position="right-start">
                                  <Menu.Target>
                                    <div>Verplaatsen</div>
                                  </Menu.Target>
                                  <Menu.Dropdown>
                                    {getAvailableSubjectsForMove(subject).map((targetSubject) => (
                                      <Menu.Item
                                        key={targetSubject}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleMoveChat(subject, targetSubject, chat);
                                        }}
                                        leftSection={
                                          subjectIcons[targetSubject.toLowerCase()] && (
                                            <img
                                              src={subjectIcons[targetSubject.toLowerCase()]}
                                              alt={`${targetSubject} icon`}
                                              style={{ width: 16, height: 16 }}
                                            />
                                          )
                                        }
                                      >
                                        {targetSubject}
                                      </Menu.Item>
                                    ))}
                                  </Menu.Dropdown>
                                </Menu>
                              </Menu.Item>
                              <Menu.Divider />
                              <Menu.Item
                                color="red"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteChat(subject, chat);
                                }}
                                leftSection={<img src={deleteIcon} alt="Delete Icon" style={{width: 14, height: 14}} />}
                              >
                                Verwijderen
                              </Menu.Item>
                            </Menu.Dropdown>
                          </Menu>
                        </div>
                      </li>
                    ))}
                    <li className='new-chat-container flex-row' onClick={() => handleNewChat(subject)}>
                      <IconPlus size={16} disabled={creatingChat} />
                      <div>
                        {creatingChat ? 'Aan het maken...' : 'Nieuwe Chat'}
                      </div>
                    </li>
                  </ul>
                </Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion>
        </div>
      </Drawer>

      {/* Delete Confirmation Modal */}
      <Modal
        className='delete-confirmation-modal-chat'
        opened={deleteModalOpened}
        onClose={cancelDeleteChat}
        centered
        size="sm"
      >
        <img src={deleteModalIcon} alt="Delete Modal Icon" style={{width: 80, height: 80, marginBottom: 20}} />
        <Text size="sm" mb="lg">
          Weet u zeker dat u <span className='delete-modal-chat-name' style={{fontWeight: 600}}>{chatToDelete?.name}</span> wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.
        </Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={cancelDeleteChat}>
            Annuleren
          </Button>
          <Button color="red" onClick={confirmDeleteChat}>
            Verwijderen
          </Button>
        </Group>
      </Modal>

      {/* Rename Chat Modal */}
      <Modal
        className='rename-chat-modal'
        opened={renameModalOpened}
        onClose={cancelRenameChat}
        centered
        size="sm"
      >
        <img src={renameModalIcon} alt="Rename Modal Icon" style={{width: 80, height: 80, marginBottom: 46}} />
        <TextInput
          placeholder="Chat naam"
          className='rename-chat-modal-input'
          value={newChatName}
          onChange={(e) => setNewChatName(e.target.value)}
          onKeyPress={handleRenameKeyPress}
          maxLength={50}
          mb="lg"
          autoFocus
          data-autofocus
        />
        <Group justify="flex-end">
          <Button variant="default" onClick={cancelRenameChat}>
            Annuleren
          </Button>
          <Button 
            color='#000460'
            onClick={confirmRenameChat}
            disabled={!newChatName.trim()}
          >
            Hernoemen
          </Button>
        </Group>
      </Modal>
    </>
  );
};

export default Sidebar;