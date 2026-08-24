// =================================================================
// ⏰ ২৪ ঘণ্টার লাইভ কাউন্টডাউন টাইমার (প্রতিদিন রাত ১২টায় অটো-রিসেট)
// =================================================================

// পরবর্তী রাত ১২:০০:০০ (Midnight) এর টাইমস্ট্যাম্প নির্ণয়
function getNextMidnightTimestamp() {
    const now = new Date();
    // আজকের দিনের পরবর্তী রাত ১২:০০ (পরের দিন 00:00:00)
    const midnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        0, 0, 0, 0
    );
    return midnight.getTime();
}

// ইংরেজি সংখ্যাকে বাংলা সংখ্যায় রূপান্তর
function convertToBengaliNumber(number) {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return number.toString().padStart(2, '0').split('').map(digit => {
        return bengaliDigits[parseInt(digit)] || digit;
    }).join('');
}

function updateCountdown() {
    const now = new Date().getTime();
    const targetTime = getNextMidnightTimestamp();
    const distance = targetTime - now;

    if (distance <= 0) {
        // রাত ১২টা পার হওয়ার সাথে সাথে স্বয়ংক্রিয়ভাবে পরের দিনের জন্য রিসেট হবে
        return;
    }

    // ঘণ্টা, মিনিট ও সেকেন্ড হিসাব
    const hours = Math.floor(distance / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    if (hoursEl) hoursEl.textContent = convertToBengaliNumber(hours);
    if (minutesEl) minutesEl.textContent = convertToBengaliNumber(minutes);
    if (secondsEl) secondsEl.textContent = convertToBengaliNumber(seconds);
}

// পেজ লোড হলে প্রতি সেকেন্ডে আপডেট হবে
document.addEventListener('DOMContentLoaded', () => {
    updateCountdown();
    setInterval(updateCountdown, 1000);
});
