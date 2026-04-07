const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security: Use environment variable or fallback to provided token
const BOT_TOKEN = process.env.BOT_TOKEN || '8611283068:AAHACBysrkkm8RqmsidZ24QRwAIcnld4t8o';

app.use(cors());
app.use(express.json());

// Telegram Webhook for /start command
app.post('/api/telegram-webhook', async (req, res) => {
    try {
        const { message } = req.body;
        if (message && message.text) {
            const chat_id = message.chat.id;
            const text = message.text.toLowerCase();

            if (text.startsWith('/start')) {
                const responseText = `👋 <b>Welcome to Nexvora!</b>\n\nYour unique Chat ID is: <code>${chat_id}</code>\n\nCopy this ID and use it to login to the Nexvora Extension. 🚀`;
                
                await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                    chat_id: chat_id,
                    text: responseText,
                    parse_mode: 'HTML'
                });
            }
        }
        res.json({ ok: true });
    } catch (error) {
        console.error('Webhook Error:', error.message);
        res.json({ ok: false });
    }
});

// Health check
app.get('/', (req, res) => {
    res.send('Nexvora Auth Server is running.');
});

// Endpoint to send OTP
app.post('/api/send-otp', async (req, res) => {
    const { chat_id, otp } = req.body;

    if (!chat_id || !otp) {
        return res.status(400).json({ ok: false, description: 'Missing Chat ID or OTP' });
    }

    try {
        const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
        await axios.post(telegramUrl, {
            chat_id: chat_id,
            text: `🔐 <b>Nexvora Login OTP</b>\n\nYour login code is: <b>${otp}</b>\n\nDo not share this code with anyone.`,
            parse_mode: 'HTML'
        });
        res.json({ ok: true });
    } catch (error) {
        console.error('OTP Send Error:', error.response ? error.response.data : error.message);
        res.status(500).json({ ok: false, description: 'Failed to send OTP' });
    }
});

// Endpoint to send Hit Notification to Group
app.post('/api/notify-hit', async (req, res) => {
    const { amount, gateway, user_chat_id, site_name } = req.body;
    const GROUP_ID = '-1003721268860';

    try {
        let userName = 'User';
        if (user_chat_id && user_chat_id !== '999999') {
            try {
                const chatRes = await axios.get(`https://api.telegram.org/bot${BOT_TOKEN}/getChat?chat_id=${user_chat_id}`);
                if (chatRes.data.ok) {
                    const chat = chatRes.data.result;
                    userName = chat.username ? `@${chat.username}` : `${chat.first_name || ''}`.trim() || 'User';
                }
            } catch (e) {
                console.warn('Could not fetch username:', e.message);
            }
        }

        console.log(`[Backup] Sending hit for ${site_name}...`);
        const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
        
        const message = `<b>HIT SUCCESSFUL</b> 🚀 (Backup)\n\n` +
                        `🌐 <b>Site:</b> <code>${site_name || 'Unknown'}</code>\n` +
                        `💰 <b>Amount:</b> <code>${amount || 'N/A'}</code>\n` +
                        `✅ <b>Status:</b> <code>Charged Successfully</code>\n\n` +
                        `<i>User: ${userName} 🇧🇩 | Checked by @hitinfobdrobot</i>`;

        const response = await axios.post(telegramUrl, {
            chat_id: GROUP_ID,
            text: message,
            parse_mode: 'HTML'
        });

        res.json({ ok: true, success: true });
    } catch (error) {
        console.error('Group Notification Error:', error.response ? error.response.data : error.message);
        res.status(500).json({ ok: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
