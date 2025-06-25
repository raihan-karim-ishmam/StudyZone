import React from 'react';
import PropTypes from 'prop-types';
import { subjectIcons, subjectColors } from '../../../subject-icons/subjectIcons.js';

import '../../../styles/Notities/micro/NoteCardVertical.scss';

// Function to convert month to Dutch
const toDutchMonth = (monthNumber) => {
  const dutchMonths = [
    'jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 
    'jul', 'aug', 'sep', 'okt', 'nov', 'dec'
  ];
  return dutchMonths[monthNumber];
};

const NoteCardVertical = ({ note, onClick }) => {
  const { title, folder, dateCreated } = note;
  
  // Format date with Dutch month
  const date = new Date(dateCreated);
  const day = date.getDate();
  const month = toDutchMonth(date.getMonth());
  const year = date.getFullYear();
  const formattedDate = `${day} ${month} ${year}`;
  
  return (
    <div 
        className="note-card-vertical flex-row" 
        onClick={() => onClick(note)}
        //   style={{ backgroundColor: subjectColors[(folder || 'uncategorized').toLowerCase()] }}
        style={{ backgroundColor: '#f9f9f9' }}
    >
        <div className="note-card-vertical-icon flex-row">
            <img 
            src={subjectIcons[(folder || 'uncategorized').toLowerCase()]} 
            alt={folder}
            className="subject-icon"
            />
        </div>
        <div className="note-card-vertical-content flex-row">
            <div className="note-card-vertical-details flex-column">
                <div className="note-card-vertical-title">
                {title}
                </div>
                <div className="note-card-vertical-folder">
                {folder}
                </div>
            </div>
            <div className="note-card-vertical-date flex-row" style={{ backgroundColor: subjectColors[(folder || 'uncategorized').toLowerCase()] }}>
                {formattedDate}
            </div>
        </div>
    </div>
  );
};

NoteCardVertical.propTypes = {
  note: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    folder: PropTypes.string,
    dateCreated: PropTypes.string
  }).isRequired,
  onClick: PropTypes.func.isRequired
};

export default NoteCardVertical;
