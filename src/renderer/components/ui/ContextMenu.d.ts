import React from 'react';
import * as ContextMenuPrimitive from '@radix-ui/react-context-menu';
declare const ContextMenu: React.FC<ContextMenuPrimitive.ContextMenuProps>;
declare const ContextMenuTrigger: React.ForwardRefExoticComponent<ContextMenuPrimitive.ContextMenuTriggerProps & React.RefAttributes<HTMLSpanElement>>;
declare const ContextMenuGroup: React.ForwardRefExoticComponent<ContextMenuPrimitive.ContextMenuGroupProps & React.RefAttributes<HTMLDivElement>>;
declare const ContextMenuPortal: React.FC<ContextMenuPrimitive.ContextMenuPortalProps>;
declare const ContextMenuSub: React.FC<ContextMenuPrimitive.ContextMenuSubProps>;
declare const ContextMenuRadioGroup: React.ForwardRefExoticComponent<ContextMenuPrimitive.ContextMenuRadioGroupProps & React.RefAttributes<HTMLDivElement>>;
declare const ContextMenuSubTrigger: React.ForwardRefExoticComponent<React.RefAttributes<unknown>>;
declare const ContextMenuSubContent: React.ForwardRefExoticComponent<React.RefAttributes<unknown>>;
declare const ContextMenuContent: React.ForwardRefExoticComponent<React.RefAttributes<unknown>>;
declare const ContextMenuItem: React.ForwardRefExoticComponent<React.RefAttributes<unknown>>;
declare const ContextMenuCheckboxItem: React.ForwardRefExoticComponent<React.RefAttributes<unknown>>;
declare const ContextMenuRadioItem: React.ForwardRefExoticComponent<React.RefAttributes<unknown>>;
declare const ContextMenuLabel: React.ForwardRefExoticComponent<React.RefAttributes<unknown>>;
declare const ContextMenuSeparator: React.ForwardRefExoticComponent<React.RefAttributes<unknown>>;
declare const ContextMenuShortcut: {
    ({ className, ...props }: {
        [x: string]: any;
        className: any;
    }): import("react/jsx-runtime").JSX.Element;
    displayName: string;
    propTypes: {
        className: any;
    };
};
export { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuCheckboxItem, ContextMenuRadioItem, ContextMenuLabel, ContextMenuSeparator, ContextMenuShortcut, ContextMenuGroup, ContextMenuPortal, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuRadioGroup, };
