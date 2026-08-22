/* =========================================================
   APP.JS
   BẾP NHÀ DUYÊN
   FULL SPA CONTROLLER
   FIX:
   - Chuyển trang không bị trắng
   - Tách giao diện từng page an toàn
   - Active navigation chính xác
   - Không render nhầm page
   - Không lỗi khi element không tồn tại
   - Giữ trạng thái page
   - Hỗ trợ dark mode
========================================================= */


/* =========================================================
   APP STATE
========================================================= */

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


/* =========================================================
   PAGE CONFIG
========================================================= */

const PAGE_CONFIG = {

    home: {

        pageId: "homePage",

        navId: "navHome",

        render: "renderHome"

    },

    statistics: {

        pageId: "statisticsPage",

        navId: "navStatistics",

        render: "renderStatistics"

    },

    history: {

        pageId: "historyPage",

        navId: "navHistory",

        render: "renderHistory"

    },

    restaurant: {

        pageId: "restaurantPage",

        navId: "navRestaurant",

        render: "renderRestaurant"

    },

    cod: {

        pageId: "codPage",

        navId: "navCOD",

        render: "renderCOD"

    }

};


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initApp
);


async function initApp() {

    try {

        /*
         * Thiết lập ngày trước
         */
        setToday();


        /*
         * Load theme
         */
        loadTheme();


        /*
         * Đảm bảo page được chuẩn hóa
         */
        preparePages();


        /*
         * Load database
         */
        await loadInitialData();


        /*
         * Mặc định vào Home
         */
        navigateTo("home", false);


    } catch (error) {

        console.error(
            "APP INIT ERROR:",
            error
        );

        showToast(
            "Không thể khởi tạo ứng dụng"
        );

    }

}


/* =========================================================
   PREPARE PAGES
========================================================= */

function preparePages() {

    const pages =
        document.querySelectorAll(
            ".page"
        );


    pages.forEach(page => {

        /*
         * Xóa trạng thái active cũ
         */
        page.classList.remove(
            "active-page"
        );


        /*
         * Không dùng display inline
         * để tránh CSS xung đột.
         */
        page.removeAttribute(
            "style"
        );

    });


    /*
     * Nếu HTML dùng page riêng nhưng
     * chưa có class .page, tự nhận diện
     * theo ID.
     */

    Object.values(PAGE_CONFIG)
        .forEach(config => {

            const element =
                document.getElementById(
                    config.pageId
                );

            if (!element) return;

            element.classList.add(
                "page"
            );

        });

}


/* =========================================================
   INITIAL DATA
========================================================= */

async function loadInitialData() {

    try {

        /*
         * Categories
         */

        AppState.categories =
            await safeDbGet(
                "categories",
                {
                    order: {
                        column: "created_at",
                        ascending: true
                    }
                }
            );


        /*
         * Dishes
         */

        AppState.dishes =
            await safeDbGet(
                "dishes",
                {
                    order: {
                        column: "created_at",
                        ascending: true
                    }
                }
            );


        /*
         * Transactions
         */

        AppState.transactions =
            await safeDbGet(
                "transactions",
                {
                    order: {
                        column: "date",
                        ascending: false
                    }
                }
            );


        /*
         * COD
         */

        try {

            AppState.codParts =
                await safeDbGet(
                    "cod_parts",
                    {
                        order: {
                            column: "created_at",
                            ascending: false
                        }
                    }
                );

        } catch (error) {

            /*
             * Nếu bảng COD chưa tồn tại
             * thì không làm app chết.
             */

            console.warn(
                "COD data unavailable:",
                error
            );

            AppState.codParts = [];

        }


    } catch (error) {

        console.error(
            "LOAD DATA ERROR:",
            error
        );

        /*
         * Không để undefined
         */

        AppState.categories =
            Array.isArray(
                AppState.categories
            )
                ? AppState.categories
                : [];


        AppState.dishes =
            Array.isArray(
                AppState.dishes
            )
                ? AppState.dishes
                : [];


        AppState.transactions =
            Array.isArray(
                AppState.transactions
            )
                ? AppState.transactions
                : [];

    }

}


/* =========================================================
   SAFE DATABASE GET
========================================================= */

