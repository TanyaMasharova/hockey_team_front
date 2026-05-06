import { Box } from '@mui/material';
import styles from './ViewModeField.module.css';

interface ViewModeFieldProps {
  label: string;
  value: string | null;
  onClick: () => void;
  formatValue?: (value: string | null) => string;
}

export const ViewModeField = ({ label, value, onClick, formatValue }: ViewModeFieldProps) => {
  const displayValue = formatValue ? formatValue(value) : value || '—';

  return (
    <div className={styles.viewMode} onClick={onClick}>
      <Box sx={{ color: 'text.secondary', fontSize: 12, mb: 0.5 }}>{label}</Box>
      <Box>{displayValue}</Box>
    </div>
  );
};
