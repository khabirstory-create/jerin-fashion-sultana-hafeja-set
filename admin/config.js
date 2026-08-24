// =================================================================
// ⚙️ অ্যাডমিন প্যানেল কনফিগারেশন (admin/config.js)
// =================================================================

const ADMIN_CONFIG = {
    DEFAULT_STORE_NAME: "Jerin Fashion",
    DEFAULT_HELPLINE: "01779000442",
    DEFAULT_ADMIN_PWD: "admin123",
    GOOGLE_SHEET_URL: localStorage.getItem('gas_sheet_url') || "https://script.google.com/macros/s/AKfycbxuT9-ANKfKqU2VpLaG79HATwEXXv6HbsNaLuIB3Cy6Tc3X2SZ268rtkFdkHzsQqgF0/exec"
};

if (typeof window !== 'undefined') {
    window.ADMIN_CONFIG = ADMIN_CONFIG;
}
