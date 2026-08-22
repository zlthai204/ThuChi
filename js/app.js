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

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        try {

            setToday();

            loadTheme();

            await loadInitialData();

            navigateTo("home");

        } catch (error) {

            console.error(
                "APP INIT ERROR:",
                error
            );

        }

    }
);


/* =========================
   INITIAL DATA
========================= */

async function loadInitialData() {

    try {

        AppState.categories =
            await dbGet("categories", {
                order: {
                    column: "created_at",
                    ascending: true
                }
            });

        AppState.dishes =
            await dbGet("dishes", {
                order: {
                    column: "created_at",
                    ascending: true
                }
            });

        AppState.transactions =
            await dbGet("transactions", {
                order: {
                    column: "date",
                    ascending: false
                }
            });


        /*
         * Đảm bảo luôn là Array.
         * Nếu database trả về null/undefined
         * thì app vẫn không bị crash.
         */

        if (!Array.isArray(AppState.categories)) {

            AppState.categories = [];

        }

        if (!Array.isArray(AppState.dishes)) {

            AppState.dishes = [];

        }

        if (!Array.isArray(AppState.transactions)) {

            AppState.transactions = [];

        }


        renderAll();

    } catch (error) {

        console.error(
            "LOAD DATA ERROR:",
            error
        );

    }

}


/* =========================
   NAVIGATION
========================= */

function navigateTo(page) {

    AppState.currentPage = page;


    document
        .querySelectorAll(".page")
        .forEach(element => {

            element.classList.remove(
                "active-page"
            );

        });


    const pageElement =
        document.getElementById(
            `${page}Page`
        );


    if (pageElement) {

        pageElement.classList.add(
            "active-page"
        );

    }


    document
        .querySelectorAll(".nav-button")
        .forEach(button => {

            button.classList.remove(
                "active"
            );

        });


    const navMap = {

        home: "navHome",

        statistics: "navStatistics",

        history: "navHistory",

        restaurant: "navRestaurant",

        cod: "navCOD"

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


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });


    if (page === "home") {

        safeRender(
            "renderHome",
            renderHome
        );

    }


    if (page === "statistics") {

        safeRender(
            "renderStatistics",
            renderStatistics
        );

    }


    if (page === "history") {

        safeRender(
            "renderHistory",
            renderHistory
        );

    }


    if (page === "restaurant") {

        safeRender(
            "renderRestaurant",
            renderRestaurant
        );

    }


    if (page === "cod") {

        safeRender(
            "renderCOD",
            renderCOD
        );

    }

}


/* =========================
   SAFE RENDER
========================= */

function safeRender(
    functionName,
    renderFunction
) {

    if (
        typeof renderFunction !==
        "function"
    ) {

        console.warn(
            `${functionName}() chưa được định nghĩa.`
        );

        return;

    }


    try {

        renderFunction();

    } catch (error) {

        console.error(
            `${functionName} ERROR:`,
            error
        );

    }

}


/* =========================
   RENDER ALL
========================= */

function renderAll() {

    safeRender(
        "renderHome",
        renderHome
    );


    safeRender(
        "renderStatistics",
        renderStatistics
    );


    safeRender(
        "renderHistory",
        renderHistory
    );


    safeRender(
        "renderRestaurant",
        renderRestaurant
    );


    safeRender(
        "renderCOD",
        renderCOD
    );

}


/* =========================
   STATISTICS
========================= */

/*
 * FIX LỖI:
 *
 * ReferenceError:
 * renderStatistics is not defined
 *
 * Hàm này phải tồn tại trước khi
 * renderAll() hoặc navigateTo()
 * gọi tới nó.
 */

function renderStatistics() {

    const transactions =
        Array.isArray(
            AppState.transactions
        )
            ? AppState.transactions
            : [];


    let totalThu = 0;

    let totalChi = 0;


    transactions.forEach(
        transaction => {

            if (!transaction) {

                return;

            }


            const amount =
                Number(
                    transaction.amount ??
                    transaction.money ??
                    transaction.value ??
                    transaction.total ??
                    0
                );


            if (
                !Number.isFinite(amount)
            ) {

                return;

            }


            const type =
                String(
                    transaction.type ??
                    ""
                )
                    .toLowerCase()
                    .trim();


            if (

                type === "thu" ||

                type === "income" ||

                type === "revenue"

            ) {

                totalThu += amount;

            }


            else if (

                type === "chi" ||

                type === "expense" ||

                type === "spending"

            ) {

                totalChi += amount;

            }

        }
    );


    const balance =
        totalThu - totalChi;


    /*
     * Cập nhật các element nếu HTML
     * của bạn có những ID này.
     *
     * Không có element cũng không lỗi.
     */


    setText(
        "totalThu",
        formatCurrency(totalThu)
    );


    setText(
        "totalChi",
        formatCurrency(totalChi)
    );


    setText(
        "balance",
        formatCurrency(balance)
    );


    setText(
        "totalIncome",
        formatCurrency(totalThu)
    );


    setText(
        "totalExpense",
        formatCurrency(totalChi)
    );


    setText(
        "netBalance",
        formatCurrency(balance)
    );


    /*
     * Một số giao diện có thể dùng
     * các ID khác.
     */

    setText(
        "statisticsTotalThu",
        formatCurrency(totalThu)
    );


    setText(
        "statisticsTotalChi",
        formatCurrency(totalChi)
    );


    setText(
        "statisticsBalance",
        formatCurrency(balance)
    );

}


/* =========================
   SET TEXT
========================= */

function setText(
    elementId,
    value
) {

    const element =
        document.getElementById(
            elementId
        );


    if (!element) {

        return;

    }


    element.textContent =
        value;

}


/* =========================
   FORMAT CURRENCY
========================= */

function formatCurrency(value) {

    const number =
        Number(value) || 0;


    return number.toLocaleString(
        "vi-VN"
    ) + " ₫";

}


/* =========================
   TOAST
========================= */

let toastTimer;


function showToast(message) {

    const toast =
        document.getElementById(
            "toast"
        );


    if (!toast) {

        return;

    }


    toast.textContent =
        message;


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


/* =========================
   THEME
========================= */

function toggleDarkMode() {

    document.body.classList.toggle(
        "dark"
    );


    localStorage.setItem(

        "bep_nha_duyen_dark",

        document.body.classList.contains(
            "dark"
        )

    );

}


function loadTheme() {

    const dark =
        localStorage.getItem(
            "bep_nha_duyen_dark"
        );


    if (
        dark === "true"
    ) {

        document.body.classList.add(
            "dark"
        );

    }

}


/* =========================
   DATE
========================= */

function setToday() {

    const now =
        new Date();


    const input =
        document.getElementById(
            "transactionDate"
        );


    if (input) {

        /*
         * Dùng local date thay vì
         * toISOString() để tránh lệch ngày
         * do múi giờ.
         */

        const year =
            now.getFullYear();


        const month =
            String(
                now.getMonth() + 1
            ).padStart(
                2,
                "0"
            );


        const day =
            String(
                now.getDate()
            ).padStart(
                2,
                "0"
            );


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
