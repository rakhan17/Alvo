import React from 'react';
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import figures from 'figures';
import { AlvoStatus, SystemSnapshot } from '../../types/index.js';
import { ValidatedPersonaConfig } from '../../config/schema.js';

interface HeaderProps {
  status: AlvoStatus;
  statusDetail?: string;
  config: ValidatedPersonaConfig;
  latestSnapshot: SystemSnapshot | null;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  statusDetail,
  config,
  latestSnapshot
}) => {
  const getStatusBadge = () => {
    switch (status) {
      case 'watching':
        return (
          <Text color="green" bold>
            {figures.circleFilled} WATCHING
          </Text>
        );
      case 'thinking':
        return (
          <Text color="yellow" bold>
            <Spinner type="dots" /> THINKING
          </Text>
        );
      case 'speaking':
        return (
          <Text color="magenta" bold>
            {figures.radioOn} SPEAKING
          </Text>
        );
      case 'error':
        return (
          <Text color="red" bold>
            {figures.cross} ERROR
          </Text>
        );
      case 'idle':
      default:
        return (
          <Text color="gray">
            {figures.circle} IDLE
          </Text>
        );
    }
  };

  const activeApp = latestSnapshot?.window?.appName || 'Detecting...';
  const activeTitle = latestSnapshot?.window?.windowTitle
    ? `· ${latestSnapshot.window.windowTitle.length > 40 ? latestSnapshot.window.windowTitle.slice(0, 37) + '...' : latestSnapshot.window.windowTitle}`
    : '';

  const isRomantic = config.name.toLowerCase() === 'araa' || 
                     config.relationship.toLowerCase().includes('yandere') || 
                     config.relationship.toLowerCase().includes('girlfriend') ||
                     config.relationship.toLowerCase().includes('wife') ||
                     config.relationship.toLowerCase().includes('partner');

  const headerBorderColor = isRomantic ? 'magenta' : 'cyan';
  const headerTitleColor = isRomantic ? 'magentaBright' : 'cyanBright';
  const headerIcon = isRomantic ? '💖' : '⚡';

  return (
    <Box flexDirection="column" borderStyle="round" borderColor={headerBorderColor} paddingX={1} marginBottom={1}>
      <Box justifyContent="space-between">
        <Box>
          <Text bold color={headerTitleColor}>
            {headerIcon} {config.name.toUpperCase()}
          </Text>
          <Text color="gray"> | {config.relationship}</Text>
        </Box>
        <Box>
          <Text color={isRomantic ? 'magenta' : 'blueBright'}>[{config.model}] </Text>
          <Text color="dim">({config.provider})</Text>
        </Box>
      </Box>

      <Box justifyContent="space-between" marginTop={0}>
        <Box>
          {getStatusBadge()}
          {statusDetail && (
            <Text color="dim"> - {statusDetail}</Text>
          )}
        </Box>
        <Box>
          <Text color="dim">
            App: <Text color="white" bold>{activeApp}</Text> <Text color="gray">{activeTitle}</Text>
          </Text>
        </Box>
      </Box>
    </Box>
  );
};
