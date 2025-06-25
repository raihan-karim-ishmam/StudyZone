import React, { useState, useEffect, useMemo, useRef, useCallback, memo } from 'react';
import dayjs from 'dayjs';

import FilterCarousel from '../components/Notities/macro/Filtercarousel.jsx';
import Footer from '../components/Footer.jsx';
import Notepreview from '../components/Notities/macro/Notepreview.jsx';
import NoteTabs from '../components/Notities/macro/NoteTabs.jsx';
import Noteview from '../components/Notities/macro/Noteview.jsx';
import '../styles/Notities/Notities.scss';

import { SegmentedControl, Chip, Tooltip } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import '@mantine/dates/styles.css';

import { IconCheck, IconX } from '@tabler/icons-react';
import PlusIcon from '../assets/svg/global/new_note_plus.svg';
import WarningIcon from '../assets/svg/global/warning.svg';
import SearchIcon from '../assets/svg/global/search.svg';
import CalendarIcon from '../assets/svg/notities/calendar_search.svg';
import WarningDeleteIcon from '../assets/svg/notities/modal_delete.svg';

import mockNotes from '../_data_test/mockNotes.js';
import NewTab from '../components/Notities/macro/NewTab.jsx';
import { NoteSearch, spotlight } from '../components/Notities/macro/NoteSearch';
import { modals } from '@mantine/modals';
import { Button, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';

// Extract unique tags from notes
const getAllUniqueTags = (notes) => {
  const tagSet = new Set();
  notes.forEach(note => {
    note.tags.forEach(tag => tagSet.add(tag));
  });
  return Array.from(tagSet);
};

const getFoldersFromNotes = (notes) => {
  const folderMap = notes.reduce((acc, note) => {
    if (!acc[note.folder]) {
      acc[note.folder] = { title: note.folder, noteCount: 0 };
    }
    acc[note.folder].noteCount += 1;
    return acc;
  }, {});
  return Object.values(folderMap);
};

// Wrap the entire Notities component with React.memo
const Notities = memo((props) => {
  // Destructure the props
  const { splitViewMode = false, openNoteId = null } = props;

  // Use all existing state variables that are already defined
  const [allNotes, setAllNotes] = useState(mockNotes);
  const [allTags, setAllTags] = useState([]);
  const [folders, setFolders] = useState(getFoldersFromNotes(mockNotes));
  const [selectedTags, setSelectedTags] = useState(['Alle Tags']);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('Alle Notities');
  const [filteredNotes, setFilteredNotes] = useState(mockNotes);
  const [folderCountMap, setFolderCountMap] = useState(
    folders.reduce((acc, folder) => {
      acc[folder.title] = folder.noteCount;
      return acc;
    }, {})
  );
  const [openedNotes, setOpenedNotes] = useState([]); 
  const [activeTabId, setActiveTabId] = useState('home');
  const [shouldRenderTabs, setShouldRenderTabs] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [editingNoteIds, setEditingNoteIds] = useState(new Set());
  const [selectedDates, setSelectedDates] = useState([]);
  
  // Add a ref to track if we've initialized from openNoteId
  const initializedRef = useRef(false);
  const lastOpenNoteIdRef = useRef(null);
  
  // Add this state to track closed tab IDs
  const [closedTabIds, setClosedTabIds] = useState(new Set());
  
  // Add this state to track whether a note was explicitly clicked in the input
  const [manuallyOpenedNoteId, setManuallyOpenedNoteId] = useState(null);
  
  // Add a state to track manually closed note IDs
  const [manuallyClosedNotes, setManuallyClosedNotes] = useState(new Set());
  
  // Add this state to track which notes are in the StudyZone input
  const [inputNoteIds, setInputNoteIds] = useState(new Set());
  
  // Add these at the component level
  const processedNoteIds = useRef(new Set()); // Track notes we've already processed
  const isFirstRender = useRef(true);
  
  // Add this at the component level
  const lastClickTimestampRef = useRef(0);
  
  // Add these new states at the top of your component with other state variables
  const [headerText, setHeaderText] = useState('');
  const [isTypingHeader, setIsTypingHeader] = useState(false);
  const fullHeaderText = 'Notities';
  
  // Now all state variables are initialized, you can use them

  // Initialize allTags in a useEffect
  useEffect(() => {
    const initialTags = getAllUniqueTags(allNotes);
    setAllTags(initialTags);
  }, [allNotes]);
  
  const uniqueTags = getAllUniqueTags(allNotes);
  
  // Find active note for rendering
  const activeNote = openedNotes.find(note => note.id === activeTabId);

  // Handle tag selection
  const handleTagSelect = (tag) => {
    let newSelectedTags;
    
    if (tag === 'Alle Tags') {
      // If "Alle Tags" is clicked
      if (selectedTags.includes('Alle Tags')) {
        // If it was already selected, deselect it
        newSelectedTags = [];
      } else {
        // If it wasn't selected, select only it
        newSelectedTags = ['Alle Tags'];
      }
    } else {
      // If any other tag is clicked
      if (selectedTags.includes('Alle Tags')) {
        // If "Alle Tags" was selected, deselect it and select only this tag
        newSelectedTags = [tag];
      } else if (selectedTags.includes(tag)) {
        // If this tag was already selected, deselect it
        newSelectedTags = selectedTags.filter(t => t !== tag);
      } else {
        // Otherwise, add this tag to the selections
        newSelectedTags = [...selectedTags, tag];
        
        // Check if all unique tags are now selected
        const allTagsSelected = uniqueTags.every(uniqueTag => 
          newSelectedTags.includes(uniqueTag)
        );
        
        // If all tags are selected, switch to "Alle Tags" instead
        if (allTagsSelected) {
          newSelectedTags = ['Alle Tags'];
        }
      }
    }
    
    setSelectedTags(newSelectedTags);
  };

  // Handle subject selection
  const handleSubjectSelect = (subject) => {
    setSelectedSubjects(prev => {
      // If already selected, remove it
      if (prev.includes(subject)) {
        return prev.filter(s => s !== subject);
      } 
      // Otherwise add it
      return [...prev, subject];
    });
  };

  // Handle time period selection
  const handlePeriodSelect = (period) => {
    setSelectedPeriod(period);
  };

  // Handle note click to open in tabs
  const handleNoteClick = (note) => {
    // Check if the note is already open
    if (!openedNotes.some(openedNote => openedNote.id === note.id)) {
      setOpenedNotes([...openedNotes, note]);
    }
    
    // Set this note as active
    setActiveTabId(note.id);
    
    // If in split view, notify parent
    if (splitViewMode && props.onNoteChange) {
      props.onNoteChange(note);
    }
  };
  
  // Modified handleTabChange to ensure it works in split view mode
  const handleTabChange = (tabId) => {
    setActiveTabId(tabId);
    
    // If we're in split view mode and this is a different note
    if (splitViewMode && tabId !== openNoteId && props.onTabChange) {
      // Notify the parent about the tab change (to update StudyZone if needed)
      props.onTabChange(tabId);
    }
  };

  // Similarly update other functions that change tabs
  const handleHomeClick = () => {
    setActiveTabId('home');
  };
  
  // Update the handleCloseTab function to track closed notes
  const handleCloseTab = (noteId, navigateTo = null) => {
    // Track that this note was manually closed
    setManuallyClosedNotes(prev => {
      const newSet = new Set(prev);
      newSet.add(noteId);
      return newSet;
    });
    
    // Remove the note/tab from opened notes
    const updatedOpenedNotes = openedNotes.filter(note => note.id !== noteId);
    setOpenedNotes(updatedOpenedNotes);
    
    // Update navigation
    if (activeTabId === noteId) {
      if (navigateTo) {
        setActiveTabId(navigateTo);
      } else if (updatedOpenedNotes.length > 0) {
        setActiveTabId(updatedOpenedNotes[updatedOpenedNotes.length - 1].id);
      } else {
        setActiveTabId('home');
      }
    }
  };
  
  // Now create a new function for "go home and close tab"
  const handleGoHomeAndCloseTab = (tabId) => {
    // Use the modified handleCloseTab with 'home' as the navigation target
    handleCloseTab(tabId, 'home');
  };
  
  // Update the filter function to handle single date or date range
  const filterNotesByDateRange = (notes, dateRange) => {
    if (!dateRange || dateRange.length === 0) {
      return notes; // Return all notes if no dates selected
    }

    if (dateRange.length === 1) {
      // Single date filtering - show notes from this day
      const targetDate = dayjs(dateRange[0]);
      const startOfDay = targetDate.startOf('day');
      const endOfDay = targetDate.endOf('day');
      
      return notes.filter(note => {
        const noteDate = dayjs(note.dateCreated);
        return noteDate.isAfter(startOfDay) && noteDate.isBefore(endOfDay);
      });
    } else if (dateRange.length >= 2) {
      // Date range filtering
      const startDate = dayjs(dateRange[0]).startOf('day');
      const endDate = dayjs(dateRange[1]).endOf('day');

      return notes.filter(note => {
        const noteDate = dayjs(note.dateCreated);
        return noteDate.isAfter(startDate) && noteDate.isBefore(endDate);
      });
    }
    
    return notes;
  };

  // Filter notes based on selected tags, subjects, AND time period
  useEffect(() => {
    let filtered = allNotes; // Start with all notes
    
    // First, filter by tags
    if (!selectedTags.includes('Alle Tags')) {
      if (selectedTags.length === 0) {
        // If no tags are selected, show all notes without tags
        filtered = filtered.filter(note => note.tags.length === 0);
      } else {
        // If specific tags are selected, show notes with those tags
        filtered = filtered.filter(note => 
          note.tags.some(tag => selectedTags.includes(tag))
        );
      }
    }
    
    // Then, filter by subjects if any are selected
    if (selectedSubjects.length > 0) {
      filtered = filtered.filter(note => 
        selectedSubjects.includes(note.folder)
      );
    }
    
    // Then, filter by time period
    const today = dayjs();
    
    switch(selectedPeriod) {
      case 'Vandaag':
        filtered = filtered.filter(note => {
          const createdDate = dayjs(note.dateCreated);
          return createdDate.isSame(today, 'day');
        });
        break;
      
      case 'Deze week':
        filtered = filtered.filter(note => {
          const createdDate = dayjs(note.dateCreated);
          return createdDate.isAfter(today.startOf('week')) && 
                 createdDate.isBefore(today.endOf('week').add(1, 'second'));
        });
        break;
      
      case 'Deze maand':
        filtered = filtered.filter(note => {
          const createdDate = dayjs(note.dateCreated);
          return createdDate.isAfter(today.startOf('month').subtract(1, 'second')) && 
                 createdDate.isBefore(today.endOf('month').add(1, 'second'));
        });
        break;
      
      default:
        break;
    }
    
    // Apply date filtering for both single date and date range
    if (selectedDates.length > 0) {
      filtered = filterNotesByDateRange(filtered, selectedDates);
    }
    
    setFilteredNotes(filtered);
  }, [selectedTags, selectedSubjects, selectedPeriod, allNotes, selectedDates]);

  // Then create these helper functions to manage the set:
  const startEditingNote = (noteId) => {
    setEditingNoteIds(prev => {
      const newSet = new Set(prev);
      newSet.add(noteId);
      return newSet;
    });
  };

  const stopEditingNote = (noteId) => {
    setEditingNoteIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(noteId);
      return newSet;
    });
  };

  const isNoteInEditMode = (noteId) => {
    return editingNoteIds.has(noteId);
  };

  // Add this function to your Notities component, before the return statement
  const handleSave = (updatedNote) => {
    console.log('Saving note:', updatedNote);
    
    // Update note in both allNotes and filteredNotes
    const updatedAllNotes = allNotes.map(note => 
      note.id === updatedNote.id ? updatedNote : note
    );
    
    const updatedFilteredNotes = filteredNotes.map(note => 
      note.id === updatedNote.id ? updatedNote : note
    );
    
    // Update note in openedNotes
    const updatedOpenedNotes = openedNotes.map(note => 
      note.id === updatedNote.id ? updatedNote : note
    );
    
    // Update folders to include any changes in the note's folder
    const updatedFolders = getFoldersFromNotes(updatedAllNotes);
    const updatedFolderCountMap = updatedFolders.reduce((acc, folder) => {
      acc[folder.title] = folder.noteCount;
      return acc;
    }, {});
    
    // Update allTags to include any new tags
    const tagSet = new Set(allTags);
    updatedNote.tags.forEach(tag => tagSet.add(tag));
    const updatedAllTags = Array.from(tagSet);
    
    // Update all states
    setAllNotes(updatedAllNotes);
    setFilteredNotes(updatedFilteredNotes);
    setOpenedNotes(updatedOpenedNotes);
    setFolders(updatedFolders);
    setFolderCountMap(updatedFolderCountMap);
    setAllTags(updatedAllTags);
    
    // Stop editing mode for this note
    stopEditingNote(updatedNote.id);
  };

  // Update the modal confirmation
  const openDeleteConfirmation = (noteId, noteTitle) => {
    modals.openConfirmModal({
      centered: true,
      withCloseButton: true,
      className: 'delete-confirmation-modal-noteHome',

      transitionProps: {
        transition: 'fade-down',
        duration: 200,
      },
      children: (
        <div className="delete-confirmation-modal-noteHome-content flex-column">
          <img src={WarningDeleteIcon} alt="Warning" style={{width: '80px', height: '80px', marginBottom: '20px', marginTop: '60px'}} />
          <div className="delete-confirmation-modal-noteHome-content-text">
            Weet u zeker dat u <span className="delete-confirmation-modal-noteHome-content-text-bold">{noteTitle}</span> wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.
          </div>
        </div>
      ),
      labels: { confirm: 'Verwijderen', cancel: 'Annuleren' },
      confirmProps: { 
        color: 'red',
        radius: 'xl',
        style: { fontWeight: 500 }
      },
      cancelProps: {
        radius: 'xl',
        variant: 'default',
        style: { fontWeight: 500 }
      },
      onCancel: () => {
        notifications.show({
          title: 'Geannuleerd',
          message: 'De notitie is niet verwijderd',
          color: 'gray',
          autoClose: 3000,
        });
      },
      onConfirm: () => {
        handleDeleteNote(noteId);
        notifications.show({
          title: 'Notitie verwijderd',
          message: `"${noteTitle}" is verwijderd`,
          color: 'red',
          autoClose: 3000,
        });
      },
    });
  };

  // Replace your current handleDeleteNote function with this complete version
  const handleDeleteNote = (noteId) => {
    // Find the note we're deleting
    const noteToDelete = allNotes.find(note => note.id === noteId);
    if (!noteToDelete) return;

    // Get a snapshot of the current notes without the deleted one
    const updatedAllNotes = allNotes.filter(note => note.id !== noteId);
    const updatedFilteredNotes = filteredNotes.filter(note => note.id !== noteId);
    const updatedOpenedNotes = openedNotes.filter(note => note.id !== noteId);
    
    // Calculate updated folders based on the filtered notes
    const updatedFolders = getFoldersFromNotes(updatedAllNotes);
    
    // Update folder count map
    const updatedFolderCountMap = updatedFolders.reduce((acc, folder) => {
      acc[folder.title] = folder.noteCount;
      return acc;
    }, {});
    
    // Extract all unique tags from updated notes
    const tagSet = new Set();
    updatedAllNotes.forEach(note => {
      note.tags.forEach(tag => tagSet.add(tag));
    });
    
    // Check if we're deleting the last note of a selected subject
    const noteFolder = noteToDelete.folder;
    const isFolderSelected = selectedSubjects.includes(noteFolder);
    const isFolderNowEmpty = !updatedFolders.some(folder => folder.title === noteFolder);
    
    // If the folder was selected and is now empty, we need to deselect it
    let updatedSelectedSubjects = [...selectedSubjects];
    if (isFolderSelected && isFolderNowEmpty) {
      updatedSelectedSubjects = updatedSelectedSubjects.filter(subject => subject !== noteFolder);
    }
    
    // Similarly, check if we need to update selected tags
    let updatedSelectedTags = [...selectedTags];
    if (!selectedTags.includes('Alle Tags')) {
      // For each tag in the deleted note
      noteToDelete.tags.forEach(tag => {
        // If the tag was selected and no other note has this tag
        if (selectedTags.includes(tag) && !Array.from(tagSet).includes(tag)) {
          // Remove the tag from selected tags
          updatedSelectedTags = updatedSelectedTags.filter(t => t !== tag);
        }
      });
    }
    
    // Update all state at once with the new values
    setAllNotes(updatedAllNotes);
    setFilteredNotes(updatedFilteredNotes);
    setOpenedNotes(updatedOpenedNotes);
    setFolders(updatedFolders);
    setFolderCountMap(updatedFolderCountMap);
    setAllTags([...tagSet]);
    setSelectedSubjects(updatedSelectedSubjects);
    
    // Only update selectedTags if it changed
    if (updatedSelectedTags.length !== selectedTags.length || 
        !updatedSelectedTags.every(tag => selectedTags.includes(tag))) {
      setSelectedTags(updatedSelectedTags);
    }
    
    // Handle tab navigation
    if (activeTabId === noteId) {
      if (updatedOpenedNotes.length > 0) {
        // Navigate to the most recently opened note
        setActiveTabId(updatedOpenedNotes[updatedOpenedNotes.length - 1].id);
      } else {
        // If no notes are left open, go to home
        setActiveTabId('home');
      }
    }
  };

  // Modified handleNewTabClick to ensure new tabs become active
  const handleNewTabClick = () => {
    // Generate a unique ID for this new tab
    const uniqueId = `new-tab-${Date.now()}`;
    
    // Add a placeholder with the unique ID
    setOpenedNotes(prev => [...prev, {
      id: uniqueId,
      title: 'Nieuwe tab',
      type: 'new' // Used to identify this as a special tab
    }]);
    
    // Set this as the active tab
    setActiveTabId(uniqueId);
    
    // Mark that we've manually changed tabs
    initializedRef.current = true;
  };

  // Enhanced handleNewTabNoteSelect to ensure it switches tabs
  const handleNewTabNoteSelect = (note, tabId) => {
    // If note is already open, switch to that tab and close the new tab
    const existingNoteIndex = openedNotes.findIndex(tab => tab.id === note.id);
    
    if (existingNoteIndex !== -1) {
      // Note is already open
      const existingTabId = openedNotes[existingNoteIndex].id;
      
      // Remove the new tab
      setOpenedNotes(prev => prev.filter(tab => tab.id !== tabId));
      
      // Immediately switch to the existing tab
      setActiveTabId(existingTabId);
      
      // Notify parent if in split view mode
      if (splitViewMode && props.onNoteChange) {
        props.onNoteChange(openedNotes[existingNoteIndex]);
    }
    
      // Mark that we've manually changed tabs
      initializedRef.current = true;
    
      return;
    }
    
    // If note isn't already open, replace the new tab with this note
    const tabIndex = openedNotes.findIndex(tab => tab.id === tabId);
    
    if (tabIndex === -1) {
      console.error('New tab not found in openedNotes:', tabId);
      return;
    }
    
    // Create updated openedNotes with the note replacing the tab
    const updatedOpenedNotes = [...openedNotes];
    updatedOpenedNotes.splice(tabIndex, 1, note);
    
    // Update openedNotes
    setOpenedNotes(updatedOpenedNotes);
    
    // Immediately switch to this note's tab
    setActiveTabId(note.id);
    
    // Notify parent if in split view mode
    if (splitViewMode && props.onNoteChange) {
      props.onNoteChange(note);
    }
    
    // Mark that we've manually changed tabs
    initializedRef.current = true;
  };

  // Modified handleNewNote for consistent tab switching
  const handleNewNote = (newNote, tabId) => {
    // Close the new tab
    const updatedOpenedNotes = openedNotes.filter(note => note.id !== tabId);
    
    // Add the new note to openedNotes
    updatedOpenedNotes.push(newNote);
    
    // Add the new note to allNotes and filteredNotes
    const updatedAllNotes = [...allNotes, newNote];
    const updatedFilteredNotes = [...filteredNotes, newNote];
    
    // Update folders
    const updatedFolders = getFoldersFromNotes(updatedAllNotes);
    const updatedFolderCountMap = updatedFolders.reduce((acc, folder) => {
      acc[folder.title] = folder.noteCount;
      return acc;
    }, {});
    
    // Update allTags if needed
    let updatedAllTags = [...allTags];
    if (newNote.tags && newNote.tags.length > 0) {
      newNote.tags.forEach(tag => {
        if (!updatedAllTags.includes(tag)) {
          updatedAllTags.push(tag);
        }
      });
    }
    
    // Update all states
    setAllNotes(updatedAllNotes);
    setFilteredNotes(updatedFilteredNotes);
    setOpenedNotes(updatedOpenedNotes);
    setFolders(updatedFolders);
    setFolderCountMap(updatedFolderCountMap);
    setAllTags(updatedAllTags);
    
    // IMPORTANT: Immediately set active tab to the new note
    setActiveTabId(newNote.id);
    
    // Start editing mode for this note
    startEditingNote(newNote.id);
    
    // Notify parent if in split view mode
    if (splitViewMode && props.onNoteChange) {
      props.onNoteChange(newNote);
    }
    
    // Mark that we've manually changed tabs
    initializedRef.current = true;
  };

  // Add this new useEffect for handling initial load
  useEffect(() => {
    // Set isInitialLoad to false after component mounts
    setIsInitialLoad(false);
  }, []);

  // Replace your existing tab animation useEffect with this one
  useEffect(() => {
    // Only manage tab visibility after the component has fully mounted
    if (activeTabId !== 'home') {
      // If we're on a tab, render the tabs
      setShouldRenderTabs(true);
    } else if (activeTabId === 'home') {
      // If we're on home and tabs were previously rendered, animate them out
      const timerId = setTimeout(() => {
        setShouldRenderTabs(false);
      }, 300); // Wait for animation to complete
      
      return () => clearTimeout(timerId);
    }
  }, [activeTabId]);

  // Add this CSS class directly in your component
  const tabsClass = activeTabId === 'home' ? 'slide-out' : 'slide-in';

  // Add this useEffect somewhere in your Notities component, 
  // alongside your other useEffect hooks

  useEffect(() => {
    // Get all available folder titles
    const availableFolders = folders.map(folder => folder.title);
    
    // Check if any selected subjects no longer exist in folders
    const hasInvalidSelection = selectedSubjects.some(subject => 
      !availableFolders.includes(subject)
    );
    
    // If there are invalid selections, filter them out
    if (hasInvalidSelection) {
      const validSelectedSubjects = selectedSubjects.filter(subject => 
        availableFolders.includes(subject)
      );
      
      // Update selected subjects
      setSelectedSubjects(validSelectedSubjects);
      console.log('Removed invalid selected subjects. New selection:', validSelectedSubjects);
    }
  }, [folders]); // This effect will run whenever folders changes

  // Replace any previous useEffect that handles openNoteId with this one
  useEffect(() => {
    // Skip on first render or if not in split view
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    
    if (!splitViewMode || !openNoteId) return;
    
    // Only process this note ID if we haven't seen it yet
    if (!processedNoteIds.current.has(openNoteId)) {
      // Mark as processed so we don't re-open it
      processedNoteIds.current.add(openNoteId);
      
      // Find the note to open
      const noteToOpen = allNotes.find(note => note.id === openNoteId);
      if (!noteToOpen) return;
      
      // Open the note
      const isAlreadyOpen = openedNotes.some(note => note.id === openNoteId);
      if (!isAlreadyOpen) {
        setOpenedNotes(prev => [...prev, noteToOpen]);
      }
      
      // Ensure the tabs are showing and this tab is active
      setShouldRenderTabs(true);
      setActiveTabId(openNoteId);
    }
  }, [openNoteId, splitViewMode, allNotes, openedNotes]);

  // Add this reset effect to handle clicking on the same note again after closing
  useEffect(() => {
    // When activeTabId changes to 'home', it likely means we closed the tab
    if (activeTabId === 'home' && openNoteId) {
      // Remove this note from processed set so it can be opened again
      processedNoteIds.current.delete(openNoteId);
    }
  }, [activeTabId, openNoteId]);

  // Add a function to properly filter out duplicate tabs
  const cleanedOpenedNotes = useMemo(() => {
    // This creates a unique array of notes based on note ID
    const uniqueNotes = [];
    const notesIds = new Set();
    
    for (const note of openedNotes) {
      if (!notesIds.has(note.id)) {
        notesIds.add(note.id);
        uniqueNotes.push(note);
      }
    }
    
    return uniqueNotes;
  }, [openedNotes]);

  // Modify handleCreateNewNote to respect manual navigation
  const handleCreateNewNote = () => {
    // Create the new note as before...
    const newNote = {
      id: `new-note-${Date.now()}`,
      title: '',
      folder: 'Uncategorized',
      content: '',
      tags: [],
      dateCreated: new Date().toISOString(),
      lastEdited: new Date().toISOString(),
      isNew: true
    };
    
    // Update all states as before...
    const updatedAllNotes = [...allNotes, newNote];
    const updatedFilteredNotes = [...filteredNotes, newNote];
    const updatedFolders = getFoldersFromNotes(updatedAllNotes);
    const updatedFolderCountMap = updatedFolders.reduce((acc, folder) => {
      acc[folder.title] = folder.noteCount;
      return acc;
    }, {});
    const updatedOpenedNotes = [...openedNotes, newNote];
    
    setAllNotes(updatedAllNotes);
    setFilteredNotes(updatedFilteredNotes);
    setOpenedNotes(updatedOpenedNotes);
    setFolders(updatedFolders);
    setFolderCountMap(updatedFolderCountMap);
    
    // Set as active tab
    setActiveTabId(newNote.id);
    
    // Mark that we've manually changed tabs
    initializedRef.current = true;
    
    // Start editing mode
    startEditingNote(newNote.id);
    
    // Notify parent if needed
    if (splitViewMode && props.onNoteChange) {
      props.onNoteChange(newNote);
    }
  };

  // Add this debugging at the top of the Notities component
  console.log("Notities render:", { 
    splitViewMode, 
    openNoteId, 
    activeTabId, 
    openedNotes: openedNotes.map(n => n.id) 
  });

  // Replace the useEffect that uses splitViewNote with this:
  useEffect(() => {
    // Skip if not in split view or no openNoteId
    if (!splitViewMode || !openNoteId) return;
    
    // Check if this is coming from App.jsx props.openNoteId
    if (props.clickTimestamp && props.clickTimestamp > lastClickTimestampRef.current) {
      // Update last timestamp 
      lastClickTimestampRef.current = props.clickTimestamp;
      
      // Find the note
      const noteToOpen = allNotes.find(note => note.id === openNoteId);
      if (!noteToOpen) return;
      
      // Check if it's already open
      const isAlreadyOpen = openedNotes.some(note => note.id === openNoteId);
      
      // Always add to openedNotes if not already there
      if (!isAlreadyOpen) {
        setOpenedNotes(prev => [...prev, noteToOpen]);
      }
      
      // Force tabs to render and make it active
      setShouldRenderTabs(true);
      setActiveTabId(openNoteId);
    }
  }, [splitViewMode, openNoteId, props.clickTimestamp]);

  // Add this new useEffect at an appropriate location with your other useEffects
  useEffect(() => {
    // Start typing animation when component mounts
    setIsTypingHeader(true);
    setHeaderText('');

    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex < fullHeaderText.length) {
        setHeaderText(prev => prev + fullHeaderText[currentIndex]);
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        setIsTypingHeader(false);
      }
    }, 50); // Adjust speed as needed

    return () => clearInterval(typingInterval);
  }, []); // Empty dependency array ensures it only runs once on mount

  // Memoize all the callback functions to prevent recreation
  const memoizedHandleSave = useCallback((updatedNote) => {
    // Update the note in allNotes
    const updatedAllNotes = allNotes.map(note => 
      note.id === updatedNote.id ? updatedNote : note
    );
    setAllNotes(updatedAllNotes);
    
    // Update the note in openedNotes if it's open
    const updatedOpenedNotes = openedNotes.map(note => 
      note.id === updatedNote.id ? updatedNote : note
    );
    setOpenedNotes(updatedOpenedNotes);
    
    // Update folders if folder changed
    setFolders(getFoldersFromNotes(updatedAllNotes));
    
    console.log('Note saved:', updatedNote);
  }, [allNotes, openedNotes]);

  const memoizedHandleDeleteNote = useCallback((noteId) => {
    // ... existing delete logic ...
  }, [allNotes, openedNotes, activeTabId]);

  const memoizedStartEditingNote = useCallback((noteId) => {
    setEditingNoteIds(prev => new Set([...prev, noteId]));
  }, []);

  const memoizedStopEditingNote = useCallback((noteId) => {
    setEditingNoteIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(noteId);
      return newSet;
    });
  }, []);

  // Memoize the active note to prevent recreation
  const memoizedActiveNote = useMemo(() => {
    return openedNotes.find(note => note.id === activeTabId);
  }, [openedNotes, activeTabId]);

  return (
    <div className={`notities-container ${splitViewMode ? 'split-view-mode' : ''}`} style={{ position: 'relative' }}>
      {/* Tabs section with animation */}
      <div className="tabs-position-container">
        {shouldRenderTabs && (
          <div className={`tabs-wrapper ${tabsClass}`}>
            <NoteTabs
              notes={cleanedOpenedNotes} // Use the cleaned unique array
              activeTabId={activeTabId}
              onTabChange={handleTabChange}
              onHomeClick={handleHomeClick}
              onCloseTab={handleCloseTab}
              onNewTabClick={handleNewTabClick}
            />
          </div>
        )}
      </div>
      
      {/* Content area */}
      <div className="content-wrapper flex-column">
        {activeTabId === 'home' ? (
          // Home view content
          <div className="notities-content-wrapper">
            <div className="notities-header flex-row">
              <div className="notities-header-text">
                {headerText}
                {isTypingHeader && <span className="typing-cursor"></span>}
              </div>
              <Tooltip color='#fefefe' style={{boxShadow: '0px 0px 20px 0px rgba(0, 0, 0, 0.11)', color: '#000000'}} withArrow label="Nieuwe Notitie">
                <div className="notities-header-button flex-row" onClick={handleCreateNewNote}>
                  <img className="notities-header-button-icon" src={PlusIcon} alt="Plus" />
                </div>
              </Tooltip>
            </div>
            <div className="notities-tags flex-row">
              <div className="tag-container flex-row">
                <Chip 
                  checked={selectedTags.includes('Alle Tags')}
                  onChange={() => handleTagSelect('Alle Tags')}
                  variant="light" 
                  color="#000460"
                >
                  Alle Tags
                </Chip>
                
                {allTags.map(tag => (
                  <Chip 
                    key={tag}
                    checked={selectedTags.includes('Alle Tags') || selectedTags.includes(tag)}
                    onChange={() => handleTagSelect(tag)}
                    variant="light" 
                    color="#000460"
                  >
                    {tag}
                  </Chip>
                ))}
              </div>
              <div onClick={() => spotlight.open()} className="search-all-notes flex-row">
                <img className="search-all-notes-button-icon" src={SearchIcon} alt="Search" style={{ width: 20, height: 20 }} />
                <div className="search-all-notes-button-text">
                    Zoek...
                </div>
              </div>
            </div>
            
            <div className="carousel-container">
              <p className="carousel-header">Folders</p>
              <FilterCarousel 
                folders={folders} 
                selectedSubjects={selectedSubjects}
                onSubjectSelect={handleSubjectSelect}
              />
            </div>
            <div className="notepreview-section">
              <div className="notepreview-section-header flex-row">
                <SegmentedControl
                  value={selectedPeriod}
                  onChange={handlePeriodSelect}
                  style={{ width: '445px' }}
                  fullWidth
                  withItemsBorders={false}
                  radius="xl" 
                  data={['Alle Notities','Vandaag', 'Deze week', 'Deze maand']}
                />
                <DatePickerInput
                  dropdownType="modal"
                  type="multiple"
                  placeholder="Selecteer data"
                  value={selectedDates}
                  onChange={setSelectedDates}
                  clearable
                  valueFormatter={({ date }) => {
                    if (!date || !Array.isArray(date) || date.length === 0) {
                      return ''; // Custom message when no date is selected
                    }
                    
                    if (date.length === 1) {
                      return dayjs(date[0]).format('DD/MM/YYYY'); // Format for single date
                    }
                    
                    if (date.length === 2) {
                      return `${dayjs(date[0]).format('DD/MM')} - ${dayjs(date[1]).format('DD/MM')}`; // Format for date range
                    }
                    
                    // If more than 2 dates are selected
                    return `${date.length} data`;
                  }}
                  classNames={{
                    root: 'date-picker-custom',
                    input: 'search-all-notes flex-row'
                  }}
                  leftSection={
                    <img className="search-all-notes-button-icon" src={CalendarIcon} alt="Calendar" style={{ width: 20, height: 20, marginLeft: 17}} />
                  }
                  
                />
              </div>
              <div className="notepreviews flex-row">
                {filteredNotes.length > 0 ? (
                  filteredNotes.map((note, index) => (
                    <Notepreview
                      key={index}
                      title={note.title}
                      subject={note.folder}
                      content={note.content}
                      dateCreated={note.dateCreated}
                      notecount={folderCountMap[note.folder]}
                      tags={note.tags}
                      onClick={() => handleNoteClick(note)}
                      onEdit={() => {
                        handleNoteClick(note);
                        startEditingNote(note.id);
                      }}
                      onDelete={() => openDeleteConfirmation(note.id, note.title)}
                    />
                  ))
                ) : (
                  <div className="no-notes-placeholder flex-column">
                    <img className="warning-icon" src={WarningIcon} alt="Warning" />
                    <p className="no-notes-placeholder-text">Pas je filters aan of maak een nieuwe notitie.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : activeTabId.startsWith('new-tab-') ? (
          <NewTab 
            allNotes={allNotes}
            onNoteSelect={handleNewTabNoteSelect}
            tabId={activeTabId}
            onNewNote={handleNewNote}
            onGoHome={handleGoHomeAndCloseTab}
            onCloseTab={handleCloseTab}
          />
        ) : (
          // Regular note content
          <div className="note-content-container" key={`container-${activeNote.id}`}>
            <div className="note-content-spacer"></div>
            <div className="note-view-area">
              <div className="single-view-container flex-column">
                <Noteview 
                  key={`note-${activeNote.id}-${Date.now()}`}
                  note={activeNote}
                  onSave={memoizedHandleSave}
                  onDelete={memoizedHandleDeleteNote}
                  isEditing={isNoteInEditMode(activeNote.id)}
                  startEditing={() => memoizedStartEditingNote(activeNote.id)}
                  stopEditing={() => memoizedStopEditingNote(activeNote.id)}
                />
              </div>
            </div>
          </div>
        )}
        {!activeNote && !activeTabId.startsWith('new-tab-') && <Footer />}
      </div>
      
      {/* Add NoteSearch here, outside of any conditionals */}
      {activeTabId === 'home' && (
        <NoteSearch 
          allNotes={allNotes}
          onNoteSelect={handleNoteClick}
        />
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function - only re-render if specific props change
  return (
    prevProps.splitViewMode === nextProps.splitViewMode &&
    prevProps.openNoteId === nextProps.openNoteId &&
    prevProps.clickTimestamp === nextProps.clickTimestamp &&
    prevProps.onOpenSplitView === nextProps.onOpenSplitView &&
    prevProps.onNoteChange === nextProps.onNoteChange &&
    prevProps.onTabChange === nextProps.onTabChange
  );
});

export default Notities;