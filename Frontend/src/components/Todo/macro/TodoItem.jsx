import React, { useState, useEffect } from 'react';
import { Accordion, ActionIcon, Checkbox, Menu, TextInput, Textarea, Select } from '@mantine/core';
import { IconDots, IconTrash, IconEdit } from '@tabler/icons-react';
import { subjectIcons } from '../../../subject-icons/subjectIcons';
import { useUser } from '../../../context/UserContext';

import cancelIcon from '../../../assets/svg/todo/cancel.svg';
import saveIcon from '../../../assets/svg/todo/save.svg';

const TodoItem = ({ todo, onMenuClick, onToggleComplete, onDeleteTodo, onUpdateTodo, accordionValue, setAccordionValue }) => {
  const { user } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDescription, setEditDescription] = useState(todo.description);
  const [editSubject, setEditSubject] = useState(todo.subject);

  // Auto-enter edit mode for new todos (empty title)
  useEffect(() => {
    if (todo.title.trim() === '' && accordionValue === todo.id) {
      setIsEditing(true);
    }
  }, [todo.title, accordionValue, todo.id]);

  // Get the subject icon, return null if not found
  const getSubjectIcon = (subject) => {
    const subjectKey = subject.toLowerCase();
    return subjectIcons[subjectKey] || null;
  };

  const handleCheckboxChange = async (checked) => {
    await onToggleComplete(todo.id, checked);
  };

  const handleDelete = () => {
    onDeleteTodo(todo.id);
  };

  const handleEdit = (e) => {
    e.stopPropagation(); // Always stop propagation
    
    // If accordion is closed, open it
    if (accordionValue !== todo.id) {
      setAccordionValue(todo.id);
    }
    
    // Set editing mode with a small delay
    setTimeout(() => {
      setIsEditing(true);
    }, 100);
  };

  const handleSave = async () => {
    // Call the parent's update function which includes validation
    const success = await onUpdateTodo(todo.id, {
      title: editTitle.trim(),
      description: editDescription,
      subject: editSubject
    });
    
    // Only exit edit mode if save was successful
    if (success) {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    // If this is a new todo with no title, delete it when cancelled
    if (todo.title.trim() === '' && editTitle.trim() === '') {
      onDeleteTodo(todo.id);
      return;
    }
    
    // Otherwise just revert changes
    setEditTitle(todo.title);
    setEditDescription(todo.description);
    setEditSubject(todo.subject);
    setIsEditing(false);
  };

  const subjectIcon = getSubjectIcon(todo.subject);

  // Prepare subject options for select
  const subjectOptions = user.subjects.map(subject => ({
    value: subject,
    label: subject
  }));

  return (
    <Accordion.Item value={todo.id}>
      <Accordion.Control
        styles={{
            chevron: {
                display: 'block'
            }
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '20px' }}>
            <Checkbox
              checked={todo.completed}
              color='#FF6601'
              onChange={(event) => handleCheckboxChange(event.currentTarget.checked)}
              onClick={(e) => e.stopPropagation()}
            />
            {isEditing ? (
              <TextInput
                value={editTitle}
                onChange={(event) => setEditTitle(event.currentTarget.value)}
                onClick={(e) => e.stopPropagation()}
                style={{ fontSize: '16px', fontWeight: '500', width: '250px' }}
                maxLength={100}
                placeholder="Voer een titel in..."
                autoFocus={todo.title.trim() === ''}
              />
            ) : (
              <span style={{ fontSize: '16px', fontWeight: '500' }}>
                {todo.title || 'Nieuwe todo'}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '10px' }}>
            {isEditing ? (
              <Select
                data={subjectOptions}
                value={editSubject}
                onChange={(value) => setEditSubject(value || '')}
                onClick={(e) => e.stopPropagation()}
                style={{ minWidth: '120px' }}
                className='todo-subject-select'
                clearable={true}
                placeholder='Kies een folder'
              />
            ) : (
              <div className='todo-subject' style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  {subjectIcon && (
                    <img 
                        src={subjectIcon} 
                        alt={todo.subject}
                        style={{ width: '20px', height: '20px' }}
                    />
                  )}
                  <span style={{ fontSize: '14px', color: '#666' }}>{todo.subject}</span>
              </div>
            )}
            <Menu>
              <Menu.Target>
                <ActionIcon
                    variant="subtle"
                    onClick={(e) => {
                    e.stopPropagation(); // Prevent accordion from opening
                    }}
                    style={{ marginLeft: '10px' }}
                >
                    <IconDots color='#000000' size={16} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                {isEditing ? (
                  <>
                    <Menu.Item leftSection={<img style={{ width: '14px', height: '14px' }} src={saveIcon} alt="save" />} onClick={(e) => { e.stopPropagation(); handleSave(); }}>
                      Opslaan
                    </Menu.Item>
                    <Menu.Item leftSection={<img style={{ width: '13px', height: '13px' }} src={cancelIcon} alt="cancel" />} onClick={(e) => { e.stopPropagation(); handleCancel(); }}>
                      Annuleren
                    </Menu.Item>
                  </>
                ) : (
                  <>
                    <Menu.Item leftSection={<IconEdit size={14} />} onClick={handleEdit}>
                      Bewerken
                    </Menu.Item>
                    <Menu.Item leftSection={<IconTrash size={14} />} onClick={(e) => { e.stopPropagation(); handleDelete(); }} color="red">
                      Verwijderen
                    </Menu.Item>
                  </>
                )}
              </Menu.Dropdown>
            </Menu>
          </div>
        </div>
      </Accordion.Control>
      <Accordion.Panel>
        <div style={{ padding: '0px 0' }}>
          {isEditing ? (
            <>
              <Textarea
                value={editDescription}
                onChange={(event) => setEditDescription(event.currentTarget.value)}
                autosize
                minRows={2}
                maxLength={1500}
                placeholder="Voeg een beschrijving toe..."
              />
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px', justifyContent: 'flex-start' }}>
                <button
                  onClick={handleCancel}
                  style={{
                    padding: '3px 16px',
                    backgroundColor: 'transparent',
                    color: '#89939E',
                    border: '1px solid #89939E',
                    borderRadius: '600px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontWeight: '500'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = '#89939E';
                  }}
                >
                  Annuleer
                </button>
                <button
                  onClick={handleSave}
                  style={{
                    padding: '3px 16px',
                    backgroundColor: '#FF6601',
                    color: 'white',
                    border: 'none',
                    borderRadius: '600px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    transition: 'opacity 0.3s ease',
                    fontWeight: '500'
                  }}
                  onMouseEnter={(e) => e.target.style.opacity = '0.8'}
                  onMouseLeave={(e) => e.target.style.opacity = '1'}
                >
                  Opslaan
                </button>
              </div>
            </>
          ) : (
            todo.description.trim() === '' ? (
              <span style={{ color: '#89939E', }}>Geen beschrijving</span>
            ) : (
              todo.description
            )
          )}
        </div>
      </Accordion.Panel>
    </Accordion.Item>
  );
};

export default TodoItem;
