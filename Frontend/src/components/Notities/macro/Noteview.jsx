import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import { Blockquote, TypographyStylesProvider, TextInput, Button, Group, Tooltip, ActionIcon, TagsInput, Select } from '@mantine/core';
import { useFocusTrap } from '@mantine/hooks';
import { Kbd } from '@mantine/core';
import { IconInfoCircle, IconCheck, IconX, IconPhoto } from '@tabler/icons-react';
import { subjectColors, subjectColorsPrimary, subjectIcons } from '../../../subject-icons/subjectIcons';
import { RichTextEditor } from '@mantine/tiptap';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Superscript from '@tiptap/extension-superscript';
import SubScript from '@tiptap/extension-subscript';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import DOMPurify from 'dompurify';
import '@mantine/tiptap/styles.css';
import Image from '@tiptap/extension-image';
import { useUser } from '../../../context/UserContext';
import { modals } from '@mantine/modals';
import { Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';

import NoteEditIcon from '../../../assets/svg/notities/edit_note.svg';
import NoteChatIcon from '../../../assets/svg/notities/note_to_chat.svg';
import NoteDeleteIcon from '../../../assets/svg/notities/delete_note.svg';
import NoteSaveIcon from '../../../assets/svg/notities/save_note.svg';
import NoteCancelIcon from '../../../assets/svg/notities/cancel_note.svg';
import WarningCancelIcon from '../../../assets/svg/notities/modal_cancel_save.svg';

import Footer from '../../../components/Footer';
import Notepreviewtag from '../micro/Notepreviewtag';

import '../../../styles/Notities/macro/Noteview.scss';

const NoteView = ({ 
  note, 
  onSave, 
  onDelete, 
  isEditing, 
  startEditing, 
  stopEditing,
}) => {
  const { user } = useUser(); // Get user from UserContext
  const [editedTitle, setEditedTitle] = useState(note.title);
  const [editedTags, setEditedTags] = useState(note.tags || []);
  const [editedFolder, setEditedFolder] = useState(note.folder || 'Uncategorized');
  
  const focusTrapRef = useFocusTrap();
  const lowerCaseSubject = (editedFolder || 'Uncategorized').toLowerCase();

  const quoteIcon = <IconInfoCircle />;
  
  // Format dates to be more readable
  const formattedCreatedDate = dayjs(note.dateCreated).format('DD-MM-YYYY');
  const formattedModifiedDate = dayjs(note.dateLastModified).format('DD-MM-YYYY');
  
  // Function to handle adding images through button click
  const handleAddImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (event) => {
      if (event.target.files?.length) {
        const file = event.target.files[0];
        const reader = new FileReader();
        
        reader.onload = () => {
          if (editor) {
            // Create an actual image element and set its attributes
            const img = document.createElement('img');
            img.src = reader.result;
            
            // Let TipTap handle inserting the node with all its internal logic
            editor.commands.insertContent({
              type: 'image',
              attrs: {
                src: img.src,
                alt: file.name || 'Image'
              }
            });
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };
  
  // Helper function to handle image files
  const handleImageFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (editor) {
        editor.chain().focus().setImage({ src: e.target.result }).run();
      }
    };
    reader.readAsDataURL(file);
  };
  
  // Initialize the rich text editor with Image extension and paste/drop handlers
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link,
      Superscript,
      SubScript,
      Highlight,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Image, // This adds basic image support
    ],
    content: note.content,
    onUpdate: ({ editor }) => {
      // Optional debugging
      // console.log(editor.getHTML());
    },
  });
  
  // Add this effect to update editor content when note changes or edit mode is entered
  useEffect(() => {
    if (editor && isEditing) {
      // Force editor to load the current note content
      editor.commands.setContent(note.content);
    }
  }, [editor, note.content, isEditing]);
  
  // Add paste handler for images
  useEffect(() => {
    if (!editor || !isEditing) return;
    
    const handlePaste = (event) => {
      const items = event.clipboardData?.items;
      if (!items) return;
      
      for (const item of items) {
        if (item.type.indexOf('image') === 0) {
          event.preventDefault();
          const file = item.getAsFile();
          if (file) handleImageFile(file);
          break;
        }
      }
    };
    
    // Add paste event listener to the editor element
    const editorElement = editor.view.dom;
    editorElement.addEventListener('paste', handlePaste);
    
    return () => {
      editorElement.removeEventListener('paste', handlePaste);
    };
  }, [editor, isEditing]);
  
  // Add drag and drop handler for images
  useEffect(() => {
    if (!editor || !isEditing) return;
    
    const handleDrop = (event) => {
      const items = event.dataTransfer?.items;
      if (!items) return;
      
      for (const item of items) {
        if (item.type.indexOf('image') === 0) {
          event.preventDefault();
          const file = item.getAsFile();
          if (file) handleImageFile(file);
          break;
        }
      }
    };
    
    const handleDragOver = (event) => {
      // This is needed to allow dropping
      event.preventDefault();
    };
    
    // Add drag and drop event listeners to the editor element
    const editorElement = editor.view.dom;
    editorElement.addEventListener('drop', handleDrop);
    editorElement.addEventListener('dragover', handleDragOver);
    
    return () => {
      editorElement.removeEventListener('drop', handleDrop);
      editorElement.removeEventListener('dragover', handleDragOver);
    };
  }, [editor, isEditing]);

  // Toggle edit mode or save depending on current state
  const handleEditToggle = () => {
    if (isEditing) {
      // If already in edit mode, save the note
      handleSave();
    } else {
      // If not in edit mode, enter edit mode
      setEditedTitle(note.title);
      setEditedTags(note.tags || []);
      setEditedFolder(note.folder || 'Uncategorized');
      startEditing();
    }
  };

  // Sanitize HTML content for security
  const sanitizedContent = DOMPurify.sanitize(note.content);

  // Track draft content
  const [draftContent, setDraftContent] = useState(null);
  const draftTimerRef = useRef(null);

  // Setup automatic draft saving
  useEffect(() => {
    if (isEditing && editor) {
      // Initial setup - check for existing draft
      const draftKey = `note_draft_${note.id}`;
      const savedDraft = localStorage.getItem(draftKey);
      
      if (savedDraft) {
        // Restore saved draft when editor initializes
        try {
          const draftData = JSON.parse(savedDraft);
          if (draftData.content && draftData.timestamp) {
            // Only restore if draft is not too old (e.g., 24 hours)
            const draftAge = Date.now() - draftData.timestamp;
            if (draftAge < 24 * 60 * 60 * 1000) {
              // Set the editor content to the draft
              editor.commands.setContent(draftData.content);
              setDraftContent(draftData.content);
              console.log('Restored draft from', new Date(draftData.timestamp));
            } else {
              // Draft too old, remove it
              localStorage.removeItem(draftKey);
            }
          }
        } catch (error) {
          console.error('Error restoring draft:', error);
          localStorage.removeItem(draftKey);
        }
      }

      // Set up auto-saving draft
      const saveDraft = () => {
        if (editor) {
          const currentContent = editor.getHTML();
          if (currentContent !== note.content) {
            // Only save if content has changed from original
            const draftData = {
              content: currentContent,
              timestamp: Date.now(),
              noteId: note.id
            };
            localStorage.setItem(draftKey, JSON.stringify(draftData));
            setDraftContent(currentContent);
            console.log('Draft saved at', new Date());
          }
        }
      };

      // Save draft every 5 seconds while editing
      draftTimerRef.current = setInterval(saveDraft, 5000);

      // Also save when editor content changes
      const handleUpdate = () => {
        // Clear any existing timer to avoid multiple rapid saves
        if (draftTimerRef.current) {
          clearInterval(draftTimerRef.current);
        }
        
        // Set a new timer to save after a short delay (debounce)
        draftTimerRef.current = setTimeout(saveDraft, 1000);
      };

      editor.on('update', handleUpdate);

      return () => {
        // Clean up timers when component unmounts or editor changes
        if (draftTimerRef.current) {
          clearInterval(draftTimerRef.current);
        }
        editor.off('update', handleUpdate);
      };
    }
  }, [isEditing, editor, note.id, note.content]);

  // Handle successful save - clear the draft
  const handleSaveSuccess = useCallback(() => {
    const draftKey = `note_draft_${note.id}`;
    localStorage.removeItem(draftKey);
    setDraftContent(null);
    console.log('Draft cleared after successful save');
  }, [note.id]);

  // Modify your existing save function to clear draft on success
  const handleSave = () => {
    if (editor) {
      // Use "Uncategorized" as default if no folder is selected
      const finalFolder = !editedFolder || editedFolder.trim() === '' ? 'Uncategorized' : editedFolder;
      
      // If title is empty, use "folder Notitie" as default (using the final folder)
      const finalTitle = editedTitle.trim() === '' ? `${finalFolder} Notitie` : editedTitle;
      
      onSave({
        ...note,
        title: finalTitle,
        content: editor.getHTML(),
        tags: editedTags,
        folder: finalFolder,
        dateLastModified: new Date().toISOString()
      });
    }
    stopEditing();
  };

  const handleCancel = () => {
    // Open confirmation modal
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
          <img 
            src={WarningCancelIcon} 
            alt="Warning" 
            style={{width: '80px', height: '80px', marginBottom: '20px', marginTop: '60px'}} 
          />
          <div className="delete-confirmation-modal-noteHome-content-text">
            Uw wijzigingen worden niet opgeslagen. Weet u zeker dat u de wijzigingen wilt annuleren?
          </div>
        </div>
      ),
      labels: { confirm: 'Annuleren', cancel: 'Doorgaan' },
      confirmProps: { 
        color: 'gray',
        radius: 'xl',
        style: { fontWeight: 500 }
      },
      cancelProps: {
        radius: 'xl',
        variant: 'default',
        style: { fontWeight: 500 }
      },
      onCancel: () => {
        // User wants to continue editing, do nothing
        notifications.show({
          title: 'Doorgaan met bewerken',
          message: 'U kunt verder gaan met het bewerken van de notitie',
          color: 'green',
          autoClose: 3000,
        });
      },
      onConfirm: () => {
        // User confirmed cancellation, proceed with cancellation
        // Clear the draft
        const draftKey = `note_draft_${note.id}`;
        localStorage.removeItem(draftKey);
        setDraftContent(null);
        
        // If editor is available, reset content to original note content
        if (editor) {
          editor.commands.setContent(note.content);
        }
        
        // Reset edited fields to original values
        const folder = note.folder || 'Uncategorized';
        
        // Check if the title is empty, if so set it to "Subject + Notitie"
        if (!note.title || note.title.trim() === '') {
          setEditedTitle(`${folder} Notitie`);
          
          // Also update the note title in the parent component
          onSave({
            ...note,
            title: `${folder} Notitie`,
            dateLastModified: new Date().toISOString()
          });
        } else {
          setEditedTitle(note.title);
        }
        
        setEditedTags(note.tags || []);
        setEditedFolder(folder);
        
        // Exit edit mode
        stopEditing();
        
        notifications.show({
          title: 'Bewerking geannuleerd',
          message: 'Alle wijzigingen zijn ongedaan gemaakt',
          color: 'gray',
          autoClose: 3000,
        });
      },
    });
  };

  // Add this effect to update editedTags when note changes
  useEffect(() => {
    if (note?.tags) {
      setEditedTags(note.tags);
    }
  }, [note]);

  useEffect(() => {
    // Update local state if the note prop changes
    if (note) {
      // Any necessary updates when note changes
      console.log("Note updated in preview:", note.tags);
    }
  }, [note]); // Dependency on the note prop

  // Update editedFolder when note changes
  useEffect(() => {
    if (note) {
      setEditedFolder(note.folder || 'Uncategorized');
    }
  }, [note]);

  // Add or modify this useEffect to update editedTitle when note changes
  useEffect(() => {
    // Update editedTitle whenever the note changes or edit mode is entered
    if (note) {
      setEditedTitle(note.title);
    }
  }, [note.id, note.title]); // Depend on note.id to detect when we switch to a different note

  // Prepare subject data for the Select component
  const subjectOptions = user.subjects.map(subject => ({
    value: subject,
    label: subject
  }));

  // Add a handler for delete button click
  const handleDelete = () => {
    onDelete(note.id);
  };

  const containerRef = useRef(null);
  
  // Keep this specific useEffect that works
  useEffect(() => {
    if (!note) return;
    
    // Use requestAnimationFrame for better timing
    const scrollToTop = () => {
      if (containerRef.current) {
        containerRef.current.scrollTop = 0;
        console.log(`Set scroll to 0 for note ${note.id}`);
      }
    };
    
    // Try multiple times to ensure it works
    requestAnimationFrame(() => {
      scrollToTop();
      
      // Try again after a delay
      setTimeout(() => {
        scrollToTop();
        
        // And one more time
        setTimeout(scrollToTop, 100);
      }, 50);
    });
  }, [note?.id]);

  // Add a UI indicator for draft status (optional)
  const renderDraftIndicator = () => {
    if (isEditing && draftContent) {
      return (
        <Text size="xs" color="dimmed" style={{ marginTop: '8px', color: '#89939E' }}>
          Draft automatisch opgeslagen. Sla eerst je notitie op voordat je deze browser tab sluit.
        </Text>
      );
    }
    return null;
  };

  return (
    <div 
      className="noteview-container" 
      ref={containerRef}
      key={`container-${note.id}`}
    >
      <div className="note-view-container flex-column">
        <div className="note-view-header">
          <div className="note-view-option-menu flex-row">
              {isEditing &&(
                  <Tooltip color='#fefefe' style={{boxShadow: '0px 0px 20px 0px rgba(0, 0, 0, 0.11)', color: '#000000'}}  offset={10} withArrow label="Annuleer">
                      <div
                          onClick={handleCancel}
                          className="note-view-option edit-note-button"
                      >
                          <img src={NoteCancelIcon} alt="Annuleer" />
                      </div>
                  </Tooltip>
              )}

              <Tooltip color='#fefefe' style={{boxShadow: '0px 0px 20px 0px rgba(0, 0, 0, 0.11)', color: '#000000'}}  offset={10} withArrow label={isEditing ? "Notitie opslaan" : "Notitie bewerken"}>
                  <div
                      onClick={handleEditToggle}
                      className="note-view-option edit-note-button"
                  >
                  {isEditing ? (
                      <img src={NoteSaveIcon} alt="Save Note" />
                  ) : (
                      <img src={NoteEditIcon} alt="Edit Note" />
                      )}
                  </div>
              </Tooltip>
              {!isEditing && (
                <Tooltip color='#fefefe' style={{boxShadow: '0px 0px 20px 0px rgba(0, 0, 0, 0.11)', color: '#000000'}}  offset={10} withArrow label="Notitie naar chat">
                    <div
                        className="note-view-option edit-note-button"
                  >
                      <img src={NoteChatIcon} alt="Note to Chat" />
                  </div>
              </Tooltip>
              )}
              <Tooltip color='#fefefe' style={{boxShadow: '0px 0px 20px 0px rgba(0, 0, 0, 0.11)', color: '#000000'}}  offset={10} withArrow label="Notitie verwijderen">
                  <div
                  className="note-view-option edit-note-button"
                  onClick={handleDelete}
                  >
                      <img src={NoteDeleteIcon} alt="Delete Note" />
                  </div>
              </Tooltip>
          </div>
          {!isEditing && (
          <div 
              className="note-view-tags flex-row"
              style={{ 
                  '--subject-color': subjectColorsPrimary[(note?.folder || 'Uncategorized').toLowerCase()]
              }}
          >
              {note?.tags.map(tag => (
              <Notepreviewtag key={tag} tag={tag} subject={note?.folder} />
              ))}
          </div>
          )}
          <div className="note-view-title-section">
            <div className="note-view-title-container">
              {isEditing ? (
                  <div className="edit-mode-header">
                      <div className="edit-mode-title flex-row">
                          <div className="edit-mode-title-label">
                              Titel
                          </div>
                          <TextInput
                              ref={focusTrapRef}
                              value={editedTitle}
                              onChange={(e) => setEditedTitle(e.target.value)}
                              size="xl"
                              className="note-view-title-input"
                              style={{
                                  width: '100%',
                              }}
                          />
                      </div>
                      <div className="edit-mode-details">
                          <div 
                              className="edit-mode-tags flex-row"
                              style={{
                                  '--subject-color': subjectColors[(editedFolder || 'Uncategorized').toLowerCase()]
                              }}
                          >
                              <div className="edit-mode-tags-label">
                                  Tags
                              </div>
                              <TagsInput
                                  value={editedTags}
                                  onChange={setEditedTags}
                                  placeholder="Voeg tags toe en druk op enter"
                                  clearable
                                  className="note-view-tags-input"
                                  style={{
                                      '--tag-bg': subjectColorsPrimary[(editedFolder || 'Uncategorized').toLowerCase()],
                                  }}
                              />
                          </div>
                          <div className="edit-mode-dateInfo flex-row">
                              <div className="edit-mode-dateInfo-label">
                                  Aangemaakt
                              </div>
                              <div className="edit-mode-dateInfo-date">
                                  {formattedCreatedDate}
                              </div>
                          </div>
                          <div className="edit-mode-dateInfo flex-row">
                              <div className="edit-mode-dateInfo-label">
                                  Laatst gewijzigd
                              </div>
                              <div className="edit-mode-dateInfo-date">
                                  {formattedModifiedDate}
                              </div>
                          </div>
                          <div className="edit-mode-folder flex-row">
                              <div className="edit-mode-folder-label">
                                  Vak
                              </div>
                              <Select
                                  value={editedFolder || 'Uncategorized'}
                                  onChange={setEditedFolder}
                                  checkIconPosition="right"
                                  data={subjectOptions}
                                  clearable={false}
                                  defaultValue="Uncategorized"
                                  className="edit-mode-folder-select"
                                  styles={{
                                      input: {
                                          paddingLeft: '0px',
                                          width: '180px',
                                      },
                                  }}
                                  classNames={{
                                      dropdown: 'animated-dropdown'
                                  }}
                              />
                          </div>
                      </div>
                  </div>
              ) : (
                <div className="note-view-title">{note?.title}</div>
              )}
            </div>
            {!isEditing && (
              <div className="note-view-dates flex-row">
                <div className="note-date-item">Aangemaakt op {formattedCreatedDate}</div>
                <div className="dot"></div>
                <div className="note-date-item">Laatst gewijzigd op {formattedModifiedDate}</div>
                <div className="dot"></div>
                <div className="note-view-subject">{note?.folder}</div>
              </div>
            )}
          </div>
        </div>

        {!isEditing && (
          <>
            <div className="note-view-divider">.</div>
          </>
        )}
        
        {isEditing ? (
          // Edit mode view with rich text editor
          <>
            <RichTextEditor 
                editor={editor} 
                style={{ 
                    marginTop: '18px', 
                    width: '100%', 
                    maxWidth: '100%'}}
                classNames={{
                    root: 'custom-rich-text-editor',
                    toolbar: 'custom-rich-text-toolbar',
                    content: 'custom-rich-text-content'
                }}
            >
              <RichTextEditor.Toolbar sticky stickyOffset={0}>
                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.Bold />
                  <RichTextEditor.Italic />
                  <RichTextEditor.Underline />
                  <RichTextEditor.Strikethrough />
                  <RichTextEditor.ClearFormatting />
                  <RichTextEditor.Highlight />
                  <RichTextEditor.Code />
                </RichTextEditor.ControlsGroup>

                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.H1 />
                  <RichTextEditor.H2 />
                  <RichTextEditor.H3 />
                  <RichTextEditor.H4 />
                </RichTextEditor.ControlsGroup>

                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.Blockquote />
                  <RichTextEditor.Hr />
                  <RichTextEditor.BulletList />
                  <RichTextEditor.OrderedList />
                  <RichTextEditor.Subscript />
                  <RichTextEditor.Superscript />
                </RichTextEditor.ControlsGroup>

                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.Link />
                  <RichTextEditor.Unlink />
                </RichTextEditor.ControlsGroup>

                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.AlignLeft />
                  <RichTextEditor.AlignCenter />
                  <RichTextEditor.AlignJustify />
                  <RichTextEditor.AlignRight />
                </RichTextEditor.ControlsGroup>

                <RichTextEditor.ControlsGroup>
                  <ActionIcon onClick={handleAddImage} title="Add image">
                    <IconPhoto size={16} />
                  </ActionIcon>
                </RichTextEditor.ControlsGroup>
              </RichTextEditor.Toolbar>

              <RichTextEditor.Content 
                style={{
                //   minHeight: '400px',
                  maxWidth: '100%'
                }}
              />
            </RichTextEditor>
            
            {renderDraftIndicator()}
            
            <Group position="right" gap={18} spacing="md" style={{ marginTop: '1.5rem' }}>
              <Tooltip color='#fefefe' style={{boxShadow: '0px 0px 20px 0px rgba(0, 0, 0, 0.11)', color: '#000000'}}  offset={10} withArrow label="Annuleer">
                  <div
                      onClick={handleCancel}
                      className="note-view-option edit-note-button"
                  >
                      <img src={NoteCancelIcon} alt="Annuleer" />
                  </div>
              </Tooltip>

              <Tooltip color='#fefefe' style={{boxShadow: '0px 0px 20px 0px rgba(0, 0, 0, 0.11)', color: '#000000'}}  offset={10} withArrow label={isEditing ? "Notitie opslaan" : "Notitie bewerken"}>
                  <div
                      onClick={handleSave}
                      className="note-view-option edit-note-button"
                  >
                      <img src={NoteSaveIcon} alt="Save Note" />
                  </div>
              </Tooltip>
            </Group>
          </>
        ) : (
          // View mode
          <>
            <TypographyStylesProvider>
              <div 
                className="note-view-content"
                dangerouslySetInnerHTML={{ __html: sanitizedContent }}
              />
            </TypographyStylesProvider>
          </>
        )}
        {!isEditing && (
        <Blockquote 
          className="note-view-quote" 
          icon={quoteIcon} 
          color={subjectColorsPrimary[(note?.folder || 'Uncategorized').toLowerCase()]} 
          cite="– De StudyZone Team" 
          mt="xl"
        >
            Bij het aanpassen van een notitie gebruik <Kbd>⌘</Kbd> + <Kbd>K</Kbd> om vragen te stellen en antwoorden van de StudyZone direct in de notitie te verwerken. <br/><br/>
            Selecteer een stuk tekst om hier vragen over te stellen in de StudyZone.
          </Blockquote>
        )}
        <Footer />
      </div>
    </div>
  );
};

NoteView.propTypes = {
  note: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    folder: PropTypes.string.isRequired,
    dateCreated: PropTypes.string.isRequired,
    dateLastModified: PropTypes.string.isRequired,
    tags: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
  onSave: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  isEditing: PropTypes.bool.isRequired,
  startEditing: PropTypes.func.isRequired,
  stopEditing: PropTypes.func.isRequired,
};

export default NoteView;