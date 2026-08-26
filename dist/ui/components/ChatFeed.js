import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { Box, Text } from 'ink';
export const ChatFeed = ({ messages, config }) => {
    const isRomantic = config.name.toLowerCase() === 'araa' ||
        config.relationship.toLowerCase().includes('yandere') ||
        config.relationship.toLowerCase().includes('girlfriend') ||
        config.relationship.toLowerCase().includes('wife');
    const companionColor = isRomantic ? 'magentaBright' : 'cyanBright';
    if (messages.length === 0) {
        return (_jsx(Box, { flexDirection: "column", paddingY: 1, paddingX: 2, borderStyle: "single", borderColor: "gray", children: _jsxs(Text, { color: "gray", italic: true, children: [config.name, " sedang memantau desktop kamu di background..."] }) }));
    }
    return (_jsx(Box, { flexDirection: "column", paddingY: 0, paddingX: 1, minHeight: 12, children: messages.slice(-10).map(msg => {
            const timeStr = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            if (msg.sender === 'user') {
                return (_jsxs(Box, { flexDirection: "column", marginY: 0, children: [_jsxs(Box, { children: [_jsxs(Text, { color: "green", bold: true, children: ["You", ' '] }), _jsxs(Text, { color: "gray", children: ["(", timeStr, "):"] })] }), _jsx(Box, { paddingLeft: 2, children: _jsx(Text, { color: "white", children: msg.text }) })] }, msg.id));
            }
            if (msg.sender === 'system') {
                return (_jsx(Box, { marginY: 0, paddingLeft: 2, children: _jsx(Text, { color: "yellow", children: msg.text }) }, msg.id));
            }
            // Companion Message (both proactive and interactive reply look identical like a real chat room!)
            return (_jsxs(Box, { flexDirection: "column", marginY: 0, children: [_jsxs(Box, { children: [_jsxs(Text, { color: companionColor, bold: true, children: [config.name, ' '] }), _jsxs(Text, { color: "gray", children: ["(", timeStr, "):"] })] }), _jsx(Box, { paddingLeft: 2, children: _jsx(Text, { color: companionColor, children: msg.text }) })] }, msg.id));
        }) }));
};
