import React from 'react';
import { EvaluatorLoop } from '../../evaluator/loop.js';
import { ValidatedPersonaConfig } from '../../config/schema.js';
interface AppProps {
    evaluator: EvaluatorLoop;
    initialConfig: ValidatedPersonaConfig;
}
export declare const App: React.FC<AppProps>;
export {};
