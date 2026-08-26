import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);
const MACOS_WINDOW_SCRIPT = `
osascript -e '
global frontAppName, windowTitle
set frontAppName to ""
set windowTitle to ""

try
    tell application "System Events"
        set frontApp to first application process whose frontmost is true
        set frontAppName to name of frontApp
    end tell

    if frontAppName is "Google Chrome" or frontAppName is "Brave Browser" or frontAppName is "Microsoft Edge" or frontAppName is "Arc" then
        try
            tell application frontAppName
                set windowTitle to title of active tab of front window
            end tell
        end try
    else if frontAppName is "Safari" then
        try
            tell application "Safari"
                set windowTitle to name of current tab of front window
            end tell
        end try
    end if

    -- Fallback to window title if browser tab title was not retrieved or for non-browsers
    if windowTitle is "" then
        tell application "System Events"
            tell process frontAppName
                if (count of windows) > 0 then
                    set windowTitle to name of front window
                end if
            end tell
        end tell
    end if
on error
    if frontAppName is "" then
        set frontAppName to "Unknown"
    end if
end try

return frontAppName & ":::" & windowTitle
'
`;
export async function getActiveWindowContext() {
    const timestamp = Date.now();
    if (process.platform !== 'darwin') {
        return {
            appName: 'Non-macOS System',
            windowTitle: 'Desktop Workspace',
            timestamp
        };
    }
    try {
        const { stdout } = await execAsync(MACOS_WINDOW_SCRIPT, { timeout: 3000 });
        const trimmed = stdout.trim();
        const parts = trimmed.split(':::');
        const appName = parts[0]?.trim() || 'Unknown App';
        const windowTitle = parts[1]?.trim() || '';
        return {
            appName,
            windowTitle,
            timestamp
        };
    }
    catch (error) {
        // Fallback if accessibility permissions are pending
        return {
            appName: 'System / Terminal',
            windowTitle: 'Active Desktop',
            timestamp
        };
    }
}
