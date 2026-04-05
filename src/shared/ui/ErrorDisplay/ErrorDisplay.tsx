'use client';

import { Snackbar } from '@mui/material';
import { useError, ErrorType } from '@/shared/context/ErrorContext';

interface ErrorDisplayProps {
  position?:
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right';
  autoHideDuration?: number;
}

const getSnackbarPosition = (
  position: ErrorDisplayProps['position']
): { vertical: 'top' | 'bottom'; horizontal: 'left' | 'center' | 'right' } => {
  switch (position) {
    case 'top-left':
      return { vertical: 'top', horizontal: 'left' };
    case 'top-center':
      return { vertical: 'top', horizontal: 'center' };
    case 'top-right':
      return { vertical: 'top', horizontal: 'right' };
    case 'bottom-left':
      return { vertical: 'bottom', horizontal: 'left' };
    case 'bottom-center':
      return { vertical: 'bottom', horizontal: 'center' };
    case 'bottom-right':
      return { vertical: 'bottom', horizontal: 'right' };
    default:
      return { vertical: 'top', horizontal: 'center' };
  }
};

export const ErrorDisplay = ({
  position = 'top-center',
  autoHideDuration = 6000,
}: ErrorDisplayProps) => {
  const { errors, clearError } = useError();

  if (errors.length === 0) return null;

  const latestError = errors[errors.length - 1];

  return (
    <Snackbar
      open={true}
      autoHideDuration={autoHideDuration}
      onClose={() => clearError(latestError.id)}
      anchorOrigin={getSnackbarPosition(position)}
      message={latestError.message}
    />
  );
};
