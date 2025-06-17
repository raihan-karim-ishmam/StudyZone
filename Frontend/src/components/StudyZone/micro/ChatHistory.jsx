import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeRaw from 'rehype-raw';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import '../../../styles/StudyZone/micro/ChatHistory.scss';
import logo_avatar from '../../../assets/svg/studyzone/assistant-avatar.svg';
import logo from '../../../assets/image/global/logo.png';     
import subjectIcons from '../../../subject-icons/subjectIcons';
import { subjectColorsPrimary } from '../../../subject-icons/subjectIcons.js';

import NoteInput from '../macro/NoteInput.jsx';

// New component to handle delayed mounting of animated text
const AnimatedMessage = ({ message, displayedText, isAnimating }) => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    // Run after browser paints the empty shell
    requestAnimationFrame(() => {
      setMounted(true);
    });
  }, []);

  return (
    <div className="message-text markdown-content animated-response">
      {mounted ? (
        <>
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeRaw, rehypeKatex]}
          >
            {isAnimating ? displayedText : message.content}
          </ReactMarkdown>
          {isAnimating && <span className="typing-cursor"></span>}
        </>
      ) : (
        <span style={{ visibility: 'hidden' }} aria-hidden="true">
          {message.content}
        </span>
      )}
    </div>
  );
};

