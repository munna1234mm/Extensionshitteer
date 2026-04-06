/**
 * Nexvora Omni-Detection (v10.0 - MutationAware)
 * Real-time monitoring across all sites and frames.
 */

(function() {
    let hasNotified = false;

    // 1. Success Recognition Function
    const processHit = (text, context) => {
        if (hasNotified) return;
        const lower = text.toLowerCase();
        
        const isHit = (
            lower.includes('paid successfully') || 
            lower.includes('successfully hitted') || 
            lower.includes('payment successful') ||
            lower.includes('approved')
        );

        if (isHit && text.length > 5 && text.length < 1000) {
            hasNotified = true;
            
            // Fast Data Extraction
            const cardMatch = text.match(/\d{15,16}\|\d{2}\|\d{2,4}\|\d{3,4}/);
            const amountRegex = /(?:[A-Z]{2,3}|[\$£€¥])\s?[\d,]+(?:\.\d{2,3})?|[\d,]+(?:\.\d{2})\s?(?:[A-Z]{2,3}|[\$£€¥])/gi;
            const amountMatch = text.match(amountRegex) || document.body.innerText.match(amountRegex);

            // Immediate Proxy Send
            chrome.runtime.sendMessage({
                type: 'NOTIFY_HIT',
                data: {
                    card: cardMatch ? cardMatch[0] : 'N/A',
                    amount: amountMatch ? amountMatch[0].trim() : 'N/A',
                    gateway: 'Stripe Omni-Detection',
                    status: 'Approved',
                    site_name: window.location.hostname,
                    user_chat_id: 'Unknown'
                }
            });
        }
    };

    // 2. Real-Time Mutation Observer
    const observer = new MutationObserver((mutations) => {
        if (hasNotified) {
            observer.disconnect();
            return;
        }
        for (let mutation of mutations) {
            for (let node of mutation.addedNodes) {
                if (node.nodeType === 1) { // Element node
                    processHit(node.innerText || node.textContent || '', 'Mutation');
                    if (node.shadowRoot) scanRecursive(node.shadowRoot);
                }
            }
        }
    });

    // 3. Recursive Backup Scanner
    const scanRecursive = (root) => {
        if (hasNotified || !root) return;

        // Atomic check
        const elements = root.querySelectorAll ? root.querySelectorAll('*') : [];
        for (let el of elements) {
            if (hasNotified) break;
            processHit(el.innerText || el.textContent || '', 'Scanner');
        }

        // Deep traversal (Shadow DOM / Iframes)
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

    // Start Everything
    if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
        setInterval(() => scanRecursive(document.body), 500);
    } else {
        // Fallback for document_start
        document.addEventListener('DOMContentLoaded', () => {
            observer.observe(document.body, { childList: true, subtree: true });
            setInterval(() => scanRecursive(document.body), 500);
        });
    }
})();
