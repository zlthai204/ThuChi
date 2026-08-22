/* =========================================================
   APP.JS
   GLOBAL APP STATE + NAVIGATION + INIT
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
   DOM HELPERS
========================================================= */

function $(selector, parent = document) {
    return parent.querySelector(selector);
}

function $$(selector, parent = document) {
    return [...parent.querySelectorAll(selector)];
}


/* FIX: setText is used by home.js/statistics.js/etc */
function setText(selector, value) {
    const element =
        typeof selector === "string"
            ? document.querySelector(selector)
            : selector;

    if (!element) return;

    element.textContent =
        value === null ||
        value === undefined
            ? ""
            : String(value);
}


/* =========================================================
   INIT
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        try {

            setToday();

            loadTheme();

            await loadInitialData();

            ensurePages();

            navigateTo("home");

        } catch (error) {

            console.error(
                "APP INIT ERROR:",
                error
            );

        }

    }
);


/* =========================================================
   INITIAL DATA
========================================================= */

async function loadInitialData() {

    try {

        if (typeof dbGet !== "function") {

            console.warn(
                "dbGet() chưa được load."
            );

            renderAll();

            return;

        }


        AppState.categories =
            await dbGet(
                "categories",
                {
                    order: {
                        column: "created_at",
                        ascending: true
                    }
                }
            ) || [];


        AppState.dishes =
            await dbGet(
                "dishes",
                {
                    order: {
                        column: "created_at",
                        ascending: true
                    }
                }
            ) || [];


        AppState.transactions =
            await dbGet(
                "transactions",
                {
                    order: {
                        column: "date",
                        ascending: false
                    }
                }
            ) || [];


        renderAll();

    } catch (error) {

        console.error(
            "LOAD DATA ERROR:",
            error
        );

        AppState.categories = [];
        AppState.dishes = [];
        AppState.transactions = [];

        renderAll();

    }

}


/* =========================================================
   PAGE CHECK
========================================================= */

function ensurePages() {

    const pages = [
        "home",
        "statistics",
        "history",
        "restaurant",
        "cod"
    ];

    pages.forEach(page => {

        const id = `${page}Page`;

        if (!document.getElementById(id)) {

            console.warn(
                `Không tìm thấy #${id}`
            );

        }

    });

}


/* =========================================================
   NAVIGATION
========================================================= */

