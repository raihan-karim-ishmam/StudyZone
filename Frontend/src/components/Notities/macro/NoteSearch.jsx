import React from 'react';
import PropTypes from 'prop-types';
import { Spotlight, spotlight } from '@mantine/spotlight';
import SearchIcon from '../../../assets/svg/global/search.svg';
import { subjectIcons } from '../../../subject-icons/subjectIcons';

import '@mantine/spotlight/styles.css';
import '../../../styles/Notities/macro/NoteSearch.scss';

const NoteSearch = ({ allNotes, onNoteSelect, tabId }) => {
  // Transform notes data for the spotlight
  const actions = allNotes.map(note => ({
    id: note.id,
    label: note.title,
    description: note.folder,
    dateCreated: note.dateCreated,
    onClick: () => {
      console.log('Note selected in spotlight:', note.id, note.title);
      
      // Call onNoteSelect and close the spotlight
      onNoteSelect(note, tabId);
      spotlight.close('note-search-spotlight');
    },
    leftSection: (
      <img 
        src={subjectIcons[(note.folder || 'uncategorized').toLowerCase()]} 
        alt={note.folder}
        style={{ width: 38, height: 38 }} 
      />
    ),
    rightSection: (
      <div className="note-search-date-created" style={{ color: '#89939E', fontSize: '12px' }}>
        {new Date(note.dateCreated).toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric' })}
      </div>
    )
  }));

  return (
    <Spotlight
      actions={actions}
      nothingFound="Geen notities gevonden"
      styles={{
        actions: {
          maxHeight: '200px',
          overflowY: 'auto'
        },
        action: {
          height: '60px'
        },
        body: {
          maxHeight: '400px'
        },
        overlay: {
            backdropFilter: 'blur(0px)',
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
          },
      }}
      searchProps={{
        leftSection: <img src={SearchIcon} alt="Search" style={{ width: 20, height: 20 }} />,
        placeholder: 'Zoek in je notities...',
      }}
    />
  );
};

NoteSearch.propTypes = {
  allNotes: PropTypes.array.isRequired,
  onNoteSelect: PropTypes.func.isRequired,
  tabId: PropTypes.string
};

// Export both the component and the spotlight controller
export { NoteSearch, spotlight };
