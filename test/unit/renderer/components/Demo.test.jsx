import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Demo from '../../../../src/renderer/components/Demo';

describe('Demo Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render window management section', () => {
    render(<Demo />);

    expect(screen.getByText('Window Management API')).toBeInTheDocument();
    expect(screen.getByText(/Control window state using the new windowAPI/i)).toBeInTheDocument();
  });

  it('should render dialog section', () => {
    render(<Demo />);

    expect(screen.getByText('Dialog API')).toBeInTheDocument();
    expect(screen.getByText(/Show native dialogs using the new dialogAPI/i)).toBeInTheDocument();
  });

  it('should have window management buttons', () => {
    render(<Demo />);

    expect(screen.getByRole('button', { name: /Minimize Window/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Maximize\/Restore/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Get Window State/i })).toBeInTheDocument();
  });

  it('should have dialog buttons', () => {
    render(<Demo />);

    expect(screen.getByRole('button', { name: /Show Message Dialog/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Show Error Dialog/i })).toBeInTheDocument();
  });

  it('should call window.minimize when minimize button is clicked', async () => {
    render(<Demo />);

    const button = screen.getByRole('button', { name: /Minimize Window/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(window.electronAPI.window.minimize).toHaveBeenCalled();
    });
  });

  it('should show success message after minimize', async () => {
    render(<Demo />);

    const button = screen.getByRole('button', { name: /Minimize Window/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/✓ Window minimized/i)).toBeInTheDocument();
    });
  });

  it('should call window.maximize when maximize button is clicked', async () => {
    render(<Demo />);

    const button = screen.getByRole('button', { name: /Maximize\/Restore/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(window.electronAPI.window.maximize).toHaveBeenCalled();
    });
  });

  it('should call window.getState when get state button is clicked', async () => {
    render(<Demo />);

    const button = screen.getByRole('button', { name: /Get Window State/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(window.electronAPI.window.getState).toHaveBeenCalled();
    });
  });

  it('should display window state information', async () => {
    render(<Demo />);

    const button = screen.getByRole('button', { name: /Get Window State/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/Window: Normal/i)).toBeInTheDocument();
      expect(screen.getByText(/Size: 800x600/i)).toBeInTheDocument();
    });
  });

  it('should call dialog.message when show message button is clicked', async () => {
    render(<Demo />);

    const button = screen.getByRole('button', { name: /Show Message Dialog/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(window.electronAPI.dialog.message).toHaveBeenCalledWith({
        type: 'info',
        title: 'Demo Dialog',
        message: 'This is a native dialog from the new Dialog API!',
        buttons: ['OK', 'Cancel'],
      });
    });
  });

  it('should call dialog.error when show error button is clicked', async () => {
    render(<Demo />);

    const button = screen.getByRole('button', { name: /Show Error Dialog/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(window.electronAPI.dialog.error).toHaveBeenCalledWith({
        title: 'Demo Error',
        content: 'This is an error dialog example',
      });
    });
  });
});