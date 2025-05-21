import React, { useState, useRef, useEffect } from 'react';
import { Textarea } from '@mantine/core';
import { spotlight } from '@mantine/spotlight';
import { notifications } from '@mantine/notifications';
import Menu from '../../../components/Menu';
import '../../../styles/StudyZone/micro/ChatInput.scss';
import { subjectColors, subjectColorsPrimary, subjectIcons } from '../../../subject-icons/subjectIcons.js';

import NoteInput from '../macro/NoteInput.jsx';

import imageIcon from '../../../assets/svg/studyzone/select-image.svg';
import sendIcon from '../../../assets/svg/studyzone/send-arrow.svg';
import sendIconDisabled from '../../../assets/svg/studyzone/load.svg';
import plusIcon from '../../../assets/svg/studyzone/plus-studyzone.svg';
import noteIcon from '../../../assets/svg/studyzone/note-studyzone.svg';
import removeIcon from '../../../assets/svg/global/close.svg';

const ChatInput = ({ 
  message, 
  setMessage, 
  onSendMessage, 
  isLoading, 
  allNotes, 
  setActiveSpotlight,
  selectedNotes = [],
  setSelectedNotes,
  removeSelectedNote,
  handleAddNoteFromSpotlight,
  selectedImages = [],
  setSelectedImages,
  maxNotes = 5,
  onViewNote,
  inSplitView,
  onOpenSplitView,
  onCancel
}) => {
  const [hiddenPrompt, setHiddenPrompt] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  const MAX_IMAGES = 1;
  const MAX_NOTES = maxNotes;

  // Make sure we're using selectedNotes directly and it's always an array
  const notesToShow = Array.isArray(selectedNotes) ? selectedNotes : [];

  // Near the top of the component:
  console.log('ChatInput received selectedNotes:', selectedNotes);
  console.log('notesToShow length:', notesToShow.length);

  // Handle image selection via file input
  const handleFileChange = (e) => {
    // Log the number of files selected
    console.log(`Selected ${e.target.files.length} files`);
    
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      addImages(files);
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Add images to selection (respecting max limit)
  const addImages = (files) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    // Console log the filtered image files
    console.log('Image files to add:', imageFiles.length);
    
    if (selectedImages.length >= MAX_IMAGES) {
      showMaxImagesNotification();
      return;
    }

    const remainingSlots = MAX_IMAGES - selectedImages.length;
    const imagesToAdd = imageFiles.slice(0, remainingSlots);
    
    if (imagesToAdd.length > 0) {
      console.log('Before update - selectedImages:', selectedImages.length);
      
      // Use a more direct approach to update
      const newImages = [...selectedImages, ...imagesToAdd];
      console.log('After update - new images array:', newImages.length);
      
      // Call the setter function
      setSelectedImages(newImages);
      
      // Force a debug render to see if state is updated
      setTimeout(() => {
        console.log('Current selectedImages after update:', selectedImages.length);
      }, 100);
      
      // Show notification if some images were skipped due to max limit
      if (imageFiles.length > remainingSlots) {
        const skippedCount = imageFiles.length - remainingSlots;
        notifications.show({
          title: 'Maximaal aantal afbeeldingen bereikt',
          message: `${skippedCount} afbeelding(en) niet toegevoegd. Maximum is ${MAX_IMAGES} afbeelding.`,
          color: 'yellow',
          autoClose: 4000,
        });
      }
    }
  };

  // Show notification when max images limit is reached
  const showMaxImagesNotification = () => {
    notifications.show({
      title: 'Maximaal aantal afbeeldingen bereikt',
      message: `U kunt maximaal ${MAX_IMAGES} afbeelding toevoegen`,
      color: 'red',
      autoClose: 4000,
    });
  };

  // Show notification when max notes limit is reached
  const showMaxNotesNotification = () => {
    notifications.show({
      title: 'Maximaal aantal notities bereikt',
      message: `U kunt maximaal ${MAX_NOTES} notitie toevoegen`,
      color: 'red',
      autoClose: 4000,
    });
  };

  // Handle pasting images
  const handlePaste = (event) => {
    if (selectedImages.length >= MAX_IMAGES) {
      const items = event.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          showMaxImagesNotification();
          event.preventDefault();
          return true;
        }
      }
      return false;
    }
    
    const items = event.clipboardData.items;
    let imageFound = false;
    
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const fileName = `pasted-image-${timestamp}.${blob.type.split('/')[1] || 'png'}`;
          const imageFile = new File([blob], fileName, { type: blob.type });

          addImages([imageFile]);
          imageFound = true;
          event.preventDefault();
          break;
        }
      }
    }
    
    return imageFound;
  };

  // Handle drag and drop for images
  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(event.dataTransfer.files);
    addImages(files);
  };

  // Handle sending message
  const handleSend = () => {
    if (message.trim() === '' && selectedImages.length === 0 && notesToShow.length === 0) return;
    
    // The visible message is just what the user typed
    const visibleMessage = message.trim();
    
    // Build hidden content with note data
    let hiddenNoteContent = '';
    if (notesToShow.length > 0) {
      // Create the content from notes for API request
      hiddenNoteContent = notesToShow.map(note => 
        `Dit is een notitie: Notitie Titel:${note.title} Notitie Folder:(${note.folder}) Notitie: Content (de titel zit niet in de content maar heb ik hiervoor benoemd):\n${note.content}`
      ).join('\n\n');
      
      console.log('Including note content in request:', hiddenNoteContent);
    }
    
    // Create metadata to identify which notes were included
    const metadata = {
      hasNotes: notesToShow.length > 0,
      noteIds: notesToShow.map(note => note.id),
      hiddenContent: hiddenNoteContent // This won't be displayed but will be sent
    };
    
    // Pass all images instead of just the first one
    onSendMessage(visibleMessage, selectedImages, metadata);
    
    // Clear selections after sending
    setSelectedImages([]);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // If in loading state, treat click as cancel request
    if (isLoading) {
      console.log('Cancel requested via button click');
      if (onCancel) {
        onCancel();
      }
      return;
    }
    
    // Normal send logic
    if (message.trim() || selectedImages.length > 0 || notesToShow.length > 0) {
      handleSend();
    }
  };

  // Open file dialog for image selection
  const openImageSelect = () => {
    if (selectedImages.length >= MAX_IMAGES) {
      showMaxImagesNotification();
      return;
    }
    
    // Add this console log to verify it's being called
    console.log('Opening file selector');
    
    // Ensure we have a valid ref before clicking
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Open note search spotlight
  const openNoteSearch = () => {
    if (notesToShow.length >= MAX_NOTES) {
      showMaxNotesNotification();
      return;
    }
    
    // Open the notes spotlight
    setTimeout(() => {
      spotlight.open();
    }, 100);
    setActiveSpotlight('notes');
  };

  // Update the removeSelectedImage function
  const removeSelectedImage = (indexToRemove) => {
    console.log('Removing image at index:', indexToRemove);
    console.log('Current images before removal:', selectedImages.length);
    
    // Add a safety check to ensure we don't wipe all images accidentally
    if (typeof indexToRemove !== 'number' || indexToRemove < 0 || indexToRemove >= selectedImages.length) {
      console.error('Invalid index to remove:', indexToRemove);
      return;
    }
    
    // Create a new array without the removed image
    const newImages = selectedImages.filter((_, index) => index !== indexToRemove);
    console.log('New images array after removal:', newImages.length);
    
    // Update the state with the new array
    setSelectedImages(newImages);
  };

  // Handle note selection from spotlight
  const handleNoteSelect = (note) => {
    if (notesToShow.length >= MAX_NOTES) {
      showMaxNotesNotification();
      return;
    }
    
    // Use the function from parent to add the note
    handleAddNoteFromSpotlight(note);
  };

  // Update the handleNoteClick function
  const handleNoteClick = (note) => {
    if (onOpenSplitView) {
      onOpenSplitView(note);
    }
  };

  // Menu items for the plus button
  const menuItems = [
    {
      items: [
        {
          label: 'Afbeelding',
          icon: <img src={imageIcon} alt="Afbeeldingen" />,
          onClick: openImageSelect,
          disabled: isLoading || selectedImages.length >= MAX_IMAGES
        },
        {
          label: 'Notitie',
          icon: <img src={noteIcon} alt="Notitie" />,
          onClick: openNoteSearch,
          disabled: isLoading || notesToShow.length >= MAX_NOTES
        }
      ]
    }
  ];

  // Add paste event listener to the textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.addEventListener('paste', handlePaste);
      return () => {
        textarea.removeEventListener('paste', handlePaste);
      };
    }
  }, [selectedImages]);

  // Add a useEffect to monitor selectedImages changes
  useEffect(() => {
    console.log('selectedImages changed:', selectedImages.length, 
                selectedImages.map(img => img.name || 'unnamed'));
  }, [selectedImages]);

  // Create a button element for the menu target
  const menuTrigger = (
    <button 
      type="button"
      className="image-button"
      disabled={isLoading}
    >
      <img src={plusIcon} alt="Add" />
    </button>
  );

  // Add handler for key press
  const handleKeyDown = (e) => {
    // If Enter is pressed without Shift key
    if (e.key === 'Enter' && !e.shiftKey) {
      // Prevent the default action (new line)
      e.preventDefault();
      
      // Submit the form if message is not empty or we have images/notes
      if (message.trim() || selectedImages.length > 0 || notesToShow.length > 0) {
        handleSubmit(e);
      }
    }
    // Allow Shift+Enter to create a new line
  };

  // At the start of the render function, add:
  console.log('Rendering ChatInput with', selectedImages.length, 'images');

  return (
    <div 
      className={`chat-input-container ${isDragging ? 'dragging' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Hidden file input for image selection */}
      <input 
        type="file" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        onChange={handleFileChange} 
        accept="image/*"
        multiple
      />
      
      {/* Selected notes preview */}
      {notesToShow.length > 0 ? (
        <div className="selected-notes-preview">
          {notesToShow.map((note, index) => {
            console.log('Rendering note in preview:', note);
            return (
              <NoteInput
                key={note.id || index}
                note={note}
                index={index}
                onRemove={removeSelectedNote}
                onClick={handleNoteClick}
                showRemoveButton={true}
              />
            );
          })}
        </div>
      ) : (
        <div style={{display: 'none'}}>No notes to show</div>
      )}
      
      {/* Selected images preview */}
      {selectedImages.length > 0 && (
        <div 
          className="selected-images-preview"
          style={
            { 
              left: notesToShow.length === 0 ? '20px' : notesToShow.length * 308 + 'px',
            }
          }
        >
          {selectedImages.map((image, index) => (
            <div key={index} className="image-preview-container">
              <img 
                src={URL.createObjectURL(image)} 
                alt={`Selected ${index + 1}`} 
                className="image-preview" 
              />
              <div 
                className="remove-image" 
                onClick={(e) => {
                  e.stopPropagation(); // Prevent event bubbling
                  console.log('Remove button clicked for index:', index);
                  removeSelectedImage(index);
                }}
                aria-label="Remove image"
              >
                <img src={removeIcon} style={{ width: '16px', height: '16px' }} alt="Remove" />
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Input form */}
      <form onSubmit={handleSubmit}>
        <div className="input-actions">
          <Menu 
            items={menuItems} 
            position="top"
            target={menuTrigger}
            trigger="hover"
            width={150}
          />
        </div>
        
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Stel een vraag..."
          autosize
          minRows={1}
          maxRows={5}
          disabled={isLoading}
        />
        
        <button 
          type="submit" 
          className={`send-button ${message.trim() || selectedImages.length > 0 || notesToShow.length > 0 ? 'active' : ''} ${isLoading ? 'disabled' : ''}`}
          disabled={!isLoading && (message.trim() === '' && selectedImages.length === 0 && notesToShow.length === 0)}
        >
          {isLoading ? (
            <img src={sendIconDisabled} alt="Cancel" />
          ) : (
            <img src={sendIcon} alt="Send" />
          )}
        </button>
      </form>
    </div>
  );
};

export default ChatInput; 


