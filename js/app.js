/* =========================================================
   APP.JS
   BẾP NHÀ DUYÊN
   FULL APP CONTROLLER
   FIX FULL:
   - setText is not defined
   - setHTML is not defined
   - setValue is not defined
   - page trắng khi chuyển trang
   - render một trang lỗi làm chết trang khác
   - navigation SPA
   - dark mode
   - database loading
   - statistics navigation
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

    statisticsDate: new Date(),

    initialized: false

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
   DOM HELPERS
   DÙNG CHUNG CHO TẤT CẢ FILE JS
========================================================= */


/*
 * Query một element
 */

function $(selector) {

    if (
        selector instanceof
        Element
    ) {
        return selector;
    }

    return document.querySelector(
        selector
    );

}


/*
 * Query nhiều element
 */

function $$(selector) {

    return [
        ...document.querySelectorAll(
            selector
        )
    ];

}


/*
 * setText
 */

function setText(
    selector,
    value
) {

    const element =
        $(selector);

    if (!element) {

        console.warn(
            "setText: element không tồn tại:",
            selector
        );

        return;

    }

    element.textContent =
        value === null ||
        value === undefined
            ? ""
            : String(value);

}


/*
 * setHTML
 */

function setHTML(
    selector,
    value
) {

    const element =
        $(selector);

    if (!element) {

        console.warn(
            "setHTML: element không tồn tại:",
            selector
        );

        return;

    }

    element.innerHTML =
        value === null ||
        value === undefined
            ? ""
            : String(value);

}


/*
 * setValue
 */

function setValue(
    selector,
    value
) {

    const element =
        $(selector);

    if (!element) {

        console.warn(
            "setValue: element không tồn tại:",
            selector
        );

        return;

    }

    element.value =
        value === null ||
        value === undefined
            ? ""
            : value;

}


/*
 * getValue
 */

function getValue(
    selector
) {

    const element =
        $(selector);

    if (!element) {

        return "";

    }

    return element.value ?? "";

}


/*
 * show element
 */

function showElement(
    selector
) {

    const element =
        $(selector);

    if (!element) return;

    element.hidden = false;

    element.style.removeProperty(
        "display"
    );

}


/*
 * hide element
 */

function hideElement(
    selector
) {

    const element =
        $(selector);

    if (!element) return;

    element.hidden = true;

}


/*
 * set visible
 */

function setVisible(
    selector,
    visible
) {

    if (visible) {

        showElement(
            selector
        );

    } else {

        hideElement(
            selector
        );

    }

}


/*
 * class add
 */

function addClass(
    selector,
    className
) {

    const element =
        $(selector);

    if (!element) return;

    element.classList.add(
        className
    );

}


/*
 * class remove
 */

function removeClass(
    selector,
    className
) {

    const element =
        $(selector);

    if (!element) return;

    element.classList.remove(
        className
    );

}


/*
 * class toggle
 */

function toggleClass(
    selector,
    className,
    force
) {

    const element =
        $(selector);

    if (!element) return;

    element.classList.toggle(
        className,
        force
    );

}


/* =========================================================
   FORMAT
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


function formatNumber(
    value
) {

    const number =
        Number(value) || 0;

    return number.toLocaleString(
        "vi-VN"
    );

}


function formatDateInput(
    date
) {

    if (
        !date ||
        !(date instanceof Date)
    ) {

        date =
            new Date(
                date || Date.now()
            );

    }


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
   INIT
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initApp
);


async function initApp() {

    try {

        console.log(
            "Bếp Nhà Duyên đang khởi tạo..."
        );


        /*
         * Theme
         */

        loadTheme();


        /*
         * Date
         */

        setToday();


        /*
         * Page system
         */

        preparePages();


        /*
         * Load database
         */

        await loadInitialData();


        /*
         * Render trang hiện tại
         */

        const initialPage =
            getPageFromURL();


        navigateTo(
            initialPage,
            false
        );


        AppState.initialized =
            true;


        console.log(
            "Bếp Nhà Duyên đã sẵn sàng."
        );


    } catch (error) {

        console.error(
            "APP INIT ERROR:",
            error
        );

        /*
         * Không để app trắng
         */

        navigateTo(
            "home",
            false
        );

    }

}


