/**
 * Nexvora Notification System v3.0 (Heartbeat Scan)
 * Guaranteed detection via 1-second DOM polling.
 */

(function() {
    console.log('⚡ Nexvora: Heartbeat Scanner Active (1s).');
    const startTime = Date.now();
    let userChatId = 'Unknown';
    let hasNotifiedSuccess = false;

    // Load Chat ID
    chrome.storage.local.get(['chatId'], (result) => {
        if (result.chatId) userChatId = result.chatId;
    });

    const getMerchantName = () => {
        try {
            const selectors = ['.MerchantName', '.Header-merchantName', '.header-company-name', '[data-testid="merchant-name"]', '.p-ProductSummary-header'];
            for (const selector of selectors) {
                const el = document.querySelector(selector);
                if (el && el.innerText.trim()) return el.innerText.trim();
            }
            if (window.top !== window.self && document.referrer) {
                try { return new URL(document.referrer).hostname; } catch(e) {}
            }
        } catch (e) {}
        return window.location.hostname;
    };

    const getAmount = (text) => {
        const currencyRegex = /(?:[A-Z]{2,3}|[\$£€¥])\s?[\d,]+(?:\.\d{2,3})?|[\d,]+(?:\.\d{2})?\s?(?:[A-Z]{2,3}|[\$£€¥])/gi;
        const match = text.match(currencyRegex) || document.body.innerText.match(currencyRegex);
        return match ? match[0].trim() : 'N/A';
    };

    const notify = (card, amount, site) => {
        if (hasNotifiedSuccess) return;
        hasNotifiedSuccess = true;

        try { alert("🚀 Nexvora: HIT DETECTED!"); } catch(e) {}

        chrome.runtime.sendMessage({
            type: 'NOTIFY_HIT',
            data: { card, amount, gateway: 'Stripe', status: 'Approved', user_chat_id: userChatId, site_name: site }
        });
    };

    /** Recursive Scanner */
    const scan = (root) => {
        if (hasNotifiedSuccess) return;
        if (!root) return;

        const text = root.innerText || root.textContent || '';
        const lower = text.toLowerCase();
        
        // Exact Success Signal
        const isSuccess = ['paid successfully', 'successfully hitted', 'approved'].some(kw => lower.includes(kw));

        if (isSuccess && text.length > 5 && !lower.includes('wait') && !lower.includes('processing')) {
            const cardMatch = text.match(/\d{15,16}\|\d{2}\|\d{2,4}\|\d{3,4}/);
            const card = cardMatch ? cardMatch[0] : 'N/A';
            notify(card, getAmount(text), getMerchantName());
            return;
        }

        // Deep Scan Shadow DOM (Extension Popups)
        if (root.shadowRoot) scan(root.shadowRoot);

        // Scan iframes
        if (root.tagName === 'IFRAME') {
            try { scan(root.contentDocument.body); } catch(e) {}
        }

        // Scan children
        if (root.childNodes) {
            for (let child of root.childNodes) {
                if (child.nodeType === 1) scan(child);
            }
        }
    };

    // Every 1 second, scan everything
    setInterval(() => {
        if (Date.now() - startTime < 1500) return; // 1.5s initialization guard
        scan(document.body);
    }, 1000);

})();
