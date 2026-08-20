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
   INIT
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        try {

            loadTheme();

            setToday();

            await loadInitialData();

            initializeTransactionForm();

            navigateTo("home");

        } catch (error) {

            console.error(
                "Lỗi khởi tạo ứng dụng:",
                error
            );

            showToast(
                "Không thể tải dữ liệu"
            );

        }

    }
);


/* =========================================================
   INITIAL DATA
========================================================= */

async function loadInitialData() {

    try {

        /*
         * LOAD CATEGORIES
         */

        AppState.categories =
            await dbGet(
                "categories",
                {
                    order: {
                        column: "created_at",
                        ascending: true
                    }
                }
            );


        /*
         * LOAD DISHES
         */

        AppState.dishes =
            await dbGet(
                "dishes",
                {
                    order: {
                        column: "created_at",
                        ascending: true
                    }
                }
            );


        /*
         * LOAD TRANSACTIONS
         */

        AppState.transactions =
            await dbGet(
                "transactions",
                {
                    order: {
                        column: "date",
                        ascending: false
                    }
                }
            );


        console.log(
            "Categories:",
            AppState.categories
        );

        console.log(
            "Dishes:",
            AppState.dishes
        );

        console.log(
            "Transactions:",
            AppState.transactions
        );


        /*
         * Render toàn bộ giao diện
         */

        renderAll();


    } catch (error) {

        console.error(
            "loadInitialData error:",
            error
        );

        throw error;

    }

}


/* =========================================================
   NAVIGATION
========================================================= */

function navigateTo(page) {

    AppState.currentPage =
        page;


    /*
     * ẨN TẤT CẢ PAGE
     */

    document
        .querySelectorAll(".page")
        .forEach(
            element => {

                element.classList.remove(
                    "active-page"
                );

            }
        );


    /*
     * HIỆN PAGE
     */

    const pageElement =
        document.getElementById(
            `${page}Page`
        );


    if (pageElement) {

        pageElement.classList.add(
            "active-page"
        );

    }


    /*
     * NAV ACTIVE
     */

    document
        .querySelectorAll(".nav-button")
        .forEach(
            button => {

                button.classList.remove(
                    "active"
                );

            }
        );


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


    /*
     * TITLE
     */

    updatePageTitle(
        page
    );


    /*
     * SCROLL TOP
     */

    window.scrollTo(
        0,
        0
    );


    /*
     * RENDER PAGE
     */

    switch (page) {

        case "home":

            renderHome();

            refreshTransactionSelectors();

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


/* =========================================================
   RENDER ALL
========================================================= */

function renderAll() {

    /*
     * Quan trọng:
     * render selector trước để Home
     * luôn nhận categories + dishes.
     */

    refreshTransactionSelectors();


    /*
     * HOME
     */

    renderHome();


    /*
     * STATISTICS
     */

    renderStatistics();


    /*
     * HISTORY
     */

    renderHistory();


    /*
     * RESTAURANT
     */

    renderRestaurant();


    /*
     * COD
     */

    renderCOD();

}


/* =========================================================
   TRANSACTION SELECTORS
========================================================= */

function refreshTransactionSelectors() {

    const categorySelect =
        document.getElementById(
            "transactionCategory"
        );


    const dishSelect =
        document.getElementById(
            "transactionDish"
        );


    /*
     * Không có form thì bỏ qua
     */

    if (
        !categorySelect ||
        !dishSelect
    ) {

        return;

    }


    /*
     * Lưu lựa chọn hiện tại
     */

    const selectedCategory =
        categorySelect.value;


    const selectedDish =
        dishSelect.value;


    /*
     * CATEGORY
     */

    categorySelect.innerHTML = `
        <option value="">
            Chọn danh mục
        </option>
    `;


    AppState.categories.forEach(
        category => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                category.id;


            option.textContent =
                category.name;


            categorySelect.appendChild(
                option
            );

        }
    );


    /*
     * Khôi phục category
     */

    if (
        AppState.categories.some(
            category =>
                String(category.id) ===
                String(selectedCategory)
        )
    ) {

        categorySelect.value =
            selectedCategory;

    }


    /*
     * Dishes theo category
     */

    renderTransactionDishes(
        categorySelect.value,
        selectedDish
    );

}


/* =========================================================
   RENDER TRANSACTION DISHES
========================================================= */

function renderTransactionDishes(
    categoryId,
    selectedDish = ""
) {

    const dishSelect =
        document.getElementById(
            "transactionDish"
        );


    if (!dishSelect) {

        return;

    }


    dishSelect.innerHTML = `
        <option value="">
            Chọn món
        </option>
    `;


    let dishes =
        AppState.dishes;


    /*
     * Nếu đã chọn danh mục
     * thì chỉ hiện món trong danh mục.
     */

    if (categoryId) {

        dishes =
            AppState.dishes.filter(
                dish =>
                    String(
                        dish.category_id
                    ) ===
                    String(
                        categoryId
                    )
            );

    } else {

        /*
         * Chưa chọn category
         * thì không hiện món.
         */

        dishes = [];

    }


    dishes.forEach(
        dish => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                dish.id;


            option.textContent =
                dish.name;


            dishSelect.appendChild(
                option
            );

        }
    );


    /*
     * Khôi phục món
     */

    if (
        dishes.some(
            dish =>
                String(dish.id) ===
                String(selectedDish)
        )
    ) {

        dishSelect.value =
            selectedDish;

    }

}


