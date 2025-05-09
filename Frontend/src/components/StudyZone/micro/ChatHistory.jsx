import React from 'react';
import '../../../styles/StudyZone/macro/ChatHistory.scss';
import logo from '../../../assets/svg/global/logo.svg';
import subjectIcons from '../../../subject-icons/subjectIcons';

const ChatHistory = ({ 
  conversation, 
  activeSubject, 
  notesForActiveSubject, 
  selectedNoteId, 
  setSelectedNoteId, 
  setMessage 
}) => {
  // Only show system messages in developer mode
  const visibleMessages = conversation.filter(msg => msg.role !== 'system');

  // Handles selection of a note
  const handleNoteSelect = (note) => {
    setSelectedNoteId(note.id);
    setMessage(`${note.title}\n${note.content}`);
  };

  // Render empty state with available notes if no conversation
  if (visibleMessages.length === 0) {
    return (
      <div className='new-chat-placeholder flex-column'>
        <img className='logo' src={logo} alt="StudyZone Logo" />
        <div className="new-chat-placeholder-title">Start Met Leren!</div>
        <div className="new-chat-placeholder-description">
          Begin met een eigen vraag of ga verder met een
          van je notities voor dit vak
        </div>
        {notesForActiveSubject.length > 0 && (
          <div className="choose-note flex-column">
            <div className="choose-note-title">Recente Notities</div>
            <div className="choose-note-blocks flex-row">
              {notesForActiveSubject.slice(0, 3).map((note) => (
                <div
                  key={note.id}
                  className={`choose-note-block button flex-row ${selectedNoteId === note.id ? 'selected' : ''}`}
                  onClick={() => handleNoteSelect(note)}
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
        )}
      </div>
    );
  }

  // Render the conversation if messages exist
  return (
    <div className="chat-history">
      {visibleMessages.map((msg, index) => (
        <div 
          key={index} 
          className={`message ${msg.role}`}
        >
          {msg.content}
        </div>
      ))}
    </div>
  );
};

export default ChatHistory; 