import React from 'react';
import { IconX, IconPlus } from '@tabler/icons-react';
import { ActionIcon } from '@mantine/core';
import PropTypes from 'prop-types';

import '../../../styles/Notities/macro/NoteTabs.scss';

import { subjectIcons, subjectColors, subjectColorsPrimary } from '../../../subject-icons/subjectIcons';

import NoteHomeIcon from '../../../assets/svg/notities/note_home.svg';
import NewTabIcon from '../../../assets/svg/notities/new_tab.svg';

const NoteTabs = ({ 
  notes, 
  activeTabId, 
  secondaryTabId,
  onTabChange, 
  onHomeClick, 
  onCloseTab,
  onNewTabClick
}) => {
  // Handle tab close without triggering tab change
  const handleCloseTab = (event, noteId) => {
    event.stopPropagation();
    onCloseTab(noteId);
  };

  return (
    <div className="note-tabs-container">
      <div className="tabs-bar">
        {/* Home tab */}
        <div 
          className={`tab home-tab ${activeTabId === 'home' ? 'active' : ''}`}
          onClick={onHomeClick}
        >
          <img className="tab-icon note-home-icon" src={NoteHomeIcon}  alt="Home" />
        </div>
        <div className="tab-divider"></div>
        
        {/* Note tabs */}
        {notes.map(note => (
          <div 
            key={note.id}
            className={`tab note-tab ${(activeTabId === note.id || secondaryTabId === note.id) ? 'active' : ''}`}
            onClick={() => onTabChange(note.id)}
            style={{ 
                cursor: 'pointer',
                '--subject-color': subjectColorsPrimary[(note.folder || 'uncategorized').toLowerCase()]
              }}
          >
            <img 
              className="tab-icon" 
              src={note.type === 'new' || note.id.startsWith('new-tab-') ? NewTabIcon : subjectIcons[(note.folder || 'uncategorized').toLowerCase()]}  
              alt={note.title} 
            />
            <span className="tab-label">
              {note.title === '' ? 'Nieuwe Notitie' : ''}
              {note.title}
            </span>
            <ActionIcon 
              size="sm" 
              variant="subtle" 
              className="tab-close-button"
              onClick={(e) => handleCloseTab(e, note.id)}
            >
              <IconX size={14} color="#89939E" />
            </ActionIcon>
          </div>
        ))}
        <div className="tab-divider"></div>
        <div 
          className={`tab plus-tab`}
          onClick={onNewTabClick}
        >
          <IconPlus className="tab-plus-icon" size={18} color="#89939E" />
        </div>
      </div>
    </div>
  );
};

NoteTabs.propTypes = {
  notes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired
    })
  ).isRequired,
  activeTabId: PropTypes.string.isRequired,
  secondaryTabId: PropTypes.string,
  onTabChange: PropTypes.func.isRequired,
  onHomeClick: PropTypes.func.isRequired,
  onCloseTab: PropTypes.func.isRequired,
  onNewTabClick: PropTypes.func.isRequired
};

export default NoteTabs;