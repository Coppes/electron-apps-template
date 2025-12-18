import React, { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Sparkle, ArrowRight } from '@phosphor-icons/react';
import Button from './ui/Button';

const WhatsNewModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [version, setVersion] = useState('');

  useEffect(() => {
    const check = async () => {
      try {
        if (window.electronAPI?.store) {
          const pending = await window.electronAPI.store.get('pendingWhatsNew');
          if (pending) {
            setVersion(pending);
            setIsOpen(true);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    check();
  }, []);

  const handleClose = async () => {
    setIsOpen(false);
    if (window.electronAPI?.store) {
      await window.electronAPI.store.delete('pendingWhatsNew');
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content aria-describedby={undefined} className="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Sparkle className="w-6 h-6 text-yellow-500" />
              <Dialog.Title className="text-xl font-bold">What's New in v{version}</Dialog.Title>
            </div>

            <div className="space-y-3 text-sm text-foreground/80">
              <div className="bg-muted/30 p-3 rounded-md">
                <h4 className="font-semibold mb-1 flex items-center gap-2"><ArrowRight className="w-3 h-3" /> Multi-Window Support</h4>
                <p className="text-xs text-muted-foreground">You can now tear out tabs into their own windows for true multitasking.</p>
              </div>
              <div className="bg-muted/30 p-3 rounded-md">
                <h4 className="font-semibold mb-1 flex items-center gap-2"><ArrowRight className="w-3 h-3" /> Custom Themes</h4>
                <p className="text-xs text-muted-foreground">Personalize the app with your own color schemes.</p>
              </div>
              <div className="bg-muted/30 p-3 rounded-md">
                <h4 className="font-semibold mb-1 flex items-center gap-2"><ArrowRight className="w-3 h-3" /> Sound Feedback</h4>
                <p className="text-xs text-muted-foreground">Enjoy subtle audio cues for a more responsive feel.</p>
              </div>
            </div>

            <div className="flex justify-end mt-2">
              <Button onClick={handleClose}>
                Got it!
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default WhatsNewModal;
