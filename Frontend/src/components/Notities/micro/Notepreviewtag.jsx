import React from 'react';

import { subjectColors } from '../../../subject-icons/subjectIcons';

import '../../../styles/Notities/micro/Notepreviewtag.scss';

function Notepreviewtag({ subject, tag }) {
  return (
    <div className="notepreviewtag-container" style={{ backgroundColor: subjectColors[subject.toLowerCase()] }}>
      {tag}
    </div>
  );
}

export default Notepreviewtag;
