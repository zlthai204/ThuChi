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

        console.log("APP START");

        setToday();

        loadTheme();

        await loadInitialData();

        setTransactionType(
            AppState.transactionType
        );

        setOrderSource(
            AppState.orderSource
        );

        refreshHomeSelectors();

        renderAll();

        navigateTo("home");

    }
);


/* =========================================================
   LOAD INITIAL DATA
========================================================= */

async function loadInitialData() {

    console.log(
        "Đang tải dữ liệu database..."
    );


    /*
     * =========================
     * CATEGORIES
     * =========================
     *
     * Không order created_at.
     * Vì bảng mới có thể không có cột này.
     */

    try {

        AppState.categories =
            await dbGet(
                "categories"
            );

        console.log(
            "CATEGORIES:",
            AppState.categories
        );

    } catch (error) {

        console.error(
            "LỖI CATEGORIES:",
            error
        );

        AppState.categories = [];

    }


    /*
     * =========================
     * DISHES
     * =========================
     */

    try {

        AppState.dishes =
            await dbGet(
                "dishes"
            );

        console.log(
            "DISHES:",
            AppState.dishes
        );

    } catch (error) {

        console.error(
            "LỖI DISHES:",
            error
        );

        AppState.dishes = [];

    }


    /*
     * =========================
     * TRANSACTIONS
     * =========================
     *
     * Quan trọng nhất.
     *
     * Không order created_at.
     * Chỉ lấy toàn bộ dữ liệu.
     */

    try {

        AppState.transactions =
            await dbGet(
                "transactions"
            );

        console.log(
            "TRANSACTIONS:",
            AppState.transactions
        );

    } catch (error) {

        console.error(
            "LỖI TRANSACTIONS:",
            error
        );

        AppState.transactions = [];

    }


    console.log(
        "DATABASE LOADED:",
        {
            categories:
                AppState.categories.length,

            dishes:
                AppState.dishes.length,

            transactions:
                AppState.transactions.length
        }
    );

}


/* =========================================================
   NAVIGATION
========================================================= */

