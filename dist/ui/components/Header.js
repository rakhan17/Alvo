import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { Box, Text } from 'ink';
import Spinner from 'ink-spinner';
import figures from 'figures';
export const Header = ({ status, statusDetail, config, latestSnapshot }) => {
    const getStatusBadge = () => {
        switch (status) {
            case 'watching':
                return (_jsxs(Text, { color: "green", bold: true, children: [figures.circleFilled, " WATCHING"] }));
            case 'thinking':
                return (_jsxs(Text, { color: "yellow", bold: true, children: [_jsx(Spinner, { type: "dots" }), " THINKING"] }));
            case 'speaking':
                return (_jsxs(Text, { color: "magenta", bold: true, children: [figures.radioOn, " SPEAKING"] }));
            case 'error':
                return (_jsxs(Text, { color: "red", bold: true, children: [figures.cross, " ERROR"] }));
            case 'idle':
            default:
                return (_jsxs(Text, { color: "gray", children: [figures.circle, " IDLE"] }));
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
    return (_jsxs(Box, { flexDirection: "column", borderStyle: "round", borderColor: headerBorderColor, paddingX: 1, marginBottom: 1, children: [_jsxs(Box, { justifyContent: "space-between", children: [_jsxs(Box, { children: [_jsxs(Text, { bold: true, color: headerTitleColor, children: [headerIcon, " ", config.name.toUpperCase()] }), _jsxs(Text, { color: "gray", children: [" | ", config.relationship] })] }), _jsxs(Box, { children: [_jsxs(Text, { color: isRomantic ? 'magenta' : 'blueBright', children: ["[", config.model, "] "] }), _jsxs(Text, { color: "dim", children: ["(", config.provider, ")"] })] })] }), _jsxs(Box, { justifyContent: "space-between", marginTop: 0, children: [_jsxs(Box, { children: [getStatusBadge(), statusDetail && (_jsxs(Text, { color: "dim", children: [" - ", statusDetail] }))] }), _jsx(Box, { children: _jsxs(Text, { color: "dim", children: ["App: ", _jsx(Text, { color: "white", bold: true, children: activeApp }), " ", _jsx(Text, { color: "gray", children: activeTitle })] }) })] })] }));
};
