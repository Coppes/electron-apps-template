export declare const useTour: () => {
    isOpen: boolean;
    currentStep: number;
    steps: any[];
    startTour: () => void;
    closeTour: () => void;
    nextStep: () => void;
    prevStep: () => void;
    completeTour: () => void;
};
export declare const TourProvider: {
    ({ children }: {
        children: any;
    }): import("react/jsx-runtime").JSX.Element;
    propTypes: {
        children: any;
    };
};