/* =========================================================
   CATEGORY CHANGE
========================================================= */

document.addEventListener(
    "change",
    event => {

        if (
            event.target.id ===
            "transactionCategory"
        ) {

            renderTransactionDishes(
                event.target.value
            );

        }

    }
);


/* =========================================================
   INITIAL FORM
========================================================= */

function initializeTransactionForm() {

    setTransactionType(
        AppState.transactionType
    );


    setOrderSource(
        AppState.orderSource
    );


    refreshTransactionSelectors();

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


/* =========================================================
   DARK MODE
========================================================= */

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


/* =========================================================
   DATE
========================================================= */

function getLocalDateString(
    date = new Date()
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


function setToday() {

    const today =
        getLocalDateString();


    const input =
        document.getElementById(
            "transactionDate"
        );


    if (input) {

        input.value =
            today;

    }


    const label =
        document.getElementById(
            "todayLabel"
        );


    if (label) {

        label.textContent =
            new Date().toLocaleDateString(
                "vi-VN"
            );

    }


    AppState.statisticsDate =
        new Date();

}


/* =========================================================
   TEXT
========================================================= */

function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.textContent =
            value;

    }

}


function setTextIfExists(
    id,
    value
) {

    setText(
        id,
        value
    );

}


/* =========================================================
   MONEY
========================================================= */

function formatMoney(
    value
) {

    const number =
        Number(value) || 0;


    return (
        number.toLocaleString(
            "vi-VN"
        ) +
        " ₫"
    );

}


/* =========================================================
   DATE FORMAT
========================================================= */

