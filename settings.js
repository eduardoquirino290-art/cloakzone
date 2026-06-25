// Settings Management System
class CloakZoneSettings {
    constructor() {
        this.defaults = {
            autoCloak: true,
            cloakKey: 'Alt+Q',
            cloakSensitivity: 'medium',
            aboutBlankTab: true,
            tabTitle: 'New Tab',
            historyClean: true,
            cacheClean: true,
            keyboardDetect: true,
            visibilityDetect: true,
            mouseMove: false,
            uncloakKey: 'Ctrl+Shift+U',
            recoveryCode: ''
        };

        this.recordingKey = false;
        this.recordingUncloakKey = false;
        this.init();
    }

    // Initialize settings
    init() {
        this.loadSettings();
        this.setupEventListeners();
        this.setupDetection();
        this.restoreUIState();
    }

    // Load settings from localStorage
    loadSettings() {
        const saved = localStorage.getItem('cloakzoneSettings');
        if (saved) {
            this.settings = { ...this.defaults, ...JSON.parse(saved) };
        } else {
            this.settings = { ...this.defaults };
        }
    }

    // Save settings to localStorage
    saveSettings() {
        localStorage.setItem('cloakzoneSettings', JSON.stringify(this.settings));
        this.showStatus('Settings saved successfully!', 'success');
    }

    // Restore UI state from settings
    restoreUIState() {
        document.getElementById('autoCloak').checked = this.settings.autoCloak;
        document.getElementById('cloakKey').value = this.settings.cloakKey;
        document.getElementById('cloakSensitivity').value = this.settings.cloakSensitivity;
        document.getElementById('aboutBlankTab').checked = this.settings.aboutBlankTab;
        document.getElementById('tabTitle').value = this.settings.tabTitle;
        document.getElementById('historyClean').checked = this.settings.historyClean;
        document.getElementById('cacheClean').checked = this.settings.cacheClean;
        document.getElementById('keyboardDetect').checked = this.settings.keyboardDetect;
        document.getElementById('visibilityDetect').checked = this.settings.visibilityDetect;
        document.getElementById('mouseMove').checked = this.settings.mouseMove;
        document.getElementById('uncloakKey').value = this.settings.uncloakKey;
        if (this.settings.recoveryCode) {
            document.getElementById('recoveryCodeDisplay').value = this.settings.recoveryCode;
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // Toggle switches
        const toggles = ['autoCloak', 'aboutBlankTab', 'historyClean', 'cacheClean', 'keyboardDetect', 'visibilityDetect', 'mouseMove'];
        toggles.forEach(toggle => {
            const element = document.getElementById(toggle);
            if (element) {
                element.addEventListener('change', (e) => {
                    this.settings[toggle] = e.target.checked;
                });
            }
        });

        // Select dropdowns
        const selects = ['cloakSensitivity'];
        selects.forEach(select => {
            const element = document.getElementById(select);
            if (element) {
                element.addEventListener('change', (e) => {
                    this.settings[select] = e.target.value;
                });
            }
        });

        // Text inputs
        const inputs = ['tabTitle'];
        inputs.forEach(input => {
            const element = document.getElementById(input);
            if (element) {
                element.addEventListener('input', (e) => {
                    this.settings[input] = e.target.value;
                });
            }
        });
    }

    // Setup auto-cloak detection triggers
    setupDetection() {
        if (!this.settings.autoCloak) return;

        // Keyboard detection
        if (this.settings.keyboardDetect) {
            document.addEventListener('keydown', (e) => {
                this.detectSuspiciousKeyboard(e);
            });
        }

        // Visibility detection
        if (this.settings.visibilityDetect) {
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    console.log('[CloakZone] Tab hidden - triggering cloak');
                }
            });

