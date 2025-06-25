import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDate } from '../context/DateContext';
import { getTodosByDate, createTodo, deleteTodo, toggleTodoComplete, updateTodo } from '../utilities/todoService';
import { DatePickerInput } from '@mantine/dates';
import { Tooltip, Accordion, Skeleton } from '@mantine/core';
import 'dayjs/locale/nl';
import { notifications } from '@mantine/notifications';

import TodoDate from '../components/Todo/macro/todoDate';
import TodoItem from '../components/Todo/macro/TodoItem';

import '../styles/Todo/Todo.scss';
import '../styles/App.scss';

import chevronRight from '../assets/svg/todo/chevron.svg';
import calendar from '../assets/svg/notities/calendar_search.svg';
import plusIcon from '../assets/svg/todo/plus.svg';

const ToDo = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Use global date context instead of local state
  const { 
    selectedDate, 
    updateSelectedDate, 
    goToToday: contextGoToToday,
    getFormattedDate,
    formatDateString,
    parseDateString 
  } = useDate();
  
  // Local state for week navigation (separate from selected date)
  const [currentWeekDate, setCurrentWeekDate] = useState(selectedDate);
  const [currentWeek, setCurrentWeek] = useState([]);
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [accordionValue, setAccordionValue] = useState(null);

  // Sync URL with selected date (optional - for sharing/bookmarking)
  useEffect(() => {
    const dateString = formatDateString(selectedDate);
    setSearchParams({ date: dateString }, { replace: true });
  }, [selectedDate, setSearchParams]);

  // Helper functions remain the same
  const getWeekStart = (date) => {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const day = d.getDay();
    const daysToSubtract = day === 0 ? 6 : day - 1;
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - daysToSubtract);
    return weekStart;
  };

  const isSameDay = (date1, date2) => {
    if (!date1 || !date2) return false;
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  };

  // Load todos when selected date changes
  useEffect(() => {
    const loadTodos = async () => {
      setLoading(true);
      try {
        const dateString = formatDateString(selectedDate);
        const todosData = await getTodosByDate(dateString);
        setTodos(todosData);
      } catch (error) {
        console.error('Error loading todos:', error);
        setTodos([]);
      } finally {
        setLoading(false);
      }
    };

    loadTodos();
  }, [selectedDate]);

  // Sync current week date with selected date when needed
  useEffect(() => {
    setCurrentWeekDate(selectedDate);
  }, [selectedDate]);

  // Generate week when currentWeekDate changes
  useEffect(() => {
    const weekStart = getWeekStart(currentWeekDate);
    const weekDates = generateWeekDates(weekStart);
    setCurrentWeek(weekDates);
  }, [currentWeekDate, selectedDate]);

  // Updated event handlers to use global state
  const handleDateClick = (date) => {
    updateSelectedDate(date);
  };

  const handleDatePickerChange = (date) => {
    if (date) {
      updateSelectedDate(date);
      setCurrentWeekDate(date);
    }
  };

  const goToToday = () => {
    contextGoToToday();
    setCurrentWeekDate(new Date());
  };

  // Week navigation (doesn't change selected date, just the week view)
  const goToPreviousWeek = () => {
    const newWeekDate = new Date(currentWeekDate);
    newWeekDate.setDate(newWeekDate.getDate() - 7);
    setCurrentWeekDate(newWeekDate);
  };

  const goToNextWeek = () => {
    const newWeekDate = new Date(currentWeekDate);
    newWeekDate.setDate(newWeekDate.getDate() + 7);
    setCurrentWeekDate(newWeekDate);
  };

  // Display formatted date for UI
  const getDisplayFormattedDate = () => {
    const options = { 
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      weekday: 'long'
    };
    const formatted = selectedDate.toLocaleDateString('nl-NL', options);
    const parts = formatted.split(' ');
    const weekday = parts[0];
    const day = parts[1];
    const month = parts[2];
    const year = parts[3];
    return `${day} ${month} ${year} - ${weekday}`;
  };

  // Helper function to generate the week dates - WITH DEBUGGING
  const generateWeekDates = (startDate) => {
    const dates = [];
    const dayNames = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'];
    
    // Get today's exact date - create it clean
    const now = new Date();
    const actualToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Get selected date clean - ADD DEBUGGING
    const cleanSelectedDate = selectedDate ? new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()) : null;
    
    // DEBUG: Log the selected date
    if (cleanSelectedDate) {
      console.log('Selected date in generateWeekDates:', cleanSelectedDate.toISOString().split('T')[0]);
    }
    
    for (let i = 0; i < 7; i++) {
      // Create clean date for this position
      const currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i);
      
      // Explicit comparisons
      const isThisToday = (
        currentDate.getFullYear() === actualToday.getFullYear() &&
        currentDate.getMonth() === actualToday.getMonth() &&
        currentDate.getDate() === actualToday.getDate()
      );
      
      const isThisSelected = cleanSelectedDate ? (
        currentDate.getFullYear() === cleanSelectedDate.getFullYear() &&
        currentDate.getMonth() === cleanSelectedDate.getMonth() &&
        currentDate.getDate() === cleanSelectedDate.getDate()
      ) : false;
      
      // DEBUG: Log when we find a selected date
      if (isThisSelected) {
        console.log('Found selected date match:', currentDate.toISOString().split('T')[0], 'vs', cleanSelectedDate.toISOString().split('T')[0]);
      }
      
      dates.push({
        dayName: dayNames[i],
        dateNumber: currentDate.getDate(),
        dateObj: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()),
        isToday: isThisToday,
        isSelected: isThisSelected
      });
    }
    
    return dates;
  };

  // Add this new function only
  const handleToggleComplete = async (todoId, completed) => {
    try {
      const updatedTodo = await toggleTodoComplete(todoId);
      
      if (updatedTodo) {
        notifications.show({
          title: completed ? 'Todo voltooid!' : 'Todo heractiveerd',
          message: completed ? 
            `"${updatedTodo.title}" is gemarkeerd als voltooid` : 
            `"${updatedTodo.title}" is gemarkeerd als niet voltooid`,
          color: completed ? '#FF6601' : '#89939E',
          autoClose: 3000,
        });

        // Use formatDateString directly
        const dateString = formatDateString(selectedDate);
        const todosData = await getTodosByDate(dateString);
        setTodos(todosData);
      }
    } catch (error) {
      notifications.show({
        title: 'Fout',
        message: 'Er is een fout opgetreden bij het bijwerken van de todo',
        color: 'red',
        autoClose: 3000,
      });
    }
  };

  // Add this function only
  const handleDeleteTodo = async (todoId) => {
    try {
      const deletedTodo = await deleteTodo(todoId);
      
      if (deletedTodo) {
        notifications.show({
          title: 'Todo verwijderd',
          message: `"${deletedTodo.title}" is verwijderd`,
          color: 'red',
          autoClose: 3000,
        });

        // Use formatDateString directly
        const dateString = formatDateString(selectedDate);
        const todosData = await getTodosByDate(dateString);
        setTodos(todosData);
      }
    } catch (error) {
      notifications.show({
        title: 'Fout',
        message: 'Er is een fout opgetreden bij het verwijderen van de todo',
        color: 'red',
        autoClose: 3000,
      });
    }
  };

  // Add this function for creating new todo
  const handleAddTodo = async () => {
    try {
      const dateString = formatDateString(selectedDate);
      
      // Create new todo with default values
      const newTodoData = {
        title: '',
        description: '',
        subject: '',
        date: dateString
      };
      
      const newTodo = await createTodo(newTodoData);
      
      if (newTodo) {
        // Reload todos to include the new one
        const todosData = await getTodosByDate(dateString);
        setTodos(todosData);
        
        // Open the accordion for the new todo
        setAccordionValue(newTodo.id);
        
        notifications.show({
          title: 'Nieuwe todo toegevoegd',
          message: 'Je kunt nu de details invullen',
          color: '#FF6601',
          autoClose: 3000,
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Fout',
        message: 'Er is een fout opgetreden bij het toevoegen van de todo',
        color: 'red',
        autoClose: 3000,
      });
    }
  };

  // Update the handleUpdateTodo function to include validation
  const handleUpdateTodo = async (todoId, updates) => {
    // Validate title requirement
    if (!updates.title || updates.title.trim() === '') {
      notifications.show({
        title: 'Titel vereist',
        message: 'Een titel is verplicht voor elke todo',
        color: 'red',
        autoClose: 3000,
      });
      return false;
    }

    try {
      const updatedTodo = await updateTodo(todoId, updates);
      
      if (updatedTodo) {
        notifications.show({
          title: 'Todo bijgewerkt',
          message: `"${updatedTodo.title}" is bijgewerkt`,
          color: '#FF6601',
          autoClose: 3000,
        });

        // Use formatDateString directly
        const dateString = formatDateString(selectedDate);
        const todosData = await getTodosByDate(dateString);
        setTodos(todosData);
        return true;
      }
    } catch (error) {
      notifications.show({
        title: 'Fout',
        message: 'Er is een fout opgetreden bij het bijwerken van de todo',
        color: 'red',
        autoClose: 3000,
      });
      return false;
    }
  };

  const handleDateChange = async (newDate) => {
    updateSelectedDate(newDate);
    // TODO: Replace with actual API call when backend ready
    // await updateUserPreference('lastSelectedTodoDate', formatDateString(newDate));
  };

  return (
    <div className="todo-page flex-column">
      <div className="header flex-row">
          <div className="header-left">
            To-do
          </div>
      </div>
      <div className="todo-navigation flex-row">
        <DatePickerInput
          className='date-picker-todo'
          placeholder="Selecteer datum"
          value={selectedDate}
          onChange={handleDatePickerChange}
          locale="nl"
          leftSection={<img src={calendar} alt="calendar" />}
          minDate={new Date()}
          styles={{
            input: {
              color: '#89939E'
            }
          }}
        />
        <div className="arrows flex-row">
          <Tooltip color='#fefefe' style={{boxShadow: '0px 0px 20px 0px rgba(0, 0, 0, 0.11)', color: '#000000'}} withArrow label="Vorige week">
            <div className="arrow-left flex-row" onClick={goToPreviousWeek}>
              <img src={chevronRight} style={{ transform: 'rotate(180deg)' }} alt="arrow-left" />
            </div>
          </Tooltip>
          <div className="date flex-row" onClick={goToToday}>Vandaag</div>
          <Tooltip color='#fefefe' style={{boxShadow: '0px 0px 20px 0px rgba(0, 0, 0, 0.11)', color: '#000000'}} withArrow label="Volgende week">
            <div className="arrow-right flex-row" onClick={goToNextWeek}>
              <img src={chevronRight} alt="arrow-right" />
            </div>
          </Tooltip>
        </div>
      </div>
      <div className="todo-top-calendar flex-row">
        {currentWeek.map((dateInfo, index) => (
          <TodoDate
            key={index}
            dayName={dateInfo.dayName}
            dateNumber={dateInfo.dateNumber}
            isToday={dateInfo.isToday}
            isSelected={dateInfo.isSelected}
            dateObj={dateInfo.dateObj}
            onClick={handleDateClick}
          />
        ))}
      </div>
      <div className="todo-todos flex-column">
        {loading ? (
          <>
            <div style={{ padding: '20px 0 10px 0' }}>
              <Skeleton height={24} width={200} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[...Array(6)].map((_, index) => (
                <div 
                  key={index}
                  style={{ 
                    border: '1px solid #e9ecef', 
                    borderRadius: '8px', 
                    padding: '16px',
                    backgroundColor: '#fff'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <Skeleton height={18} width="70%" mb={6} />
                      <Skeleton height={14} width="40%" />
                    </div>
                    <Skeleton height={24} width={24} circle />
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : todos.length > 0 ? (
          <>
            <div style={{ padding: '20px 0 10px 0', fontSize: '16px', fontWeight: '500', color: '#89939E' }}>
              {getDisplayFormattedDate()}
            </div>
            <Accordion multiple className='todo-accordion' radius="md" value={accordionValue} onChange={setAccordionValue}>
              {todos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onToggleComplete={handleToggleComplete}
                  onDeleteTodo={handleDeleteTodo}
                  onUpdateTodo={handleUpdateTodo}
                  accordionValue={accordionValue}
                  setAccordionValue={setAccordionValue}
                />
              ))}
            </Accordion>
            <div className='add-todo-button' style={{ marginTop: '20px', display: 'flex' }}>
              <img src={plusIcon} alt="plus" />
              <button 
                onClick={handleAddTodo}
                style={{
                  color: '#000000',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  backgroundColor: 'transparent',
                  transition: 'opacity 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.opacity = '0.8'}
                onMouseLeave={(e) => e.target.style.opacity = '1'}
              >
                Nieuwe To-do
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{ paddingTop: '180px', textAlign: 'center', color: '#89939E' }}>
              Geen todos voor {getDisplayFormattedDate()}
            </div>
            <div className='add-todo-button' style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
              <img src={plusIcon} alt="plus" />
              <button 
                onClick={handleAddTodo}
                style={{
                  color: '#000000',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  backgroundColor: 'transparent',
                  transition: 'opacity 0.3s ease'
                }}
                onMouseEnter={(e) => e.target.style.opacity = '0.8'}
                onMouseLeave={(e) => e.target.style.opacity = '1'}
              >
                Nieuwe To-do
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ToDo;