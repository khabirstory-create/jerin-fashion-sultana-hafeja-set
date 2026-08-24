document.addEventListener('DOMContentLoaded', function() {
    // Read Configuration from config.js
    const activeConfig = (typeof APP_CONFIG !== 'undefined') ? APP_CONFIG : {};

    const rawProducts = Array.isArray(activeConfig.PRODUCTS) 
        ? activeConfig.PRODUCTS 
        : Object.keys(activeConfig.PRODUCTS || {}).map(k => ({ key: k, ...activeConfig.PRODUCTS[k] }));

    const shippingDhaka = (activeConfig.SHIPPING && activeConfig.SHIPPING.INSIDE_DHAKA) || 80;
    const shippingOutside = (activeConfig.SHIPPING && activeConfig.SHIPPING.OUTSIDE_DHAKA) || 150;
    const apiEndpoint = activeConfig.API_URL || activeConfig.MYSQL_API_URL || '/api/orders';
    const sheetEndpoint = activeConfig.GOOGLE_SHEET_URL || localStorage.getItem('gas_sheet_url') || '';
    const helpPhone = activeConfig.HELP_PHONE || '01886106856';
    const whatsappPhone = activeConfig.WHATSAPP_PHONE || '8801886106856';

    let selectedProducts = [];
    let deliveryCharge = shippingOutside; // Default outside Dhaka

    // --- Update Helpline Phone Number & WhatsApp if set ---
    if (helpPhone) {
        const phoneDisplay = document.querySelector('.phone-number');
        const callBtn = document.querySelector('.call-button');
        if (phoneDisplay) phoneDisplay.textContent = helpPhone;
        if (callBtn) {
            callBtn.href = `tel:${helpPhone}`;
            callBtn.innerHTML = `<i class="ti ti-phone-call"></i> ${helpPhone}`;
            callBtn.addEventListener('click', function() {
                if (window.fbq) fbq('track', 'Contact', { content_name: 'Helpline Call' });
            });
        }
    }

    const waBtn = document.querySelector('.whatsapp-float');
    if (waBtn && whatsappPhone) {
        waBtn.href = `https://wa.me/${whatsappPhone.replace(/[^0-9]/g, '')}`;
        waBtn.addEventListener('click', function() {
            if (window.fbq) fbq('track', 'Contact', { content_name: 'WhatsApp Chat' });
        });
    }

    // --- Update Delivery Radio Labels with dynamic price from config ---
    const outsideRadioLabel = document.querySelector('input[name="delivery"][value="outside"]');
    const insideRadioLabel = document.querySelector('input[name="delivery"][value="inside"]');
    if (outsideRadioLabel && outsideRadioLabel.parentElement) {
        outsideRadioLabel.parentElement.innerHTML = `<input type="radio" name="delivery" value="outside" checked> ঢাকা সিটির বাহিরে (${shippingOutside} টাকা)`;
    }
    if (insideRadioLabel && insideRadioLabel.parentElement) {
        insideRadioLabel.parentElement.innerHTML = `<input type="radio" name="delivery" value="inside"> ঢাকা সিটির ভিতরে (${shippingDhaka} টাকা)`;
    }

    // --- 1. DYNAMICALLY RENDER PRODUCTS ---
    const productOptionsContainer = document.querySelector('.product-options');
    
    if (productOptionsContainer && rawProducts.length > 0) {
        productOptionsContainer.innerHTML = rawProducts.map((prod, index) => {
            const isDefault = (index === 0);
            const hasSizes = prod.sizes && Array.isArray(prod.sizes) && prod.sizes.length > 0;
            
            return `
                <div class="product-item ${isDefault ? 'selected' : ''}" data-product="${prod.key || index}">
                    <div class="product-card-top">
                        <div class="card-checkbox">
                            <i class="ti ti-check"></i>
                        </div>
                        <div class="product-thumb-wrapper">
                            <img src="${prod.image || '../images/sultana-hafeja-set/1.webp'}" alt="${prod.title || 'Product'}">
                            <div class="thumb-check"><i class="ti ti-check"></i></div>
                        </div>
                        <div class="product-info">
                            <h3 class="product-title">${prod.title || prod.displayName || 'বোরকা'}</h3>
                            ${prod.subtitle ? `<p class="product-subtitle">${prod.subtitle}</p>` : ''}
                            <div class="product-price">
                                <span class="original-price">${prod.originalPrice}৳</span>
                                <span class="discount-price">${prod.price}৳</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="product-card-bottom" style="${isDefault ? 'display:block;' : 'display:none;'}">
                        ${hasSizes ? `
                        <div class="size-section">
                            <span class="section-label">সাইজ:</span>
                            <div class="size-buttons">
                                ${prod.sizes.map((size, sIdx) => `
                                    <button type="button" class="${isDefault && sIdx === 0 ? 'selected' : ''}">${size}</button>
                                `).join('')}
                            </div>
                        </div>` : ''}

                        <div class="quantity-section">
                            <span class="section-label">পরিমান:</span>
                            <div class="quantity-counter">
                                <button type="button" class="qty-btn minus">-</button>
                                <span class="qty-number">1</span>
                                <button type="button" class="qty-btn plus">+</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // --- 2. GALLERY FUNCTIONALITY & AUTO-SLIDE (2 SECONDS) ---
    const gallerySection = document.querySelector('.product-gallery');
    const mainImage = document.getElementById('mainProductImage') || document.querySelector('.main-image img');
    const thumbnails = document.querySelectorAll('.thumbnails img');
    const prevArrow = document.querySelector('.prev-arrow');
    const nextArrow = document.querySelector('.next-arrow');
    const thumbnailsContainer = document.querySelector('.thumbnails');
    let currentIndex = 0;
    let autoSlideTimer = null;

    function selectThumbnail(index) {
        if (!thumbnails || thumbnails.length === 0) return;
        if (index < 0) index = thumbnails.length - 1;
        if (index >= thumbnails.length) index = 0;
        currentIndex = index;

        const activeThumbnail = thumbnails[currentIndex];
        if (mainImage && activeThumbnail) {
            mainImage.src = activeThumbnail.src;
        }

        thumbnails.forEach(t => t.classList.remove('selected'));
        if (activeThumbnail) {
            activeThumbnail.classList.add('selected');

            if (thumbnailsContainer) {
                const containerWidth = thumbnailsContainer.offsetWidth;
                const thumbnailWidth = activeThumbnail.offsetWidth;
                const scrollPosition = activeThumbnail.offsetLeft - (containerWidth / 2) + (thumbnailWidth / 2);
                
                thumbnailsContainer.scrollTo({
                    left: scrollPosition,
                    behavior: 'smooth'
                });
            }
        }
    }

    function startAutoSlide() {
        stopAutoSlide();
        if (thumbnails && thumbnails.length > 1) {
            autoSlideTimer = setInterval(() => {
                selectThumbnail(currentIndex + 1);
            }, 2500);
        }
    }

    function stopAutoSlide() {
        if (autoSlideTimer) {
            clearInterval(autoSlideTimer);
            autoSlideTimer = null;
        }
    }

    function resetAutoSlide() {
        stopAutoSlide();
        startAutoSlide();
    }

    thumbnails.forEach((thumb, idx) => {
        thumb.addEventListener('click', () => {
            selectThumbnail(idx);
            resetAutoSlide();
        });
    });

    if (prevArrow) {
        prevArrow.addEventListener('click', (e) => {
            e.preventDefault();
            selectThumbnail(currentIndex - 1);
            resetAutoSlide();
        });
    }

    if (nextArrow) {
        nextArrow.addEventListener('click', (e) => {
            e.preventDefault();
            selectThumbnail(currentIndex + 1);
            resetAutoSlide();
        });
    }

    startAutoSlide();

    if (gallerySection) {
        gallerySection.addEventListener('mouseenter', stopAutoSlide);
        gallerySection.addEventListener('mouseleave', startAutoSlide);
        gallerySection.addEventListener('touchstart', stopAutoSlide, { passive: true });
        gallerySection.addEventListener('touchend', startAutoSlide, { passive: true });
    }

    // --- 3. SMOOTH SCROLL FOR TOP ORDER BUTTON ---
    const topOrderBtn = document.querySelector('.order-button button');
    if (topOrderBtn) {
        topOrderBtn.addEventListener('click', function() {
            const productSection = document.querySelector('.select-text') || document.querySelector('.order-form-section');
            if (productSection) {
                productSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    }

    // --- 4. DOM ELEMENTS FOR ORDER & FORM ---
    const productItems = document.querySelectorAll('.product-item');
    const selectedItemDiv = document.getElementById('selectedProductDetails');
    const totalPriceSpan = document.querySelector('.total-price');
    const deliveryChargeSpan = document.querySelector('.delivery-charge');
    const grandTotalSpan = document.querySelector('.grand-total');
    const orderForm = document.getElementById('orderForm');
    const confirmButton = orderForm ? orderForm.querySelector('button[type="submit"]') : null;
    const nameInput = document.getElementById('name');
    const addressInput = document.getElementById('address');
    const phoneInput = document.getElementById('phone');
    const warningMessageDiv = document.getElementById('productValidationMessage');

    function getProductConfig(key) {
        return rawProducts.find(p => String(p.key) === String(key)) || rawProducts[0];
    }

    function validateOrderRequirements() {
        if (!warningMessageDiv) return;
        const hasSelectedProducts = selectedProducts.length > 0;
        const allProductsHaveSize = selectedProducts.every(p => {
            if (p.hasSizes) {
                return !!p.size;
            }
            return true;
        });
        const hasName = nameInput && nameInput.value.trim() !== '';
        const hasAddress = addressInput && addressInput.value.trim() !== '';
        const hasPhone = phoneInput && phoneInput.value.trim() !== '';

        if (!hasSelectedProducts) {
            warningMessageDiv.style.color = '#ef4444';
            warningMessageDiv.textContent = 'দয়া করে কমপক্ষে একটি পণ্য নির্বাচন করুন';
        } else if (!allProductsHaveSize) {
            warningMessageDiv.style.color = '#ef4444';
            warningMessageDiv.textContent = 'দয়া করে সব পণ্যের সাইজ নির্বাচন করুন';
        } else if (!hasName || !hasAddress || !hasPhone) {
            warningMessageDiv.style.color = '#ef4444';
            warningMessageDiv.textContent = 'দয়া করে সকল প্রয়োজনীয় তথ্য পূরণ করুন';
        } else {
            warningMessageDiv.textContent = '';
        }
    }

    function updateOrderSummary() {
        if (!selectedItemDiv) return;
        if (selectedProducts.length === 0) {
            selectedItemDiv.innerHTML = '<p>কোনো পণ্য নির্বাচন করা হয়নি</p>';
            if (totalPriceSpan) totalPriceSpan.textContent = '৳0';
            if (deliveryChargeSpan) deliveryChargeSpan.textContent = `৳${deliveryCharge}`;
            if (grandTotalSpan) grandTotalSpan.textContent = `৳${deliveryCharge}`;
        } else {
            let totalPrice = 0;
            const productDetailsHTML = selectedProducts.map(product => {
                const productTotal = product.price * product.quantity;
                totalPrice += productTotal;
                const sizeText = product.hasSizes 
                    ? (product.size ? ` - সাইজ: ${product.size}` : ' - <span style="color:#ef4444;">(সাইজ সিলেক্ট করুন)</span>')
                    : '';
                return `
                    <div class="selected-product" style="padding: 4px 0; font-size: 13.5px; color: #1e293b;">
                        <strong>${product.title}</strong>${sizeText} - ${product.quantity}টি - ৳${productTotal}
                    </div>
                `;
            }).join('');

            const grandTotal = totalPrice + deliveryCharge;

            selectedItemDiv.innerHTML = productDetailsHTML;
            if (totalPriceSpan) totalPriceSpan.textContent = `৳${totalPrice}`;
            if (deliveryChargeSpan) deliveryChargeSpan.textContent = `৳${deliveryCharge}`;
            if (grandTotalSpan) grandTotalSpan.textContent = `৳${grandTotal}`;
        }

        validateOrderRequirements();
    }

    // Initialize Default 1st Product in selectedProducts
    if (rawProducts.length > 0) {
        const firstProd = rawProducts[0];
        const hasSizes = firstProd.sizes && Array.isArray(firstProd.sizes) && firstProd.sizes.length > 0;
        const defaultSize = hasSizes ? firstProd.sizes[0] : null;

        selectedProducts.push({
            key: firstProd.key || '0',
            title: firstProd.title,
            sheetName: firstProd.sheetName || firstProd.title,
            price: firstProd.price,
            originalPrice: firstProd.originalPrice,
            size: defaultSize,
            hasSizes: hasSizes,
            quantity: 1
        });
    }

    // Product Card Selection & Event Listeners
    productItems.forEach((item) => {
        const productKey = item.getAttribute('data-product');
        const productData = getProductConfig(productKey);

        const cardTop = item.querySelector('.product-card-top');
        const cardBottom = item.querySelector('.product-card-bottom');
        const sizeButtonsContainer = item.querySelector('.size-buttons');

        if (cardTop) {
            cardTop.addEventListener('click', function() {
                item.classList.toggle('selected');

                if (item.classList.contains('selected')) {
                    if (cardBottom) cardBottom.style.display = 'block';
                    const activeSizeBtn = item.querySelector('.size-buttons button.selected');
                    const defaultSize = activeSizeBtn ? activeSizeBtn.textContent.trim() : (productData.sizes && productData.sizes[0] ? productData.sizes[0] : null);
                    const hasSizes = productData.sizes && Array.isArray(productData.sizes) && productData.sizes.length > 0;

                    if (activeSizeBtn) {
                        activeSizeBtn.classList.add('selected');
                    } else if (hasSizes) {
                        const firstBtn = item.querySelector('.size-buttons button');
                        if (firstBtn) firstBtn.classList.add('selected');
                    }

                    const exists = selectedProducts.find(p => String(p.key) === String(productKey));
                    if (!exists) {
                        selectedProducts.push({
                            key: productKey,
                            title: productData.title,
                            sheetName: productData.sheetName || productData.title,
                            price: productData.price,
                            originalPrice: productData.originalPrice,
                            size: defaultSize,
                            hasSizes: hasSizes,
                            quantity: 1
                        });
                    }
                } else {
                    if (cardBottom) cardBottom.style.display = 'none';
                    selectedProducts = selectedProducts.filter(p => String(p.key) !== String(productKey));
                    
                    const sizeButtons = item.querySelectorAll('.size-buttons button');
                    sizeButtons.forEach(btn => btn.classList.remove('selected'));

                    const quantitySpan = item.querySelector('.qty-number');
                    if (quantitySpan) quantitySpan.textContent = '1';

                    const priceDisplay = item.querySelector('.discount-price');
                    const originalPriceDisplay = item.querySelector('.original-price');
                    if (priceDisplay) priceDisplay.textContent = `${productData.price}৳`;
                    if (originalPriceDisplay) originalPriceDisplay.textContent = `${productData.originalPrice}৳`;
                }

                updateOrderSummary();
            });
        }

        if (sizeButtonsContainer) {
            sizeButtonsContainer.addEventListener('click', (e) => {
                const button = e.target.closest('button');
                if (!button) return;

                e.stopPropagation();
                const hasSizes = productData.sizes && Array.isArray(productData.sizes) && productData.sizes.length > 0;

                if (!item.classList.contains('selected')) {
                    item.classList.add('selected');
                    if (cardBottom) cardBottom.style.display = 'block';
                    selectedProducts.push({
                        key: productKey,
                        title: productData.title,
                        sheetName: productData.sheetName || productData.title,
                        price: productData.price,
                        originalPrice: productData.originalPrice,
                        size: button.textContent.trim(),
                        hasSizes: hasSizes,
                        quantity: 1
                    });
                }

                sizeButtonsContainer.querySelectorAll('button').forEach(b => b.classList.remove('selected'));
                button.classList.add('selected');

                const productIndex = selectedProducts.findIndex(p => String(p.key) === String(productKey));
                if (productIndex !== -1) {
                    selectedProducts[productIndex].size = button.textContent.trim();
                    updateOrderSummary();
                }
            });
        }

        const quantityBox = item.querySelector('.quantity-counter');
        if (quantityBox) {
            const minusBtn = quantityBox.querySelector('.minus');
            const plusBtn = quantityBox.querySelector('.plus');
            const quantitySpan = quantityBox.querySelector('.qty-number');

            if (minusBtn) {
                minusBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const productIndex = selectedProducts.findIndex(p => String(p.key) === String(productKey));
                    
                    if (productIndex !== -1 && selectedProducts[productIndex].quantity > 1) {
                        selectedProducts[productIndex].quantity--;
                        if (quantitySpan) quantitySpan.textContent = selectedProducts[productIndex].quantity;

                        const priceDisplay = item.querySelector('.discount-price');
                        const originalPriceDisplay = item.querySelector('.original-price');
                        const basePrice = productData.price;
                        const origPrice = productData.originalPrice;

                        if (priceDisplay) priceDisplay.textContent = `${basePrice * selectedProducts[productIndex].quantity}৳`;
                        if (originalPriceDisplay) originalPriceDisplay.textContent = `${origPrice * selectedProducts[productIndex].quantity}৳`;

                        updateOrderSummary();
                    }
                });
            }

            if (plusBtn) {
                plusBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const productIndex = selectedProducts.findIndex(p => String(p.key) === String(productKey));

                    if (productIndex !== -1) {
                        selectedProducts[productIndex].quantity++;
                        if (quantitySpan) quantitySpan.textContent = selectedProducts[productIndex].quantity;

                        const priceDisplay = item.querySelector('.discount-price');
                        const originalPriceDisplay = item.querySelector('.original-price');
                        const basePrice = productData.price;
                        const origPrice = productData.originalPrice;

                        if (priceDisplay) priceDisplay.textContent = `${basePrice * selectedProducts[productIndex].quantity}৳`;
                        if (originalPriceDisplay) originalPriceDisplay.textContent = `${origPrice * selectedProducts[productIndex].quantity}৳`;

                        updateOrderSummary();
                    }
                });
            }
        }
    });

    // Delivery charge radio change
    const deliveryOptions = document.querySelectorAll('input[name="delivery"]');
    deliveryOptions.forEach(option => {
        option.addEventListener('change', () => {
            if (option.value === 'inside') {
                deliveryCharge = shippingDhaka;
            } else {
                deliveryCharge = shippingOutside;
            }
            updateOrderSummary();
        });
    });

    if (nameInput) nameInput.addEventListener('input', validateOrderRequirements);
    if (addressInput) addressInput.addEventListener('input', validateOrderRequirements);
    if (phoneInput) phoneInput.addEventListener('input', validateOrderRequirements);

    // Initial call
    updateOrderSummary();

    // Generate readable JF Order ID
    function generateOrderId() {
        const randomDigits = Math.floor(10000 + Math.random() * 90000);
        return `JF-${randomDigits}`;
    }

    // Save order locally for Admin instant visibility
    function saveOrderLocally(order) {
        try {
            const raw = localStorage.getItem('borka_orders');
            let orders = raw ? JSON.parse(raw) : [];
            orders.unshift(order);
            localStorage.setItem('borka_orders', JSON.stringify(orders));
        } catch(e) {
            console.error('Error saving local order:', e);
        }
    }

    // Submit form handler
    if (orderForm) {
        orderForm.addEventListener('submit', function(e) {
            e.preventDefault();

            if (selectedProducts.length === 0) {
                if (warningMessageDiv) {
                    warningMessageDiv.style.color = '#ef4444';
                    warningMessageDiv.textContent = 'দয়া করে কমপক্ষে একটি পণ্য নির্বাচন করুন';
                    warningMessageDiv.scrollIntoView({ behavior: 'smooth' });
                }
                return;
            }

            const unselectedSize = selectedProducts.find(p => p.hasSizes && !p.size);
            if (unselectedSize) {
                if (warningMessageDiv) {
                    warningMessageDiv.style.color = '#ef4444';
                    warningMessageDiv.textContent = 'দয়া করে সব পণ্যের সাইজ নির্বাচন করুন';
                    warningMessageDiv.scrollIntoView({ behavior: 'smooth' });
                }
                return;
            }

            const name = nameInput ? nameInput.value.trim() : '';
            const address = addressInput ? addressInput.value.trim() : '';
            const phone = phoneInput ? phoneInput.value.trim() : '';

            if (!name || !address || !phone) {
                if (warningMessageDiv) {
                    warningMessageDiv.style.color = '#ef4444';
                    warningMessageDiv.textContent = 'দয়া করে সকল তথ্য পূরণ করুন';
                }
                return;
            }

            const cleanPhone = phone.replace(/[^0-9]/g, '');
            const isValidBDPhone = /^(01[3-9]\d{8}|8801[3-9]\d{8})$/.test(cleanPhone);
            if (!isValidBDPhone) {
                if (warningMessageDiv) {
                    warningMessageDiv.style.color = '#ef4444';
                    warningMessageDiv.textContent = 'সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 018XXXXXXXX)';
                    warningMessageDiv.scrollIntoView({ behavior: 'smooth' });
                }
                return;
            }

            const originalButtonText = confirmButton.innerHTML;
            confirmButton.innerHTML = '<i class="ti ti-loader ti-spin"></i> অর্ডার কনফার্ম হচ্ছে...';
            confirmButton.disabled = true;

            const orderId = generateOrderId();
            const productNames = selectedProducts.map(p => p.sheetName || p.title).join(', ');
            const sizeQuantityDetails = selectedProducts.map(p => {
                const sizeStr = p.size ? `(${p.size})` : '';
                return `${p.sheetName || p.title} ${sizeStr} - ${p.quantity}টি`;
            }).join(' + ');

            const totalPrice = selectedProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0);
            const grandTotal = totalPrice + deliveryCharge;
            const deliveryText = (deliveryCharge === shippingDhaka) ? `ঢাকা ভিতরে (${shippingDhaka}৳)` : `ঢাকা বাহিরে (${shippingOutside}৳)`;

            const orderData = {
                action: 'new_order',
                orderId: orderId,
                timestamp: new Date().toString(),
                name: name,
                phone: phone,
                address: address,
                product: sizeQuantityDetails,
                raw_product: productNames,
                delivery: deliveryText,
                total: `৳${grandTotal}`,
                numeric_total: grandTotal,
                source: (window.location.search.includes('tt') || window.location.search.includes('tiktok')) ? 'TikTok' : (window.location.search.includes('fb') ? 'Facebook' : 'Direct'),
                status: 'Processing'
            };

            // Save to localStorage for instant Admin view
            saveOrderLocally(orderData);

            // Google Sheets Apps Script Submission
            const currentSheetUrl = activeConfig.GOOGLE_SHEET_URL || localStorage.getItem('gas_sheet_url') || '';
            
            const submitPromises = [];

            if (currentSheetUrl) {
                const sheetPromise = fetch(currentSheetUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify(orderData),
                    mode: 'no-cors'
                }).catch(err => {
                    console.warn('Google Sheet submission log:', err);
                });
                submitPromises.push(sheetPromise);
            }

            // Also optional backend API endpoint
            if (apiEndpoint && apiEndpoint !== '/api/orders') {
                submitPromises.push(
                    fetch(apiEndpoint, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(orderData)
                    }).catch(e => console.warn('API error:', e))
                );
            }

            // Complete order UI
            Promise.all(submitPromises).then(() => {
                finishOrderSuccess();
            }).catch(() => {
                finishOrderSuccess();
            });

            function finishOrderSuccess() {
                confirmButton.innerHTML = originalButtonText;
                confirmButton.disabled = false;

                // Facebook Pixel Purchase Tracking if available
                if (window.fbTracker && typeof window.fbTracker.trackPurchase === 'function') {
                    window.fbTracker.trackPurchase({
                        total: grandTotal,
                        product: sizeQuantityDetails,
                        name: name,
                        phone: phone
                    });
                }

                // Show thank you popup
                const popup = document.getElementById('thankYouPopup');
                if (popup) {
                    popup.classList.add('show');
                    if (typeof confetti === 'function') {
                        confetti({
                            particleCount: 120,
                            spread: 80,
                            origin: { y: 0.6 }
                        });
                    }
                }

                // Reset form
                orderForm.reset();
            }
        });
    }

    // Thank You Popup close button
    const confirmPopupBtn = document.getElementById('confirmButton');
    const thankYouPopup = document.getElementById('thankYouPopup');
    if (confirmPopupBtn && thankYouPopup) {
        confirmPopupBtn.addEventListener('click', function() {
            thankYouPopup.classList.remove('show');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});
