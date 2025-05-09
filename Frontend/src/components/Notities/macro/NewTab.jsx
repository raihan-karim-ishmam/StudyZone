import React from 'react';
import PropTypes from 'prop-types';
import { NoteSearch } from '../macro/NoteSearch.jsx';
import { spotlight } from '@mantine/spotlight';

import NoteCardVertical from '../micro/NoteCardVertical.jsx';

import SearchIcon from '../../../assets/svg/global/search.svg';
import PlusIcon from '../../../assets/svg/global/plus.svg';
import HomeIcon from '../../../assets/svg/notities/new_tab_home.svg';

import '../../../styles/Notities/macro/NewTab.scss';

const NewTab = ({ allNotes, onNoteSelect, tabId, onNewNote, onGoHome, onCloseTab }) => {
  // Get the first 5 notes from the allNotes array
  
  const recentNotes = allNotes.slice(allNotes.length - 5, allNotes.length).reverse();
  
  // Handler for creating a new note
  const handleNewNoteClick = () => {
    // Create a new note object with placeholder data
    const newNote = {
      id: `new-note-${Date.now()}`,
      title: '',
      folder: 'Uncategorized',
      content: '',
      tags: [],
      dateCreated: new Date().toISOString(),
      lastEdited: new Date().toISOString(),
      isNew: true // Flag to indicate this is a brand new note
    };
    
    // Call the parent handler to create the note and open it in edit mode
    onNewNote(newNote, tabId);
  };
  
  // Handler for going to home
  const handleGoHomeClick = () => {
    // This will close the tab and navigate to home
    onGoHome(tabId);
  };
  
  // Handler for opening spotlight
  const handleSearchClick = () => {
    spotlight.open();
  };
  
  return (
    <div className="new-tab-container">
      <div className="new-tab-spacer"></div>
      <div className="new-tab-content">
        <div className="new-tab-options flex-row">
            <div onClick={handleNewNoteClick} className="new-tab-option new_note_option flex-column">
                <img className="new-tab-option-icon" src={PlusIcon} alt="Plus"/>
                <div className="new-tab-option-text">
                    Nieuwe Notitie
                </div>
            </div>
            <div onClick={handleGoHomeClick} className="new-tab-option go_home_option flex-column">
                <img className="new-tab-option-icon" src={HomeIcon} alt="Home"/>
                <div className="new-tab-option-text">
                    Zoek Notitie
                </div>
            </div>
        </div>
        <div onClick={handleSearchClick} className="new-tab-search-button flex-row">
            <img className="new-tab-search-button-icon" src={SearchIcon} alt="Search" style={{ width: 20, height: 20 }} />
            <div className="new-tab-search-button-text">
                Zoek door je notities...
            </div>
        </div>
        <div className="new-tab-recent-notes">
            <div className="new-tab-recent-notes-title">
                Recente Notities
            </div>
            <div className="recente-notities-container flex-column">
                {recentNotes.map(note => (
                    <NoteCardVertical 
                        key={note.id}
                        note={note} 
                        onClick={(note) => onNoteSelect(note, tabId)} 
                    />
                ))}
            </div>
        </div>
      </div>
      <NoteSearch 
          allNotes={allNotes}
          onNoteSelect={onNoteSelect}
          tabId={tabId}
      />
    </div>
  );
};

NewTab.propTypes = {
  allNotes: PropTypes.array.isRequired,
  onNoteSelect: PropTypes.func.isRequired,
  tabId: PropTypes.string.isRequired,
  onNewNote: PropTypes.func.isRequired,
  onGoHome: PropTypes.func.isRequired,
  onCloseTab: PropTypes.func.isRequired
};

export default NewTab;
