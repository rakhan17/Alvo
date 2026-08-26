import React from 'react';
interface InputBarProps {
    onSubmit: (text: string) => void;
    disabled?: boolean;
    name?: string;
    isRomantic?: boolean;
}
export declare const InputBar: React.FC<InputBarProps>;
export {};