            window.addEventListener('blur', () => {
                this.triggerCloak();
            });
        }

        // Mouse movement detection
        if (this.settings.mouseMove) {
            document.addEventListener('mousemove', (e) => {
                this.detectSuspiciousMouseMovement(e);
            });
        }
    }

    // Detect suspicious keyboard patterns
    detectSuspiciousKeyboard(event) {
        // Ctrl+Shift+Delete - History clearing
        if (event.ctrlKey && event.shiftKey && event.key === 'Delete') {
            console.log('[CloakZone] Suspicious key combo detected: Ctrl+Shift+Del');
            this.triggerCloak();
        }

        // Alt+Tab - Window switching
        if (event.altKey && event.key === 'Tab') {
            console.log('[CloakZone] Alt+Tab detected');
            this.triggerCloak();
        }

        // Escape key
        if (event.key === 'Escape' && this.settings.cloakSensitivity === 'high') {
            console.log('[CloakZone] Escape key detected');
            this.triggerCloak();
        }

        // Custom cloak key
        if (this.matchesHotkey(event, this.settings.cloakKey)) {
            console.log('[CloakZone] Custom cloak key pressed');
            this.triggerCloak();
        }

        // Custom un-cloak key
        if (this.matchesHotkey(event, this.settings.uncloakKey)) {
            console.log('[CloakZone] Un-cloak key pressed');
            this.uncloak();
        }
    }

    // Match hotkey from settings
    matchesHotkey(event, hotkey) {
        const keys = hotkey.split('+').map(k => k.trim().toLowerCase());
        
        let match = true;
        if (keys.includes('ctrl') && !event.ctrlKey) match = false;
        if (keys.includes('alt') && !event.altKey) match = false;
        if (keys.includes('shift') && !event.shiftKey) match = false;

        const keyChar = event.key.toLowerCase();
        const lastKey = keys[keys.length - 1].toLowerCase();
        
        if (keyChar !== lastKey && lastKey !== 'ctrl' && lastKey !== 'alt' && lastKey !== 'shift') {
            match = false;
        }

        return match;
    }

    // Detect suspicious mouse movement patterns
    lastMousePos = { x: 0, y: 0 };
    suspiciousMovements = 0;

    detectSuspiciousMouseMovement(event) {
        const dx = Math.abs(event.clientX - this.lastMousePos.x);
        const dy = Math.abs(event.clientY - this.lastMousePos.y);
        
        this.lastMousePos = { x: event.clientX, y: event.clientY };

        // Large sudden movements
        if (dx > 500 || dy > 500) {
            this.suspiciousMovements++;
            if (this.suspiciousMovements > 3) {
                console.log('[CloakZone] Suspicious mouse pattern detected');
                this.triggerCloak();
                this.suspiciousMovements = 0;
            }
        }
    }

    // Trigger cloak - hide the site
    triggerCloak() {
        console.log('[CloakZone] CLOAKING ACTIVATED');

        // Change page title
        document.title = this.settings.tabTitle;

        // Apply visual cloak
        document.body.style.opacity = '0';
        setTimeout(() => {
            document.body.style.display = 'none';
        }, 300);

        // Clear data if enabled
        if (this.settings.cacheClean) {
            this.clearLocalData();
        }

        // Replace with about:blank if enabled
        if (this.settings.aboutBlankTab) {
            this.replaceWithAboutBlank();
        }

        // Store cloak state
        sessionStorage.setItem('cloakzoneIsCloaked', 'true');
    }

    // Un-cloak - restore the site
    uncloak() {
        console.log('[CloakZone] UN-CLOAKING');
        
        document.body.style.display = 'block';
        document.body.style.opacity = '1';
        sessionStorage.removeItem('cloakzoneIsCloaked');
    }

    // Replace current page with about:blank
    replaceWithAboutBlank() {
        // Store current data before navigation
        sessionStorage.setItem('cloakzoneOriginalUrl', window.location.href);
        sessionStorage.setItem('cloakzoneIsHidden', 'true');

        // Small delay to ensure visual cloak completes
        setTimeout(() => {
            window.location.href = 'about:blank';
        }, 100);
    }

    // Clear local data
    clearLocalData() {
        console.log('[CloakZone] Clearing local data');
        
        // Clear cookies
        document.cookie.split(";").forEach((c) => {
            const eqPos = c.indexOf("=");
            const name = eqPos > -1 ? c.substr(0, eqPos).trim() : c.trim();
            document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        });

        // Clear localStorage (except settings)
        const settingsData = localStorage.getItem('cloakzoneSettings');
        localStorage.clear();
        if (settingsData) {
            localStorage.setItem('cloakzoneSettings', settingsData);
        }

        // Clear sessionStorage (except cloak state)
        const cloakState = sessionStorage.getItem('cloakzoneIsCloaked');
        sessionStorage.clear();
        if (cloakState) {
            sessionStorage.setItem('cloakzoneIsCloaked', cloakState);
        }
    }

    // Show status message
    showStatus(message, type = 'info') {
        const statusEl = document.getElementById('statusMessage');
        if (statusEl) {
            statusEl.textContent = message;
            statusEl.className = `status-message show ${type}`;
            
            setTimeout(() => {
                statusEl.classList.remove('show');
            }, 3000);
        }
    }

    // Generate recovery code
    generateRecoveryCode() {
        const code = 'CZ-' + Math.random().toString(36).substr(2, 9).toUpperCase() + '-' + Date.now().toString(36).toUpperCase();
        this.settings.recoveryCode = code;
        document.getElementById('recoveryCodeDisplay').value = code;
        this.showStatus('Recovery code generated!', 'success');
    }

    // Reset settings to default
    resetToDefaults() {
        if (confirm('Are you sure you want to reset all settings to default?')) {
            this.settings = { ...this.defaults };
            localStorage.removeItem('cloakzoneSettings');
            this.restoreUIState();
            this.showStatus('Settings reset to default', 'info');
        }
    }
}

