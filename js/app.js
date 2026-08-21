/* =========================================================
   BẾP NHÀ DUYÊN
   APP CORE
   Dùng chung cho 5 HTML:
   - index.html
   - statistics.html
   - history.html
   - restaurant.html
   - cod.html
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


/*
 * Cho các file JS khác truy cập.
 */

window.AppState = AppState;


/* =========================================================
   PAGE CONFIG
========================================================= */

const PAGE_CONFIG = {

    home: {
        file: "index.html",
        title: "Bếp Nhà Duyên"
    },

    statistics: {
        file: "statistics.html",
        title: "Thống kê"
    },

    history: {
        file: "history.html",
        title: "Lịch sử"
    },

    restaurant: {
        file: "restaurant.html",
        title: "Thực đơn"
    },

    cod: {
        file: "cod.html",
        title: "COD món ăn"
    }

};


window.PAGE_CONFIG = PAGE_CONFIG;


/* =========================================================
   INIT
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        console.log(
            "================================"
        );

        console.log(
            "BẾP NHÀ DUYÊN - APP START"
        );

        console.log(
            "================================"
        );


        /*
         * Xác định page hiện tại
         */

        detectCurrentPage();


        /*
         * Ngày hôm nay
         */

        setToday();


        /*
         * Theme
         */

        loadTheme();


        /*
         * Load database
         */

        await loadInitialData();


        /*
         * Thiết lập loại giao dịch
         */

        if (
            typeof window.setTransactionType ===
            "function"
        ) {

            window.setTransactionType(
                AppState.transactionType
            );

        }


        /*
         * Thiết lập nguồn đơn
         */

        if (
            typeof window.setOrderSource ===
            "function"
        ) {

            window.setOrderSource(
                AppState.orderSource
            );

        }


        /*
         * Refresh selector nếu đang ở trang Home
         */

        refreshHomeSelectors();


        /*
         * Render page hiện tại
         */

        renderCurrentPage();


        /*
         * Cập nhật navigation
         */

        updateNavigation();


        console.log(
            "APP READY"
        );

    }
);


/* =========================================================
   DETECT CURRENT PAGE
========================================================= */

