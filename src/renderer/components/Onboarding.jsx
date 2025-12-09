import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, ArrowRight, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Button from './ui/Button';

const Onboarding = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);
  const { t } = useTranslation('onboarding');

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        // Assume window.electronAPI.store exists from previous implementation context
        const completed = await window.electronAPI.store.get('onboardingCompleted');
        if (!completed) {
          setIsOpen(true);
        }
      } catch (error) {
        console.error('Failed to check onboarding status:', error);
      }
    };
    checkOnboarding();
  }, []);

  const handleComplete = async () => {
    try {
      await window.electronAPI.store.set('onboardingCompleted', true);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to save onboarding status:', error);
    }
  };

  const steps = [
    {
      title: 'Welcome to Electron App',
      description: 'A powerful, secure, and modern template for your next project.',
      image: (
        <div className="w-full h-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-4xl font-bold">
          🚀
        </div>
      ),
    },
    {
      title: 'Secure by Default',
      description: 'Built with context isolation, sandbox enabled, and strict CSP.',
      image: (
        <div className="w-full h-32 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg flex items-center justify-center text-white text-4xl font-bold">
          🔒
        </div>
      ),
    },
    {
      title: 'Feature Rich',
      description: 'Includes Tabs, Command Palette, i18n, and more out of the box.',
      image: (
        <div className="w-full h-32 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center text-white text-4xl font-bold">
          ✨
        </div>
      ),
    },
  ];

  if (!isOpen) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg">

          <div className="flex flex-col gap-4 text-center">
            {steps[step].image}
            <Dialog.Title className="text-2xl font-bold tracking-tight">
              {steps[step].title}
            </Dialog.Title>
            <Dialog.Description className="text-muted-foreground">
              {steps[step].description}
            </Dialog.Description>
          </div>

          <div className="flex justify-between items-center mt-4">
            <div className="flex gap-1">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-primary' : 'w-1.5 bg-muted'
                    }`}
                />
              ))}
            </div>

            <div className="flex gap-2">
              {step < steps.length - 1 ? (
                <>
                  <Button variant="ghost" onClick={handleComplete}>
                    Skip
                  </Button>
                  <Button onClick={() => setStep(step + 1)}>
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </>
              ) : (
                <Button onClick={handleComplete}>
                  Get Started <Check className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default Onboarding;
