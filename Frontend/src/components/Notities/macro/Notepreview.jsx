import React from 'react';
import PropTypes from 'prop-types';
import DOMPurify from 'dompurify';
import { IconEdit, IconTrash } from '@tabler/icons-react';

import Menu from '../../Menu.jsx';
import '../../../styles/Notities/macro/Notepreview.scss';

import MenuTrigger from '../../../assets/svg/global/menu-target-dots.svg';
import ChatIcon from '../../../assets/svg/notities/note_to_chat_black.svg';

import { subjectIcons, subjectColors, subjectColorsPrimary } from '../../../subject-icons/subjectIcons';

import Notepreviewtag from '../micro/Notepreviewtag';

function Notepreview({ title, subject, content, notecount, tags, dateCreated, onClick, onEdit, onDelete }) {
  const lowerCaseSubject = subject.toLowerCase();
  
  // Strip HTML tags for preview
  const getPlainTextPreview = (htmlContent) => {
    // First sanitize the HTML
    const sanitizedContent = DOMPurify.sanitize(htmlContent);
    
    // Create a temporary div to parse the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = sanitizedContent;
    
    // Get the text content (removes all HTML tags)
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    
    // Return a truncated version for preview (first 150 characters)
    return textContent.substring(0, 150) + (textContent.length > 150 ? '...' : '');
  };
  
  // Format date to dd-mm-yyyy
  const formatDate = (date) => {
    if (!date) return '';
    
    // Check if date is already a Date object or a string
    const dateObj = date instanceof Date ? date : new Date(date);
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) return date;
    
    // Format to dd-mm-yyyy
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    
    return `${day}-${month}-${year}`;
  };
  
  // Get the plain text version for preview
  const contentPreview = getPlainTextPreview(content);
  
  // Define menu items
  const menuItems = [
    {
      items: [
        {
          label: "Bewerken",
          icon: <IconEdit size={15} />,
          onClick: (e) => {
            e.stopPropagation(); // Prevent triggering the note click
            onEdit();
          }
        },
        {
          label: "Start chat",
          icon: <img src={ChatIcon} alt="chat-icon" style={{ width: '15px', height: '15px' }} />,
          onClick: (e) => {
            e.stopPropagation(); // Prevent triggering the note click
            // Functionality will be added later
            console.log("Start chat clicked");
          }
        },
      ]
    },
    {
      items: [
        {
          label: "Verwijderen",
          icon: <IconTrash size={15} />,
          color: "red",
          onClick: (e) => {
            e.stopPropagation(); // Prevent triggering the note click
            onDelete();
          }
        }
      ]
    }
  ];
  
  // Handle click on the menu trigger to prevent opening the note
  const handleMenuTriggerClick = (e) => {
    e.stopPropagation();
  };
  
  return (
    <div 
      className="notepreview-container flex-column" 
      onClick={onClick}
      style={{ 
        cursor: 'pointer',
        '--subject-color': subjectColors[lowerCaseSubject]
      }}
    >
      <div className="notepreview-banner">
        <svg className="notepreview-banner-svg" width="299" height="127" viewBox="0 0 299 127" fill="none" xmlns="http://www.w3.org/2000/svg">
          <g clip-path="url(#clip0_2260_1852)">
          <path d="M-0.5 114.5C60.2996 93.6794 85.2444 66.0993 104.5 -0.5" stroke={subjectColorsPrimary[lowerCaseSubject]}/>
          <path d="M97 148.5C149.241 106.345 169.006 72.994 178.5 -0.5" stroke={subjectColorsPrimary[lowerCaseSubject]}/>
          <path d="M208 148.5C247.272 108.087 259.405 73.1969 259.5 -0.5" stroke={subjectColorsPrimary[lowerCaseSubject]}/>
          <g filter="url(#filter0_f_2260_1852)">
          <circle cx="284" cy="145" r="50" fill={subjectColors[lowerCaseSubject]}/>
          </g>
          <g filter="url(#filter1_f_2260_1852)">
          <circle cx="138" cy="-28" r="50" fill={subjectColors[lowerCaseSubject]}/>
          </g>
          <g filter="url(#filter2_f_2260_1852)">
          <ellipse cx="-22.5" cy="140" rx="74.5" ry="50" fill={subjectColors[lowerCaseSubject]}/>
          </g>
          </g>
          <defs>
          <filter id="filter0_f_2260_1852" x="74" y="-65" width="420" height="420" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
          <feFlood flood-opacity="0" result="BackgroundImageFix"/>
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
          <feGaussianBlur stdDeviation="80" result="effect1_foregroundBlur_2260_1852"/>
          </filter>
          <filter id="filter1_f_2260_1852" x="-72" y="-238" width="420" height="420" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
          <feFlood flood-opacity="0" result="BackgroundImageFix"/>
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
          <feGaussianBlur stdDeviation="80" result="effect1_foregroundBlur_2260_1852"/>
          </filter>
          <filter id="filter2_f_2260_1852" x="-257" y="-70" width="469" height="420" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
          <feFlood flood-opacity="0" result="BackgroundImageFix"/>
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
          <feGaussianBlur stdDeviation="80" result="effect1_foregroundBlur_2260_1852"/>
          </filter>
          <clipPath id="clip0_2260_1852">
          <rect width="299" height="127" rx="7.5" fill="white"/>
          </clipPath>
          </defs>
        </svg>
        <div className="notepreview-date-created flex-row">
          <div className="notepreview-date-created-text">
            {formatDate(dateCreated)}
          </div>
        </div>
        <div className="context-menu-trigger" onClick={handleMenuTriggerClick}>
          <Menu 
            items={menuItems}
            target={<img src={MenuTrigger} alt="menu-trigger" />}
            position="bottom-end"
            width={180}
            trigger="hover"
            openDelay={100}
            closeDelay={100}
            className="notepreview-menu"
          />
        </div>
        <div className="notepreview-icon flex-row">
          <img className="notepreview-icon-img" src={subjectIcons[lowerCaseSubject]} alt="subject-icon" />
        </div>
      </div>
      <div className="notepreview-content flex-column">
        <div className="notepreview-content-title">
          {title}
        </div>
        <div className="notepreview-content-description">
          {!contentPreview || contentPreview.trim() === '' ? 'Begin met schrijven...' : null}
          {contentPreview}
        </div>
        <div className="notepreview-content-tags flex-row">
          {tags.map((tag) => (
            <Notepreviewtag key={tag} tag={tag} subject={subject} />
          ))}
        </div>
      </div>
    </div>
  );
}

Notepreview.propTypes = {
  title: PropTypes.string.isRequired,
  subject: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  notecount: PropTypes.number.isRequired,
  tags: PropTypes.array.isRequired,
  onClick: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
};

export default Notepreview;

// style={{ border: `0px solid ${subjectColors[subject.toLowerCase()]}` }}
