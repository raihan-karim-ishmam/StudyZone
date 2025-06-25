import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
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

// Wrap the entire component with React.memo to prevent unnecessary re-renders
const NoteView = memo(({ 
  note, 
  onSave, 
  onDelete, 
  isEditing, 
  startEditing, 
  stopEditing,
}) => {
  const { user } = useUser();
  
  // Add the missing titleInputRef
  const titleInputRef = useRef(null);
  const editorRef = useRef(null);
  const draftTimerRef = useRef(null);
  
  // Use refs to prevent state loss during re-renders
  const titleRef = useRef(note.title);
  const tagsRef = useRef(note.tags || []);
  const folderRef = useRef(note.folder || 'Uncategorized');

  // Local state that's completely isolated
  const [localTitle, setLocalTitle] = useState(() => note.title);
  const [localTags, setLocalTags] = useState(() => note.tags || []);
  const [localFolder, setLocalFolder] = useState(() => note.folder || 'Uncategorized');
  const [draftContent, setDraftContent] = useState(null);

  // Only update when switching to a different note (not on re-renders)
  const lastNoteIdRef = useRef(note.id);
  
  useEffect(() => {
    if (note.id !== lastNoteIdRef.current) {
      // Switching to different note - update local state
      setLocalTitle(note.title);
      setLocalTags(note.tags || []);
      setLocalFolder(note.folder || 'Uncategorized');
      lastNoteIdRef.current = note.id;
    }
  }, [note.id]);

  const focusTrapRef = useFocusTrap();
  
  // Memoize derived values to prevent recalculation on every render
  const lowerCaseSubject = useMemo(() => (localFolder || 'Uncategorized').toLowerCase(), [localFolder]);
  const formattedCreatedDate = useMemo(() => dayjs(note.dateCreated).format('DD-MM-YYYY'), [note.dateCreated]);
  const formattedModifiedDate = useMemo(() => dayjs(note.dateLastModified).format('DD-MM-YYYY'), [note.dateLastModified]);
  const sanitizedContent = useMemo(() => DOMPurify.sanitize(note.content), [note.content]);

  // Memoize the editor configuration to prevent recreation on every render
  const editorConfig = useMemo(() => ({
    extensions: [
      StarterKit,
      Underline,
      Link,
      Superscript,
      SubScript,
      Highlight,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Image,
    ],
    content: note.content,
    onUpdate: ({ editor }) => {
      // Optional debugging
      // console.log(editor.getHTML());
    },
  }), [note.content]);

  // Initialize the rich text editor with stable config
  const editor = useEditor(editorConfig);
  
  // First define handleSave and handleCancel
  const handleSave = useCallback(() => {
    if (editor) {
      // Use "Uncategorized" as default if no folder is selected
      const finalFolder = !localFolder || localFolder.trim() === '' ? 'Uncategorized' : localFolder;
      
      // If title is empty, use "folder Notitie" as default (using the final folder)
      const finalTitle = localTitle.trim() === '' ? `${finalFolder} Notitie` : localTitle;
      
      onSave({
        ...note,
        title: finalTitle,
        content: editor.getHTML(),
        tags: localTags,
        folder: finalFolder,
        dateLastModified: new Date().toISOString()
      });
    }
    stopEditing();
  }, [editor, localFolder, localTitle, localTags, note, onSave, stopEditing]);

  const handleCancel = useCallback(() => {
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
        notifications.show({
          title: 'Doorgaan met bewerken',
          message: 'U kunt verder gaan met het bewerken van de notitie',
          color: 'green',
          autoClose: 3000,
        });
      },
      onConfirm: () => {
        // Clear the draft
        const draftKey = `note_draft_${note.id}`;
        localStorage.removeItem(draftKey);
        setLocalTags(note.tags || []);
        setLocalFolder(note.folder || 'Uncategorized');
        
        // If editor is available, reset content to original note content
        if (editor) {
          editor.commands.setContent(note.content);
        }
        
        // Reset edited fields to original values
        if (!note.title || note.title.trim() === '') {
          setLocalTitle(`${note.folder} Notitie`);
          
          onSave({
            ...note,
            title: `${note.folder} Notitie`,
            dateLastModified: new Date().toISOString()
          });
        } else {
          setLocalTitle(note.title);
        }
        
        stopEditing();
        
        notifications.show({
          title: 'Bewerking geannuleerd',
          message: 'Alle wijzigingen zijn ongedaan gemaakt',
          color: 'gray',
          autoClose: 3000,
        });
      },
    });
  }, [editor, note, onSave, stopEditing]);

  const handleDelete = useCallback(() => {
    onDelete(note.id);
  }, [onDelete, note.id]);

  // Now define handleEditToggle AFTER handleSave is defined
  const handleEditToggle = useCallback(() => {
    if (isEditing) {
      handleSave();
    } else {
      setLocalTitle(note.title);
      setLocalTags(note.tags || []);
      setLocalFolder(note.folder || 'Uncategorized');
      startEditing();
    }
  }, [isEditing, handleSave, note.title, note.tags, note.folder, startEditing]);

  // Then define the image handlers that were defined earlier
  const handleAddImage = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (event) => {
      if (event.target.files?.length) {
        const file = event.target.files[0];
        const reader = new FileReader();
        
        reader.onload = () => {
          if (editor) {
            const img = document.createElement('img');
            img.src = reader.result;
            
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
  }, [editor]);

  const handleImageFile = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (editor) {
        editor.chain().focus().setImage({ src: e.target.result }).run();
      }
    };
    reader.readAsDataURL(file);
  }, [editor]);

  // Update editor content only when necessary (not on every render)
  useEffect(() => {
    if (editor && isEditing && note.content !== editor.getHTML()) {
      editor.commands.setContent(note.content);
    }
  }, [editor, note.id, isEditing]); // Only depend on note.id, not entire note object
  
  // Stable paste handler
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
    
    const editorElement = editor.view.dom;
    editorElement.addEventListener('paste', handlePaste);
    
    return () => {
      editorElement.removeEventListener('paste', handlePaste);
    };
  }, [editor, isEditing, handleImageFile]);
  
  // Stable drag and drop handler
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
      event.preventDefault();
    };
    
    const editorElement = editor.view.dom;
    editorElement.addEventListener('drop', handleDrop);
    editorElement.addEventListener('dragover', handleDragOver);
    
    return () => {
      editorElement.removeEventListener('drop', handleDrop);
      editorElement.removeEventListener('dragover', handleDragOver);
    };
  }, [editor, isEditing, handleImageFile]);

  // Draft saving logic with stable dependencies
  useEffect(() => {
    if (isEditing && editor) {
      const draftKey = `note_draft_${note.id}`;
      const savedDraft = localStorage.getItem(draftKey);
      
      if (savedDraft) {
        try {
          const draftData = JSON.parse(savedDraft);
          if (draftData.content && draftData.timestamp) {
            const draftAge = Date.now() - draftData.timestamp;
            if (draftAge < 24 * 60 * 60 * 1000) {
              editor.commands.setContent(draftData.content);
              console.log('Restored draft from', new Date(draftData.timestamp));
            } else {
              localStorage.removeItem(draftKey);
            }
          }
        } catch (error) {
          console.error('Error restoring draft:', error);
          localStorage.removeItem(draftKey);
        }
      }
    }
  }, [editor, isEditing, note.id]); // Only depend on note.id, not entire note object

  const quoteIcon = <IconInfoCircle />;
  
  // Prepare subject data for the Select component
  const subjectOptions = user.subjects.map(subject => ({
    value: subject,
    label: subject
  }));

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
    if (isEditing && editor) {
      return (
        <Text size="xs" color="dimmed" style={{ marginTop: '8px', color: '#89939E' }}>
          Draft automatisch opgeslagen. Sla eerst je notitie op voordat je deze browser tab sluit.
        </Text>
      );
    }
    return null;
  };

  // Handle successful save - clear the draft
  const handleSaveSuccess = useCallback(() => {
    const draftKey = `note_draft_${note.id}`;
    localStorage.removeItem(draftKey);
    console.log('Draft cleared after successful save');
  }, [note.id]);

  // Add this effect to update editedTags when note changes
  useEffect(() => {
    if (note?.tags) {
      setLocalTags(note.tags);
    }
  }, [note.id, note.tags]); // Use note.id instead of entire note

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
      setLocalFolder(note.folder || 'Uncategorized');
    }
  }, [note.id, note.folder]); // Use note.id instead of entire note

  // Add or modify this useEffect to update editedTitle when note changes
  useEffect(() => {
    // Update editedTitle whenever the note changes or edit mode is entered
    if (note) {
      setLocalTitle(note.title);
    }
  }, [note.id, note.title]); // Use note.id instead of entire note

  // Stable event handlers
  const handleTitleChange = useCallback((event) => {
    const newTitle = event.currentTarget.value;
    setLocalTitle(newTitle);
    titleRef.current = newTitle;
  }, []);

  const handleTagsChange = useCallback((newTags) => {
    setLocalTags(newTags);
    tagsRef.current = newTags;
  }, []);

  const handleFolderChange = useCallback((newFolder) => {
    setLocalFolder(newFolder || '');
    folderRef.current = newFolder || '';
  }, []);

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
                              ref={titleInputRef}
                              value={localTitle}
                              onChange={handleTitleChange}
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
                                  '--subject-color': subjectColors[(localFolder || 'Uncategorized').toLowerCase()]
                              }}
                          >
                              <div className="edit-mode-tags-label">
                                  Tags
                              </div>
                              <TagsInput
                                  value={localTags}
                                  onChange={handleTagsChange}
                                  placeholder="Voeg tags toe en druk op enter"
                                  clearable
                                  className="note-view-tags-input"
                                  style={{
                                      '--tag-bg': subjectColorsPrimary[(localFolder || 'Uncategorized').toLowerCase()],
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
                                  value={localFolder || 'Uncategorized'}
                                  onChange={handleFolderChange}
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
}, (prevProps, nextProps) => {
  // Only re-render if note ID changes or editing state changes
  return (
    prevProps.note.id === nextProps.note.id &&
    prevProps.isEditing === nextProps.isEditing &&
    prevProps.onSave === nextProps.onSave &&
    prevProps.onDelete === nextProps.onDelete &&
    prevProps.startEditing === nextProps.startEditing &&
    prevProps.stopEditing === nextProps.stopEditing
  );
});

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