function detectCurrentPage() {

    const path =
        window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();


    /*
     * index.html
     */

    if (
        path === "" ||
        path === "index.html"
    ) {

        AppState.currentPage =
            "home";

        return;

    }


    if (
        path ===
        "statistics.html"
    ) {

        AppState.currentPage =
            "statistics";

        return;

    }


    if (
        path ===
        "history.html"
    ) {

        AppState.currentPage =
            "history";

        return;

    }


    if (
        path ===
        "restaurant.html"
    ) {

        AppState.currentPage =
            "restaurant";

        return;

    }


    if (
        path ===
        "cod.html"
    ) {

        AppState.currentPage =
            "cod";

        return;

    }


    /*
     * Fallback
     */

    AppState.currentPage =
        "home";

}


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
     */

    try {

        AppState.categories =
            await dbGet(
                "categories"
            );


        if (
            !Array.isArray(
                AppState.categories
            )
        ) {

            AppState.categories = [];

        }


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


        if (
            !Array.isArray(
                AppState.dishes
            )
        ) {

            AppState.dishes = [];

        }


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
     */

    try {

        AppState.transactions =
            await dbGet(
                "transactions"
            );


        if (
            !Array.isArray(
                AppState.transactions
            )
        ) {

            AppState.transactions = [];

        }


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


    /*
     * =========================
     * COD PARTS
     * =========================
     *
     * Nếu hệ thống hiện tại không có bảng
     * cod_parts thì bỏ qua.
     */

    try {

        const codData =
            await dbGet(
                "cod_parts"
            );


        if (
            Array.isArray(
                codData
            )
        ) {

            AppState.codParts =
                codData;

        }

    } catch (error) {

        /*
         * Không coi đây là lỗi nghiêm trọng.
         */

        console.warn(
            "Không tải được cod_parts:",
            error
        );

        AppState.codParts = [];

    }


    console.log(
        "DATABASE LOADED:",
        {

            categories:
                AppState.categories.length,

            dishes:
                AppState.dishes.length,

            transactions:
                AppState.transactions.length,

            codParts:
                AppState.codParts.length

        }
    );

}


/* =========================================================
   RENDER CURRENT PAGE
========================================================= */

function renderCurrentPage() {

    const page =
        AppState.currentPage;


    console.log(
        "RENDER PAGE:",
        page
    );


    switch (page) {


        /* =====================
           HOME
        ===================== */

        case "home":

            refreshHomeSelectors();


            if (
                typeof window.renderHome ===
                "function"
            ) {

                window.renderHome();

            }

            break;


        /* =====================
           STATISTICS
        ===================== */

        case "statistics":

            if (
                typeof window.renderStatistics ===
                "function"
            ) {

                window.renderStatistics();

            }


            setTimeout(
                function () {

                    if (
                        typeof window.updateStatisticsPie ===
                        "function"
                    ) {

                        window.updateStatisticsPie();

                    }

                },
                100
            );

            break;


        /* =====================
           HISTORY
        ===================== */

        case "history":

            if (
                typeof window.renderHistory ===
                "function"
            ) {

                window.renderHistory();

            }

            break;


        /* =====================
           RESTAURANT
        ===================== */

        case "restaurant":

            if (
                typeof window.renderRestaurant ===
                "function"
            ) {

                window.renderRestaurant();

            }

            break;


        /* =====================
           COD
        ===================== */

        case "cod":

            if (
                typeof window.renderCOD ===
                "function"
            ) {

                window.renderCOD();

            }

            break;

    }

}


/* =========================================================
   NAVIGATION
========================================================= */

function navigateTo(page) {

    if (
        !PAGE_CONFIG[page]
    ) {

        console.warn(
            "Page không tồn tại:",
            page
        );

        return;

    }


    /*
     * Nếu đang ở page hiện tại
     * thì chỉ render lại.
     */

    if (
        AppState.currentPage ===
        page
    ) {

        renderCurrentPage();

        updateNavigation();

        return;

    }


    /*
     * Lưu state trước khi chuyển trang.
     */

    saveAppState();


    /*
     * Với hệ thống 5 HTML riêng,
     * chuyển trang bằng location.
     */

    const target =
        PAGE_CONFIG[page].file;


    window.location.href =
        target;

}


/*
 * Cho HTML gọi được.
 */

window.navigateTo =
    navigateTo;


/* =========================================================
   SAVE APP STATE
========================================================= */

function saveAppState() {

    try {

        const state = {

            transactionType:
                AppState.transactionType,

            orderSource:
                AppState.orderSource,

            statisticsPeriod:
                AppState.statisticsPeriod,

            statisticsDate:
                AppState.statisticsDate
                    instanceof Date
                    ? AppState.statisticsDate
                        .toISOString()
                    : AppState.statisticsDate

        };


        sessionStorage.setItem(
            "bep_nha_duyen_state",
            JSON.stringify(
                state
            )
        );

    } catch (error) {

        console.warn(
            "Không lưu được AppState:",
            error
        );

    }

}


/* =========================================================
   LOAD APP STATE
========================================================= */

function loadAppState() {

    try {

        const raw =
            sessionStorage.getItem(
                "bep_nha_duyen_state"
            );


        if (!raw) {

            return;

        }


        const state =
            JSON.parse(
                raw
            );


        if (
            state.transactionType
        ) {

            AppState.transactionType =
                state.transactionType;

        }


        if (
            state.orderSource
        ) {

            AppState.orderSource =
                state.orderSource;

        }


        if (
            state.statisticsPeriod
        ) {

            AppState.statisticsPeriod =
                state.statisticsPeriod;

        }


        if (
            state.statisticsDate
        ) {

            const date =
                new Date(
                    state.statisticsDate
                );


            if (
                !Number.isNaN(
                    date.getTime()
                )
            ) {

                AppState.statisticsDate =
                    date;

            }

        }

    } catch (error) {

        console.warn(
            "Không load được AppState:",
            error
        );

    }

}


/* =========================================================
   NAVIGATION UI
========================================================= */

function updateNavigation() {

    const page =
        AppState.currentPage;


    /*
     * Xóa active
     */

    document
        .querySelectorAll(
            ".nav-button"
        )
        .forEach(
            button => {

                button.classList.remove(
                    "active"
                );

            }
        );


    /*
     * Mapping
     */

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


    const navId =
        navMap[page];


    if (!navId) {

        return;

    }


    const navButton =
        document.getElementById(
            navId
        );


    if (navButton) {

        navButton.classList.add(
            "active"
        );

    }


    /*
     * Page title
     */

    updatePageTitle(
        page
    );

}


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


    if (!title) {

        return;

    }


    const config =
        PAGE_CONFIG[page];


    title.textContent =
        config
            ? config.title
            : "Bếp Nhà Duyên";

}