function formatDate(
    date
) {

    if (
        !(date instanceof Date)
    ) {

        date =
            new Date(date);

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


function formatVietnameseDate(
    dateString
) {

    if (!dateString) {

        return "";

    }


    const value =
        String(
            dateString
        );


    /*
     * YYYY-MM-DD
     */

    const parts =
        value.split("-");


    if (
        parts.length === 3
    ) {

        return `${parts[2]}/${parts[1]}/${parts[0]}`;

    }


    /*
     * Fallback
     */

    const date =
        new Date(value);


    if (
        !Number.isNaN(
            date.getTime()
        )
    ) {

        return date.toLocaleDateString(
            "vi-VN"
        );

    }


    return value;

}


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    ).replace(
        /[&<>"']/g,
        char => ({

            "&":
                "&amp;",

            "<":
                "&lt;",

            ">":
                "&gt;",

            '"':
                "&quot;",

            "'":
                "&#039;"

        })[char]
    );

}


/* =========================================================
   NUMBER
========================================================= */

function toNumber(
    value
) {

    const number =
        Number(value);


    if (
        Number.isFinite(
            number
        )
    ) {

        return number;

    }


    return 0;

}


/* =========================================================
   DISH COST
========================================================= */

function getDishCost(
    dish
) {

    if (!dish) {

        return 0;

    }


    const parts =
        Array.isArray(
            dish.cod_parts
        )
            ? dish.cod_parts
            : [];


    return parts.reduce(
        (
            sum,
            part
        ) => {

            return (
                sum +
                toNumber(
                    part?.amount
                )
            );

        },
        0
    );

}


/* =========================================================
   TRANSACTION COST
========================================================= */

function getTransactionDishCost(
    transaction
) {

    if (
        !transaction ||
        !transaction.dish_id
    ) {

        return 0;

    }


    const dish =
        AppState.dishes.find(
            d =>
                String(d.id) ===
                String(
                    transaction.dish_id
                )
        );


    return getDishCost(
        dish
    );

}


/* =========================================================
   HOME
========================================================= */

function renderHome() {

    const transactions =
        Array.isArray(
            AppState.transactions
        )
            ? AppState.transactions
            : [];


    /*
     * DOANH THU
     */

    const income =
        transactions
            .filter(
                t =>
                    t.type === "thu"
            )
            .reduce(
                (
                    sum,
                    t
                ) =>
                    sum +
                    toNumber(
                        t.amount
                    ),
                0
            );


    /*
     * CHI PHÍ
     */

    const expense =
        transactions
            .filter(
                t =>
                    t.type === "chi"
            )
            .reduce(
                (
                    sum,
                    t
                ) =>
                    sum +
                    toNumber(
                        t.amount
                    ),
                0
            );


    /*
     * PHÍ APP
     */

    const appFee =
        transactions
            .filter(
                t =>
                    t.type === "thu"
            )
            .reduce(
                (
                    sum,
                    t
                ) =>
                    sum +
                    toNumber(
                        t.app_fee
                    ),
                0
            );


    /*
     * GIÁ VỐN
     */

    const codCost =
        transactions
            .filter(
                t =>
                    t.type === "thu"
            )
            .reduce(
                (
                    sum,
                    transaction
                ) =>
                    sum +
                    getTransactionDishCost(
                        transaction
                    ),
                0
            );


    /*
     * LỢI NHUẬN
     */

    const profit =
        income -
        expense -
        appFee -
        codCost;


    setText(
        "homeRevenue",
        formatMoney(
            income
        )
    );


    setText(
        "homeExpense",
        formatMoney(
            expense
        )
    );


    setText(
        "homeOrders",
        transactions.filter(
            t =>
                t.type === "thu"
        ).length
    );


    setText(
        "homeProfit",
        formatMoney(
            profit
        )
    );


    /*
     * HÔM NAY
     */

    const today =
        getLocalDateString();


    const todayTransactions =
        transactions.filter(
            transaction =>
                normalizeTransactionDate(
                    transaction.date
                ) ===
                today
        );


    /*
     * Hôm nay - doanh thu
     */

    const todayIncome =
        todayTransactions
            .filter(
                t =>
                    t.type === "thu"
            )
            .reduce(
                (
                    sum,
                    t
                ) =>
                    sum +
                    toNumber(
                        t.amount
                    ),
                0
            );


    /*
     * Hôm nay - chi phí
     */

    const todayExpense =
        todayTransactions
            .filter(
                t =>
                    t.type === "chi"
            )
            .reduce(
                (
                    sum,
                    t
                ) =>
                    sum +
                    toNumber(
                        t.amount
                    ),
                0
            );


    /*
     * Hôm nay - phí app
     */

    const todayFee =
        todayTransactions
            .filter(
                t =>
                    t.type === "thu"
            )
            .reduce(
                (
                    sum,
                    t
                ) =>
                    sum +
                    toNumber(
                        t.app_fee
                    ),
                0
            );


    /*
     * Hôm nay - giá vốn
     */

    const todayCost =
        todayTransactions
            .filter(
                t =>
                    t.type === "thu"
            )
            .reduce(
                (
                    sum,
                    transaction
                ) =>
                    sum +
                    getTransactionDishCost(
                        transaction
                    ),
                0
            );


    setText(
        "todayRevenue",
        formatMoney(
            todayIncome
        )
    );


    setText(
        "todayExpense",
        formatMoney(
            todayExpense
        )
    );


    setText(
        "todayAppFee",
        formatMoney(
            todayFee
        )
    );


    setText(
        "todayCost",
        formatMoney(
            todayCost
        )
    );

}


/* =========================================================
   NORMALIZE DATABASE DATE
========================================================= */

function normalizeTransactionDate(
    value
) {

    if (!value) {

        return "";

    }


    /*
     * Nếu database trả:
     *
     * 2026-08-21
     */

    if (
        /^\d{4}-\d{2}-\d{2}$/.test(
            String(value)
        )
    ) {

        return String(value);

    }


    /*
     * Nếu database trả timestamp:
     *
     * 2026-08-21T00:00:00...
     */

    const text =
        String(value);


    if (
        text.length >= 10
    ) {

        const first10 =
            text.substring(
                0,
                10
            );


        if (
            /^\d{4}-\d{2}-\d{2}$/.test(
                first10
            )
        ) {

            return first10;

        }

    }


    /*
     * Fallback Date
     */

    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "";

    }


    return getLocalDateString(
        date
    );

}


/* =========================================================
   PAGE TITLE
========================================================= */

function updatePageTitle(
    page
) {

    const title =
        document.getElementById(
            "pageTitle"
        );


    if (!title) {

        return;

    }


    const titles = {

        home:
            "Bếp Nhà Duyên",

        statistics:
            "Thống kê",

        history:
            "Lịch sử",

        restaurant:
            "Thực đơn",

        cod:
            "COD món ăn"

    };


    title.textContent =
        titles[page] ||
        "Bếp Nhà Duyên";

}