/* =========================================================
   PREPARE PAGES
========================================================= */

function preparePages() {

    /*
     * Các page phải có class page
     */

    Object.values(
        PAGE_CONFIG
    ).forEach(
        config => {

            const element =
                document.getElementById(
                    config.pageId
                );


            if (!element) {

                console.warn(
                    `Thiếu #${config.pageId}`
                );

                return;

            }


            element.classList.add(
                "page"
            );


            element.setAttribute(
                "aria-hidden",
                "true"
            );

        }
    );


    /*
     * Nav
     */

    Object.values(
        PAGE_CONFIG
    ).forEach(
        config => {

            const nav =
                document.getElementById(
                    config.navId
                );


            if (!nav) return;


            nav.classList.add(
                "nav-button"
            );

        }
    );

}


/* =========================================================
   DATABASE
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
            "dbGet chưa tồn tại:",
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


        return Array.isArray(
            result
        )
            ? result
            : [];

    } catch (error) {

        console.error(
            `DB ERROR [${table}]`,
            error
        );

        return [];

    }

}


async function loadInitialData() {

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
     *
     * Không để thiếu bảng COD
     * làm chết toàn app.
     */

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


    /*
     * Render tất cả
     */

    renderAll();

}


/* =========================================================
   NAVIGATION
========================================================= */

function navigateTo(
    page,
    smooth = true
) {

    /*
     * Kiểm tra page
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


    if (!pageElement) {

        console.error(
            `Không tìm thấy #${config.pageId}`
        );

        return;

    }


    /*
     * State
     */

    AppState.currentPage =
        page;


    /*
     * HIDE ALL PAGE
     */

    $$(".page")
        .forEach(
            element => {

                element.classList.remove(
                    "active-page"
                );

                element.setAttribute(
                    "aria-hidden",
                    "true"
                );

            }
        );


    /*
     * SHOW CURRENT PAGE
     */

    pageElement.classList.add(
        "active-page"
    );

    pageElement.setAttribute(
        "aria-hidden",
        "false"
    );


    /*
     * Navigation
     */

    $$(".nav-button")
        .forEach(
            button => {

                button.classList.remove(
                    "active"
                );

                button.removeAttribute(
                    "aria-current"
                );

            }
        );


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
     * Render riêng page
     */

    renderCurrentPage(
        page
    );


    /*
     * Scroll top
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
        window[
            config.render
        ];


    if (
        typeof renderFunction !==
        "function"
    ) {

        console.warn(
            `${config.render} chưa được load`
        );

        return;

    }


    try {

        renderFunction();

    } catch (error) {

        console.error(
            `RENDER ERROR [${page}]`,
            error
        );


        /*
         * Chỉ page hiện tại lỗi.
         * Không làm chết các page khác.
         */

        showToast(
            `Lỗi hiển thị ${page}`
        );

    }

}


/* =========================================================
   RENDER ALL
========================================================= */

function renderAll() {

    const renderers = [

        "renderHome",

        "renderStatistics",

        "renderHistory",

        "renderRestaurant",

        "renderCOD"

    ];


    renderers.forEach(
        functionName => {

            const fn =
                window[
                    functionName
                ];


            if (
                typeof fn !==
                "function"
            ) {

                console.warn(
                    `${functionName} chưa được load`
                );

                return;

            }


            try {

                fn();

            } catch (error) {

                console.error(
                    `RENDER ERROR: ${functionName}`,
                    error
                );

            }

        }
    );

}


/* =========================================================
   REFRESH
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
            "Toast:",
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
   THEME
========================================================= */

function toggleDarkMode() {

    const dark =
        document.body.classList.toggle(
            "dark"
        );


    localStorage.setItem(
        "bep_nha_duyen_dark",
        dark
            ? "true"
            : "false"
    );


    updateThemeButton(
        dark
    );

}


