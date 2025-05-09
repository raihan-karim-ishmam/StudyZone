import React, { useState } from 'react';
import { RichTextEditor } from '@mantine/tiptap';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { Button, TextInput, Group, Box, ActionIcon } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';

import '@mantine/tiptap/styles.css';
import '../../../styles/Notities/macro/Editnote.scss';

const Editnote = ({ note, onClose, onSave }) => {
  const [title, setTitle] = useState(note.title);
  
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
    ],
    content: note.content,
  });

  const handleSave = () => {
    if (!editor) return;
    
    const updatedNote = {
      ...note,
      title,
      content: editor.getHTML(),
      dateLastModified: new Date().toISOString(),
    };
    
    onSave(updatedNote);
    onClose();
  };

  return (
    <div className="editnote-container">
      <div className="editnote-header">
        <Group position="apart" mb="md">
          <ActionIcon variant="transparent" onClick={onClose}>
            <IconArrowLeft size={24} />
          </ActionIcon>
          <Button variant="filled" color="blue" onClick={handleSave}>
            Opslaan
          </Button>
        </Group>
        
        <TextInput
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titel van de notitie"
          size="lg"
          mb="md"
        />
      </div>
      
      <Box className="editnote-content">
        <RichTextEditor editor={editor}>
          <RichTextEditor.Toolbar sticky stickyOffset={60}>
            <RichTextEditor.ControlsGroup>
              <RichTextEditor.Bold />
              <RichTextEditor.Italic />
              <RichTextEditor.Underline />
              <RichTextEditor.Strikethrough />
              <RichTextEditor.ClearFormatting />
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
            </RichTextEditor.ControlsGroup>
          </RichTextEditor.Toolbar>

          <RichTextEditor.Content />
        </RichTextEditor>
      </Box>
    </div>
  );
};

export default Editnote;