// Record hotkey function
function recordHotkey() {
    const btn = event.target;
    btn.textContent = 'Press any key...';
    btn.disabled = true;

    const handleKeyRecord = (e) => {
        e.preventDefault();
        
        let hotkey = '';
        if (e.ctrlKey) hotkey += 'Ctrl+';
        if (e.altKey) hotkey += 'Alt+';
        if (e.shiftKey) hotkey += 'Shift+';
        
        const key = e.key.length === 1 ? e.key.toUpperCase() : e.key;
        hotkey += key;

        document.getElementById('cloakKey').value = hotkey;
        settings.settings.cloakKey = hotkey;

        btn.textContent = 'Record Key';
        btn.disabled = false;
        document.removeEventListener('keydown', handleKeyRecord);
    };

    document.addEventListener('keydown', handleKeyRecord);
}

// Record un-cloak hotkey function
function recordUncloakKey() {
    const btn = event.target;
    btn.textContent = 'Press any key...';
    btn.disabled = true;

    const handleKeyRecord = (e) => {
        e.preventDefault();
        
        let hotkey = '';
        if (e.ctrlKey) hotkey += 'Ctrl+';
        if (e.altKey) hotkey += 'Alt+';
        if (e.shiftKey) hotkey += 'Shift+';
        
        const key = e.key.length === 1 ? e.key.toUpperCase() : e.key;
        hotkey += key;

        document.getElementById('uncloakKey').value = hotkey;
        settings.settings.uncloakKey = hotkey;

        btn.textContent = 'Record Key';
        btn.disabled = false;
        document.removeEventListener('keydown', handleKeyRecord);
    };

    document.addEventListener('keydown', handleKeyRecord);
}

// Save settings function
function saveSettings() {
    settings.saveSettings();
}

// Reset settings function
function resetSettings() {
    settings.resetToDefaults();
}

// Generate recovery code function
function generateRecoveryCode() {
    settings.generateRecoveryCode();
}

// Initialize settings on page load
let settings;
document.addEventListener('DOMContentLoaded', () => {
    settings = new CloakZoneSettings();
});

// Check if page was cloaked
if (sessionStorage.getItem('cloakzoneIsCloaked') === 'true') {
    document.body.style.display = 'none';
}
