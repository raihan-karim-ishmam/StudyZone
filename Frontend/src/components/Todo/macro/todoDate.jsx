import React from 'react';

const TodoDate = ({ dayName, dateNumber, isToday, isSelected, dateObj, onClick }) => {
    // Check if date is before today
    const today = new Date();
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const dateOnly = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
    const isBeforeToday = dateOnly < todayOnly;

    return (
      <div 
        className="todo-top-calendar-date flex-row" 
        onClick={!isBeforeToday ? () => onClick && onClick(dateObj) : undefined}
        style={{
          opacity: isBeforeToday ? 0.6 : 1,
          cursor: isBeforeToday ? 'not-allowed' : 'pointer'
        }}
      >
        <div className="todo-top-calendar-date-day flex-row">
          <span style={{
            fontWeight: isToday || isSelected ? '600' : '400',
            color: '#000000'
          }}>{dayName}</span>
        </div>
        <div 
          className="todo-top-calendar-date-number flex-row" 
          style={{
            backgroundColor: isSelected ? '#FF6601' : 'transparent',
            color: isSelected ? '#fefefe' : (isToday ? '#FF6601' : '#000000'),
            fontWeight: isToday || isSelected ? '600' : '400',
          }}
        >
          <span>{dateNumber}</span>
        </div>
      </div>
    );
};

export default TodoDate;