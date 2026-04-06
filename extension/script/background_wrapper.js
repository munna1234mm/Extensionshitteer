/**
 * Nexvora Background Wrapper (Super Fix)
 * This script safely wraps the original service worker and adds our Proxy.
 */

try {
    // 1. Import the original obfuscated background script
    importScripts('background.js');
} catch (e) {
    console.error('Nexvora: Failed to import original background script:', e);
}

// 2. Add our powerful Notification Proxy
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'NOTIFY_HIT') {
        console.log('🚀 Background Proxy: Relaying hit to server...');
        
        fetch('https://extensionshitteer.onrender.com/api/notify-hit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request.data)
        })
        .then(response => response.json())
        .then(data => {
            console.log('✅ Server Response:', data);
            sendResponse({ ok: true, data });
        })
        .catch(error => {
            console.error('❌ Proxy Fetch Error:', error);
            sendResponse({ ok: false, error: error.message });
        });
        
        return true; // Keep channel open
    }
});
