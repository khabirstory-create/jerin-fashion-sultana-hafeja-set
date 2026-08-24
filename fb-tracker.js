/**
 * =================================================================
 * 🎯 FACEBOOK PIXEL & CONVERSION API (CAPI) TRACKER (v2.0)
 * =================================================================
 * Features:
 * - Robust Pixel ID Loading from local config or Google Sheet (X4)
 * - Standard E-commerce Events: PageView, ViewContent, InitiateCheckout, Purchase
 * - Event Deduplication with unique 'event_id'
 * - Meta Advanced Matching (_fbp, _fbc extraction)
 * - Meta Events Manager Test Event Code support
 */

(function() {
    window.fbTracker = {
        isInitialized: false,
        pixelId: null,
        testEventCode: null,
        hasCapi: false,

        // 1. Get Cookie helper for _fbp and _fbc
        getCookie: function(name) {
            try {
                const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
                return match ? decodeURIComponent(match[2]) : null;
            } catch (e) {
                return null;
            }
        },

        // 2. Generate unique Event ID for deduplication between Browser Pixel & Server CAPI
        generateEventId: function(prefix) {
            const p = prefix || 'evt';
            const timestamp = Date.now();
            const random = Math.floor(Math.random() * 1000000);
            return `${p}_${timestamp}_${random}`;
        },

        // 3. Initialize Facebook Base Pixel Script
        initBasePixel: function() {
            if (window.fbq) return;

            /* Facebook Pixel Standard Snippet */
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
        },

        // 4. Setup Pixel with ID
        setupWithPixelId: function(pixelId, testCode) {
            if (!pixelId || this.isInitialized) return;
            this.pixelId = String(pixelId).trim();
            this.testEventCode = testCode ? String(testCode).trim() : null;

            this.initBasePixel();
            
            // Initialize Meta Pixel
            fbq('init', this.pixelId);
            this.isInitialized = true;

            // Auto-track PageView
            const pageViewEventId = this.generateEventId('pageview');
            const pageViewOptions = { eventID: pageViewEventId };
            if (this.testEventCode) {
                pageViewOptions.test_event_code = this.testEventCode;
            }
            fbq('track', 'PageView', {}, pageViewOptions);
            console.log(`[Meta Pixel] Initialized (${this.pixelId}) & PageView tracked (Event ID: ${pageViewEventId})`);

            // Auto-track ViewContent on product landing page
            this.trackViewContent();
        },

        // 5. Track ViewContent
        trackViewContent: function(productName, price) {
            if (!window.fbq || !this.isInitialized) return;
            const name = productName || document.title || 'দুবাই চেরি বোরকা কালেকশন';
            const val = parseFloat(price) || 1850;
            const eventId = this.generateEventId('vc');

            const options = { eventID: eventId };
            if (this.testEventCode) {
                options.test_event_code = this.testEventCode;
            }

            fbq('track', 'ViewContent', {
                content_name: name,
                content_type: 'product',
                value: val,
                currency: 'BDT'
            }, options);
            console.log(`[Meta Pixel] ViewContent tracked (Product: "${name}", Value: ৳${val}, Event ID: ${eventId})`);
        },

        // 6. Track InitiateCheckout (Triggered when clicking order or filling form)
        trackInitiateCheckout: function(totalValue, itemsCount) {
            if (!window.fbq || !this.isInitialized) return;
            const val = parseFloat(totalValue) || 2000;
            const count = parseInt(itemsCount) || 1;
            const eventId = this.generateEventId('checkout');

            const options = { eventID: eventId };
            if (this.testEventCode) {
                options.test_event_code = this.testEventCode;
            }

            fbq('track', 'InitiateCheckout', {
                value: val,
                currency: 'BDT',
                num_items: count,
                content_type: 'product'
            }, options);
            console.log(`[Meta Pixel] InitiateCheckout tracked (Value: ৳${val}, Items: ${count}, Event ID: ${eventId})`);
        },

        // 7. Extract Meta Tracking Parameters (for server CAPI deduplication)
        getMetaTrackingParameters: function(prefix) {
            return {
                event_id: this.generateEventId(prefix || 'purchase'),
                fbp: this.getCookie('_fbp') || '',
                fbc: this.getCookie('_fbc') || '',
                user_agent: (typeof navigator !== 'undefined' && navigator.userAgent) ? navigator.userAgent : '',
                event_source_url: (typeof window !== 'undefined' && window.location && window.location.href) ? window.location.href : ''
            };
        },

        // 8. Track Purchase (Browser + Server Deduplication)
        trackPurchase: function(orderData, eventId) {
            const finalEventId = eventId || this.generateEventId('purchase');
            const total = parseFloat((orderData.total || '0').toString().replace(/[^0-9.]/g, '')) || 0;
            const productName = orderData.product || orderData.products || 'বোরকা';

            if (window.fbq && this.isInitialized) {
                const options = { eventID: finalEventId };
                if (this.testEventCode) {
                    options.test_event_code = this.testEventCode;
                }

                fbq('track', 'Purchase', {
                    value: total,
                    currency: 'BDT',
                    content_name: productName,
                    content_type: 'product'
                }, options);
                console.log(`[Meta Pixel] Purchase tracked in browser (Value: ৳${total}, Event ID: ${finalEventId})`);
            }

            return {
                event_id: finalEventId,
                fbp: this.getCookie('_fbp') || '',
                fbc: this.getCookie('_fbc') || '',
                user_agent: (typeof navigator !== 'undefined' && navigator.userAgent) ? navigator.userAgent : '',
                event_source_url: (typeof window !== 'undefined' && window.location && window.location.href) ? window.location.href : ''
            };
        },

        // 9. Bootstrap configuration from APP_CONFIG, sessionStorage, or Google Sheet
        bootstrap: function() {
            const self = this;
            
            // Ensure base script tag stub is ready
            self.initBasePixel();

            // Get local config safely from global scope or window
            const cfg = (typeof APP_CONFIG !== 'undefined' && APP_CONFIG) 
                ? APP_CONFIG 
                : (typeof window !== 'undefined' && window.APP_CONFIG ? window.APP_CONFIG : {});
            
            const adminCfg = (typeof ADMIN_CONFIG !== 'undefined' && ADMIN_CONFIG) 
                ? ADMIN_CONFIG 
                : (typeof window !== 'undefined' && window.ADMIN_CONFIG ? window.ADMIN_CONFIG : {});

            // Check if Pixel ID is hardcoded in local config
            if (cfg && cfg.FB_PIXEL_ID && cfg.FB_PIXEL_ID !== 'YOUR_PIXEL_ID') {
                self.setupWithPixelId(cfg.FB_PIXEL_ID, cfg.FB_TEST_EVENT_CODE);
            }

            // Check Session Storage Cache
            try {
                const cachedPixelId = sessionStorage.getItem('fb_pixel_id');
                const cachedTestCode = sessionStorage.getItem('fb_test_code');
                if (cachedPixelId && !self.isInitialized) {
                    self.setupWithPixelId(cachedPixelId, cachedTestCode);
                }
            } catch (e) {}

            // Fetch live config & X7 duplicate message from Google Apps Script API
            const scriptUrl = (cfg && (cfg.GOOGLE_SHEET_URL || cfg.GOOGLE_SCRIPT_URL)) ||
                              (adminCfg && adminCfg.GOOGLE_SCRIPT_URL) || '';

            if (scriptUrl) {
                const callbackName = 'fbConfigCallback_' + Math.floor(Math.random() * 100000);

                window[callbackName] = function(data) {
                    if (data) {
                        if (data.duplicate_message) {
                            window.borkaDuplicateMessage = data.duplicate_message;
                            try {
                                localStorage.setItem('borka_duplicate_msg', data.duplicate_message);
                            } catch (e) {}
                        }
                        if (data.spam_protection !== undefined) {
                            window.borkaSpamProtection = !!data.spam_protection;
                            try {
                                localStorage.setItem('borka_spam_protection', data.spam_protection ? 'ON' : 'OFF');
                            } catch (e) {}
                        }
                        if (data.pixel_id && !self.isInitialized) {
                            try {
                                sessionStorage.setItem('fb_pixel_id', data.pixel_id);
                                if (data.test_event_code) sessionStorage.setItem('fb_test_code', data.test_event_code);
                            } catch (e) {}
                            self.hasCapi = !!data.has_capi;
                            self.setupWithPixelId(data.pixel_id, data.test_event_code);
                        }
                    }
                    delete window[callbackName];
                    const el = document.getElementById(callbackName);
                    if (el && el.parentNode) el.parentNode.removeChild(el);
                };

                const s = document.createElement('script');
                s.id = callbackName;
                s.src = scriptUrl + (scriptUrl.indexOf('?') >= 0 ? '&' : '?') + 'action=get_fb_config&callback=' + callbackName;
                s.onerror = function() {
                    delete window[callbackName];
                };
                document.head.appendChild(s);
            }
        }
    };

    // Immediate bootstrap
    window.fbTracker.bootstrap();
})();
