// =================================================================
// ⚙️ সুলতানা হাফেজা সেট প্রোডাক্ট পেজ সেটিংস (config.js)
// =================================================================

const APP_CONFIG = {
    // গুগল শিট Apps Script Web App URL (এখানে আপনার Apps Script Web App লিংক দিন)
    GOOGLE_SHEET_URL: localStorage.getItem('gas_sheet_url') || "",

    // ব্যাকএন্ড API URL (ঐচ্ছিক)
    API_URL: "/api/orders",
    MYSQL_API_URL: "/api/orders",

    // ফেসবুক পিক্সেল আইডি ও টেস্ট কোড
    FB_PIXEL_ID: "1366048449016304",
    FB_TEST_EVENT_CODE: "",

    // ডেলিভারি চার্জ
    SHIPPING: {
        INSIDE_DHAKA: 80,
        OUTSIDE_DHAKA: 150
    },

    // হেল্পলাইন ও হোয়াটসঅ্যাপ নম্বর
    HELP_PHONE: "01886106856",
    WHATSAPP_PHONE: "8801886106856",

    // অফার কাউন্টডাউন মিনিট
    COUNTDOWN_MINUTES: 30,

    // প্রোডাক্ট রিলেটেড সকল তথ্য
    PRODUCTS: [
        {
            key: 'ফুল সুলতানা সেট',
            title: 'ফুল সুলতানা সেট',
            subtitle: '(হিজাব + নিকাব + বোরকা)',
            sheetName: 'ফুল সুলতানা সেট',
            price: 2350,
            originalPrice: 2950,
            image: '../images/sultana-hafeja-set/6.webp',
            sizes: ['50', '52', '54', '56', '58']
        },
        {
            key: 'শুধু হিজাব ও নিকাব',
            title: 'শুধু হিজাব ও নিকাব',
            subtitle: '(হিজাব + নিকাব)',
            sheetName: 'শুধু হিজাব ও নিকাব',
            price: 1350,
            originalPrice: 1850,
            image: '../images/sultana-hafeja-set/1.webp',
            sizes: []
        }
    ]
};

// Global export for window
if (typeof window !== 'undefined') {
    window.APP_CONFIG = APP_CONFIG;
}
