import React, { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSettings } from './SettingsContext';
import { TOUR_STEPS } from '../config/tour-steps';

const TourContext = createContext({
  isOpen: false,
  currentStep: 0,
  steps: [],
  startTour: () => { },
  closeTour: () => { },
  nextStep: () => { },
  prevStep: () => { },
  completeTour: () => { },
});

export const useTour = () => useContext(TourContext);

export const TourProvider = ({ children }) => {
  const { settings, updateSetting } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Auto-start tour if not completed
  useEffect(() => {
    // Check if settings loaded and tour not completed
    if (settings && settings.hasCompletedTour === false) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [settings]);

  const startTour = () => {
    setCurrentStep(0);
    setIsOpen(true);
  };

  const closeTour = () => {
    setIsOpen(false);
  };

  const nextStep = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const completeTour = () => {
    setIsOpen(false);
    updateSetting('hasCompletedTour', true);
  };

  return (
    <TourContext.Provider value={{
      isOpen,
      currentStep,
      steps: TOUR_STEPS,
      startTour,
      closeTour,
      nextStep,
      prevStep,
      completeTour
    }}>
      {children}
    </TourContext.Provider>
  );
};

TourProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