function navigateTo(page) {

    const validPages = [
        "home",
        "statistics",
        "history",
        "restaurant",
        "cod"
    ];


    if (!validPages.includes(page)) {

        console.warn(
            "Trang không hợp lệ:",
            page
        );

        return;

    }


    AppState.currentPage = page;


    /* ---------------------------------
       Hide all pages
    --------------------------------- */

    $$(".page").forEach(element => {

        element.classList.remove(
            "active-page"
        );

        element.hidden = true;

    });


    /* ---------------------------------
       Show selected page
    --------------------------------- */

    const pageElement =
        document.getElementById(
            `${page}Page`
        );


    if (!pageElement) {

        console.error(
            `Không tìm thấy #${page}Page`
        );

        return;

    }


    pageElement.hidden = false;

    pageElement.classList.add(
        "active-page"
    );


    /* ---------------------------------
       Navigation button
    --------------------------------- */

    $$(".nav-button").forEach(button => {

        button.classList.remove(
            "active"
        );

    });


    const navMap = {

        home: "navHome",

        statistics:
            "navStatistics",

        history:
            "navHistory",

        restaurant:
            "navRestaurant",

        cod:
            "navCOD"

    };


    const navButton =
        document.getElementById(
            navMap[page]
        );


    if (navButton) {

        navButton.classList.add(
            "active"
        );

    }


    /* ---------------------------------
       Render page
    --------------------------------- */

    try {

        switch (page) {

            case "home":

                if (
                    typeof renderHome ===
                    "function"
                ) {
                    renderHome();
                }

                break;


            case "statistics":

                if (
                    typeof renderStatistics ===
                    "function"
                ) {
                    renderStatistics();
                }

                break;


            case "history":

                if (
                    typeof renderHistory ===
                    "function"
                ) {
                    renderHistory();
                }

                break;


            case "restaurant":

                if (
                    typeof renderRestaurant ===
                    "function"
                ) {
                    renderRestaurant();
                }

                break;


            case "cod":

                if (
                    typeof renderCOD ===
                    "function"
                ) {
                    renderCOD();
                }

                break;

        }

    } catch (error) {

        console.error(
            `RENDER ${page} ERROR:`,
            error
        );

    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================================
   RENDER ALL
========================================================= */

function renderAll() {

    const renderers = [
        ["home", renderHome],
        ["statistics", renderStatistics],
        ["history", renderHistory],
        ["restaurant", renderRestaurant],
        ["cod", renderCOD]
    ];


    renderers.forEach(
        ([name, renderer]) => {

            if (
                typeof renderer !==
                "function"
            ) {

                console.warn(
                    `Chưa có ${name}.js`
                );

                return;

            }


            try {

                renderer();

            } catch (error) {

                console.error(
                    `Render ${name} lỗi:`,
                    error
                );

            }

        }
    );

}


/* =========================================================
   TOAST
========================================================= */

let toastTimer = null;

function showToast(message) {

    const toast =
        document.getElementById(
            "toast"
        );

    if (!toast) {

        console.log(message);

        return;

    }


    toast.textContent =
        message || "";


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(() => {

            toast.classList.remove(
                "show"
            );

        }, 2200);

}


/* =========================================================
   THEME
========================================================= */

function toggleDarkMode() {

    const enabled =
        document.body.classList.toggle(
            "dark"
        );


    localStorage.setItem(
        "bep_nha_duyen_dark",
        enabled
    );

}


function loadTheme() {

    const dark =
        localStorage.getItem(
            "bep_nha_duyen_dark"
        );


    if (dark === "true") {

        document.body.classList.add(
            "dark"
        );

    }

}


/* =========================================================
   DATE
========================================================= */

function setToday() {

    const now = new Date();


    const input =
        document.getElementById(
            "transactionDate"
        );


    if (input) {

        const year =
            now.getFullYear();


        const month =
            String(
                now.getMonth() + 1
            ).padStart(2, "0");


        const day =
            String(
                now.getDate()
            ).padStart(2, "0");


        input.value =
            `${year}-${month}-${day}`;

    }


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

}


/* =========================================================
   GLOBAL FORMATTERS
========================================================= */

function formatMoney(value) {

    const number =
        Number(value) || 0;


    return number.toLocaleString(
        "vi-VN"
    ) + " ₫";

}


function formatNumber(value) {

    return (
        Number(value) || 0
    ).toLocaleString(
        "vi-VN"
    );

}


function formatDate(date) {

    if (!date) return "";


    const d =
        new Date(date);


    if (
        Number.isNaN(
            d.getTime()
        )
    ) {
        return "";
    }


    return d.toLocaleDateString(
        "vi-VN"
    );

}


/* =========================================================
   SAFE HTML
========================================================= */

function escapeHTML(value) {

    return String(
        value ?? ""
    )
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* =========================================================
   ACTIVE PAGE
========================================================= */

function getCurrentPage() {

    return AppState.currentPage;

}


/* =========================================================
   BACKWARD COMPATIBILITY
========================================================= */

window.AppState = AppState;

window.$ = $;
window.$$ = $$;

window.setText = setText;

window.formatMoney = formatMoney;
window.formatNumber = formatNumber;
window.formatDate = formatDate;

window.escapeHTML = escapeHTML;

window.navigateTo = navigateTo;
window.showToast = showToast;

window.toggleDarkMode =
    toggleDarkMode;

window.loadTheme = loadTheme;
window.setToday = setToday;
