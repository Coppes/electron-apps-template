import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Onboarding from '../../../../src/renderer/components/Onboarding';

// Mocks are already handled partly by setup, but we need specific store behavior
const mockStoreGet = vi.fn();
const mockStoreSet = vi.fn();

// Mock electronAPI if not fully covered specific to this test needs
window.electronAPI = {
  store: {
    get: mockStoreGet,
    set: mockStoreSet,
  },
};

describe('Onboarding', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render if onboarding is already completed', async () => {
    mockStoreGet.mockResolvedValue(true);
    render(<Onboarding />);

    await waitFor(() => {
      expect(mockStoreGet).toHaveBeenCalledWith('onboardingCompleted');
    });

    // Should be empty as it returns null
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should render if onboarding is not completed', async () => {
    mockStoreGet.mockResolvedValue(false);
    render(<Onboarding />);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    expect(screen.getByText('Welcome to Electron App')).toBeInTheDocument();
  });

  it('should navigate through steps', async () => {
    mockStoreGet.mockResolvedValue(false);
    render(<Onboarding />);

    await waitFor(() => screen.getByRole('dialog'));

    // Step 1: Welcome
    expect(screen.getByText('Welcome to Electron App')).toBeInTheDocument();

    // Click Next
    fireEvent.click(screen.getByText('Next'));

    // Step 2: Security
    expect(screen.getByText('Secure by Default')).toBeInTheDocument();
  });

  it('should complete onboarding when "Get Started" is clicked', async () => {
    mockStoreGet.mockResolvedValue(false);
    render(<Onboarding />);

    await waitFor(() => screen.getByRole('dialog'));

    // Navigate to last step (0 -> 1 -> 2 -> 3)
    fireEvent.click(screen.getByText('Next')); // to 1
    fireEvent.click(screen.getByText('Next')); // to 2
    fireEvent.click(screen.getByText('Next')); // to 3 (Shortcuts)

    const finishButton = screen.getByText('Get Started');
    fireEvent.click(finishButton);

    await waitFor(() => {
      expect(mockStoreSet).toHaveBeenCalledWith('onboardingCompleted', true);
    });
  });

  it('should complete onboarding when "Skip" is clicked', async () => {
    mockStoreGet.mockResolvedValue(false);
    render(<Onboarding />);

    await waitFor(() => screen.getByRole('dialog'));

    const skipButton = screen.getByText('Skip');
    fireEvent.click(skipButton);

    await waitFor(() => {
      expect(mockStoreSet).toHaveBeenCalledWith('onboardingCompleted', true);
    });
  });
});
