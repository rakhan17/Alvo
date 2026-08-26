import React, { useState } from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';

interface InputBarProps {
  onSubmit: (text: string) => void;
  disabled?: boolean;
  name?: string;
  isRomantic?: boolean;
}

export const InputBar: React.FC<InputBarProps> = ({ onSubmit, disabled = false, name = 'Alvo', isRomantic = false }) => {
  const [value, setValue] = useState('');

  const handleSubmit = (submittedValue: string) => {
    const trimmed = submittedValue.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed);
    setValue('');
  };

  const borderColor = isRomantic ? 'magenta' : 'cyan';
  const promptColor = isRomantic ? 'magentaBright' : 'cyan';

  return (
    <Box flexDirection="column" borderStyle="single" borderColor={borderColor} paddingX={1} marginTop={1}>
      <Box>
        <Text color={promptColor} bold>
          {'>'}{' '}
        </Text>
        <TextInput
          value={value}
          onChange={setValue}
          onSubmit={handleSubmit}
          placeholder={disabled ? `${name} is thinking...` : `Type a message to ${name} or /help, /scan, /preset, /clear, /quit`}
        />
      </Box>
      <Box justifyContent="space-between">
        <Text color="dim">Press Enter to send · Ctrl+C to exit</Text>
        <Text color="dim">Commands: /scan · /preset [name] · /help</Text>
      </Box>
    </Box>
  );
};
