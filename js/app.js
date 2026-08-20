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

        setToday();

        loadTheme();

        await loadInitialData();

        /*
         * Đảm bảo trạng thái giao diện ban đầu
         */

        setTransactionType(
            AppState.transactionType
        );

        setOrderSource(
            AppState.orderSource
        );

        navigateTo("home");

    }
);


/* =========================================================
   INITIAL DATA
========================================================= */

async function loadInitialData() {

    try {

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


        /*
         * Render từng module.
         * Các hàm thật nằm trong:
         * home.js
         * statistics.js
         * history.js
         * restaurant.js
         * cod.js
         */

        renderAll();


    } catch (error) {

        console.error(
            "Lỗi loadInitialData:",
            error
        );

    }

}


/* =========================================================
   NAVIGATION
========================================================= */

function navigateTo(page) {

    AppState.currentPage = page;


    /*
     * Ẩn tất cả page
     */

    document
        .querySelectorAll(".page")
        .forEach(element => {

            element.classList.remove(
                "active-page"
            );

        });


    /*
     * Hiện page được chọn
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
     * Active bottom navigation
     */

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


    /*
     * Không dùng smooth khi đổi page.
     * Tránh cảm giác giật trên mobile.
     */

    window.scrollTo(
        0,
        0
    );


    /*
     * Render module tương ứng
     */

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


/* =========================================================
   RENDER ALL
========================================================= */

function renderAll() {

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

/*
 * Quan trọng:
 *
 * KHÔNG dùng:
 *
 * new Date().toISOString().split("T")[0]
 *
 * vì ISO dùng UTC và có thể làm ngày ở Việt Nam
 * bị lùi 1 ngày.
 */

function getLocalDateString(date = new Date()) {

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


    /*
     * Statistics mặc định là hôm nay
     */

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


function formatDate(
    date
) {

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


    /*
     * Nếu database lưu YYYY-MM-DD
     */

    const parts =
        String(
            dateString
        ).split("-");


    if (parts.length === 3) {

        return `${parts[2]}/${parts[1]}/${parts[0]}`;

    }


    /*
     * Fallback nếu truyền Date
     */

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
   SAFE NUMBER
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
   GET TRANSACTION DISH COST
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
     * Tổng doanh thu
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
     * Tổng chi phí
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
     * Phí app
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
     * Giá vốn COD
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
     * Lợi nhuận thực
     */

    const profit =
        income -
        expense -
        appFee -
        codCost;


    /*
     * Tổng
     */

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
     *
     * Dùng local date.
     * Không dùng toISOString().
     */

    const today =
        getLocalDateString();


    const todayTransactions =
        transactions.filter(
            t =>
                t.date === today
        );


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
   TRANSACTION CATEGORY / DISH SELECT
========================================================= */

/*
 * Tự đổ danh mục và món vào form Home.
 * Không ảnh hưởng nếu HTML không có các select này.
 */

function renderTransactionSelectors() {

    const categorySelect =
        document.getElementById(
            "transactionCategory"
        );


    const dishSelect =
        document.getElementById(
            "transactionDish"
        );


    /*
     * CATEGORY
     */

    if (categorySelect) {

        const currentValue =
            categorySelect.value;


        categorySelect.innerHTML = `
            <option value="">
                Chọn danh mục
            </option>
        `;


        AppState.categories.forEach(
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


        /*
         * Giữ lựa chọn cũ nếu còn tồn tại
         */

        if (
            AppState.categories.some(
                category =>
                    String(
                        category.id
                    ) ===
                    String(
                        currentValue
                    )
            )
        ) {

            categorySelect.value =
                currentValue;

        }

    }


    /*
     * DISH
     */

    if (dishSelect) {

        const categoryId =
            categorySelect?.value || "";


        const currentValue =
            dishSelect.value;


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
                    String(
                        dish.id
                    ) ===
                    String(
                        currentValue
                    )
            )
        ) {

            dishSelect.value =
                currentValue;

        }

    }

}


/* =========================================================
   CATEGORY -> DISH
========================================================= */

document.addEventListener(
    "change",
    event => {

        if (
            event.target.id ===
            "transactionCategory"
        ) {

            const dishSelect =
                document.getElementById(
                    "transactionDish"
                );


            if (!dishSelect) return;


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

    }
);


/* =========================================================
   REFRESH SELECTORS AFTER DATA LOAD
========================================================= */

const originalLoadInitialData =
    loadInitialData;


/*
 * Không override loadInitialData.
 * renderAll() sẽ gọi renderHome().
 *
 * Các selector sẽ được refresh tại đây khi cần.
 */

function refreshHomeSelectors() {

    const categorySelect =
        document.getElementById(
            "transactionCategory"
        );


    if (!categorySelect) return;


    const selectedCategory =
        categorySelect.value;


    categorySelect.innerHTML = `
        <option value="">
            Chọn danh mục
        </option>
    `;


    AppState.categories.forEach(
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


    /*
     * Nếu đang chọn danh mục,
     * cập nhật món.
     */

    const dishSelect =
        document.getElementById(
            "transactionDish"
        );


    if (!dishSelect) return;


    const selectedDish =
        dishSelect.value;


    const dishes =
        selectedCategory
            ? AppState.dishes.filter(
                dish =>
                    String(
                        dish.category_id
                    ) ===
                    String(
                        selectedCategory
                    )
            )
            : [];


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


    dishSelect.value =
        selectedDish || "";

}


/* =========================================================
   OVERRIDE renderAll SAFELY
========================================================= */

function refreshAllUI() {

    refreshHomeSelectors();

    renderHome();

    renderStatistics();

    renderHistory();

    renderRestaurant();

    renderCOD();

}


/*
 * Khi các module gọi renderAll(),
 * dùng hàm này.
 */

window.renderAll =
    refreshAllUI;


/* =========================================================
   INITIAL FORM STATE
========================================================= */

function initializeFormState() {

    setTransactionType(
        AppState.transactionType
    );


    setOrderSource(
        AppState.orderSource
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
   PATCH NAVIGATION TITLE
========================================================= */

const _navigateTo =
    navigateTo;


window.navigateTo =
    function(page) {

        updatePageTitle(
            page
        );

        _navigateTo(
            page
        );

    };


/* =========================================================
   PATCH INIT
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /*
         * Đợi DOM + các file JS module
         */

        setTimeout(
            () => {

                refreshHomeSelectors();

                initializeFormState();

            },
            0
        );

    }
);