async function safeDbGet(
    table,
    options = {}
) {

    if (
        typeof dbGet !==
        "function"
    ) {

        console.warn(
            "dbGet() chưa được load:",
            table
        );

        return [];

    }


    try {

        const result =
            await dbGet(
                table,
                options
            );


        return Array.isArray(result)
            ? result
            : [];


    } catch (error) {

        console.error(
            `DB GET ERROR: ${table}`,
            error
        );

        return [];

    }

}


/* =========================================================
   NAVIGATION
========================================================= */

function navigateTo(
    page,
    smooth = true
) {

    /*
     * Page không tồn tại
     */

    if (
        !PAGE_CONFIG[page]
    ) {

        console.warn(
            "Page không tồn tại:",
            page
        );

        page = "home";

    }


    const config =
        PAGE_CONFIG[page];


    const pageElement =
        document.getElementById(
            config.pageId
        );


    /*
     * Nếu pageElement không tồn tại
     * thì không tiếp tục.
     */

    if (!pageElement) {

        console.error(
            `Không tìm thấy #${config.pageId}`
        );

        return;

    }


    /*
     * Lưu state
     */

    AppState.currentPage =
        page;


    /*
     * =========================
     * HIDE ALL PAGES
     * =========================
     */

    document
        .querySelectorAll(
            ".page"
        )
        .forEach(element => {

            element.classList.remove(
                "active-page"
            );

            element.setAttribute(
                "aria-hidden",
                "true"
            );

        });


    /*
     * =========================
     * SHOW CURRENT PAGE
     * =========================
     */

    pageElement.classList.add(
        "active-page"
    );

    pageElement.setAttribute(
        "aria-hidden",
        "false"
    );


    /*
     * =========================
     * NAVIGATION ACTIVE
     * =========================
     */

    document
        .querySelectorAll(
            ".nav-button"
        )
        .forEach(button => {

            button.classList.remove(
                "active"
            );

            button.removeAttribute(
                "aria-current"
            );

        });


    const navButton =
        document.getElementById(
            config.navId
        );


    if (navButton) {

        navButton.classList.add(
            "active"
        );

        navButton.setAttribute(
            "aria-current",
            "page"
        );

    }


    /*
     * =========================
     * RENDER PAGE
     * =========================
     */

    renderCurrentPage(
        page
    );


    /*
     * =========================
     * SCROLL TOP
     * =========================
     */

    window.scrollTo({

        top: 0,

        behavior:
            smooth
                ? "smooth"
                : "auto"

    });

}


/* =========================================================
   RENDER CURRENT PAGE
========================================================= */

function renderCurrentPage(
    page
) {

    const config =
        PAGE_CONFIG[page];


    if (!config) return;


    const renderFunction =
        window[config.render];


    /*
     * Render function không tồn tại
     */

    if (
        typeof renderFunction !==
        "function"
    ) {

        console.warn(
            `Không tìm thấy ${config.render}()`
        );

        return;

    }


    try {

        renderFunction();

    } catch (error) {

        console.error(
            `RENDER ERROR: ${page}`,
            error
        );

        showToast(
            "Không thể hiển thị trang"
        );

    }

}


/* =========================================================
   RENDER ALL
========================================================= */

function renderAll() {

    /*
     * Chỉ render các function tồn tại.
     * Không để một page lỗi làm hỏng toàn app.
     */

    const renderFunctions = [

        "renderHome",

        "renderStatistics",

        "renderHistory",

        "renderRestaurant",

        "renderCOD"

    ];


    renderFunctions.forEach(
        functionName => {

            const fn =
                window[functionName];


            if (
                typeof fn !==
                "function"
            ) {

                console.warn(
                    `${functionName}() không tồn tại`
                );

                return;

            }


            try {

                fn();

            } catch (error) {

                console.error(
                    `Render error: ${functionName}`,
                    error
                );

            }

        }
    );

}


/* =========================================================
   REFRESH CURRENT PAGE
========================================================= */

function refreshCurrentPage() {

    renderCurrentPage(
        AppState.currentPage
    );

}


/* =========================================================
   TOAST
========================================================= */

let toastTimer = null;


