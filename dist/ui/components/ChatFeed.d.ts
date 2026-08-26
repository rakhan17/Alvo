import React from 'react';
import { ChatMessage } from '../../types/index.js';
import { ValidatedPersonaConfig } from '../../config/schema.js';
interface ChatFeedProps {
    messages: ChatMessage[];
    config: ValidatedPersonaConfig;
}
export declare const ChatFeed: React.FC<ChatFeedProps>;
export {};