const ChatHistory = ({ 
  conversation, 
  activeSubject, 
  notesForActiveSubject,
  selectedNoteIds,
  toggleNoteSelection,
  isLoading,
  allNotes = [],
  onNoteClick,
  onTypingStateChange,
  typingCancelRef
}) => {
  // Add state to track typing animation
  const [typingMessageIndex, setTypingMessageIndex] = useState(-1);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingSpeedRef = useRef(5); // Characters per frame
  const prevConversationLengthRef = useRef(0);
  
  // Add a ref to track already animated messages
  const animatedMessagesRef = useRef(new Set());
  
  // Add ref for chat history element and auto-scroll state
  const historyRef = useRef();
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  
  // First make sure we have a scroll detector reference
  const lastUserScrollTimestampRef = useRef(0);
  const isUserScrollingRef = useRef(false);
  
  // ComponentDidMount - load previously animated messages from localStorage
  useEffect(() => {
    try {
      const savedAnimated = localStorage.getItem('animatedMessages');
      if (savedAnimated) {
        animatedMessagesRef.current = new Set(JSON.parse(savedAnimated));
      }
    } catch (e) {
      console.error("Error loading animated messages:", e);
    }
  }, []);
  
  // Improve scroll listener to detect even slight scrolls
  useEffect(() => {
    const el = historyRef.current;
    if (!el) return;

    // Track the last scroll position to detect direction
    let lastScrollTop = el.scrollTop;
    
    function onScroll() {
      const now = Date.now();
      const scrollTop = el.scrollTop;
      
      // Detect user-initiated scroll vs. programmatic
      // If scroll happened very soon after the last user interaction, it's likely user-initiated
      const isUserScroll = now - lastUserScrollTimestampRef.current < 100 || 
                          isUserScrollingRef.current;
      
      // Detect scroll direction
      const isScrollingUp = scrollTop < lastScrollTop;
      
      if (isUserScroll && isScrollingUp) {
        // User scrolled up - disable auto-scroll immediately
        // Use a smaller threshold - 10px instead of 50px
        const distanceFromBottom = el.scrollHeight - scrollTop - el.clientHeight;
        if (distanceFromBottom > 6) { 
          setAutoScrollEnabled(false);
          console.log("Auto-scroll disabled - user scrolled up");
        }
      }
      
      lastScrollTop = scrollTop;
    }
    
    function onUserInteraction() {
      // Mark timestamp of user interaction
      lastUserScrollTimestampRef.current = Date.now();
      isUserScrollingRef.current = true;
      
      // Reset the flag after a short delay
      setTimeout(() => {
        isUserScrollingRef.current = false;
      }, 100);
    }

    el.addEventListener('scroll', onScroll, { passive: true });
    el.addEventListener('touchstart', onUserInteraction, { passive: true });
    el.addEventListener('mousedown', onUserInteraction);
    el.addEventListener('wheel', onUserInteraction, { passive: true });

    return () => {
      el.removeEventListener('scroll', onScroll);
      el.removeEventListener('touchstart', onUserInteraction);
      el.removeEventListener('mousedown', onUserInteraction);
      el.removeEventListener('wheel', onUserInteraction);
    };
  }, []);
  
  // Also, let's check if we're at bottom after scrolling ends
  useEffect(() => {
    const el = historyRef.current;
    if (!el) return;
    
    // Check if we should enable auto-scroll
    function checkScrollPosition() {
      const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      
      // If user manually scrolled to bottom, re-enable auto-scroll
      if (distanceFromBottom < 10) {
        setAutoScrollEnabled(true);
        console.log("Auto-scroll re-enabled - user at bottom");
      }
    }
    
    // Add listener for when scroll stops
    el.addEventListener('scrollend', checkScrollPosition, { passive: true });
    
    return () => {
      el.removeEventListener('scrollend', checkScrollPosition);
    };
  }, []);
  
  // Auto-scroll when messages change, typing progresses, or loading changes
  useEffect(() => {
    const el = historyRef.current;
    if (!el || !autoScrollEnabled) return;

    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [conversation, displayedText, isLoading, autoScrollEnabled]);
  
  // Re-enable auto-scroll when conversation length increases (new message)
  useEffect(() => {
    const visibleMsgs = conversation.filter(msg => msg.role !== 'system');
    if (visibleMsgs.length > prevConversationLengthRef.current) {
      setAutoScrollEnabled(true);
    }
  }, [conversation]);
  
  // Track when new messages arrive
  useEffect(() => {
    const visibleMsgs = conversation.filter(msg => msg.role !== 'system');
    
    // Check if we have a new message that hasn't been animated yet
    if (visibleMsgs.length > 0 && !isLoading) {
      const lastMsg = visibleMsgs[visibleMsgs.length - 1];
      
      // Generate a unique ID for this message
      const msgId = `${lastMsg.role}-${lastMsg.content.substring(0, 20)}-${visibleMsgs.length}`;
      
      // Only animate if:
      // 1. It's the most recent message
      // 2. It's from the assistant
      // 3. It hasn't been animated before
      // 4. The message list just grew (new message was added)
      if (lastMsg.role === 'assistant' && 
          !animatedMessagesRef.current.has(msgId) &&
          visibleMsgs.length > prevConversationLengthRef.current) {
        
        // Start typing animation
        setTypingMessageIndex(visibleMsgs.length - 1);
        setDisplayedText('');
        setIsTyping(true);
        
        // Re-enable auto-scroll for typing animation
        setAutoScrollEnabled(true);
        
        // Mark this message as animated
        animatedMessagesRef.current.add(msgId);
        
        // Save to localStorage
        try {
          localStorage.setItem('animatedMessages', 
            JSON.stringify([...animatedMessagesRef.current]));
        } catch (e) {
          console.error("Error saving animated messages:", e);
        }
      }
      
      // Update the ref for next comparison
      prevConversationLengthRef.current = visibleMsgs.length;
    }
  }, [conversation, isLoading]);
  
  // Handle the typing animation
  useEffect(() => {
    if (!isTyping || typingMessageIndex === -1) return;
    
    const visibleMsgs = conversation.filter(msg => msg.role !== 'system');
    if (typingMessageIndex >= visibleMsgs.length) return;
    
    const fullText = visibleMsgs[typingMessageIndex].content;
    
    // Check if animation should be cancelled or is complete
    if (displayedText.length >= fullText.length || 
        (typingCancelRef && typingCancelRef.shouldCancel)) {
      
      // If cancelled, show the full text immediately
      if (typingCancelRef && typingCancelRef.shouldCancel) {
        console.log('Typing animation cancelled');
        setDisplayedText(fullText);
        typingCancelRef.shouldCancel = false;
      }
      
      setIsTyping(false);
      return;
    }
    
    // Continue typing animation
    const timer = setTimeout(() => {
      const nextCharCount = Math.min(
        displayedText.length + typingSpeedRef.current,
        fullText.length
      );
      setDisplayedText(fullText.substring(0, nextCharCount));
    }, 30);
    
    return () => clearTimeout(timer);
  }, [isTyping, displayedText, typingMessageIndex, conversation, typingCancelRef]);
  
  // Notify parent when typing state changes
  useEffect(() => {
    if (onTypingStateChange) {
      onTypingStateChange(isTyping);
    }
  }, [isTyping, onTypingStateChange]);
  
  // Only show system messages in developer mode
  const visibleMessages = conversation.filter(msg => msg.role !== 'system');

  // Render empty state with available notes if no conversation
  if (visibleMessages.length === 0) {
    return (
      <div className='new-chat-placeholder flex-column'>
        <div className="logo">
          <img className='logo-image' src={logo} alt="StudyZone Logo" />
        </div>
        <div className="new-chat-placeholder-title">Start Met Leren!</div>
        <div className="new-chat-placeholder-description">
          Begin met een eigen vraag of ga verder met een
          van je notities voor dit vak
        </div>

        {notesForActiveSubject.length > 0 && (
          <div className="notes-container flex-column">
            <div className="notes-header">Recente Notities</div>
            <div className="notes-list flex-row">
              {notesForActiveSubject.map((note) => (
                <div 
                  key={note.id} 
                  className={`note-item flex-row ${selectedNoteIds.includes(note.id) ? 'selected' : ''}`}
                  onClick={() => toggleNoteSelection(note.id)}
                >
                  <div className="note-icon">
                    <img src={subjectIcons[note.folder.toLowerCase()]} alt={note.folder} />
                  </div>
                  <div className="note-title">{note.title}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  const renderMessage = (message, index) => {
    // Determine if this message should use the typing animation
    const isAnimatedMessage = index === typingMessageIndex && isTyping;
    
    // Use either the partial text for animation or the full message
    const textToDisplay = isAnimatedMessage ? displayedText : message.content;
    
    return (
      <div className={`message cancel-width ${message.role}`} key={index}>
        <div className="message-avatar flex-row">
          {message.role === 'assistant' && (
            <img 
              src={logo_avatar} 
              alt="Assistant" 
              className="avatar-image"
              style={{
                backgroundColor: subjectColorsPrimary[activeSubject.toLowerCase()],
                borderRadius: '100px'
              }}
            />
          )}
          {message.role === 'user' && (
            <div className="user-avatar">
              {/* User initial or icon */}
              U
            </div>
          )}
        </div>
        <div className="message-content">
          {message.role === 'user' && message.metadata && message.metadata.hasImages && (
            <div className="message-images flex-row">
              {message.metadata.images.map((image, imgIndex) => (
                <div key={imgIndex} className="message-image">
                  <img 
                    src={image.url} 
                    alt={image.name || "Uploaded image"} 
                    className="sent-image"
                  />
                </div>
              ))}
            </div>
          )}
          {message.role === 'user' && message.metadata && message.metadata.hasNotes && (
            <div className="message-notes">
              {message.metadata.noteIds.map((noteId, noteIndex) => {
                const note = allNotes.find(n => n.id === noteId);
                if (!note) return null;
                
                return (
                  <NoteInput
                    key={noteId}
                    note={note}
                    index={noteIndex}
                    onClick={onNoteClick}
                    showRemoveButton={false}
                  />
                );
              })}
            </div>
          )}
          {message.role === 'assistant' ? (
            <AnimatedMessage 
              message={message}
              displayedText={textToDisplay}
              isAnimating={isAnimatedMessage}
            />
          ) : (
            <div className="message-text">{message.content}</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="chat-history" ref={historyRef}>
      {visibleMessages.map((message, index) => (
        <div key={index} className={`message ${message.role}`}>
          {renderMessage(message, index)}
        </div>
      ))}
      
      {isLoading && (
        <div className="message assistant loading">
          <div className="message-avatar flex-row">
            <img 
              src={logo_avatar} 
              alt="Assistant" 
              className="avatar-image"
              style={{
                backgroundColor: subjectColorsPrimary[activeSubject.toLowerCase()],
                borderRadius: '100px'
              }}
            />
          </div>
          <div className="message-content">
            <div className="typing-indicator">
              <span style={{backgroundColor: subjectColorsPrimary[activeSubject.toLowerCase()]}}></span>
              <span style={{backgroundColor: subjectColorsPrimary[activeSubject.toLowerCase()]}}></span>
              <span style={{backgroundColor: subjectColorsPrimary[activeSubject.toLowerCase()]}}></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatHistory; 