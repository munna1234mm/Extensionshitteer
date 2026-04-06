/**
 * Nexvora - Checkout Branding & Auth Check
 */
(function() {
    // 1. Check Login State before proceeding
    chrome.storage.local.get(['isLoggedIn'], (result) => {
        if (!result.isLoggedIn) {
            console.log("[Nexvora] Not logged in. In-page overlay disabled.");
            return;
        }
        
        initializeNexvora();
    });

    function initializeNexvora() {
        const sanitizeUI = () => {
            // Fix any lingering branding
            const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
            let node;
            while (node = walker.nextNode()) {
                if (node.textContent.includes('Pixel')) {
                    node.textContent = node.textContent
                        .replace(/PixelAutohit/g, 'Nexvora')
                        .replace(/Pixel Hitter/g, 'Nexvora')
                        .replace(/Auto Hitter/g, 'Nexvora')
                        .replace(/Pixel/g, 'Auto');
                }
            }
        }

        // 4. Update title and add logo in the card header if found
        const panelHeader = document.querySelector('.panel-header');
        const panelTitle = document.querySelector('.panel-title');
        const overlay = document.querySelector('.card-generator-overlay');
        
        if (overlay) {
            overlay.classList.remove('dark-theme');
            overlay.style.setProperty('background', '#ffffff', 'important');
            overlay.style.setProperty('color', '#0f172a', 'important');
        }

        if (panelHeader && panelTitle) {
            panelTitle.textContent = 'Nexvora Pro';
            
            // Add Logo if not already present
            if (!panelHeader.querySelector('.nexvora-logo')) {
                const logoImg = document.createElement('img');
                logoImg.src = chrome.runtime.getURL('icons/icon128.png');
                logoImg.className = 'nexvora-logo';
                logoImg.style.height = '18px';
                logoImg.style.width = 'auto';
                logoImg.style.marginRight = '8px';
                logoImg.style.verticalAlign = 'middle';
                panelTitle.prepend(logoImg);
            }
        }

        // 5. Force Inject Global Light Theme Styles (High Specificity Brute Force)
        const oldStyle = document.getElementById('nexvora-theme-force');
        if (oldStyle) oldStyle.remove();

        const style = document.createElement('style');
        style.id = 'nexvora-theme-force';
        style.textContent = `
            /* Main Container */
            .card-generator-overlay, .modal-content { 
                background-color: #ffffff !important; 
                border: 2px solid #10b981 !important;
                border-radius: 16px !important;
                overflow: hidden !important;
            }

            /* Header - Dark Green for Premium Look */
            .panel-header { 
                background: #064e3b !important; 
                padding: 14px !important;
                display: flex !important;
                align-items: center !important;
                border: none !important;
            }
            .panel-title { 
                color: #ffffff !important; 
                font-weight: 800 !important; 
                font-size: 14px !important;
                background: transparent !important;
                display: flex !important;
                align-items: center !important;
            }
            .panel-title * { color: #ffffff !important; background: transparent !important; }

            /* Status Text */
            .status-text, .status-badge, .status-label, [id*="status"] {
                color: #059669 !important;
                font-weight: 800 !important;
                text-transform: uppercase !important;
            }

            /* Inputs - Clean with Green Border */
            .input-field, input, select {
                background: #f8fafc !important;
                color: #0f172a !important;
                border: 2px solid #e2e8f0 !important;
                border-radius: 8px !important;
                padding: 10px !important;
                font-weight: 700 !important;
            }
            .input-field:focus { border-color: #10b981 !important; }

            /* Primary Green Buttons (Start, Random BIN, Save) */
            .action-btn.primary-btn, 
            .start-btn, 
            #startBtn, 
            .random-bin-btn,
            [onclick*="start"],
            [onclick*="Random"],
            .action-btn.save-btn,
            .save-btn { 
                background: linear-gradient(135deg, #10b981, #059669) !important; 
                color: #ffffff !important;
                border: none !important;
                border-radius: 10px !important;
                font-weight: 800 !important;
                padding: 12px !important;
                text-transform: uppercase !important;
                box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3) !important;
                margin-bottom: 8px !important;
                cursor: pointer !important;
            }

            /* Mode/Tabs - Vibrant Green Active */
            .mode-toggle { background: #f1f5f9 !important; padding: 4px !important; border-radius: 12px !important; }
            .mode-btn { 
                background: transparent !important; 
                color: #64748b !important; 
                font-weight: 700 !important; 
                border: none !important;
            }
            .mode-btn.active { 
                background: #10b981 !important; 
                color: #ffffff !important;
                border-radius: 8px !important;
                box-shadow: 0 4px 10px rgba(16, 185, 129, 0.2) !important;
            }

            /* Sectioning */
            .section-title { color: #065f46 !important; font-weight: 800 !important; }
            .collapsible-header { 
                background: #f0fdf4 !important; 
                color: #065f46 !important; 
                font-weight: 800 !important;
                border-top: 1px solid #dcfce7 !important;
            }
            .stats-summary, .history-item { background: #f0fdf4 !important; }
            
            /* Fix any lingering white-on-white text */
            span, div, p, label { color: inherit; }
        `;
        document.head.appendChild(style);
    };

    // Run immediately
    forceState();
    sanitizeUI();

    // Periodic check for dynamic injections
    setInterval(sanitizeUI, 1500);
    setInterval(forceState, 5000);

})();
