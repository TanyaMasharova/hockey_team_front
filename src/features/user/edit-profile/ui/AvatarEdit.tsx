import { useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import styles from './AvatarEdit.module.css';
import { useRouter } from 'next/navigation';
import LogoutIcon from '@mui/icons-material/Logout';

interface AvatarEditProps {
  avatarUrl?: string;
  onAvatarChange: (newAvatarUrl: string) => void;
}

export const AvatarEdit = ({ avatarUrl, onAvatarChange }: AvatarEditProps) => {
  const [open, setOpen] = useState(false);
  const [tempAvatarUrl, setTempAvatarUrl] = useState(avatarUrl || '');
  const router = useRouter();

  const handleLogout = () => {
    // Очистить токен, сделать logout запрос и т.д.
    localStorage.removeItem('token');
    // или api.post('/auth/logout');
    router.push('/login');
  };

  const handleSave = () => {
    onAvatarChange(tempAvatarUrl);
    setOpen(false);
  };

  return (
    <>
      <div className={styles.avatarContainer}>
        <Avatar
          src={avatarUrl}
          sx={{ width: 120, height: 120, cursor: 'pointer' }}
          onClick={() => setOpen(true)}
        />

        <Button
          variant="outlined"
          color="error"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          sx={{ mt: 2 }}
          style={{ alignSelf: 'center' }}
        >
          Выйти
        </Button>
      </div>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Изменить аватар</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="URL аватара"
            value={tempAvatarUrl}
            onChange={e => setTempAvatarUrl(e.target.value)}
            margin="normal"
            placeholder="https://example.com/avatar.jpg"
          />
          {tempAvatarUrl && (
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
              <Avatar src={tempAvatarUrl} sx={{ width: 100, height: 100 }} />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Отмена</Button>
          <Button onClick={handleSave} variant="contained">
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
