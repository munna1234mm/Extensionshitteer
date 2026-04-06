/**
 * Nexvora Absolute Isolation (v12.0 - Forced Strip)
 * Zero collision, zero latency, pure stability.
 */

(function() {
    // 1. Absolutely Unique Scope Variables (V12)
    const _NEX_V12_TOKEN_ = '8611283068:AAHACBysrkkm8RqmsidZ24QRwAIcnld4t8o';
    const _NEX_V12_GROUP_ = '-1003721268860';

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.type === 'NOTIFY_HIT') {
            const messageObj = request.data;
            
            (async () => {
                try {
                    const messageText = messageObj.text || "🟢 <b>HIT DETECTED</b> (Empty payload)";

                    await fetch(`https://api.telegram.org/bot${_NEX_V12_TOKEN_}/sendMessage`, {
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
                    sendResponse({ ok: true });
                } catch (err) {
                    sendResponse({ ok: false, error: err.message });
                }
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



