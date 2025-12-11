import React, { useEffect, useState, useRef } from 'react';
import { useTour } from '../contexts/TourContext';
import { CaretLeft, CaretRight, X, Check } from '@phosphor-icons/react';

export const TourOverlay = () => {
  const { isOpen, currentStep, steps, nextStep, prevStep, closeTour } = useTour();
  const [targetRect, setTargetRect] = useState(null);
  const step = steps[currentStep];
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !step) return;

    const updatePosition = () => {
      if (step.target === 'body') {
        setTargetRect(null); // Center mode
        return;
      }

      const el = document.querySelector(step.target);
      if (el) {
        const rect = el.getBoundingClientRect();
        setTargetRect({
          top: rect.top,
          left: rect.left,
          right: rect.right,
          bottom: rect.bottom,
          width: rect.width,
          height: rect.height,
        });
        // Scroll into view if needed
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        // Fallback to center if target not found
        console.warn(`Tour target ${step.target} not found`);
        setTargetRect(null);
      }
    };

    updatePosition();
    // Update on resize
    window.addEventListener('resize', updatePosition);
    // Slight delay to allow UI to settle?
    const timer = setTimeout(updatePosition, 100);

    return () => {
      window.removeEventListener('resize', updatePosition);
      clearTimeout(timer);
    };
  }, [isOpen, step, currentStep]);

  if (!isOpen || !step) return null;

  const isLastStep = currentStep === steps.length - 1;

  // Calculate position style
  let style = {};
  if (targetRect) {
    // Basic positioning logic: try to put it below, or flip if no space
    // For simplicity: predefined relative placement or just 'bottom' default
    // Dimensions of the popover card (approximate or measured)
    const CARD_WIDTH = 320; // Slightly wider to be safe
    const CARD_HEIGHT = 200; // Approximate min height
    const GAP = 12;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Potential positions
    const positions = {
      // Bottom
      bottom: {
        top: targetRect.bottom + GAP,
        left: targetRect.left + (targetRect.width / 2) - (CARD_WIDTH / 2),
      },
      // Top
      top: {
        top: targetRect.top - CARD_HEIGHT - GAP,
        left: targetRect.left + (targetRect.width / 2) - (CARD_WIDTH / 2),
      },
      // Right
      right: {
        top: targetRect.top,
        left: targetRect.right + GAP,
      },
      // Left
      left: {
        top: targetRect.top,
        left: targetRect.left - CARD_WIDTH - GAP,
      }
    };

    let bestPos = positions.bottom; // Default
    let found = false;

    // 1. Try Right (Good for Sidebar)
    // If target is tall (height > 1/3 screen) and on left side
    if (targetRect.height > viewportHeight / 3 && targetRect.left < viewportWidth / 2) {
      if (positions.right.left + CARD_WIDTH < viewportWidth) {
        bestPos = positions.right;
        found = true;
      }
    }

    // 2. Try Bottom (Standard)
    if (!found) {
      if (positions.bottom.top + CARD_HEIGHT < viewportHeight) {
        bestPos = positions.bottom;
        found = true;
      }
    }

    // 3. Try Top (If bottom fails)
    if (!found) {
      if (positions.top.top > 0) {
        bestPos = positions.top;
        found = true;
      }
    }

    // 4. Try Left (If target is on right side)
    if (!found) {
      if (positions.left.left > 0) {
        bestPos = positions.left;
        found = true;
      }
    }

    // Apply strict clamping ensuring it never goes off screen or negative
    let finalTop = Math.max(12, Math.min(bestPos.top, viewportHeight - CARD_HEIGHT - 12));
    let finalLeft = Math.max(12, Math.min(bestPos.left, viewportWidth - CARD_WIDTH - 12));

    style = {
      position: 'absolute',
      top: finalTop,
      left: finalLeft,
      width: 300,
      zIndex: 100,
    };

    // Clamping handled above

  } else {
    // Centered modal style
    style = {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: 400,
      zIndex: 100,
    };
  }

  return (
    <>
      {/* Spotlight Backdrop */}
      {
        targetRect ? (
          <div
            className="fixed inset-0 z-[90] pointer-events-none transition-all duration-500 ease-in-out"
            style={{
              // Create a "hole" using a massive box-shadow around the target rect
              boxShadow: `0 0 0 9999px rgba(0, 0, 0, 0.6)`,
              // Match target position perfectly
              top: targetRect.top,
              left: targetRect.left,
              width: targetRect.width,
              height: targetRect.height,
              borderRadius: '6px', // Optional: match target radius roughly
              position: 'absolute',
            }}
          >
            {/* Highlight border around target */}
            <div className="absolute inset-[-4px] border-2 border-blue-500 rounded-lg animate-pulse pointer-events-none" />
          </div>
        ) : (
          // Fallback backdrop for center mode
          <div
            className="fixed inset-0 bg-black/60 z-[90] transition-opacity duration-300"
            onClick={closeTour}
          />
        )
      }

      {/* Popover Card */}
      <div
        ref={overlayRef}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 border border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in slide-in-from-bottom-2 duration-300"
        style={style}
      >
        <button
          onClick={closeTour}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
        >
          <X size={16} />
        </button>

        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100 pr-6">
          {step.title}
        </h3>

        <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm leading-relaxed">
          {step.content}
        </p>

        <div className="flex justify-between items-center mt-4 pt-2 border-t border-gray-100 dark:border-gray-700">
          <div className="text-xs text-gray-400 font-medium tracking-wide">
            STEP {currentStep + 1} OF {steps.length}
          </div>

          <div className="flex gap-2">
            {currentStep > 0 && (
              <button
                onClick={prevStep}
                className="px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white flex items-center gap-1 transition-colors rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <CaretLeft size={14} /> Back
              </button>
            )}

            <button
              onClick={nextStep}
              className="px-4 py-1.5 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 active:bg-blue-800 flex items-center gap-1 transition-colors shadow-sm"
            >
              {isLastStep ? 'Finish' : 'Next'}
              {isLastStep ? <Check size={14} /> : <CaretRight size={14} />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
