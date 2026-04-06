/**
 * Nexvora Notification System v2.1 (Non-Blocking Mode)
 * Monitors both the Dashboard and Checkout Pages for successful hits.
 */

(function() {
    const startTime = Date.now(); 
    let userChatId = 'Unknown';

    // ASYNC Load Chat ID (Non-Blocking)
    chrome.storage.local.get(['chatId'], (result) => {
        if (result.chatId) {
            userChatId = result.chatId;
            console.log('✅ Nexvora: User ID loaded:', userChatId);
        }
    });

    let hasNotifiedSuccess = false;

    /**
     * Tries to find the real merchant name on the checkout page.
     */
    const getMerchantName = () => {
        try {
            const selectors = ['.MerchantName', '.Header-merchantName', '.header-company-name', '[data-testid="merchant-name"]', '.p-ProductSummary-header'];
            for (const selector of selectors) {
                const el = document.querySelector(selector);
                if (el && el.innerText.trim()) return el.innerText.trim();
            }
            const headerText = document.body.innerText.split('\n')[0];
            if (headerText && headerText.length < 50 && headerText.length > 2) return headerText.trim();
            if (window.top !== window.self && document.referrer) {
                try { return new URL(document.referrer).hostname; } catch(e) {}
            }
        } catch (e) {}
        return window.location.hostname;
    };

    /**
     * Amount extraction from text
     */
    const getTransactionAmount = (customText) => {
        const currencyRegex = /(?:[A-Z]{2,3}|[\$£€¥])\s?[\d,]+(?:\.\d{2,3})?|[\d,]+(?:\.\d{2})?\s?(?:[A-Z]{2,3}|[\$£€¥])/gi;
        const match = customText.match(currencyRegex) || document.body.innerText.match(currencyRegex);
        return match ? match[0].trim() : 'N/A';
    };

    const notifyServer = async (hitData) => {
        if (hasNotifiedSuccess) return; 
        
        try {
            hasNotifiedSuccess = true;
            
            // LOCAL ALERT FOR USER (Diagnostic)
            try {
                alert("🚀 Nexvora: HIT DETECTED!\n\nWait for message in Telegram...");
            } catch(e) {}

            console.info('🚀 Sending hit to background...', hitData);

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
                console.log('Background Signal result:', response);
            });
        } catch (error) {
            console.error('Failed hit signal:', error);
            hasNotifiedSuccess = false; 
        }
    };

    /**
     * Aggressively scans an element and its Shadow DOMs for keywords.
     */
    const scanElementRecursively = (root) => {
        if (hasNotifiedSuccess) return;
        if (!root) return;

        // 1. Check current element text
        const text = root.innerText || root.textContent || '';
        const lowerText = text.toLowerCase();
        
        const successKeywords = ['paid successfully', 'successfully hitted', 'approved'];
        const isSuccess = successKeywords.some(kw => lowerText.includes(kw));

        const ignoreKeywords = ['processing', 'loading', 'wait', 'please', 'checking'];
        const shouldIgnore = ignoreKeywords.some(kw => lowerText.includes(kw));

        if (isSuccess && !shouldIgnore && text.length > 5) {
            const cardMatch = text.match(/\d{15,16}\|\d{2}\|\d{2,4}\|\d{3,4}/);
            const card = cardMatch ? cardMatch[0] : 'N/A';
            const siteName = getMerchantName();
            const amount = getTransactionAmount(text);
            
            notifyServer({ card, amount, site_name: siteName, gateway: 'Stripe', status: 'Approved' });
            return;
        }

        // 2. Scan children iframes (if same origin)
        if (root.tagName === 'IFRAME') {
            try {
                scanElementRecursively(root.contentDocument.body);
            } catch(e) {}
        }

        // 3. Scan Shadow DOM
        if (root.shadowRoot) {
            scanElementRecursively(root.shadowRoot);
        }

        // 4. Scan regular children
        if (root.childNodes) {
            for (let child of root.childNodes) {
                if (child.nodeType === 1) scanElementRecursively(child);
            }
        }
    };

    const setupObserver = () => {
        // Mutation Observer for real-time
        const observer = new MutationObserver((mutations) => {
            if (Date.now() - startTime < 1000) return; // 1s guard
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) scanElementRecursively(node);
                });
            });
        });
        observer.observe(document.body, { childList: true, subtree: true });

        // Interval Polling fallback (Aggressive checking)
        setInterval(() => {
            if (Date.now() - startTime < 1500) return;
            scanElementRecursively(document.body);
        }, 2000);

        console.log('🌍 Nexvora: Global Monitoring Active (Non-Blocking).');
    };

    // Initialize IMMEDIATELY
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupObserver);
    } else {
        setupObserver();
    }
})();
