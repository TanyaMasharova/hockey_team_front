import { useState } from 'react';
import { TextField, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import InputMask from 'react-input-mask';
import { ViewModeField } from '@/shared/ui/ViewModeField/ViewModeField';
import styles from './EditableField.module.css';

interface EditableFieldProps {
  label: string;
  value: string;
  onSave: (newValue: string) => void;
  type?: 'text' | 'email' | 'tel';
  mask?: string;
}

export const EditableField = ({
  label,
  value,
  onSave,
  type = 'text',
  mask,
}: EditableFieldProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = () => {
    onSave(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className={styles.fieldWithEdit}>
        <div className={styles.fieldWrapper}>
          {mask ? (
            <InputMask
              mask={mask}
              maskChar="_"
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
            >
              {(inputProps: any) => (
                <TextField {...inputProps} fullWidth label={label} type={type} autoFocus />
              )}
            </InputMask>
          ) : (
            <TextField
              fullWidth
              label={label}
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              type={type}
              autoFocus
            />
          )}
        </div>
        <div className={styles.editIcon}>
          <IconButton onClick={handleSave} color="primary" size="small">
            <SaveIcon />
          </IconButton>
          <IconButton onClick={handleCancel} color="error" size="small">
            <CancelIcon />
          </IconButton>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.fieldWithEdit}>
      <div className={styles.fieldWrapper}>
        <ViewModeField label={label} value={value} onClick={() => setIsEditing(true)} />
      </div>
      <div className={styles.editIcon}>
        <IconButton onClick={() => setIsEditing(true)} size="small">
          <EditIcon />
        </IconButton>
      </div>
    </div>
  );
};
