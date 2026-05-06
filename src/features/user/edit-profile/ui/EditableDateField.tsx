import { useState } from 'react';
import { IconButton } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import { ViewModeField } from '@/shared/ui/ViewModeField/ViewModeField';
import styles from './EditableField.module.css';

interface EditableDateFieldProps {
  label: string;
  value: string | null;
  onSave: (newValue: string | null) => void;
}

export const EditableDateField = ({ label, value, onSave }: EditableDateFieldProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState<dayjs.Dayjs | null>(value ? dayjs(value) : null);

  const handleSave = () => {
    onSave(editValue ? editValue.format('YYYY-MM-DD') : null);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value ? dayjs(value) : null);
    setIsEditing(false);
  };

  const formatDate = (val: string | null) => (val ? dayjs(val).format('DD.MM.YYYY') : '—');

  if (isEditing) {
    return (
      <div className={styles.fieldWithEdit}>
        <div className={styles.fieldWrapper}>
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ru">
            <DatePicker
              label={label}
              value={editValue}
              onChange={newValue => setEditValue(newValue)}
              openTo="year"
              views={['year', 'month', 'day']}
              slotProps={{
                textField: { fullWidth: true },
                actionBar: { actions: ['clear', 'today', 'accept'] },
              }}
            />
          </LocalizationProvider>
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
        <ViewModeField
          label={label}
          value={value}
          onClick={() => setIsEditing(true)}
          formatValue={formatDate}
        />
      </div>
      <div className={styles.editIcon}>
        <IconButton onClick={() => setIsEditing(true)} size="small">
          <EditIcon />
        </IconButton>
      </div>
    </div>
  );
};