/* =========================================================
   RENDER ALL
========================================================= */

function renderAll() {

    refreshHomeSelectors();


    if (
        typeof window.renderHome ===
        "function"
    ) {

        window.renderHome();

    }


    if (
        typeof window.renderStatistics ===
        "function"
    ) {

        window.renderStatistics();

    }


    if (
        typeof window.renderHistory ===
        "function"
    ) {

        window.renderHistory();

    }


    if (
        typeof window.renderRestaurant ===
        "function"
    ) {

        window.renderRestaurant();

    }


    if (
        typeof window.renderCOD ===
        "function"
    ) {

        window.renderCOD();

    }


    if (
        typeof window.updateStatisticsPie ===
        "function"
    ) {

        window.updateStatisticsPie();

    }

}


window.renderAll =
    renderAll;


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


    /*
     * Nếu page hiện tại không có toast
     * thì tạo tự động.
     */

    if (!toast) {

        const newToast =
            document.createElement(
                "div"
            );


        newToast.id =
            "toast";


        newToast.className =
            "toast";


        document.body.appendChild(
            newToast
        );


        newToast.textContent =
            message;


        newToast.classList.add(
            "show"
        );


        clearTimeout(
            toastTimer
        );


        toastTimer =
            setTimeout(
                function () {

                    newToast.classList.remove(
                        "show"
                    );

                },
                2200
            );


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
            function () {

                toast.classList.remove(
                    "show"
                );

            },
            2200
        );

}


window.showToast =
    showToast;


/* =========================================================
   DARK MODE
========================================================= */

function toggleDarkMode() {

    document.body.classList.toggle(
        "dark"
    );


    const dark =
        document.body.classList.contains(
            "dark"
        );


    localStorage.setItem(
        "bep_nha_duyen_dark",
        dark
            ? "true"
            : "false"
    );

}


window.toggleDarkMode =
    toggleDarkMode;


/* =========================================================
   LOAD THEME
========================================================= */

