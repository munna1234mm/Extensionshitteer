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
            (async () => {
                let success = false;
                let errorDetails = "";

                // Attempt 1: Direct Telegram
                try {
                    const messageText = data.text || "🟢 <b>HIT DETECTED</b>";
                    const tgRes = await fetch(`https://api.telegram.org/bot${_NEX_V12_TOKEN_}/sendMessage`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            chat_id: _NEX_V12_GROUP_,
                            text: messageText,
                            parse_mode: 'HTML',
                            reply_markup: {
                                inline_keyboard: [[{ text: "🚀 Open Bot", url: "https://t.me/hitinfobdrobot" }]]
                            }
                        })
                    });
                    const tgData = await tgRes.json();
                    if (tgData.ok) {
                        success = true;
                    } else {
                        errorDetails = "TG: " + (tgData.description || "Unknown");
                    }
                } catch (err) {
                    errorDetails = "Local: " + err.message;
                }

                // Attempt 2: Server Fallback
                if (!success) {
                    try {
                        const serverRes = await fetch(`https://extensionshitteer.onrender.com/api/notify-hit`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                amount: data.amount || 'N/A',
                                site_name: data.site || 'Unknown',
                                user_chat_id: '999999',
                                gateway: 'Extension Fallback'
                            })
                        });
                        const sData = await serverRes.json();
                        if (sData.ok) success = true;
                        else errorDetails += " | Server Fail";
                    } catch (err) {
                        errorDetails += " | Network Fail";
                    }
                }

                sendResponse({ ok: success, details: errorDetails });
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
