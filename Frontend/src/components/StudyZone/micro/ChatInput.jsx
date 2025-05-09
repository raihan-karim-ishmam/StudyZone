import React, { useRef, useState } from 'react';
import { Textarea } from '@mantine/core';
import '../../../styles/StudyZone/macro/ChatInput.scss';

import selectImage from '../../../assets/svg/studyzone/select-image.svg';
import sendImage from '../../../assets/svg/studyzone/send-arrow.svg';

const ChatInput = ({ message, setMessage, onSendMessage }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef(null);

  // Handle image selection via file input
  const handleImageChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedImage(event.target.files[0]);
      console.log("Image selected via input:", event.target.files[0].name);
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Handle pasting images
  const handlePaste = (event) => {
    const items = event.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const fileName = `pasted-image-${timestamp}.${blob.type.split('/')[1] || 'png'}`;
          const imageFile = new File([blob], fileName, { type: blob.type });

          setSelectedImage(imageFile);
          event.preventDefault();
          console.log("Image pasted:", imageFile.name);
          break;
        }
      }
    }
  };

  // Handle drag and drop for images
  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDraggingOver(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDraggingOver(false);
    const files = event.dataTransfer.files;

    if (files.length > 0) {
      let imageFile = null;
      for (let i = 0; i < files.length; i++) {
        if (files[i].type.startsWith('image/')) {
          imageFile = files[i];
          break;
        }
      }

      if (imageFile) {
        setSelectedImage(imageFile);
        console.log("Image dropped:", imageFile.name);
      } else {
        console.log("Dropped file is not an image.");
      }
    }
  };

  // Handle sending message
  const handleSend = () => {
    if (message.trim() === '' && !selectedImage) return;
    
    onSendMessage(message, selectedImage);
    setSelectedImage(null);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (message.trim() !== '' || selectedImage) {
         handleSend();
      } else {
         setMessage('');
      }
    }
  };

  return (
    <div className="typebar-container flex-row">
      <div
        className={`input-container flex-row ${isDraggingOver ? 'dragging-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageChange}
          style={{ display: 'none' }}
          accept="image/*"
        />
        <img
          src={selectImage}
          className='select-image button'
          alt="Select Image"
          onClick={triggerFileInput}
        />
        {selectedImage && (
          <span className="selected-image-name">
            {selectedImage.name}
          </span>
        )}
        <Textarea
          className="typebar"
          type="text"
          placeholder={selectedImage ? "Image selected. Add a caption..." : "Type, paste, or drop image here..."}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          autosize
          minRows={1}
          maxRows={7}
          styles={{
            padding: 0,
            input: {
              border: 'none',
              backgroundColor: 'transparent',
              flexGrow: 1,
            },
            wrapper: {
              flexGrow: 1,
            }
          }}
        />
      </div>
      <div className='send-button flex-row button' onClick={handleSend}>
        <img src={sendImage} alt="Send" />
      </div>
    </div>
  );
};

export default ChatInput; 