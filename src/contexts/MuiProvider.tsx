import React, { useMemo } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ar, enUS } from 'date-fns/locale';
import { useLanguage } from './LanguageContext';
import type {} from '@mui/x-date-pickers/themeAugmentation';

export const MuiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAr, dir } = useLanguage();

  const theme = useMemo(
    () =>
      createTheme({
        direction: dir as 'rtl' | 'ltr',
        typography: {
          fontFamily: 'inherit',
        },
        components: {
          MuiOutlinedInput: {
            styleOverrides: {
              root: {
                borderRadius: '0.75rem',
                backgroundColor: 'transparent',
                '& fieldset': {
                  border: 'none', // We use our own border from Tailwind wrapper
                },
              },
            },
          },
          MuiPickerPopper: {
            styleOverrides: {
              paper: {
                borderRadius: '1rem',
                boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
              },
            },
          },
          MuiButtonBase: {
            styleOverrides: {
              root: {
                fontFamily: 'inherit',
              },
            },
          },
          MuiPickerDay: {
            styleOverrides: {
              root: {
                fontSize: '0.875rem',
                fontWeight: 'bold',
              },
            },
          },
        },
      }),
    [dir]
  );

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider 
        dateAdapter={AdapterDateFns} 
        adapterLocale={isAr ? ar : enUS}
      >
        {children}
      </LocalizationProvider>
    </ThemeProvider>
  );
};