function loadTheme() {

    const dark =
        localStorage.getItem(
            "bep_nha_duyen_dark"
        ) === "true";


    document.body.classList.toggle(
        "dark",
        dark
    );


    updateThemeButton(
        dark
    );

}


function updateThemeButton(
    dark
) {

    $$(
        "[data-theme-toggle]"
    ).forEach(
        button => {

            button.setAttribute(
                "aria-pressed",
                String(dark)
            );


            const icon =
                button.querySelector(
                    ".theme-icon"
                );


            if (icon) {

                icon.textContent =
                    dark
                        ? "☀️"
                        : "🌙";

            }

        }
    );

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
        new Date(now);

}


/* =========================================================
   STATISTICS
========================================================= */

function setStatisticsPeriod(
    period
) {

    if (
        ![
            "day",
            "month",
            "year"
        ].includes(period)
    ) {

        period = "day";

    }


    AppState.statisticsPeriod =
        period;


    refreshCurrentPage();

}


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
                date.getDate() +
                Number(amount)
            );

            break;


        case "month":

            date.setMonth(
                date.getMonth() +
                Number(amount)
            );

            break;


        case "year":

            date.setFullYear(
                date.getFullYear() +
                Number(amount)
            );

            break;

    }


    AppState.statisticsDate =
        date;


    refreshCurrentPage();

}


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
   URL
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
   NAVIGATION CLICK
========================================================= */

document.addEventListener(
    "click",
    event => {

        /*
         * data-page
         */

        const navigation =
            event.target.closest(
                "[data-page]"
            );


        if (navigation) {

            const page =
                navigation.dataset.page;


            if (
                page &&
                PAGE_CONFIG[page]
            ) {

                event.preventDefault();

                navigateTo(
                    page
                );

                return;

            }

        }


        /*
         * Theme
         */

        const theme =
            event.target.closest(
                "[data-theme-toggle]"
            );


        if (theme) {

            event.preventDefault();

            toggleDarkMode();

        }

    }
);


/* =========================================================
   BROWSER BACK/FORWARD
========================================================= */

window.addEventListener(
    "popstate",
    () => {

        navigateTo(
            getPageFromURL(),
            false
        );

    }
);


/* =========================================================
   GLOBAL ERROR
========================================================= */

window.addEventListener(
    "error",
    event => {

        console.error(
            "GLOBAL JS ERROR:",
            event.error ||
            event.message
        );

    }
);


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
   EXPOSE GLOBAL FUNCTIONS
   QUAN TRỌNG KHI TÁCH FILE
========================================================= */

window.AppState =
    AppState;

window.PAGE_CONFIG =
    PAGE_CONFIG;


/*
 * DOM
 */

window.$ =
    $;

window.$$ =
    $$;

window.setText =
    setText;

window.setHTML =
    setHTML;

window.setValue =
    setValue;

window.getValue =
    getValue;

window.showElement =
    showElement;

window.hideElement =
    hideElement;

window.setVisible =
    setVisible;

window.addClass =
    addClass;

window.removeClass =
    removeClass;

window.toggleClass =
    toggleClass;


/*
 * Format
 */

window.formatMoney =
    formatMoney;

window.formatNumber =
    formatNumber;

window.formatDateInput =
    formatDateInput;

window.formatDateVN =
    formatDateVN;

window.escapeHTML =
    escapeHTML;


/*
 * App
 */

window.navigateTo =
    navigateTo;

window.navigateToURL =
    navigateToURL;

window.renderAll =
    renderAll;

window.refreshCurrentPage =
    refreshCurrentPage;

window.showToast =
    showToast;


/*
 * Theme
 */

window.toggleDarkMode =
    toggleDarkMode;


/*
 * Statistics
 */

window.setStatisticsPeriod =
    setStatisticsPeriod;

window.changeStatisticsDate =
    changeStatisticsDate;

window.getStatisticsDateLabel =
    getStatisticsDateLabel;


/* =========================================================
   END APP.JS
========================================================= */
