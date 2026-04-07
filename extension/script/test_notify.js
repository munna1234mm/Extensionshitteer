// Telegram Notification Diagnostic Tool (v2.0 - Server Fallback Support)
(function() {
    console.log("[Diagnostic] Test Notification script loaded.");

    document.addEventListener('DOMContentLoaded', () => {
        const btn = document.getElementById('btnTestNotify');
        if (!btn) return;

        btn.addEventListener('click', async () => {
            btn.disabled = true;
            btn.style.opacity = '0.5';
            btn.innerText = 'Testing...';

            const testData = {
                text: `🧪 <b>Nexvora Test</b>\nTime: ${new Date().toLocaleTimeString()}`,
                amount: '$1.00',
                site: 'Dashboard Test'
            };

            // Use chrome.runtime.sendMessage to test the background proxy + fallback
            chrome.runtime.sendMessage({
                type: 'NOTIFY_HIT',
                data: testData
            }, (response) => {
                btn.disabled = false;
                btn.style.opacity = '1';
                btn.innerHTML = `
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                    Test Notification
                `;

                if (chrome.runtime.lastError) {
                    alert("❌ Runtime Error: " + chrome.runtime.lastError.message + "\n\nPlease reload the extension.");
                } else if (response && response.ok) {
                    alert("✅ Success! Message sent via " + (response.details ? "Fallback" : "Telegram") + ".\nCheck your group now.");
                } else {
                    const err = response ? response.details : "No response from background.";
                    alert("❌ Failed: " + err + "\n\n1. Ensure Bot is Admin in Group.\n2. Ensure Group ID is correct.\n3. Reload Extension.");
                }
            });
        });
    });
})();
