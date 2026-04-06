// AUTH CONFIG
// Replace with your Render URL after deployment (e.g. https://nexvora-auth.onrender.com)
const RENDER_URL = 'https://nexvora-auth.onrender.com'; 
let generatedOTP = null;

document.addEventListener('DOMContentLoaded', () => {
    const loginScreen = document.getElementById('login-screen');
    const appContent = document.getElementById('app');
    const sendOtpBtn = document.getElementById('send-otp-btn');
    const loginBtn = document.getElementById('login-btn');
    const chatIdInput = document.getElementById('chat-id');
    const otpInput = document.getElementById('otp-code');
    const otpSection = document.getElementById('otp-section');
    const loginStatus = document.getElementById('login-status');

    // 1. Check if already logged in
    chrome.storage.local.get(['isLoggedIn'], (result) => {
        if (result.isLoggedIn) {
            showDashboard();
        }
    });

    // 2. Send OTP Handler
    sendOtpBtn.addEventListener('click', async () => {
        const chatId = chatIdInput.value.trim();
        if (!chatId) {
            showStatus('Please enter your Chat ID', 'error');
            return;
        }

        sendOtpBtn.disabled = true;
        sendOtpBtn.textContent = 'Sending...';
        showStatus('Sending OTP via Server...', 'success');

        generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
        
        try {
            // Updated to use the secure backend server
            const response = await fetch(`${RENDER_URL}/api/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    otp: generatedOTP
                })
            });

            const data = await response.json();
            if (data.ok) {
                showStatus('OTP sent! Check your Telegram.', 'success');
                otpSection.style.display = 'block';
                sendOtpBtn.textContent = 'Resend OTP';
                sendOtpBtn.disabled = false;
            } else {
                throw new Error(data.description || 'Server error');
            }
        } catch (error) {
            showStatus('Error: ' + error.message + '. Make sure the server is live.', 'error');
            sendOtpBtn.disabled = false;
            sendOtpBtn.textContent = 'Send OTP to Telegram';
        }
    });

    // 3. Login Handler
    loginBtn.addEventListener('click', () => {
        const enteredOtp = otpInput.value.trim();
        
        if (enteredOtp === generatedOTP && generatedOTP !== null) {
            showStatus('Login successful!', 'success');
            chrome.storage.local.set({ isLoggedIn: true }, () => {
                setTimeout(showDashboard, 1000);
            });
        } else {
            showStatus('Invalid OTP code. Please try again.', 'error');
        }
    });

    function showDashboard() {
        loginScreen.classList.add('hidden');
        appContent.classList.remove('hidden');
    }

    function showStatus(msg, type) {
        loginStatus.textContent = msg;
        loginStatus.className = 'login-status ' + (type === 'success' ? 'status-success' : 'status-error');
    }

    // Logout capability (integration with existing logout buttons)
    const logoutBtns = document.querySelectorAll('#logoutBtn, .logout-btn');
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            chrome.storage.local.set({ isLoggedIn: false }, () => {
                window.location.reload();
            });
        });
    });
});
