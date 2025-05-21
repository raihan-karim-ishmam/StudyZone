import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import ChatHistory from '../micro/ChatHistory';
import ChatInput from '../micro/ChatInput';
import mockChatMessages from '../../../_data_test/mockChatMessages';
import mockNotes from '../../../_data_test/mockNotes';
import '../../../styles/StudyZone/macro/ChatContainer.scss';
import { notifications } from '@mantine/notifications'; // Import notifications

const BACKEND_URL = "http://localhost:5001";

const ChatContainer = forwardRef(({ 
  activeSubject, 
  activeChat, 
  allNotes, 
  setActiveSpotlight, 
  onViewNote,
  inSplitView,
  onOpenSplitView,
  // State passed from StudyZone
  getCurrentMessage,
  updateCurrentMessage,
  getCurrentConversation,
  updateConversation,
  getCurrentSelectedNotes,
  updateCurrentSelectedNotes,
  getCurrentSelectedImages,
  updateCurrentSelectedImages
}, ref) => {
  // Local state for when we don't have props
  const [localMessage, setLocalMessage] = useState('');
  const [localConversation, setLocalConversation] = useState([]);
  const [localSelectedNotes, setLocalSelectedNotes] = useState([]);
  const [localSelectedImages, setLocalSelectedImages] = useState([]);
  
  // Track selected note IDs locally
  const [selectedNoteIds, setSelectedNoteIds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isBackendAvailable, setIsBackendAvailable] = useState(false);
  const [sessionId] = useState(() => `${activeSubject}-${activeChat?.id || 'new'}-${Date.now()}`);
  
  const MAX_NOTES = 1;
  
  const notesForActiveSubject = allNotes.filter(note => note.folder === activeSubject).slice(0, 5) || [];
  
  // Add typing animation state
  const [isTypingAnimation, setIsTypingAnimation] = useState(false);
  const abortControllerRef = useRef(null);
  const typingCancelRef = useRef({ shouldCancel: false });
  
  // Determine if input should be disabled (either loading or typing)
  const isInputDisabled = isLoading || isTypingAnimation;
  
  // IMPORTANT: Define helper functions at the top before they're used
  
  // Get current message and handle updates
  const getMessage = () => {
    return getCurrentMessage ? getCurrentMessage() : localMessage;
  };
  
  const setMessage = (newMessage) => {
    if (updateCurrentMessage) {
      updateCurrentMessage(newMessage);
    } else {
      setLocalMessage(newMessage);
    }
  };
  
  // Get current conversation and handle updates
  const getConversation = () => {
    if (getCurrentConversation) {
      const conversation = getCurrentConversation();
      return Array.isArray(conversation) ? conversation : [];
    }
    return localConversation || [];
  };
  
  // Define setConversation early
  const setConversation = (newConversation) => {
    if (updateConversation) {
      updateConversation(newConversation);
    } else {
      setLocalConversation(newConversation);
    }
  };
  
  // Get selected notes and handle updates
  const getSelectedNotes = () => {
    let result = [];
    
    if (getCurrentSelectedNotes) {
      result = getCurrentSelectedNotes();
      console.log('Getting notes from App state:', result);
    } else {
      result = localSelectedNotes || [];
      console.log('Getting notes from local state:', result);
    }
    
    if (!Array.isArray(result)) {
      console.warn('getSelectedNotes returned non-array:', result);
      return [];
    }
    
    return result;
  };
  
  const setSelectedNotes = (newSelectedNotes) => {
    // Ensure newSelectedNotes is an array
    const notesArray = Array.isArray(newSelectedNotes) ? newSelectedNotes : [];
    
    if (updateCurrentSelectedNotes) {
      updateCurrentSelectedNotes(notesArray);
    } else {
      setLocalSelectedNotes(notesArray);
    }
    
    // Update selectedNoteIds to match
    const noteIds = notesArray.map(note => note.id);
    setSelectedNoteIds(noteIds);
  };
  
  // Get selected images and handle updates
  const getSelectedImages = () => {
    if (getCurrentSelectedImages) {
      const images = getCurrentSelectedImages();
      return Array.isArray(images) ? images : [];
    }
    return localSelectedImages || [];
  };
  
  const setSelectedImages = (newSelectedImages) => {
    const imagesArray = Array.isArray(newSelectedImages) ? newSelectedImages : [];
    if (updateCurrentSelectedImages) {
      updateCurrentSelectedImages(imagesArray);
    } else {
      setLocalSelectedImages(imagesArray);
    }
  };
  
  // Initialize conversation when subject or chat changes
  useEffect(() => {
    if (activeSubject && activeChat) {
      // Only initialize if we're not using persisted state or have no conversation
      if (!getCurrentConversation || getConversation().length === 0) {
        // Check for mock data
        if (mockChatMessages[activeSubject] && mockChatMessages[activeSubject][activeChat.id]) {
          setConversation(mockChatMessages[activeSubject][activeChat.id]);
        } else {
          // Initialize with system prompt
          setConversation([{
            role: "system",
            content: `You are StudyZone AI, a helpful assistant for ${activeSubject} students.`
          }]);
        }
      }
    }
  }, [activeSubject, activeChat]);
  
  // Show notification when max notes limit is reached
  const showMaxNotesNotification = () => {
    notifications.show({
      title: 'Maximaal aantal notities bereikt',
      message: `U kunt maximaal ${MAX_NOTES} notitie toevoegen`,
      color: 'red',
      autoClose: 4000,
    });
  };
  
  // Check if backend is available
  useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            'session_id': 'test-connection'
          }),
          signal: AbortSignal.timeout(2000) // 2 second timeout
        });
        setIsBackendAvailable(response.ok);
      } catch (error) {
        console.log("Backend not available, using mock data:", error);
        setIsBackendAvailable(false);
      }
    };
    
    checkBackendStatus();
  }, []);
  
  // Update the toggleNoteSelection function with MAX_NOTES check
  const toggleNoteSelection = (noteId) => {
    // If the note is not already selected, check if we've reached the limit
    if (!selectedNoteIds.includes(noteId) && getSelectedNotes().length >= MAX_NOTES) {
      showMaxNotesNotification();
      return;
    }
    
    // First find the note
    const note = notesForActiveSubject.find(note => note.id === noteId);
    if (!note) return;
    
    // Update both states atomically to avoid synchronization issues
    if (selectedNoteIds.includes(noteId)) {
      // Remove the note
      setSelectedNoteIds(prev => prev.filter(id => id !== noteId));
      
      const currentNotes = getSelectedNotes();
      const updatedNotes = currentNotes.filter(n => n.id !== noteId);
      
      if (updateCurrentSelectedNotes) {
        updateCurrentSelectedNotes(updatedNotes);
      }
      setLocalSelectedNotes(updatedNotes);
    } else {
      // Add the note
      setSelectedNoteIds(prev => [...prev, noteId]);
      
      const currentNotes = getSelectedNotes();
      const updatedNotes = [...currentNotes, note];
      
      if (updateCurrentSelectedNotes) {
        updateCurrentSelectedNotes(updatedNotes);
      }
      setLocalSelectedNotes(updatedNotes);
    }
  };

  // Add a function to remove a note from selectedNotes
  const removeSelectedNote = (index) => {
    const noteToRemove = getSelectedNotes()[index];
    
    // Remove from selectedNotes
    setSelectedNotes(prev => prev.filter((_, i) => i !== index));
    
    // Also remove from selectedNoteIds
    setSelectedNoteIds(prev => prev.filter(id => id !== noteToRemove.id));
  };

  // Fix the handleAddNoteFromSpotlight function
  const handleAddNoteFromSpotlight = (note) => {
    // Check if we've reached the maximum number of notes
    if (getSelectedNotes().length >= MAX_NOTES) {
      showMaxNotesNotification();
      return;
    }
    
    // Check if note is already selected
    const currentSelectedNotes = getSelectedNotes();
    if (currentSelectedNotes.some(n => n.id === note.id)) {
      return;
    }
    
    // Simple approach: directly create a new array
    const newSelectedNotes = [...currentSelectedNotes, note];
    
    // Update the state
    setSelectedNotes(newSelectedNotes);
    
    // Also update selectedNoteIds
    setSelectedNoteIds(prev => [...prev, note.id]);
  };

  // Separate cancel function (not part of handleSendMessage)
  const handleCancel = () => {
    console.log('Cancel triggered from button');
    
    // Cancel API request if it's in progress
    if (isLoading && abortControllerRef.current) {
      console.log('Cancelling API request');
      abortControllerRef.current.abort();
      setIsLoading(false);
    }
    
    // Cancel typing animation if it's in progress
    if (isTypingAnimation) {
      console.log('Cancelling typing animation');
      typingCancelRef.current.shouldCancel = true;
      // Immediately update state to false so the UI updates
      setIsTypingAnimation(false);
    }
  };

  // Modified handleSendMessage with cancel support
  const handleSendMessage = async (messageText, images = [], metadata = {}) => {
    console.log('handleSendMessage called');
    
    // Check if we're in loading or animation state - treat click as cancel
    if (isLoading || isTypingAnimation) {
      handleCancel();
      return;
    }
    
    // Original message validation
    if (messageText === '' && images.length === 0 && !(metadata && metadata.hasNotes)) return;

    // Create a new abort controller for this request
    abortControllerRef.current = new AbortController();
    typingCancelRef.current.shouldCancel = false;

    // Create the user message that will be displayed
    const userMessage = {
      role: 'user',
      content: messageText,
      metadata: {
        hasNotes: metadata?.hasNotes || false,
        noteIds: metadata?.noteIds || [],
        hasImages: images.length > 0,
        images: images.length > 0 ? images.map(image => ({
          url: URL.createObjectURL(image),
          name: image.name || 'image.jpg'
        })) : []
      }
    };
    
    // Update conversation with user message
    const currentConversation = getConversation();
    const updatedConversation = [...currentConversation, userMessage];
    setConversation(updatedConversation);
    
    // Clear input field & selections
    setMessage('');
    setSelectedNotes([]);
    setSelectedNoteIds([]);
    setSelectedImages([]);
    
    // Scroll to bottom
    setTimeout(() => {
      const chatHistory = document.querySelector('.chat-history-container');
      if (chatHistory) {
        chatHistory.scrollTop = chatHistory.scrollHeight;
      }
    }, 100);
    
    setIsLoading(true);

    try {
      // Process message for API
      const fullApiMessage = metadata && metadata.hiddenContent 
        ? `${messageText}\n\n${metadata.hiddenContent}` 
        : messageText;
      
      // Prepare form data for API call
      const formData = new FormData();
      formData.append('session_id', sessionId);
      
      if (fullApiMessage.trim()) {
        formData.append('message', fullApiMessage.trim());
      }
      
      // Append images
      if (Array.isArray(images) && images.length > 0) {
        const image = images[0]; // Only use first image since backend supports one
        if (image && (image instanceof Blob || image instanceof File)) {
          formData.append('image', image, image.name || 'image.jpg');
        }
      }

      let assistantMessage;
      
      if (isBackendAvailable) {
        try {
          const response = await fetch(`${BACKEND_URL}/chat`, {
            method: "POST",
            body: formData,
            signal: abortControllerRef.current.signal // Use abort controller signal
          });
  
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Error: ${response.statusText} - ${errorData.detail || 'Unknown error'}`);
          }
  
          const data = await response.json();
          
          // Process response
          assistantMessage = {
            role: 'assistant',
            content: data.message || "No response from assistant."
          };
        } catch (error) {
          // Check if request was cancelled
          if (error.name === 'AbortError') {
            console.log('Request was cancelled by user');
            return; // Exit early without updating state
          }
          
          console.error("API call failed, falling back to mock data:", error);
          assistantMessage = getMockResponse(activeSubject, messageText);
        }
      } else {
        // Use mock data
        assistantMessage = getMockResponse(activeSubject, messageText);
      }
      
      // Only update conversation if not cancelled
      if (!abortControllerRef.current?.signal?.aborted) {
        setConversation([...updatedConversation, assistantMessage]);
      }
      
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Request was cancelled');
        return;
      }
      
      console.error("Failed to send message or fetch response:", error);
      const errorMessage = {
        role: 'system',
        content: `Error: ${error.message}`
      };
      setConversation([...updatedConversation, errorMessage]);
    } finally {
      // Only reset loading state if not aborted
      if (!abortControllerRef.current?.signal?.aborted) {
        setIsLoading(false);
      }
    }
  };

  // Generate a mock response based on the subject
  const getMockResponse = (subject, query) => {
    // Wait a moment to simulate API delay
    return {
      role: 'assistant',
      content: `This is a mock response to your question about ${subject}. In a real implementation, this would come from the OpenAI API.\n\nYour query was: "${query}"\n\nWhen the backend is connected, you'll receive actual AI responses here.`
    };
  };

  // Add a function to remove a note by ID from selected notes
  const removeNoteById = (noteId) => {
    setSelectedNotes(prev => prev.filter(note => note.id !== noteId));
    setSelectedNoteIds(prev => prev.filter(id => id !== noteId));
  };

  // Use these functions for ref
  useImperativeHandle(ref, () => ({
    handleAddNoteFromSpotlight,
    removeNoteById
  }));

  // In the ChatContainer component, add explicit logging for onOpenSplitView
  useEffect(() => {
    console.log('ChatContainer has onOpenSplitView:', !!onOpenSplitView);
  }, [onOpenSplitView]);

  // Add this useEffect to preserve selectedNoteIds when opening split view
  useEffect(() => {
    // This ensures we don't lose the selected note IDs when opening a note in split view
    if (inSplitView) {
      const currentNotes = getSelectedNotes();
      
      // Make sure all selected notes have their IDs in selectedNoteIds
      const allNoteIds = currentNotes.map(note => note.id);
      
      // Update selectedNoteIds to match all notes that are currently selected
      setSelectedNoteIds(allNoteIds);
    }
  }, [inSplitView]);

  return (
    <div className="chat-container flex-column">
      <ChatHistory
        conversation={getConversation()}
        activeSubject={activeSubject}
        notesForActiveSubject={notesForActiveSubject}
        selectedNoteIds={selectedNoteIds}
        toggleNoteSelection={toggleNoteSelection}
        isLoading={isLoading}
        allNotes={allNotes}
        onNoteClick={(note) => {
          console.log('Note clicked in ChatHistory:', note);
          if (onOpenSplitView) {
            onOpenSplitView(note);
          } else {
            console.error('onOpenSplitView is not available in ChatContainer');
          }
        }}
        onTypingStateChange={setIsTypingAnimation}
        typingCancelRef={typingCancelRef}
        inSplitView={inSplitView}
      />
      <ChatInput
        message={getMessage()}
        setMessage={setMessage}
        onSendMessage={handleSendMessage}
        isLoading={isLoading || isTypingAnimation}
        allNotes={allNotes}
        setActiveSpotlight={setActiveSpotlight}
        selectedNotes={getSelectedNotes()}
        setSelectedNotes={setSelectedNotes}
        removeSelectedNote={removeSelectedNote}
        handleAddNoteFromSpotlight={handleAddNoteFromSpotlight}
        selectedImages={getSelectedImages()}
        setSelectedImages={setSelectedImages}
        maxNotes={MAX_NOTES}
        onViewNote={onViewNote}
        inSplitView={inSplitView}
        onOpenSplitView={onOpenSplitView}
        onCancel={handleCancel}
      />
      <div className="chat-input-background"></div>
    </div>
  );
});

export default ChatContainer; 