function showToast(
    message
) {

    const toast =
        document.getElementById(
            "toast"
        );


    if (!toast) {

        console.log(
            "TOAST:",
            message
        );

        return;

    }


    toast.textContent =
        String(message);


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2200
        );

}


/* =========================================================
   DARK MODE
========================================================= */

function toggleDarkMode() {

    const isDark =
        document.body.classList.toggle(
            "dark"
        );


    localStorage.setItem(
        "bep_nha_duyen_dark",
        isDark
            ? "true"
            : "false"
    );


    /*
     * Update button icon nếu có
     */

    updateThemeButton(
        isDark
    );

}


/* =========================================================
   LOAD THEME
========================================================= */

function loadTheme() {

    const dark =
        localStorage.getItem(
            "bep_nha_duyen_dark"
        );


    const isDark =
        dark === "true";


    document.body.classList.toggle(
        "dark",
        isDark
    );


    updateThemeButton(
        isDark
    );

}


/* =========================================================
   THEME BUTTON
========================================================= */

function updateThemeButton(
    isDark
) {

    const buttons =
        document.querySelectorAll(
            "[data-theme-toggle]"
        );


    buttons.forEach(button => {

        button.setAttribute(
            "aria-pressed",
            String(isDark)
        );


        const icon =
            button.querySelector(
                ".theme-icon"
            );


        if (icon) {

            icon.textContent =
                isDark
                    ? "☀️"
                    : "🌙";

        }

    });

}


/* =========================================================
   DATE
========================================================= */

function setToday() {

    const now =
        new Date();


    /*
     * Transaction date
     */

    const input =
        document.getElementById(
            "transactionDate"
        );


    if (input) {

        input.value =
            formatDateInput(
                now
            );

    }


    /*
     * Today label
     */

    const label =
        document.getElementById(
            "todayLabel"
        );


    if (label) {

        label.textContent =
            now.toLocaleDateString(
                "vi-VN"
            );

    }


    /*
     * Statistics date
     */

    AppState.statisticsDate =
        new Date(
            now
        );

}


/* =========================================================
   DATE FORMAT YYYY-MM-DD
========================================================= */

function formatDateInput(
    date
) {

    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            date.getDate()
        ).padStart(
            2,
            "0"
        );


    return `${year}-${month}-${day}`;

}


/* =========================================================
   FORMAT MONEY
========================================================= */

function formatMoney(
    value
) {

    const number =
        Number(value) || 0;


    return number.toLocaleString(
        "vi-VN"
    ) + " ₫";

}


/* =========================================================
   FORMAT NUMBER
========================================================= */

function formatNumber(
    value
) {

    const number =
        Number(value) || 0;


    return number.toLocaleString(
        "vi-VN"
    );

}


/* =========================================================
   FORMAT DATE
========================================================= */

function formatDateVN(
    value
) {

    if (!value) return "";


    const date =
        value instanceof Date
            ? value
            : new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(value);

    }


    return date.toLocaleDateString(
        "vi-VN"
    );

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   PAGE CLICK EVENTS
========================================================= */

document.addEventListener(
    "click",
    event => {

        /*
         * Navigation button
         */

        const nav =
            event.target.closest(
                "[data-page]"
            );


        if (nav) {

            const page =
                nav.dataset.page;


            if (page) {

                event.preventDefault();

                navigateTo(
                    page
                );

                return;

            }

        }


        /*
         * Theme toggle
         */

        const themeButton =
            event.target.closest(
                "[data-theme-toggle]"
            );


        if (themeButton) {

            event.preventDefault();

            toggleDarkMode();

        }

    }
);


/* =========================================================
   BROWSER BACK / FORWARD
========================================================= */

window.addEventListener(
    "popstate",
    () => {

        const page =
            getPageFromURL();


        navigateTo(
            page,
            false
        );

    }
);


/* =========================================================
   URL PAGE
========================================================= */

function getPageFromURL() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const page =
        params.get(
            "page"
        );


    if (
        page &&
        PAGE_CONFIG[page]
    ) {

        return page;

    }


    return "home";

}


/* =========================================================
   OPTIONAL URL NAVIGATION
========================================================= */

