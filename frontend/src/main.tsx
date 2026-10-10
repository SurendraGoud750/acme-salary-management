import React from 'react';
import ReactDOM from 'react-dom/client';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import App from './App';
import './styles.css';

const theme = createTheme({
  palette: { mode: 'light', primary: { main: '#4f46e5' }, background: { default: '#f5f7fb', paper: '#ffffff' }, text: { primary: '#182230', secondary: '#697586' } },
  typography: { fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', button: { textTransform: 'none', fontWeight: 600 } },
  shape: { borderRadius: 12 },
  components: { MuiCard: { styleOverrides: { root: { border: '1px solid #e8edf4', boxShadow: '0 4px 18px rgba(22,34,51,.035)' } } } }
});
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><ThemeProvider theme={theme}><CssBaseline /><App /></ThemeProvider></React.StrictMode>);