function navigateTo(page) {

    AppState.currentPage =
        page;


    document
        .querySelectorAll(".page")
        .forEach(
            element => {

                element.classList.remove(
                    "active-page"
                );

            }
        );


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
        .forEach(
            button => {

                button.classList.remove(
                    "active"
                );

            }
        );


    const navMap = {

        home:
            "navHome",

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


    window.scrollTo(
        0,
        0
    );


    switch (page) {

        case "home":

            refreshHomeSelectors();

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


/* =========================================================
   RENDER ALL
========================================================= */

function renderAll() {

    refreshHomeSelectors();

    renderHome();

    renderStatistics();

    renderHistory();

    renderRestaurant();

    renderCOD();

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


    if (!toast) return;


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


    if (dark === "true") {

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
            new Date()
                .toLocaleDateString(
                    "vi-VN"
                );

    }


    AppState.statisticsDate =
        new Date();

}


/* =========================================================
   HELPERS
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


function formatMoney(value) {

    const number =
        Number(value) || 0;


    return (
        number.toLocaleString(
            "vi-VN"
        ) +
        " ₫"
    );

}


function formatDate(date) {

    if (!(date instanceof Date)) {

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


    const parts =
        String(
            dateString
        ).split("-");


    if (parts.length === 3) {

        return `${parts[2]}/${parts[1]}/${parts[0]}`;

    }


    const date =
        new Date(
            dateString
        );


    if (
        !Number.isNaN(
            date.getTime()
        )
    ) {

        return date.toLocaleDateString(
            "vi-VN"
        );

    }


    return String(
        dateString
    );

}


/* =========================================================
   HTML SAFETY
========================================================= */

function escapeHTML(value) {

    return String(
        value ?? ""
    ).replace(
        /[&<>"']/g,
        char => ({

            "&": "&amp;",

            "<": "&lt;",

            ">": "&gt;",

            '"': "&quot;",

            "'": "&#039;"

        })[char]
    );

}


/* =========================================================
   NUMBER
========================================================= */

function toNumber(value) {

    const number =
        Number(value);


    return Number.isFinite(
        number
    )
        ? number
        : 0;

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
   TRANSACTION DISH COST
========================================================= */

function getTransactionDishCost(
    transaction
) {

    if (!transaction) {

        return 0;

    }


    if (!transaction.dish_id) {

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


    if (!dish) {

        return 0;

    }


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
     * TỔNG DOANH THU
     */

    const income =
        transactions
            .filter(
                t =>
                    String(t.type)
                        .toLowerCase()
                        .trim() ===
                    "thu"
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
     * TỔNG CHI
     */

    const expense =
        transactions
            .filter(
                t =>
                    String(t.type)
                        .toLowerCase()
                        .trim() ===
                    "chi"
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
                    String(t.type)
                        .toLowerCase()
                        .trim() ===
                    "thu"
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
                    String(t.type)
                        .toLowerCase()
                        .trim() ===
                    "thu"
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
                String(t.type)
                    .toLowerCase()
                    .trim() ===
                "thu"
        ).length
    );


    setText(
        "homeProfit",
        formatMoney(
            profit
        )
    );


    /*
     * =========================
     * HÔM NAY
     * =========================
     */

    const today =
        getLocalDateString();


    const todayTransactions =
        transactions.filter(
            t => {

                if (!t.date) {

                    return false;

                }


                /*
                 * Database có thể trả:
                 *
                 * 2026-08-21
                 *
                 * hoặc timestamp.
                 */

                const transactionDate =
                    String(
                        t.date
                    ).substring(
                        0,
                        10
                    );


                return (
                    transactionDate ===
                    today
                );

            }
        );


    console.log(
        "TODAY:",
        today,
        todayTransactions
    );


    const todayIncome =
        todayTransactions
            .filter(
                t =>
                    String(t.type)
                        .toLowerCase()
                        .trim() ===
                    "thu"
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


    const todayExpense =
        todayTransactions
            .filter(
                t =>
                    String(t.type)
                        .toLowerCase()
                        .trim() ===
                    "chi"
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


    const todayFee =
        todayTransactions
            .filter(
                t =>
                    String(t.type)
                        .toLowerCase()
                        .trim() ===
                    "thu"
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


    const todayCost =
        todayTransactions
            .filter(
                t =>
                    String(t.type)
                        .toLowerCase()
                        .trim() ===
                    "thu"
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
   HOME SELECTORS
========================================================= */

function refreshHomeSelectors() {

    const categorySelect =
        document.getElementById(
            "transactionCategory"
        );


    const dishSelect =
        document.getElementById(
            "transactionDish"
        );


    if (!categorySelect) {

        return;

    }


    const selectedCategory =
        categorySelect.value;


    categorySelect.innerHTML = `
        <option value="">
            Chọn danh mục
        </option>
    `;


    AppState.categories
        .forEach(
            category => {

                categorySelect.innerHTML += `
                    <option value="${escapeHTML(
                        category.id
                    )}">
                        ${escapeHTML(
                            category.name
                        )}
                    </option>
                `;

            }
        );


    categorySelect.value =
        selectedCategory || "";


    if (!dishSelect) {

        return;

    }


    const selectedDish =
        dishSelect.value;


    const categoryId =
        categorySelect.value;


    const dishes =
        categoryId
            ? AppState.dishes.filter(
                dish =>
                    String(
                        dish.category_id
                    ) ===
                    String(
                        categoryId
                    )
            )
            : AppState.dishes;


    dishSelect.innerHTML = `
        <option value="">
            Chọn món
        </option>
    `;


    dishes.forEach(
        dish => {

            dishSelect.innerHTML += `
                <option value="${escapeHTML(
                    dish.id
                )}">
                    ${escapeHTML(
                        dish.name
                    )}
                </option>
            `;

        }
    );


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
   CATEGORY -> DISH
========================================================= */

document.addEventListener(
    "change",
    event => {

        if (
            event.target.id !==
            "transactionCategory"
        ) {

            return;

        }


        const dishSelect =
            document.getElementById(
                "transactionDish"
            );


        if (!dishSelect) {

            return;

        }


        const categoryId =
            event.target.value;


        const dishes =
            AppState.dishes.filter(
                dish =>
                    String(
                        dish.category_id
                    ) ===
                    String(
                        categoryId
                    )
            );


        dishSelect.innerHTML = `
            <option value="">
                Chọn món
            </option>
        `;


        dishes.forEach(
            dish => {

                dishSelect.innerHTML += `
                    <option value="${escapeHTML(
                        dish.id
                    )}">
                        ${escapeHTML(
                            dish.name
                        )}
                    </option>
                `;

            }
        );

    }
);


/* =========================================================
   UPDATE PAGE TITLE
========================================================= */

function updatePageTitle(
    page
) {

    const title =
        document.getElementById(
            "pageTitle"
        );


    if (!title) return;


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


/* =========================================================
   PATCH NAVIGATION
========================================================= */

const originalNavigateTo =
    navigateTo;


window.navigateTo =
    function(page) {

        updatePageTitle(
            page
        );

        originalNavigateTo(
            page
        );

    };
