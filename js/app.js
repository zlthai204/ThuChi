const AppState = {
    currentPage: "home",

    transactions: [],
    categories: [],
    dishes: [],
    codParts: [],

    editingTransactionId: null,

    transactionType: "thu",
    orderSource: "ShopeeFood",

    statisticsPeriod: "day",
    statisticsDate: new Date()
};


/* =========================
   INIT
========================= */

document.addEventListener("DOMContentLoaded", async () => {
    setToday();
    loadTheme();

    await loadInitialData();

    navigateTo("home");
});


/* =========================
   INITIAL DATA
========================= */

async function loadInitialData() {
    try {
        AppState.categories = await dbGet("categories", {
            order: {
                column: "created_at",
                ascending: true
            }
        });

        AppState.dishes = await dbGet("dishes", {
            order: {
                column: "created_at",
                ascending: true
            }
        });

        AppState.transactions = await dbGet("transactions", {
            order: {
                column: "date",
                ascending: false
            }
        });

        renderAll();

    } catch (error) {
        console.error("Lỗi loadInitialData:", error);
    }
}


/* =========================
   NAVIGATION
========================= */

function navigateTo(page) {
    AppState.currentPage = page;

    document.querySelectorAll(".page").forEach(element => {
        element.classList.remove("active-page");
    });

    const pageElement = document.getElementById(`${page}Page`);

    if (pageElement) {
        pageElement.classList.add("active-page");
    }

    document.querySelectorAll(".nav-button").forEach(button => {
        button.classList.remove("active");
    });

    const navMap = {
        home: "navHome",
        statistics: "navStatistics",
        history: "navHistory",
        restaurant: "navRestaurant",
        cod: "navCOD"
    };

    const navButton = document.getElementById(navMap[page]);

    if (navButton) {
        navButton.classList.add("active");
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    switch (page) {
        case "home":
            renderHome();
            break;

        case "statistics":
            renderStatistics();
            break;

        case "history":
            renderHistory();
            break;

        case "restaurant":
            renderRestaurant();
            break;

        case "cod":
            renderCOD();
            break;
    }
}


/* =========================
   RENDER ALL
========================= */

function renderAll() {
    renderHome();
    renderStatistics();
    renderHistory();
    renderRestaurant();
    renderCOD();
}


/* =========================
   HOME
========================= */

function renderHome() {
    // Nếu bạn đã có renderHome() ở file khác,
    // hãy xóa hàm này để tránh trùng tên.

    const element = document.getElementById("homePage");

    if (!element) return;

    // Không làm gì nếu HTML của Home
    // đã được xử lý bởi code khác.
}


/* =========================
   STATISTICS
========================= */

function renderStatistics() {
    const page = document.getElementById("statisticsPage");

    if (!page) return;

    /*
     * Tính tổng thu / chi từ transactions.
     *
     * Hàm này được viết theo kiểu an toàn:
     * nếu chưa có HTML thống kê thì chỉ return,
     * không làm app crash.
     */

    const transactions = Array.isArray(AppState.transactions)
        ? AppState.transactions
        : [];

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(transaction => {
        const amount = Number(
            transaction.amount ??
            transaction.money ??
            transaction.total ??
            0
        );

        const type = String(
            transaction.type ??
            transaction.transaction_type ??
            ""
        ).toLowerCase();

        if (
            type === "thu" ||
            type === "income" ||
            type === "revenue"
        ) {
            totalIncome += amount;
        } else if (
            type === "chi" ||
            type === "expense"
        ) {
            totalExpense += amount;
        }
    });

    const profit = totalIncome - totalExpense;

    /*
     * Nếu HTML có các element này thì cập nhật.
     * Không có thì bỏ qua.
     */

    setTextIfExists("totalIncome", formatMoney(totalIncome));
    setTextIfExists("totalExpense", formatMoney(totalExpense));
    setTextIfExists("totalProfit", formatMoney(profit));

    setTextIfExists("statisticsIncome", formatMoney(totalIncome));
    setTextIfExists("statisticsExpense", formatMoney(totalExpense));
    setTextIfExists("statisticsProfit", formatMoney(profit));
}


/* =========================
   HISTORY
========================= */

function renderHistory() {
    // Placeholder an toàn.
    // Giữ lại nếu project của bạn chưa có hàm này.
}


/* =========================
   RESTAURANT
========================= */

function renderRestaurant() {
    // Placeholder an toàn.
    // Giữ lại nếu project của bạn chưa có hàm này.
}


/* =========================
   COD
========================= */

function renderCOD() {
    // Placeholder an toàn.
    // Giữ lại nếu project của bạn chưa có hàm này.
}


/* =========================
   TOAST
========================= */

let toastTimer;

function showToast(message) {
    const toast = document.getElementById("toast");

    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2200);
}


/* =========================
   THEME
========================= */

function toggleDarkMode() {
    document.body.classList.toggle("dark");

    localStorage.setItem(
        "bep_nha_duyen_dark",
        document.body.classList.contains("dark")
    );
}


function loadTheme() {
    const dark = localStorage.getItem("bep_nha_duyen_dark");

    if (dark === "true") {
        document.body.classList.add("dark");
    }
}


/* =========================
   DATE
========================= */

function setToday() {
    const input = document.getElementById("transactionDate");

    if (input) {
        const now = new Date();

        /*
         * Dùng local date thay vì toISOString()
         * để tránh trường hợp lệch ngày do timezone.
         */

        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");

        input.value = `${year}-${month}-${day}`;
    }

    const label = document.getElementById("todayLabel");

    if (label) {
        label.textContent = new Date().toLocaleDateString("vi-VN");
    }
}


/* =========================
   HELPERS
========================= */

function setTextIfExists(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.textContent = value;
    }
}


function formatMoney(value) {
    const number = Number(value) || 0;

    return number.toLocaleString("vi-VN") + " ₫";
}
