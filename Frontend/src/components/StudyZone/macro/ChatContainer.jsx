import React, { useState, useEffect } from 'react';
import ChatHistory from '../micro/ChatHistory';
import ChatInput from '../micro/ChatInput';
import mockChatMessages from '../../../_data_test/mockChatMessages';
import mockNotes from '../../../_data_test/mockNotes';
import '../../../styles/StudyZone/macro/ChatContainer.scss';

const ChatContainer = ({ activeSubject, activeChat }) => {
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [sessionId] = useState(() => "session-" + Date.now());
  
  // Load notes for the active subject
  const notesForActiveSubject = mockNotes.filter(note => note.folder === activeSubject) || [];
  
  // Load conversation history when subject or chat changes
  useEffect(() => {
    if (activeSubject && activeChat) {
      // Check if we have mock data for this chat
      if (mockChatMessages[activeSubject] && mockChatMessages[activeSubject][activeChat.id]) {
        setConversation(mockChatMessages[activeSubject][activeChat.id]);
      } else {
        // Initialize with system prompt if no history exists
        setConversation([{
          role: "system",
          content: `You are StudyZone AI, a helpful assistant for ${activeSubject} students.`
        }]);
      }
      // Reset selected note when changing chats
      setSelectedNoteId(null);
    } else {
      // Clear the conversation when no chat is selected
      setConversation([]);
    }
  }, [activeSubject, activeChat]);

  // Send message to API
  const handleSendMessage = async (messageText, image = null) => {
    if (messageText.trim() === '' && !image) return;

    // Create user message
    const userMessage = {
      role: 'user',
      content: messageText.trim() || (image ? "Image sent" : "")
    };
    
    // Optimistically add user message to conversation
    const updatedConversation = [...conversation, userMessage];
    setConversation(updatedConversation);
    setMessage(''); // Clear input field

    // In real implementation, send to backend
    try {
      // Prepare form data for API call
      const formData = new FormData();
      formData.append('session_id', sessionId);
      
      if (messageText.trim()) {
        formData.append('message', messageText.trim());
      }
      
      if (image) {
        formData.append('image', image, image.name);
      }

      // Simulate API call with a timeout
      setTimeout(() => {
        // Mock assistant response
        const assistantMessage = {
          role: 'assistant',
          content: `This is a mock response to your question about ${activeSubject}. In a real implementation, this would come from the OpenAI API.`
        };
        
        setConversation(prev => [...prev, assistantMessage]);
      }, 1000);

      /* REAL API CALL - UNCOMMENT WHEN BACKEND IS READY
      const response = await fetch("http://localhost:5001/chat", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error: ${response.statusText} - ${errorData.detail || 'Unknown error'}`);
      }

      const data = await response.json();
      
      // Process OpenAI API response format
      const assistantMessage = {
        role: 'assistant',
        content: data.message || "No response from assistant."
      };
      
      setConversation(prev => [...prev, assistantMessage]);
      */
      
    } catch (error) {
      console.error("Failed to send message or fetch assistant response:", error);
      const errorMessage = {
        role: 'system',
        content: `Error: ${error.message}`
      };
      setConversation(prev => [...prev, errorMessage]);
    }
  };

  return (
    <div className="chat-container">
      <ChatHistory
        conversation={conversation}
        activeSubject={activeSubject}
        notesForActiveSubject={notesForActiveSubject}
        selectedNoteId={selectedNoteId}
        setSelectedNoteId={setSelectedNoteId}
        setMessage={setMessage}
      />
      <ChatInput
        message={message}
        setMessage={setMessage}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
};

export default ChatContainer; 