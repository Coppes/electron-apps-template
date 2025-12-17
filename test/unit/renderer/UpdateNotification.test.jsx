import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import React from 'react';
import UpdateNotification from '../../../src/renderer/components/UpdateNotification';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, defaultValue) => defaultValue || key,
  }),
}));

describe('UpdateNotification Component', () => {
  const defaultProps = {
    updateInfo: { version: '1.2.3', releaseNotes: 'Fixes and improvements' },
    status: 'available',
    onInstall: vi.fn(),
    onDismiss: vi.fn(),
  };

  it('renders nothing when status is null', () => {
    const { container } = render(<UpdateNotification {...defaultProps} status={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders update available state correctly', () => {
    render(<UpdateNotification {...defaultProps} status="available" />);
    expect(screen.getByText(/Update Available/i)).toBeInTheDocument();
    expect(screen.getByText(/1.2.3/i)).toBeInTheDocument();
    expect(screen.getByText(/Download/i)).toBeInTheDocument();
  });

  it('renders downloading state correctly', () => {
    render(<UpdateNotification {...defaultProps} status="downloading" />);
    expect(screen.getByText(/Downloading/i)).toBeInTheDocument();
    expect(screen.queryByText(/Install/i)).not.toBeInTheDocument();
  });

  it('renders ready to install state correctly', () => {
    render(<UpdateNotification {...defaultProps} status="ready" />);
    expect(screen.getByText(/Ready to Install/i)).toBeInTheDocument();
    expect(screen.getByText(/Install & Restart/i)).toBeInTheDocument();
  });

  it('calls onInstall when install button is clicked', () => {
    render(<UpdateNotification {...defaultProps} status="ready" />);
    fireEvent.click(screen.getByText(/Install & Restart/i));
    expect(defaultProps.onInstall).toHaveBeenCalled();
  });

  it('calls onDismiss when dismiss button is clicked', () => {
    render(<UpdateNotification {...defaultProps} status="available" />);
    fireEvent.click(screen.getByLabelText(/Close/i)); // Assuming X icon has aria-label/title or we use testid
    expect(defaultProps.onDismiss).toHaveBeenCalled();
  });
});
