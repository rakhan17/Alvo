import React from 'react';
import { Box, Text } from 'ink';
import { ChatMessage } from '../../types/index.js';
import { ValidatedPersonaConfig } from '../../config/schema.js';

interface ChatFeedProps {
  messages: ChatMessage[];
  config: ValidatedPersonaConfig;
}

export const ChatFeed: React.FC<ChatFeedProps> = ({ messages, config }) => {
  const isRomantic = config.name.toLowerCase() === 'araa' || 
                     config.relationship.toLowerCase().includes('yandere') || 
                     config.relationship.toLowerCase().includes('girlfriend') ||
                     config.relationship.toLowerCase().includes('wife');

  const companionColor = isRomantic ? 'magentaBright' : 'cyanBright';

  if (messages.length === 0) {
    return (
      <Box flexDirection="column" paddingY={1} paddingX={2} borderStyle="single" borderColor="gray">
        <Text color="gray" italic>
          {config.name} sedang memantau desktop kamu di background...
        </Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" paddingY={0} paddingX={1} minHeight={12}>
      {messages.slice(-10).map(msg => {
        const timeStr = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        if (msg.sender === 'user') {
          return (
            <Box key={msg.id} flexDirection="column" marginY={0}>
              <Box>
                <Text color="green" bold>
                  You{' '}
                </Text>
                <Text color="gray">({timeStr}):</Text>
              </Box>
              <Box paddingLeft={2}>
                <Text color="white">{msg.text}</Text>
              </Box>
            </Box>
          );
        }

        if (msg.sender === 'system') {
          return (
            <Box key={msg.id} marginY={0} paddingLeft={2}>
              <Text color="yellow">{msg.text}</Text>
            </Box>
          );
        }

        // Companion Message (both proactive and interactive reply look identical like a real chat room!)
        return (
          <Box key={msg.id} flexDirection="column" marginY={0}>
            <Box>
              <Text color={companionColor} bold>
                {config.name}{' '}
              </Text>
              <Text color="gray">({timeStr}):</Text>
            </Box>
            <Box paddingLeft={2}>
              <Text color={companionColor}>{msg.text}</Text>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};
