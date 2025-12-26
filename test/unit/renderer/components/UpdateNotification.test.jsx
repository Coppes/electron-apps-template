import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import UpdateNotification from '../../../../src/renderer/components/shared/UpdateNotification';

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

      expect(screen.getByText('update.available.title')).toBeInTheDocument();
      expect(screen.getByText(/update.available.message/i)).toBeInTheDocument();
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

      expect(screen.getByText("update.available.release_notes")).toBeInTheDocument();
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

      expect(screen.getByRole('button', { name: /update.download_btn/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /update.later/i })).toBeInTheDocument();
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

      const downloadButton = screen.getByRole('button', { name: /update.download_btn/i });
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

      const laterButton = screen.getByRole('button', { name: /update.later/i });
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

      expect(screen.getByText('update.download.title')).toBeInTheDocument();
      expect(screen.getByText(/update.download.message/i)).toBeInTheDocument();
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

      expect(screen.getByRole('button', { name: /update.download.hide/i })).toBeInTheDocument();
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

      const hideButton = screen.getByRole('button', { name: /update.download.hide/i });
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

      expect(screen.getByText('update.ready.title')).toBeInTheDocument();
      expect(screen.getByText(/update.ready.message/i)).toBeInTheDocument();
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

      expect(screen.getByRole('button', { name: /update.ready.install/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /update.later/i })).toBeInTheDocument();
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

      const installButton = screen.getByRole('button', { name: /update.ready.install/i });
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

      const laterButton = screen.getByRole('button', { name: /update.later/i });
      fireEvent.click(laterButton);

      expect(mockOnDismiss).toHaveBeenCalledTimes(1);
    });
  });
});