function navigateToURL(
    page
) {

    if (
        !PAGE_CONFIG[page]
    ) {

        page = "home";

    }


    const url =
        new URL(
            window.location.href
        );


    url.searchParams.set(
        "page",
        page
    );


    history.pushState(
        {
            page
        },
        "",
        url
    );


    navigateTo(
        page
    );

}


/* =========================================================
   STATISTICS PERIOD
========================================================= */

function setStatisticsPeriod(
    period
) {

    const allowed = [
        "day",
        "month",
        "year"
    ];


    if (
        !allowed.includes(
            period
        )
    ) {

        period = "day";

    }


    AppState.statisticsPeriod =
        period;


    refreshCurrentPage();

}


/* =========================================================
   STATISTICS DATE
========================================================= */

function changeStatisticsDate(
    amount
) {

    const date =
        new Date(
            AppState.statisticsDate
        );


    switch (
        AppState.statisticsPeriod
    ) {

        case "day":

            date.setDate(
                date.getDate() + amount
            );

            break;


        case "month":

            date.setMonth(
                date.getMonth() + amount
            );

            break;


        case "year":

            date.setFullYear(
                date.getFullYear() + amount
            );

            break;

    }


    AppState.statisticsDate =
        date;


    refreshCurrentPage();

}


/* =========================================================
   STATISTICS DATE LABEL
========================================================= */

function getStatisticsDateLabel() {

    const date =
        AppState.statisticsDate;


    switch (
        AppState.statisticsPeriod
    ) {

        case "day":

            return date.toLocaleDateString(
                "vi-VN",
                {
                    weekday: "long",
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric"
                }
            );


        case "month":

            return date.toLocaleDateString(
                "vi-VN",
                {
                    month: "long",
                    year: "numeric"
                }
            );


        case "year":

            return String(
                date.getFullYear()
            );


        default:

            return "";

    }

}


/* =========================================================
   UPDATE STATISTICS DATE LABEL
========================================================= */

function updateStatisticsDateLabel() {

    const element =
        document.getElementById(
            "statisticsDateLabel"
        );


    if (!element) return;


    element.textContent =
        getStatisticsDateLabel();

}


/* =========================================================
   SAFE ELEMENT
========================================================= */

function $(selector) {

    return document.querySelector(
        selector
    );

}


function $$(selector) {

    return [
        ...document.querySelectorAll(
            selector
        )
    ];

}


/* =========================================================
   PAGE DEBUG
========================================================= */

function debugPages() {

    console.group(
        "STATISTICS APP PAGES"
    );


    Object.entries(
        PAGE_CONFIG
    ).forEach(
        ([name, config]) => {

            const page =
                document.getElementById(
                    config.pageId
                );


            const nav =
                document.getElementById(
                    config.navId
                );


            console.log(
                name,
                {
                    page:
                        !!page,

                    nav:
                        !!nav,

                    render:
                        typeof window[
                            config.render
                        ] === "function"
                }
            );

        }
    );


    console.groupEnd();

}


/* =========================================================
   GLOBAL ERROR HANDLER
========================================================= */

window.addEventListener(
    "error",
    event => {

        console.error(
            "GLOBAL ERROR:",
            event.error ||
            event.message
        );

    }
);


/* =========================================================
   PROMISE ERROR
========================================================= */

window.addEventListener(
    "unhandledrejection",
    event => {

        console.error(
            "UNHANDLED PROMISE:",
            event.reason
        );

    }
);


/* =========================================================
   EXPOSE APP
========================================================= */

window.AppState =
    AppState;

window.PAGE_CONFIG =
    PAGE_CONFIG;

window.navigateTo =
    navigateTo;

window.navigateToURL =
    navigateToURL;

window.renderAll =
    renderAll;

window.refreshCurrentPage =
    refreshCurrentPage;

window.toggleDarkMode =
    toggleDarkMode;

window.setStatisticsPeriod =
    setStatisticsPeriod;

window.changeStatisticsDate =
    changeStatisticsDate;

window.getStatisticsDateLabel =
    getStatisticsDateLabel;

window.formatMoney =
    formatMoney;

window.formatNumber =
    formatNumber;

window.formatDateVN =
    formatDateVN;

window.escapeHTML =
    escapeHTML;


/* =========================================================
   END
========================================================= */