function loadTheme() {

    const dark =
        localStorage.getItem(
            "bep_nha_duyen_dark"
        );


    if (
        dark ===
        "true"
    ) {

        document.body.classList.add(
            "dark"
        );

    } else {

        document.body.classList.remove(
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


window.getLocalDateString =
    getLocalDateString;


/* =========================================================
   SET TODAY
========================================================= */

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


    /*
     * Nếu chưa có ngày thống kê
     */

    if (
        !AppState.statisticsDate ||
        !(AppState.statisticsDate instanceof Date)
    ) {

        AppState.statisticsDate =
            new Date();

    }

}


window.setToday =
    setToday;


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


window.setText =
    setText;


/* =========================================================
   SET TEXT IF EXISTS
========================================================= */

function setTextIfExists(
    id,
    value
) {

    setText(
        id,
        value
    );

}


window.setTextIfExists =
    setTextIfExists;


/* =========================================================
   FORMAT MONEY
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


window.formatMoney =
    formatMoney;


/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(
    date
) {

    if (
        !(date instanceof Date)
    ) {

        date =
            new Date(
                date
            );

    }


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "";

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


window.formatDate =
    formatDate;


/* =========================================================
   FORMAT VIETNAMESE DATE
========================================================= */

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


    if (
        parts.length ===
        3
    ) {

        return (
            `${parts[2]}/` +
            `${parts[1]}/` +
            `${parts[0]}`
        );

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


window.formatVietnameseDate =
    formatVietnameseDate;


/* =========================================================
   HTML SAFETY
========================================================= */

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    ).replace(
        /[&<>"']/g,
        function (char) {

            return {

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

            }[char];

        }
    );

}


window.escapeHTML =
    escapeHTML;


/* =========================================================
   NUMBER
========================================================= */

function toNumber(
    value
) {

    const number =
        Number(value);


    return Number.isFinite(
        number
    )
        ? number
        : 0;

}


window.toNumber =
    toNumber;


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
        function (
            sum,
            part
        ) {

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


window.getDishCost =
    getDishCost;


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
            function (d) {

                return (
                    String(d.id) ===
                    String(
                        transaction.dish_id
                    )
                );

            }
        );


    if (!dish) {

        return 0;

    }


    return getDishCost(
        dish
    );

}


window.getTransactionDishCost =
    getTransactionDishCost;


/* =========================================================
   HOME
========================================================= */

function renderHome() {

    /*
     * Nếu không phải trang Home,
     * không cần render.
     */

    if (
        AppState.currentPage !==
        "home"
    ) {

        /*
         * Nhưng vẫn cho phép gọi thủ công.
         */

    }


    const transactions =
        Array.isArray(
            AppState.transactions
        )
            ? AppState.transactions
            : [];


    /*
     * =========================
     * DOANH THU
     * =========================
     */

    const income =
        transactions
            .filter(
                function (t) {

                    return (
                        String(t.type)
                            .toLowerCase()
                            .trim() ===
                        "thu"
                    );

                }
            )
            .reduce(
                function (
                    sum,
                    t
                ) {

                    return (
                        sum +
                        toNumber(
                            t.amount
                        )
                    );

                },
                0
            );


    /*
     * =========================
     * CHI
     * =========================
     */

    const expense =
        transactions
            .filter(
                function (t) {

                    return (
                        String(t.type)
                            .toLowerCase()
                            .trim() ===
                        "chi"
                    );

                }
            )
            .reduce(
                function (
                    sum,
                    t
                ) {

                    return (
                        sum +
                        toNumber(
                            t.amount
                        )
                    );

                },
                0
            );


    /*
     * =========================
     * PHÍ APP
     * =========================
     */

    const appFee =
        transactions
            .filter(
                function (t) {

                    return (
                        String(t.type)
                            .toLowerCase()
                            .trim() ===
                        "thu"
                    );

                }
            )
            .reduce(
                function (
                    sum,
                    t
                ) {

                    return (
                        sum +
                        toNumber(
                            t.app_fee
                        )
                    );

                },
                0
            );


    /*
     * =========================
     * GIÁ VỐN
     * =========================
     */

    const codCost =
        transactions
            .filter(
                function (t) {

                    return (
                        String(t.type)
                            .toLowerCase()
                            .trim() ===
                        "thu"
                    );

                }
            )
            .reduce(
                function (
                    sum,
                    transaction
                ) {

                    return (
                        sum +
                        getTransactionDishCost(
                            transaction
                        )
                    );

                },
                0
            );


    /*
     * =========================
     * LỢI NHUẬN
     * =========================
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
            function (t) {

                return (
                    String(t.type)
                        .toLowerCase()
                        .trim() ===
                    "thu"
                );

            }
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
            function (t) {

                if (!t.date) {

                    return false;

                }


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


    const todayIncome =
        todayTransactions
            .filter(
                function (t) {

                    return (
                        String(t.type)
                            .toLowerCase()
                            .trim() ===
                        "thu"
                    );

                }
            )
            .reduce(
                function (
                    sum,
                    t
                ) {

                    return (
                        sum +
                        toNumber(
                            t.amount
                        )
                    );

                },
                0
            );


    const todayExpense =
        todayTransactions
            .filter(
                function (t) {

                    return (
                        String(t.type)
                            .toLowerCase()
                            .trim() ===
                        "chi"
                    );

                }
            )
            .reduce(
                function (
                    sum,
                    t
                ) {

                    return (
                        sum +
                        toNumber(
                            t.amount
                        )
                    );

                },
                0
            );


    const todayFee =
        todayTransactions
            .filter(
                function (t) {

                    return (
                        String(t.type)
                            .toLowerCase()
                            .trim() ===
                        "thu"
                    );

                }
            )
            .reduce(
                function (
                    sum,
                    t
                ) {

                    return (
                        sum +
                        toNumber(
                            t.app_fee
                        )
                    );

                },
                0
            );


    const todayCost =
        todayTransactions
            .filter(
                function (t) {

                    return (
                        String(t.type)
                            .toLowerCase()
                            .trim() ===
                        "thu"
                    );

                }
            )
            .reduce(
                function (
                    sum,
                    transaction
                ) {

                    return (
                        sum +
                        getTransactionDishCost(
                            transaction
                        )
                    );

                },
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


window.renderHome =
    renderHome;


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


    /*
     * Trang không có form Home
     */

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
            function (category) {

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
                function (dish) {

                    return (
                        String(
                            dish.category_id
                        ) ===
                        String(
                            categoryId
                        )
                    );

                }
            )
            : AppState.dishes;


    dishSelect.innerHTML = `
        <option value="">
            Chọn món
        </option>
    `;


    dishes.forEach(
        function (dish) {

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
            function (dish) {

                return (
                    String(dish.id) ===
                    String(
                        selectedDish
                    )
                );

            }
        )
    ) {

        dishSelect.value =
            selectedDish;

    }

}


window.refreshHomeSelectors =
    refreshHomeSelectors;


/* =========================================================
   CATEGORY -> DISH
========================================================= */

document.addEventListener(
    "change",
    function (event) {

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
            categoryId
                ? AppState.dishes.filter(
                    function (dish) {

                        return (
                            String(
                                dish.category_id
                            ) ===
                            String(
                                categoryId
                            )
                        );

                    }
                )
                : AppState.dishes;


        dishSelect.innerHTML = `
            <option value="">
                Chọn món
            </option>
        `;


        dishes.forEach(
            function (dish) {

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

function updateCurrentPageTitle() {

    updatePageTitle(
        AppState.currentPage
    );

}


window.updateCurrentPageTitle =
    updateCurrentPageTitle;


/* =========================================================
   GET CURRENT PAGE
========================================================= */

function getCurrentPage() {

    return AppState.currentPage;

}


window.getCurrentPage =
    getCurrentPage;


/* =========================================================
   PAGE CHECK
========================================================= */

function isPage(
    page
) {

    return (
        AppState.currentPage ===
        page
    );

}


window.isPage =
    isPage;


/* =========================================================
   REFRESH DATABASE
========================================================= */

async function refreshDatabase() {

    console.log(
        "Refreshing database..."
    );


    await loadInitialData();


    refreshHomeSelectors();


    renderCurrentPage();


    /*
     * Pie chart
     */

    if (
        typeof window.updateStatisticsPie ===
        "function"
    ) {

        window.updateStatisticsPie();

    }

}


window.refreshDatabase =
    refreshDatabase;


/* =========================================================
   AUTO REFRESH
========================================================= */

window.addEventListener(
    "focus",
    async function () {

        /*
         * Khi quay lại tab,
         * kiểm tra lại database.
         */

        try {

            await refreshDatabase();

        } catch (error) {

            console.warn(
                "Auto refresh lỗi:",
                error
            );

        }

    }
);


/* =========================================================
   STORAGE EVENT
========================================================= */

window.addEventListener(
    "storage",
    function (event) {

        if (
            event.key ===
            "bep_nha_duyen_dark"
        ) {

            loadTheme();

        }

    }
);


/* =========================================================
   INITIAL STATE
========================================================= */

loadAppState();


/* =========================================================
   PAGE TITLE
========================================================= */

updateCurrentPageTitle();


/* =========================================================
   EXPORT
========================================================= */

window.BepNhaDuyenApp = {

    state:
        AppState,

    navigateTo:

        navigateTo,

    renderAll:

        renderAll,

    renderCurrentPage:

        renderCurrentPage,

    refreshDatabase:

        refreshDatabase,

    formatMoney:

        formatMoney,

    formatDate:

        formatDate,

    escapeHTML:

        escapeHTML,

    getDishCost:

        getDishCost,

    getTransactionDishCost:

        getTransactionDishCost

};
