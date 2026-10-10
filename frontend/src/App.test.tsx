import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import App from './App';

describe('salary management app', () => {
  it('shows the ACME dashboard and employee directory navigation', async () => {
    render(<ThemeProvider theme={createTheme()}><App /></ThemeProvider>);
    expect(screen.getByText('ACME')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('Good morning, HR team')).toBeInTheDocument());
    expect(screen.getByText('Employee directory')).toBeInTheDocument();
  });
});
