import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UpdateNotification } from '../../../../src/renderer/components/UpdateNotification';

describe('UpdateNotification Component', () => {
  const mockUpdateInfo = {
    version: '2.0.0',
    releaseNotes: 'Bug fixes and improvements',
  };

  const mockOnInstall = vi.fn();
  const mockOnDismiss = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return null when no updateInfo is provided', () => {
    const { container } = render(
      <UpdateNotification
        updateInfo={null}
        status="available"
        onInstall={mockOnInstall}
        onDismiss={mockOnDismiss}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should return null when no status is provided', () => {
    const { container } = render(
      <UpdateNotification
        updateInfo={mockUpdateInfo}
        status={null}
        onInstall={mockOnInstall}
        onDismiss={mockOnDismiss}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  describe('available status', () => {
    it('should display update available message', () => {
      render(
        <UpdateNotification
          updateInfo={mockUpdateInfo}
          status="available"
          onInstall={mockOnInstall}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.getByText('Update Available')).toBeInTheDocument();
      expect(screen.getByText(/Version 2.0.0 is available/i)).toBeInTheDocument();
    });

    it('should display release notes when provided', () => {
      render(
        <UpdateNotification
          updateInfo={mockUpdateInfo}
          status="available"
          onInstall={mockOnInstall}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.getByText("What's new?")).toBeInTheDocument();
      expect(screen.getByText('Bug fixes and improvements')).toBeInTheDocument();
    });

    it('should have Download and Later buttons', () => {
      render(
        <UpdateNotification
          updateInfo={mockUpdateInfo}
          status="available"
          onInstall={mockOnInstall}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.getByRole('button', { name: /Download/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Later/i })).toBeInTheDocument();
    });

    it('should call onInstall when Download is clicked', () => {
      render(
        <UpdateNotification
          updateInfo={mockUpdateInfo}
          status="available"
          onInstall={mockOnInstall}
          onDismiss={mockOnDismiss}
        />
      );

      const downloadButton = screen.getByRole('button', { name: /Download/i });
      fireEvent.click(downloadButton);

      expect(mockOnInstall).toHaveBeenCalledTimes(1);
    });

    it('should call onDismiss when Later is clicked', () => {
      render(
        <UpdateNotification
          updateInfo={mockUpdateInfo}
          status="available"
          onInstall={mockOnInstall}
          onDismiss={mockOnDismiss}
        />
      );

      const laterButton = screen.getByRole('button', { name: /Later/i });
      fireEvent.click(laterButton);

      expect(mockOnDismiss).toHaveBeenCalledTimes(1);
    });
  });

  describe('downloading status', () => {
    it('should display downloading message', () => {
      render(
        <UpdateNotification
          updateInfo={mockUpdateInfo}
          status="downloading"
          progress={{ percent: 50, transferred: 5000000, total: 10000000 }}
          onInstall={mockOnInstall}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.getByText('Downloading Update')).toBeInTheDocument();
      expect(screen.getByText(/Downloading version 2.0.0/i)).toBeInTheDocument();
    });

    it('should display progress bar with percentage', () => {
      render(
        <UpdateNotification
          updateInfo={mockUpdateInfo}
          status="downloading"
          progress={{ percent: 75, transferred: 7500000, total: 10000000 }}
          onInstall={mockOnInstall}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('should have Hide button', () => {
      render(
        <UpdateNotification
          updateInfo={mockUpdateInfo}
          status="downloading"
          progress={{ percent: 50, transferred: 5000000, total: 10000000 }}
          onInstall={mockOnInstall}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.getByRole('button', { name: /Hide/i })).toBeInTheDocument();
    });

    it('should call onDismiss when Hide is clicked', () => {
      render(
        <UpdateNotification
          updateInfo={mockUpdateInfo}
          status="downloading"
          progress={{ percent: 50, transferred: 5000000, total: 10000000 }}
          onInstall={mockOnInstall}
          onDismiss={mockOnDismiss}
        />
      );

      const hideButton = screen.getByRole('button', { name: /Hide/i });
      fireEvent.click(hideButton);

      expect(mockOnDismiss).toHaveBeenCalledTimes(1);
    });
  });

  describe('ready status', () => {
    it('should display ready to install message', () => {
      render(
        <UpdateNotification
          updateInfo={mockUpdateInfo}
          status="ready"
          onInstall={mockOnInstall}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.getByText('Update Ready to Install')).toBeInTheDocument();
      expect(screen.getByText(/Version 2.0.0 has been downloaded/i)).toBeInTheDocument();
    });

    it('should have Install & Restart and Later buttons', () => {
      render(
        <UpdateNotification
          updateInfo={mockUpdateInfo}
          status="ready"
          onInstall={mockOnInstall}
          onDismiss={mockOnDismiss}
        />
      );

      expect(screen.getByRole('button', { name: /Install & Restart/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Later/i })).toBeInTheDocument();
    });

    it('should call onInstall when Install & Restart is clicked', () => {
      render(
        <UpdateNotification
          updateInfo={mockUpdateInfo}
          status="ready"
          onInstall={mockOnInstall}
          onDismiss={mockOnDismiss}
        />
      );

      const installButton = screen.getByRole('button', { name: /Install & Restart/i });
      fireEvent.click(installButton);

      expect(mockOnInstall).toHaveBeenCalledTimes(1);
    });

    it('should call onDismiss when Later is clicked', () => {
      render(
        <UpdateNotification
          updateInfo={mockUpdateInfo}
          status="ready"
          onInstall={mockOnInstall}
          onDismiss={mockOnDismiss}
        />
      );

      const laterButton = screen.getByRole('button', { name: /Later/i });
      fireEvent.click(laterButton);

      expect(mockOnDismiss).toHaveBeenCalledTimes(1);
    });
  });
});
