import React from 'react';
import { AlvoStatus, SystemSnapshot } from '../../types/index.js';
import { ValidatedPersonaConfig } from '../../config/schema.js';
interface HeaderProps {
    status: AlvoStatus;
    statusDetail?: string;
    config: ValidatedPersonaConfig;
    latestSnapshot: SystemSnapshot | null;
}
export declare const Header: React.FC<HeaderProps>;
export {};
