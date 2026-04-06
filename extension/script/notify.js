/**
 * Nexvora Precision Detection (v8.0 - Atomic)
 * Independent element-level scanning to avoid 'Processing' blocks.
 */

(function() {
    const startTime = Date.now();
    let hasNotified = false;

    /** 1-Second Precision Scan */
    setInterval(() => {
        if (hasNotified) return;
        if (Date.now() - startTime < 3000) return; // Initial page stability delay

        const scanRecursive = (root) => {
            if (hasNotified || !root) return;

            // 1. Process each element individually (Atomic Check)
            const elements = root.querySelectorAll ? root.querySelectorAll('*') : [];
            
            for (let el of elements) {
                if (hasNotified) break;
                
                // Get immediate text content (not global body text)
                const text = el.innerText || el.textContent || '';
                const lower = text.toLowerCase();

                // High-Confidence Success Markers
                const isHit = (
                    lower.includes('paid successfully') || 
                    lower.includes('successfully hitted') || 
                    lower.includes('payment successful') ||
                    lower.includes('approved')
                );

                // Atomic Validation: Check if THIS element has a success marker
                // We ignore global 'processing' text unless it's in the SAME element.
                if (isHit && text.length > 5 && text.length < 500) {
                    // Check if this specific element is NOT a processing button
                    if (!lower.includes('processing') && !lower.includes('wait')) {
                        hasNotified = true;
                        
                        // Data Extraction (Silent)
                        const cardMatch = text.match(/\d{15,16}\|\d{2}\|\d{2,4}\|\d{3,4}/);
                        const bodyText = document.body.innerText;
                        const currencyRegex = /(?:[A-Z]{2,3}|[\$£€¥])\s?[\d,]+(?:\.\d{2,3})?|[\d,]+(?:\.\d{2})?\s?(?:[A-Z]{2,3}|[\$£€¥])/gi;
                        const amountMatch = text.match(currencyRegex) || bodyText.match(currencyRegex);

                        // Dispatch to Isolated Background Bridge
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
            }

            // 2. Direct Shadow DOM support
            if (root.shadowRoot) scanRecursive(root.shadowRoot);
            
            // 3. Same-origin iframe support
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
    }, 1200);
})();
