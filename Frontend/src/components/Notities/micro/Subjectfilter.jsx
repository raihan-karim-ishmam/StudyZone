import React from 'react';
import PropTypes from 'prop-types';

import '../../../styles/Notities/micro/Subjectfilter.scss';

import subjectIcons from '../../../subject-icons/subjectIcons';
import { subjectColors, subjectColorsPrimary } from '../../../subject-icons/subjectIcons';

function Subjectfilter({ title, noteCount, isSelected, onSelect }) {
  const lowerCaseTitle = title.toLowerCase();
  
  return (
    <div 
      className={`subject-filter-card ${isSelected ? 'selected' : ''}`} 
      style={{ 
        backgroundColor: subjectColors[lowerCaseTitle],
        '--primary-color': subjectColorsPrimary[lowerCaseTitle]
      }}
      onClick={onSelect}
    >
      <img
        className="subject-icon-folder"
        src={subjectIcons[lowerCaseTitle]}
        alt={`Folder Icon`}
      />
      <div className="folder-label flex-column">
        <div className="folder-title">{title}</div>
        <div className="folder-note-count">{noteCount} {noteCount === 1 ? 'Notitie' : 'Notities'}</div>
      </div>
    </div>
  );
}

Subjectfilter.propTypes = {
  title: PropTypes.string.isRequired,
  noteCount: PropTypes.number.isRequired,
  isSelected: PropTypes.bool,
  onSelect: PropTypes.func.isRequired,
};

Subjectfilter.defaultProps = {
  isSelected: false,
};

export default Subjectfilter;
