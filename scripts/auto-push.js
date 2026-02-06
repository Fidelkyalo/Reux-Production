import { watch } from 'fs';
import { exec } from 'child_process';
import { resolve } from 'path';

// Configuration
const WATCH_DIRS = ['src', 'public'];
const DEBOUNCE_MS = 5000; // Wait 5 seconds after last change

let debounceTimer = null;
let isPushing = false;
let pendingPush = false;

function log(msg) {
    console.log(`[Auto-Push] ${msg}`);
}

function executeGitCommands() {
    if (isPushing) {
        pendingPush = true;
        return;
    }

    isPushing = true;
    pendingPush = false;

    log('Starting sync...');

    // Chain git commands
    exec('git add . && git commit -m "Auto-save: Update files" && git push', (error, stdout, stderr) => {
        isPushing = false;

        if (error) {
            // Ignore "nothing to commit" errors
            if (stdout.includes('nothing to commit') || stderr.includes('nothing to commit')) {
                log('Nothing to commit.');
            } else {
                console.error(`[Auto-Push] Error: ${error.message}`);
            }
        } else {
            log('Successfully pushed changes to GitHub.');
            if (stdout) console.log(stdout);
        }

        // If a new change happened while pushing, push again
        if (pendingPush) {
            log('Changes detected during push, retrying...');
            // Small delay to prevent tight loops
            setTimeout(executeGitCommands, 1000);
        }
    });
}

function onFileChange(eventType, filename) {
    if (!filename) return;

    // Ignore .git directory and node_modules (though they shouldn't be in src/public usually)

    log(`Change detected in ${filename}`);

    if (debounceTimer) {
        clearTimeout(debounceTimer);
    }

    debounceTimer = setTimeout(() => {
        executeGitCommands();
    }, DEBOUNCE_MS);
}

// Start Watching
log(`Monitoring directories: ${WATCH_DIRS.join(', ')}...`);

WATCH_DIRS.forEach(dir => {
    const path = resolve(process.cwd(), dir);
    try {
        watch(path, { recursive: true }, onFileChange);
        log(`Watching ${path}`);
    } catch (err) {
        console.error(`Error watching ${dir}:`, err.message);
    }
});
