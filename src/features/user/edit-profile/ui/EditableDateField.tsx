'use client';
import { TextField, IconButton, Box } from '@mui/material';
import { Edit, Check, Close } from '@mui/icons-material';
import { useState } from 'react';

interface EditableDateFieldProps {
  label: string;
  value: string;
  onSave: (value: string) => Promise<void>;
}

export const EditableDateField = ({ label, value, onSave }: EditableDateFieldProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (editValue === value) {
      setIsEditing(false);
      return;
    }

    setIsLoading(true);
    try {
      await onSave(editValue);
      setIsEditing(false);
    } catch (error) {
      console.error('Save failed:', error);
      setEditValue(value);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
        <TextField
          fullWidth
          label={label}
          type="date"
          value={editValue}
          onChange={e => setEditValue(e.target.value)}
          autoFocus
          disabled={isLoading}
          InputLabelProps={{ shrink: true }}
        />
        <IconButton onClick={handleSave} color="primary" disabled={isLoading} size="small">
          <Check />
        </IconButton>
        <IconButton onClick={handleCancel} disabled={isLoading} size="small">
          <Close />
        </IconButton>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
      <TextField
        fullWidth
        label={label}
        value={value || 'Не указано'}
        InputProps={{ readOnly: true }}
        variant="outlined"
      />
      <IconButton onClick={() => setIsEditing(true)} size="small" sx={{ mt: 1 }}>
        <Edit />
      </IconButton>
    </Box>
  );
};
