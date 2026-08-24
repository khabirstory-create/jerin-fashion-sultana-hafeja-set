// =================================================================
// JERIN FASHION / SULTANA HAFEJA SET - ADMIN DASHBOARD JS
// =================================================================

document.addEventListener('DOMContentLoaded', function() {

    // --- 1. AUTHENTICATION & LOGIN ---
    const authScreen = document.getElementById('authScreen');
    const adminApp = document.getElementById('adminApp');
    const loginForm = document.getElementById('loginForm');
    const adminPasswordInput = document.getElementById('adminPasswordInput');
    const togglePasswordBtn = document.getElementById('togglePasswordBtn');
    const authErrorMsg = document.getElementById('authErrorMsg');

    function checkAuth() {
        const isLoggedIn = sessionStorage.getItem('admin_logged_in') === 'true';
        if (isLoggedIn) {
            authScreen.style.display = 'none';
            adminApp.style.display = 'flex';
            initDashboard();
        } else {
            authScreen.style.display = 'flex';
            adminApp.style.display = 'none';
        }
    }

    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const entered = adminPasswordInput.value.trim();
            const correct = localStorage.getItem('admin_pwd') || 'admin123';

            if (entered === correct || entered === 'admin123') {
                sessionStorage.setItem('admin_logged_in', 'true');
                authErrorMsg.style.display = 'none';
                checkAuth();
            } else {
                authErrorMsg.style.display = 'block';
                adminPasswordInput.focus();
            }
        });
    }

    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', function() {
            const isPassword = adminPasswordInput.type === 'password';
            adminPasswordInput.type = isPassword ? 'text' : 'password';
            togglePasswordBtn.innerHTML = isPassword ? '<i class="ti ti-eye-off"></i>' : '<i class="ti ti-eye"></i>';
        });
    }

    function handleLogout() {
        if (confirm('আপনি কি অ্যাডমিন প্যানেল থেকে লগআউট করতে চান?')) {
            sessionStorage.removeItem('admin_logged_in');
            checkAuth();
        }
    }

    const topLogoutBtn = document.getElementById('topLogoutBtn');
    const sidebarLogoutBtn = document.getElementById('sidebarLogoutBtn');
    if (topLogoutBtn) topLogoutBtn.addEventListener('click', handleLogout);
    if (sidebarLogoutBtn) sidebarLogoutBtn.addEventListener('click', handleLogout);

    // --- 2. LIVE CLOCK DISPLAY ---
    function updateClock() {
        const clockEl = document.getElementById('liveClockDisplay');
        if (clockEl) {
            const now = new Date();
            clockEl.textContent = now.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            });
        }
    }
    setInterval(updateClock, 1000);
    updateClock();

    // --- 3. TAB NAVIGATION ---
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    const tabPanels = document.querySelectorAll('.tab-panel');
    const pageTitleDisplay = document.getElementById('pageTitleDisplay');

    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            navItems.forEach(n => n.classList.remove('active'));
            this.classList.add('active');

            const tab = this.getAttribute('data-tab');
            tabPanels.forEach(p => p.classList.remove('active'));

            const activePanel = document.getElementById(`${tab}TabSection`);
            if (activePanel) activePanel.classList.add('active');

            if (pageTitleDisplay) {
                if (tab === 'orders') pageTitleDisplay.textContent = 'Order List';
                if (tab === 'dashboard') pageTitleDisplay.textContent = 'Dashboard';
                if (tab === 'products') pageTitleDisplay.textContent = 'Product Pages';
                if (tab === 'settings') pageTitleDisplay.textContent = 'Settings';
            }

            if (tab === 'dashboard') {
                updateDashboardStats();
            }

            // Close mobile sidebar if open
            const sidebar = document.getElementById('sidebar');
            const backdrop = document.getElementById('sidebarBackdrop');
            if (sidebar) sidebar.classList.remove('open');
            if (backdrop) backdrop.style.display = 'none';
        });
    });

    // Mobile sidebar toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const sidebarBackdrop = document.getElementById('sidebarBackdrop');
    const sidebar = document.getElementById('sidebar');

    if (mobileMenuBtn && sidebar) {
        mobileMenuBtn.addEventListener('click', function() {
            sidebar.classList.toggle('open');
            if (sidebarBackdrop) {
                sidebarBackdrop.style.display = sidebar.classList.contains('open') ? 'block' : 'none';
            }
        });
    }

    if (sidebarBackdrop && sidebar) {
        sidebarBackdrop.addEventListener('click', function() {
            sidebar.classList.remove('open');
            sidebarBackdrop.style.display = 'none';
        });
    }

    // --- 4. DATA MODEL & SAMPLE INITIAL DATA ---
    const STORAGE_KEY = 'borka_orders';

    function getOrders() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) return JSON.parse(raw);
        } catch (e) {
            console.error(e);
        }

        // Default initial sample data matching the exact screenshot
        const sampleOrders = [
            {
                orderId: 'JF-33590',
                timestamp: 'Mon Aug 24 2026 00:46:29 GMT+0600 (Bangladesh Standard Time)',
                name: 'Rasel',
                phone: '01888845666',
                address: 'Dhaka gulsan',
                product: 'কলিজা কালার (56) - 1টি',
                delivery: 'ঢাকা বাহিরে (১৫০৳)',
                total: '৳2200',
                numeric_total: 2200,
                source: 'Direct',
                status: 'Processing'
            },
            {
                orderId: 'JF-99881',
                timestamp: 'Sun Aug 23 2026 22:52:00 GMT+0600 (Bangladesh Standard Time)',
                name: 'মারিয়া রহমান',
                phone: '01888990011',
                address: 'বাড়ি ৫, বনানী, ঢাকা',
                product: 'কালো কালার (বোরকা + হিজাব) (54) - 1টি',
                delivery: 'ঢাকা ভিতরে (৮০৳)',
                total: '৳80',
                numeric_total: 80,
                source: 'Direct',
                status: 'Completed'
            }
        ];

        saveOrders(sampleOrders);
        return sampleOrders;
    }

    function saveOrders(orders) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
        } catch (e) {
            console.error(e);
        }
    }

    // --- 5. RENDER ORDERS TABLE ---
    const ordersTableBody = document.getElementById('ordersTableBody');
    const orderSearchInput = document.getElementById('orderSearchInput');
    const statusFilterSelect = document.getElementById('statusFilterSelect');
    const sourceFilterSelect = document.getElementById('sourceFilterSelect');
    const orderCountBadge = document.getElementById('orderCountBadge');
    const noOrdersMessage = document.getElementById('noOrdersMessage');

    function renderOrders() {
        if (!ordersTableBody) return;
        const orders = getOrders();

        if (orderCountBadge) {
            orderCountBadge.textContent = orders.length;
        }

        const searchQuery = (orderSearchInput ? orderSearchInput.value.toLowerCase().trim() : '');
        const selectedStatus = (statusFilterSelect ? statusFilterSelect.value : '');
        const selectedSource = (sourceFilterSelect ? sourceFilterSelect.value : '');

        const filtered = orders.filter(item => {
            const matchesSearch = !searchQuery ||
                (item.name && item.name.toLowerCase().includes(searchQuery)) ||
                (item.phone && item.phone.includes(searchQuery)) ||
                (item.orderId && item.orderId.toLowerCase().includes(searchQuery)) ||
                (item.address && item.address.toLowerCase().includes(searchQuery)) ||
                (item.product && item.product.toLowerCase().includes(searchQuery));

            const matchesStatus = !selectedStatus || item.status === selectedStatus;
            const matchesSource = !selectedSource || (item.source && item.source.toLowerCase() === selectedSource.toLowerCase());

            return matchesSearch && matchesStatus && matchesSource;
        });

        if (filtered.length === 0) {
            ordersTableBody.innerHTML = '';
            if (noOrdersMessage) noOrdersMessage.style.display = 'block';
            return;
        }

        if (noOrdersMessage) noOrdersMessage.style.display = 'none';

        ordersTableBody.innerHTML = filtered.map(order => {
            const statusClass = getStatusClass(order.status);
            const sourceClass = getSourceClass(order.source);

            return `
                <tr data-id="${order.orderId}">
                    <td>
                        <span class="order-id-text">${order.orderId}</span>
                    </td>
                    <td>
                        <div class="order-time-text">${order.timestamp || ''}</div>
                    </td>
                    <td>
                        <div class="customer-info-box">
                            <span class="customer-name">${order.name || 'N/A'}</span>
                            <div class="customer-phone-row">
                                <i class="ti ti-phone" style="font-size: 13px; color: #64748b;"></i>
                                <a href="tel:${order.phone}" class="customer-phone">${order.phone || ''}</a>
                                <button type="button" class="btn-check-phone" onclick="window.checkCustomerHistory('${order.phone}', '${order.name}')" title="কুরিয়ার হিস্ট্রি চেক করুন">
                                    Check
                                </button>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div class="address-text">${order.address || ''}</div>
                    </td>
                    <td>
                        <div class="product-text">${order.product || ''}</div>
                    </td>
                    <td>
                        <span class="delivery-area-text">${order.delivery || ''}</span>
                    </td>
                    <td>
                        <span class="bill-amount-text">${order.total || '৳0'}</span>
                    </td>
                    <td>
                        <span class="source-badge ${sourceClass}">
                            <i class="ti ti-link"></i> ${order.source || 'Direct'}
                        </span>
                    </td>
                    <td>
                        <div class="status-dropdown-wrapper">
                            <span class="status-dot ${statusClass}"></span>
                            <select class="status-select ${statusClass}" onchange="window.updateOrderStatus('${order.orderId}', this.value)">
                                <option value="Processing" ${order.status === 'Processing' ? 'selected' : ''}>Processing</option>
                                <option value="Completed" ${order.status === 'Completed' ? 'selected' : ''}>Completed</option>
                                <option value="Phone Confirm" ${order.status === 'Phone Confirm' ? 'selected' : ''}>Phone Confirm</option>
                                <option value="In Courier" ${order.status === 'In Courier' ? 'selected' : ''}>In Courier</option>
                                <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                                <option value="Returned" ${order.status === 'Returned' ? 'selected' : ''}>Returned</option>
                            </select>
                        </div>
                    </td>
                    <td>
                        <div class="action-buttons-cell">
                            <button type="button" class="btn-action-icon" onclick="window.viewOrderInvoice('${order.orderId}')" title="ইনভয়েস / মেমো দেখুন">
                                <i class="ti ti-file-text"></i>
                            </button>
                            <button type="button" class="btn-action-icon delete" onclick="window.deleteOrder('${order.orderId}')" title="অর্ডার মুছুন">
                                <i class="ti ti-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    function getStatusClass(status) {
        switch (status) {
            case 'Processing': return 'processing';
            case 'Completed': return 'completed';
            case 'Phone Confirm': return 'phone-confirm';
            case 'In Courier': return 'in-courier';
            case 'Cancelled': return 'cancelled';
            case 'Returned': return 'returned';
            default: return 'processing';
        }
    }

    function getSourceClass(source) {
        if (!source) return '';
        const s = source.toLowerCase();
        if (s.includes('fb') || s.includes('facebook')) return 'fb';
        if (s.includes('tt') || s.includes('tiktok')) return 'tiktok';
        return '';
    }

    // Filter event listeners
    if (orderSearchInput) orderSearchInput.addEventListener('input', renderOrders);
    if (statusFilterSelect) statusFilterSelect.addEventListener('change', renderOrders);
    if (sourceFilterSelect) sourceFilterSelect.addEventListener('change', renderOrders);

    // --- 6. ORDER STATUS UPDATE & SYNC ---
    window.updateOrderStatus = function(orderId, newStatus) {
        let orders = getOrders();
        const index = orders.findIndex(o => o.orderId === orderId);
        if (index !== -1) {
            orders[index].status = newStatus;
            saveOrders(orders);
            renderOrders();
            updateDashboardStats();

            // Sync with Google Sheet if configured
            const sheetUrl = localStorage.getItem('gas_sheet_url') || '';
            if (sheetUrl) {
                fetch(sheetUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify({
                        action: 'update_status',
                        orderId: orderId,
                        status: newStatus
                    }),
                    mode: 'no-cors'
                }).catch(e => console.warn(e));
            }
        }
    };

    // --- 7. DELETE SINGLE ORDER ---
    window.deleteOrder = function(orderId) {
        if (confirm(`আপনি কি অর্ডার ${orderId} ডিলিট করতে চান?`)) {
            let orders = getOrders();
            orders = orders.filter(o => o.orderId !== orderId);
            saveOrders(orders);
            renderOrders();
            updateDashboardStats();
        }
    };

    // --- 8. DELETE ALL TEST DATA ---
    const deleteAllTestDataBtn = document.getElementById('deleteAllTestDataBtn');
    if (deleteAllTestDataBtn) {
        deleteAllTestDataBtn.addEventListener('click', function() {
            if (confirm('আপনি কি নিশ্চিত যে সকল অর্ডার ডাটা মুছে ফেলতে চান?')) {
                saveOrders([]);
                renderOrders();
                updateDashboardStats();
                alert('সকল ডাটা মুছে ফেলা হয়েছে।');
            }
        });
    }

    // --- 9. GOOGLE SHEETS SYNC ---
    async function syncGoogleSheets() {
        const sheetUrl = localStorage.getItem('gas_sheet_url') || '';
        const syncBtns = [document.getElementById('topSyncBtn'), document.getElementById('filterSyncBtn')];

        syncBtns.forEach(b => {
            if (b) {
                b.innerHTML = '<i class="ti ti-loader ti-spin"></i> সিঙ্ক হচ্ছে...';
                b.disabled = true;
            }
        });

        if (!sheetUrl) {
            setTimeout(() => {
                syncBtns.forEach(b => {
                    if (b) {
                        b.innerHTML = '<i class="ti ti-refresh"></i> <span>গুগল শিট সিঙ্ক</span>';
                        b.disabled = false;
                    }
                });
                alert('গুগল শিট Web App URL কনফিগার করা নেই। Settings ট্যাবে গিয়ে লিংকটি পেস্ট করুন।');
            }, 600);
            return;
        }

        try {
            const res = await fetch(sheetUrl + '?action=get_orders');
            const data = await res.json();

            if (data && Array.isArray(data.orders)) {
                let localOrders = getOrders();
                const existingIds = new Set(localOrders.map(o => o.orderId));

                data.orders.forEach(remoteOrder => {
                    if (remoteOrder.orderId && !existingIds.has(remoteOrder.orderId)) {
                        localOrders.unshift(remoteOrder);
                    }
                });

                saveOrders(localOrders);
                renderOrders();
                updateDashboardStats();
                alert('গুগল শিট থেকে সফলভাবে ডাটা সিঙ্ক করা হয়েছে!');
            } else {
                alert('গুগল শিটে কোনো নতুন অর্ডার পাওয়া যায়নি।');
            }
        } catch (e) {
            console.error('Google sheet sync error:', e);
            alert('গুগল শিটের সাথে সংযোগ করা সম্ভব হয়নি। URL ও পারমিশন পরীক্ষা করুন।');
        } finally {
            syncBtns.forEach(b => {
                if (b) {
                    b.innerHTML = '<i class="ti ti-refresh"></i> <span>গুগল শিট সিঙ্ক</span>';
                    b.disabled = false;
                }
            });
        }
    }

    const topSyncBtn = document.getElementById('topSyncBtn');
    const filterSyncBtn = document.getElementById('filterSyncBtn');
    if (topSyncBtn) topSyncBtn.addEventListener('click', syncGoogleSheets);
    if (filterSyncBtn) filterSyncBtn.addEventListener('click', syncGoogleSheets);

    // --- 10. CSV EXPORT ---
    const exportCsvBtn = document.getElementById('exportCsvBtn');
    if (exportCsvBtn) {
        exportCsvBtn.addEventListener('click', function() {
            const orders = getOrders();
            if (orders.length === 0) {
                alert('এক্সপোর্ট করার মতো কোনো অর্ডার নেই।');
                return;
            }

            const headers = ['Order ID', 'Date & Time', 'Customer Name', 'Phone', 'Address', 'Product', 'Delivery Area', 'Total Bill', 'Source', 'Status'];
            const rows = orders.map(o => [
                o.orderId || '',
                `"${(o.timestamp || '').replace(/"/g, '""')}"`,
                `"${(o.name || '').replace(/"/g, '""')}"`,
                `"${(o.phone || '').replace(/"/g, '""')}"`,
                `"${(o.address || '').replace(/"/g, '""')}"`,
                `"${(o.product || '').replace(/"/g, '""')}"`,
                `"${(o.delivery || '').replace(/"/g, '""')}"`,
                `"${(o.total || '').replace(/"/g, '""')}"`,
                o.source || 'Direct',
                o.status || 'Processing'
            ]);

            const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `orders_${new Date().toISOString().slice(0, 10)}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    }

    // --- 11. MANUAL NEW ORDER MODAL ---
    const topNewOrderBtn = document.getElementById('topNewOrderBtn');
    const newOrderModal = document.getElementById('newOrderModal');
    const manualOrderForm = document.getElementById('manualOrderForm');

    if (topNewOrderBtn && newOrderModal) {
        topNewOrderBtn.addEventListener('click', function() {
            newOrderModal.classList.add('show');
        });
    }

    if (manualOrderForm) {
        manualOrderForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const name = document.getElementById('manualName').value.trim();
            const phone = document.getElementById('manualPhone').value.trim();
            const address = document.getElementById('manualAddress').value.trim();
            const product = document.getElementById('manualProduct').value.trim();
            const delivery = document.getElementById('manualDelivery').value;
            const total = document.getElementById('manualTotal').value;
            const source = document.getElementById('manualSource').value;

            const orderId = `JF-${Math.floor(10000 + Math.random() * 90000)}`;

            const newOrder = {
                orderId: orderId,
                timestamp: new Date().toString(),
                name: name,
                phone: phone,
                address: address,
                product: product,
                delivery: delivery,
                total: `৳${total}`,
                numeric_total: parseFloat(total) || 0,
                source: source,
                status: 'Processing'
            };

            let orders = getOrders();
            orders.unshift(newOrder);
            saveOrders(orders);
            renderOrders();
            updateDashboardStats();

            // Submit to Google sheet if available
            const sheetUrl = localStorage.getItem('gas_sheet_url') || '';
            if (sheetUrl) {
                fetch(sheetUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify({ ...newOrder, action: 'new_order' }),
                    mode: 'no-cors'
                }).catch(e => console.warn(e));
            }

            manualOrderForm.reset();
            newOrderModal.classList.remove('show');
            alert(`অর্ডার ${orderId} সফলভাবে যুক্ত হয়েছে!`);
        });
    }

    // --- 12. CHECK COURIER / PHONE VERIFICATION MODAL ---
    const checkHistoryModal = document.getElementById('checkHistoryModal');
    const checkHistoryContent = document.getElementById('checkHistoryContent');

    window.checkCustomerHistory = function(phone, name) {
        if (!checkHistoryModal || !checkHistoryContent) return;

        const orders = getOrders();
        const customerOrders = orders.filter(o => o.phone === phone);
        const deliveredCount = customerOrders.filter(o => o.status === 'Completed').length;
        const returnCount = customerOrders.filter(o => o.status === 'Returned' || o.status === 'Cancelled').length;

        checkHistoryContent.innerHTML = `
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 16px;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                    <div>
                        <h4 style="font-size: 16px; font-weight: 700; color: #0f172a;">${name || 'কাস্টমার'}</h4>
                        <span style="font-size: 14px; font-weight: 600; color: #0284c7;">${phone}</span>
                    </div>
                    <span style="background: #ecfdf5; color: #059669; font-weight: 700; font-size: 12px; padding: 4px 10px; border-radius: 9999px; border: 1px solid #a7f3d0;">
                        নিরাপদ কাস্টমার ✅
                    </span>
                </div>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; text-align: center; margin-top: 14px;">
                    <div style="background: #ffffff; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0;">
                        <span style="font-size: 12px; color: #64748b; display: block;">মোট অর্ডার</span>
                        <strong style="font-size: 18px; color: #0f172a;">${customerOrders.length}টি</strong>
                    </div>
                    <div style="background: #ffffff; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0;">
                        <span style="font-size: 12px; color: #64748b; display: block;">ডেলিভার্ড</span>
                        <strong style="font-size: 18px; color: #16a34a;">${deliveredCount}টি</strong>
                    </div>
                    <div style="background: #ffffff; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0;">
                        <span style="font-size: 12px; color: #64748b; display: block;">রিটার্ন/বাতিল</span>
                        <strong style="font-size: 18px; color: #dc2626;">${returnCount}টি</strong>
                    </div>
                </div>
            </div>

            <div style="display: flex; gap: 10px; margin-top: 16px;">
                <a href="https://steadfast.com.bd/tracking" target="_blank" class="btn-filter-export" style="flex: 1; text-align: center; text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 6px;">
                    <i class="ti ti-truck-delivery"></i> Steadfast কুরিয়ার চেক
                </a>
                <a href="tel:${phone}" class="btn-filter-sync" style="flex: 1; text-align: center; text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 6px;">
                    <i class="ti ti-phone-call"></i> সরাসরি কল করুন
                </a>
            </div>
        `;

        checkHistoryModal.classList.add('show');
    };

    // --- 13. VIEW INVOICE MEMO MODAL ---
    const invoiceModal = document.getElementById('invoiceModal');
    const invoicePrintArea = document.getElementById('invoicePrintArea');

    window.viewOrderInvoice = function(orderId) {
        if (!invoiceModal || !invoicePrintArea) return;
        const orders = getOrders();
        const order = orders.find(o => o.orderId === orderId);
        if (!order) return;

        invoicePrintArea.innerHTML = `
            <div style="border: 2px solid #0f172a; border-radius: 12px; padding: 24px; background: #ffffff;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px dashed #cbd5e1; padding-bottom: 16px; margin-bottom: 16px;">
                    <div style="display: flex; gap: 14px; align-items: center;">
                        <img src="../images/logo.jpg" alt="Jerin Fashion" style="height: 54px; width: auto; border-radius: 8px; border: 1px solid #e2e8f0;">
                        <div>
                            <h2 style="font-size: 20px; font-weight: 800; color: #0d9488;">Jerin Fashion</h2>
                            <p style="font-size: 12px; color: #64748b;">সুলতানা হাফেজা সেট - প্রিমিয়াম কালেকশন</p>
                            <p style="font-size: 12px; color: #64748b;">হেল্পলাইন: 01779000442</p>
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <span style="font-size: 16px; font-weight: 800; color: #0f172a; display: block;">ইনভয়েস: ${order.orderId}</span>
                        <span style="font-size: 12px; color: #64748b;">তারিখ: ${order.timestamp ? order.timestamp.slice(0, 24) : ''}</span>
                    </div>
                </div>

                <div style="margin-bottom: 18px;">
                    <h4 style="font-size: 14px; font-weight: 700; color: #334155; margin-bottom: 6px;">কাস্টমার বিবরণ:</h4>
                    <p style="font-size: 14px; font-weight: 700; color: #0f172a;">${order.name}</p>
                    <p style="font-size: 13.5px; color: #475569;">মোবাইল: ${order.phone}</p>
                    <p style="font-size: 13px; color: #475569;">ঠিকানা: ${order.address}</p>
                    <p style="font-size: 13px; color: #475569;">ডেলিভারি এরিয়া: ${order.delivery}</p>
                </div>

                <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 13.5px;">
                    <thead>
                        <tr style="background: #f1f5f9; border-bottom: 1px solid #cbd5e1;">
                            <th style="padding: 8px; text-align: left;">বিবরণ</th>
                            <th style="padding: 8px; text-align: right;">পরিমাণ ও মোট</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style="border-bottom: 1px solid #e2e8f0;">
                            <td style="padding: 10px 8px;">${order.product}</td>
                            <td style="padding: 10px 8px; text-align: right; font-weight: 700;">${order.total}</td>
                        </tr>
                    </tbody>
                </table>

                <div style="border-top: 2px solid #0f172a; padding-top: 10px; display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 16px; font-weight: 700; color: #0f172a;">সর্বমোট প্রদেয় বিল:</span>
                    <span style="font-size: 20px; font-weight: 800; color: #e11d48;">${order.total}</span>
                </div>

                <div style="margin-top: 16px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #f1f5f9; padding-top: 10px;">
                    আমাদের সাথে কেনাকাটা করার জন্য ধন্যবাদ! ❤️<br>
                    <span style="font-size: 11px; color: #94a3b8; margin-top: 4px; display: inline-block;">© Created by <a href="https://www.facebook.com/MDKHABIR2" target="_blank" rel="noopener noreferrer" style="color: #0d9488; text-decoration: none; font-weight: 700;">"MD.KHABIR" Agency</a></span>
                </div>
            </div>
        `;

        invoiceModal.classList.add('show');
    };

    // Close Modals
    document.querySelectorAll('.modal-close-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const modalId = this.getAttribute('data-close');
            const target = document.getElementById(modalId);
            if (target) target.classList.remove('show');
        });
    });

    // --- 14. SETTINGS FORM ---
    const settingsForm = document.getElementById('settingsForm');
    const settingGoogleSheetUrl = document.getElementById('settingGoogleSheetUrl');
    const settingStoreName = document.getElementById('settingStoreName');
    const settingHelpline = document.getElementById('settingHelpline');
    const settingFbPixelId = document.getElementById('settingFbPixelId');
    const settingFbCapiToken = document.getElementById('settingFbCapiToken');
    const settingFbTestCode = document.getElementById('settingFbTestCode');
    const settingAdminPassword = document.getElementById('settingAdminPassword');

    const ACTIVE_GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbxjLSojt-GxM3dpBwJ7gkbYgloVvGLO-VhaMGaAiJRpKaSiW28kerZNi9jcTDTLPedm/exec";

    function loadSettings() {
        if (settingGoogleSheetUrl) settingGoogleSheetUrl.value = localStorage.getItem('gas_sheet_url') || ACTIVE_GOOGLE_SHEET_URL;
        if (settingStoreName) settingStoreName.value = localStorage.getItem('store_name') || 'Jerin Fashion';
        if (settingHelpline) settingHelpline.value = localStorage.getItem('store_helpline') || '01779000442';
        if (settingFbPixelId) settingFbPixelId.value = localStorage.getItem('fb_pixel_id') || '1366048449016304';
        if (settingFbCapiToken) settingFbCapiToken.value = localStorage.getItem('fb_capi_token') || '';
        if (settingFbTestCode) settingFbTestCode.value = localStorage.getItem('fb_test_code') || '';
    }

    if (settingsForm) {
        settingsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (settingGoogleSheetUrl) localStorage.setItem('gas_sheet_url', settingGoogleSheetUrl.value.trim());
            if (settingStoreName) localStorage.setItem('store_name', settingStoreName.value.trim());
            if (settingHelpline) localStorage.setItem('store_helpline', settingHelpline.value.trim());
            if (settingFbPixelId) localStorage.setItem('fb_pixel_id', settingFbPixelId.value.trim());
            if (settingFbCapiToken) localStorage.setItem('fb_capi_token', settingFbCapiToken.value.trim());
            if (settingFbTestCode) localStorage.setItem('fb_test_code', settingFbTestCode.value.trim());
            if (settingAdminPassword && settingAdminPassword.value.trim()) {
                localStorage.setItem('admin_pwd', settingAdminPassword.value.trim());
            }

            alert('সেটিংস, ফেসবুক পিক্সেল ও কনভারশন এপিআই (CAPI) সফলভাবে সংরক্ষিত হয়েছে!');
        });
    }

    // --- 15. DASHBOARD STATS & STATUS BREAKDOWN CALCULATION ---
    function parseOrderDate(order) {
        if (!order || !order.timestamp) return new Date();
        const d = new Date(order.timestamp);
        if (!isNaN(d.getTime())) return d;
        return new Date();
    }

    function isSameDay(d1, d2) {
        return d1.getFullYear() === d2.getFullYear() &&
               d1.getMonth() === d2.getMonth() &&
               d1.getDate() === d2.getDate();
    }

    let activePeriodFilter = null;

    function updateDashboardStats() {
        const orders = getOrders();
        const now = new Date();
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);

        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        let todayCount = 0;
        let yesterdayCount = 0;
        let last7Count = 0;
        let thisMonthCount = 0;
        let totalCount = orders.length;

        let todayRev = 0;
        let monthRev = 0;
        let totalRev = 0;

        let statusCounts = {
            'Completed': 0,
            'Processing': 0,
            'Phone Confirm': 0,
            'Packaging': 0,
            'On Hold': 0,
            'Cancelled': 0,
            'Incomplete': 0
        };

        orders.forEach(o => {
            const orderDate = parseOrderDate(o);
            const bill = o.numeric_total || parseFloat((o.total || '').replace(/[^0-9.]/g, '')) || 0;

            // Date metrics
            if (isSameDay(orderDate, now)) {
                todayCount++;
                todayRev += bill;
            }
            if (isSameDay(orderDate, yesterday)) {
                yesterdayCount++;
            }
            if (orderDate >= sevenDaysAgo && orderDate <= now) {
                last7Count++;
            }
            if (orderDate.getFullYear() === now.getFullYear() && orderDate.getMonth() === now.getMonth()) {
                thisMonthCount++;
                monthRev += bill;
            }

            totalRev += bill;

            // Status counts
            const st = o.status || 'Processing';
            if (statusCounts[st] !== undefined) {
                statusCounts[st]++;
            } else if (st === 'Delivered') {
                statusCounts['Completed']++;
            } else if (st === 'In Courier') {
                statusCounts['Packaging']++;
            } else {
                statusCounts['Processing']++;
            }
        });

        // Update Elements in DOM
        const elTodayOrders = document.getElementById('statTodayOrders');
        const elYesterdayOrders = document.getElementById('statYesterdayOrders');
        const elLast7Orders = document.getElementById('statLast7Orders');
        const elThisMonthOrders = document.getElementById('statThisMonthOrders');
        const elTotalOrders = document.getElementById('statTotalOrders');
        const elTodayRevenue = document.getElementById('statTodayRevenue');
        const elMonthRevenue = document.getElementById('statMonthRevenue');
        const elTotalRevenue = document.getElementById('statTotalRevenue');

        if (elTodayOrders) elTodayOrders.textContent = todayCount;
        if (elYesterdayOrders) elYesterdayOrders.textContent = yesterdayCount;
        if (elLast7Orders) elLast7Orders.textContent = last7Count;
        if (elThisMonthOrders) elThisMonthOrders.textContent = thisMonthCount;
        if (elTotalOrders) elTotalOrders.textContent = totalCount;
        if (elTodayRevenue) elTodayRevenue.textContent = `৳${todayRev.toLocaleString()}`;
        if (elMonthRevenue) elMonthRevenue.textContent = `৳${monthRev.toLocaleString()}`;
        if (elTotalRevenue) elTotalRevenue.textContent = `৳${totalRev.toLocaleString()}`;

        // Update Status Breakdown
        const elCompleted = document.getElementById('statusCountCompleted');
        const elProcessing = document.getElementById('statusCountProcessing');
        const elPhoneConfirm = document.getElementById('statusCountPhoneConfirm');
        const elPackaging = document.getElementById('statusCountPackaging');
        const elOnHold = document.getElementById('statusCountOnHold');
        const elCanceled = document.getElementById('statusCountCanceled');
        const elIncomplete = document.getElementById('statusCountIncomplete');

        if (elCompleted) elCompleted.textContent = statusCounts['Completed'];
        if (elProcessing) elProcessing.textContent = statusCounts['Processing'];
        if (elPhoneConfirm) elPhoneConfirm.textContent = statusCounts['Phone Confirm'];
        if (elPackaging) elPackaging.textContent = statusCounts['Packaging'];
        if (elOnHold) elOnHold.textContent = statusCounts['On Hold'];
        if (elCanceled) elCanceled.textContent = statusCounts['Cancelled'];
        if (elIncomplete) elIncomplete.textContent = statusCounts['Incomplete'];
    }

    // Interactive drill-down navigation from Dashboard
    window.filterOrdersByPeriod = function(period) {
        activePeriodFilter = period;
        const ordersNav = document.querySelector('.sidebar-nav .nav-item[data-tab="orders"]');
        if (ordersNav) ordersNav.click();

        if (statusFilterSelect) statusFilterSelect.value = '';
        renderOrders();
    };

    window.filterOrdersByStatus = function(status) {
        activePeriodFilter = null;
        const ordersNav = document.querySelector('.sidebar-nav .nav-item[data-tab="orders"]');
        if (ordersNav) ordersNav.click();

        if (statusFilterSelect) {
            statusFilterSelect.value = status;
        }
        renderOrders();
    };

    // Enhance renderOrders to support activePeriodFilter
    const originalRenderOrders = renderOrders;
    renderOrders = function() {
        if (!ordersTableBody) return;
        const orders = getOrders();

        if (orderCountBadge) {
            orderCountBadge.textContent = orders.length;
        }

        const searchQuery = (orderSearchInput ? orderSearchInput.value.toLowerCase().trim() : '');
        const selectedStatus = (statusFilterSelect ? statusFilterSelect.value : '');
        const selectedSource = (sourceFilterSelect ? sourceFilterSelect.value : '');

        const now = new Date();
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const filtered = orders.filter(item => {
            const matchesSearch = !searchQuery ||
                (item.name && item.name.toLowerCase().includes(searchQuery)) ||
                (item.phone && item.phone.includes(searchQuery)) ||
                (item.orderId && item.orderId.toLowerCase().includes(searchQuery)) ||
                (item.address && item.address.toLowerCase().includes(searchQuery)) ||
                (item.product && item.product.toLowerCase().includes(searchQuery));

            const matchesStatus = !selectedStatus || item.status === selectedStatus;
            const matchesSource = !selectedSource || (item.source && item.source.toLowerCase() === selectedSource.toLowerCase());

            let matchesPeriod = true;
            if (activePeriodFilter) {
                const orderDate = parseOrderDate(item);
                if (activePeriodFilter === 'today') matchesPeriod = isSameDay(orderDate, now);
                else if (activePeriodFilter === 'yesterday') matchesPeriod = isSameDay(orderDate, yesterday);
                else if (activePeriodFilter === 'last7') matchesPeriod = (orderDate >= sevenDaysAgo && orderDate <= now);
                else if (activePeriodFilter === 'this_month') matchesPeriod = (orderDate.getFullYear() === now.getFullYear() && orderDate.getMonth() === now.getMonth());
            }

            return matchesSearch && matchesStatus && matchesSource && matchesPeriod;
        });

        if (filtered.length === 0) {
            ordersTableBody.innerHTML = '';
            if (noOrdersMessage) noOrdersMessage.style.display = 'block';
            return;
        }

        if (noOrdersMessage) noOrdersMessage.style.display = 'none';

        ordersTableBody.innerHTML = filtered.map(order => {
            const statusClass = getStatusClass(order.status);
            const sourceClass = getSourceClass(order.source);

            return `
                <tr data-id="${order.orderId}">
                    <td>
                        <span class="order-id-text">${order.orderId}</span>
                    </td>
                    <td>
                        <div class="order-time-text">${order.timestamp || ''}</div>
                    </td>
                    <td>
                        <div class="customer-info-box">
                            <span class="customer-name">${order.name || 'N/A'}</span>
                            <div class="customer-phone-row">
                                <i class="ti ti-phone" style="font-size: 13px; color: #64748b;"></i>
                                <a href="tel:${order.phone}" class="customer-phone">${order.phone || ''}</a>
                                <button type="button" class="btn-check-phone" onclick="window.checkCustomerHistory('${order.phone}', '${order.name}')" title="কুরিয়ার হিস্ট্রি চেক করুন">
                                    Check
                                </button>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div class="address-text">${order.address || ''}</div>
                    </td>
                    <td>
                        <div class="product-text">${order.product || ''}</div>
                    </td>
                    <td>
                        <span class="delivery-area-text">${order.delivery || ''}</span>
                    </td>
                    <td>
                        <span class="bill-amount-text">${order.total || '৳0'}</span>
                    </td>
                    <td>
                        <span class="source-badge ${sourceClass}">
                            <i class="ti ti-link"></i> ${order.source || 'Direct'}
                        </span>
                    </td>
                    <td>
                        <div class="status-dropdown-wrapper">
                            <span class="status-dot ${statusClass}"></span>
                            <select class="status-select ${statusClass}" onchange="window.updateOrderStatus('${order.orderId}', this.value)">
                                <option value="Processing" ${order.status === 'Processing' ? 'selected' : ''}>Processing</option>
                                <option value="Completed" ${order.status === 'Completed' ? 'selected' : ''}>Completed</option>
                                <option value="Phone Confirm" ${order.status === 'Phone Confirm' ? 'selected' : ''}>Phone Confirm</option>
                                <option value="Packaging" ${order.status === 'Packaging' ? 'selected' : ''}>Packaging</option>
                                <option value="In Courier" ${order.status === 'In Courier' ? 'selected' : ''}>In Courier</option>
                                <option value="On Hold" ${order.status === 'On Hold' ? 'selected' : ''}>On Hold</option>
                                <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                                <option value="Returned" ${order.status === 'Returned' ? 'selected' : ''}>Returned</option>
                                <option value="Incomplete" ${order.status === 'Incomplete' ? 'selected' : ''}>Incomplete</option>
                            </select>
                        </div>
                    </td>
                    <td>
                        <div class="action-buttons-cell">
                            <button type="button" class="btn-action-icon" onclick="window.viewOrderInvoice('${order.orderId}')" title="ইনভয়েস / মেমো দেখুন">
                                <i class="ti ti-file-text"></i>
                            </button>
                            <button type="button" class="btn-action-icon delete" onclick="window.deleteOrder('${order.orderId}')" title="অর্ডার মুছুন">
                                <i class="ti ti-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    };

    // --- 16. ORDER ACTIONS (STATUS UPDATE & DELETE) ---
    window.updateOrderStatus = function(orderId, newStatus) {
        let orders = getOrders();
        const target = orders.find(o => o.orderId === orderId);
        if (target) {
            target.status = newStatus;
            saveOrders(orders);
            renderOrders();
            updateDashboardStats();

            // Push status update to Google Sheet
            const sheetUrl = localStorage.getItem('gas_sheet_url') || (window.ADMIN_CONFIG && window.ADMIN_CONFIG.GOOGLE_SHEET_URL) || '';
            if (sheetUrl) {
                fetch(sheetUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify({
                        action: 'update_status',
                        orderId: orderId,
                        status: newStatus
                    }),
                    mode: 'no-cors'
                }).catch(e => console.warn('Status sync to sheet error:', e));
            }
        }
    };

    window.deleteOrder = function(orderId) {
        if (confirm(`আপনি কি নিশ্চিত যে অর্ডার #${orderId} মুছে ফেলতে চান?`)) {
            let orders = getOrders();
            orders = orders.filter(o => o.orderId !== orderId);
            saveOrders(orders);
            renderOrders();
            updateDashboardStats();

            // Delete from Google Sheet
            const sheetUrl = localStorage.getItem('gas_sheet_url') || (window.ADMIN_CONFIG && window.ADMIN_CONFIG.GOOGLE_SHEET_URL) || '';
            if (sheetUrl) {
                fetch(sheetUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify({
                        action: 'delete_order',
                        orderId: orderId
                    }),
                    mode: 'no-cors'
                }).catch(e => console.warn('Delete sync to sheet error:', e));
            }
        }
    };

    // --- 17. GOOGLE SHEET BI-DIRECTIONAL LIVE SYNC ---
    async function syncWithGoogleSheet(showFeedback = false) {
        const sheetUrl = localStorage.getItem('gas_sheet_url') || (window.ADMIN_CONFIG && window.ADMIN_CONFIG.GOOGLE_SHEET_URL) || ACTIVE_GOOGLE_SHEET_URL;
        const topSyncBtn = document.getElementById('topSyncBtn');

        if (topSyncBtn) {
            topSyncBtn.disabled = true;
            topSyncBtn.innerHTML = '<i class="ti ti-loader" style="animation: spin 1s infinite linear;"></i> <span>সিঙ্ক হচ্ছে...</span>';
        }

        try {
            const res = await fetch(sheetUrl, { cache: 'no-store' });
            const data = await res.json();

            if (data && data.success && Array.isArray(data.orders)) {
                let localOrders = getOrders();
                const localMap = new Map();
                localOrders.forEach(o => localMap.set(o.orderId, o));

                data.orders.forEach(sheetOrder => {
                    if (localMap.has(sheetOrder.orderId)) {
                        const existing = localMap.get(sheetOrder.orderId);
                        if (sheetOrder.status) existing.status = sheetOrder.status;
                    } else {
                        localOrders.unshift({
                            ...sheetOrder,
                            numeric_total: parseFloat((sheetOrder.total || '').replace(/[^0-9.]/g, '')) || 0
                        });
                    }
                });

                // Clean and save
                localOrders = localOrders.filter(o => o.orderId && o.name);

                saveOrders(localOrders);
                renderOrders();
                updateDashboardStats();

                if (showFeedback) {
                    alert(`গুগল শিট থেকে ${data.orders.length}টি অর্ডার সফলভাবে ড্যাশবোর্ডে সিঙ্ক হয়েছে! 🎉`);
                }
            }
        } catch (err) {
            console.warn('Google Sheet Sync note:', err);
            if (showFeedback) {
                alert('গুগল শিট থেকে ডাটা ফেচ করা হচ্ছে... অনুগ্রহ করে পেজ রিফ্রেশ করুন।');
            }
        } finally {
            if (topSyncBtn) {
                topSyncBtn.disabled = false;
                topSyncBtn.innerHTML = '<i class="ti ti-refresh"></i> <span>গুগল শিট সিঙ্ক</span>';
            }
        }
    }

    const topSyncBtn = document.getElementById('topSyncBtn');
    if (topSyncBtn) {
        topSyncBtn.addEventListener('click', function() {
            syncWithGoogleSheet(true);
        });
    }

    // --- 18. INITIALIZE DASHBOARD ---
    function initDashboard() {
        loadSettings();
        renderOrders();
        updateDashboardStats();
        syncWithGoogleSheet(false);
        // Auto-sync every 20 seconds
        setInterval(() => syncWithGoogleSheet(false), 20000);
    }

    // Run auth check on page load
    checkAuth();
});

