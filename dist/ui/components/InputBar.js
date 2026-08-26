import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useState } from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
export const InputBar = ({ onSubmit, disabled = false, name = 'Alvo', isRomantic = false }) => {
    const [value, setValue] = useState('');
    const handleSubmit = (submittedValue) => {
        const trimmed = submittedValue.trim();
        if (!trimmed || disabled)
            return;
        onSubmit(trimmed);
        setValue('');
    };
    const borderColor = isRomantic ? 'magenta' : 'cyan';
    const promptColor = isRomantic ? 'magentaBright' : 'cyan';
    return (_jsxs(Box, { flexDirection: "column", borderStyle: "single", borderColor: borderColor, paddingX: 1, marginTop: 1, children: [_jsxs(Box, { children: [_jsxs(Text, { color: promptColor, bold: true, children: ['>', ' '] }), _jsx(TextInput, { value: value, onChange: setValue, onSubmit: handleSubmit, placeholder: disabled ? `${name} is thinking...` : `Type a message to ${name} or /help, /scan, /preset, /clear, /quit` })] }), _jsxs(Box, { justifyContent: "space-between", children: [_jsx(Text, { color: "dim", children: "Press Enter to send \u00B7 Ctrl+C to exit" }), _jsx(Text, { color: "dim", children: "Commands: /scan \u00B7 /preset [name] \u00B7 /help" })] })] }));
};
