import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
    const { t } = useTranslation('onboarding');
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
    // Translate steps dynamically
    const translatedSteps = TOUR_STEPS.map((step, index) => {
        const keys = ['welcome', 'navigation', 'command_palette', 'settings', 'finish'];
        const key = keys[index];
        if (!key)
            return step;
        return {
            ...step,
            title: t(`tour.${key}.title`, step.title),
            content: t(`tour.${key}.content`, step.content),
        };
    });
    const nextStep = () => {
        if (currentStep < translatedSteps.length - 1) {
            setCurrentStep(prev => prev + 1);
        }
        else {
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
    return (_jsx(TourContext.Provider, { value: {
            isOpen,
            currentStep,
            steps: translatedSteps,
            startTour,
            closeTour,
            nextStep,
            prevStep,
            completeTour
        }, children: children }));
};
TourProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
