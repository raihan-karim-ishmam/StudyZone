import React from 'react';
import { subjectColors, subjectIcons } from '../../../subject-icons/subjectIcons.js';
import removeIcon from '../../../assets/svg/global/close.svg';

import '../../../styles/StudyZone/macro/NoteInput.scss';

const NoteInput = ({ 
  note, 
  index, 
  onRemove, 
  onClick, 
  showRemoveButton = true 
}) => {
  return (
    <div 
      key={note.id || index}
      className="note-preview-container flex-row"
      style={{ 
        backgroundColor: '#fefefe',
        cursor: 'pointer',
        '--subject-color': subjectColors[note.folder.toLowerCase()]
      }}
      onClick={onClick ? () => onClick(note) : undefined}
    >
      <div className="note-preview-content flex-row">
        <div 
          className="note-preview-icon flex-row"
          style={{
            backgroundColor: subjectColors[note.folder.toLowerCase()],
          }}
        >
          <img src={subjectIcons[note.folder.toLowerCase()]} alt="Notitie" />
        </div>
        <div className="note-preview-text flex-column">
          <p className="note-preview-title">{note.title}</p>
          <p className="note-preview-folder">{note.folder}</p>
        </div>
      </div>
      
      {showRemoveButton && onRemove && (
        <div 
          className="remove-note" 
          onClick={(e) => {
            e.stopPropagation(); // Prevent triggering parent click
            onRemove(index);
          }}
          aria-label="Remove note"
        >
          <img src={removeIcon} style={{ width: '18px', height: '18px' }} alt="Remove" />
        </div>
      )}
    </div>
  );
};

export default NoteInput;