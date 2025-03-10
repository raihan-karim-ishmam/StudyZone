import React, { useEffect, useRef } from 'react';
import '../styles/ContextMenu.scss';

const ContextMenu = ({ options, position, onClose }) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div 
      ref={menuRef} 
      className="context-menu"
      style={{ top: position.top, left: position.left }}
    >
      {options.map((option, index) => (
        <div 
          key={index} 
          className="context-menu-option" 
          onClick={() => {
            option.onClick();
            onClose();
          }}
        >
          {option.label}
        </div>
      ))}
    </div>
  );
};

export default ContextMenu;