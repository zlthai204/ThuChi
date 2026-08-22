/* =========================================================
   STATISTICS.JS
   PREMIUM STATISTICS
   FULL REBUILD

   FEATURES
   ---------------------------------------------------------
   ✓ Thu + Chi cùng lúc
   ✓ Ngày / Tuần / Tháng
   ✓ Điều hướng ngày chính xác
   ✓ Điều hướng tuần chính xác
   ✓ Điều hướng tháng chính xác
   ✓ Không lỗi ngày 29/30/31 khi chuyển tháng
   ✓ Biểu đồ Thu / Chi
   ✓ Tổng Thu / Chi
   ✓ Lợi nhuận thực
   ✓ Phí ShopeeFood
   ✓ Phí GrabFood
   ✓ COD / giá vốn
   ✓ Thống kê món
   ✓ Thống kê nguồn
   ✓ Phân tích nhóm chi
   ✓ Bánh xe tổng Thu / Chi
   ✓ Bánh xe từng món
   ✓ Bánh xe từng nhóm chi
   ✓ Dark mode
   ✓ Tương thích HTML cũ
========================================================= */


/* =========================================================
   STATE
========================================================= */

if (
    typeof AppState === "undefined"
) {

    window.AppState = {};

}


if (
    !AppState.statisticsPeriod
) {

    AppState.statisticsPeriod = "day";

}


if (
    !(AppState.statisticsDate instanceof Date) ||
    isNaN(
        AppState.statisticsDate.getTime()
    )
) {

    AppState.statisticsDate =
        new Date();

}


if (
    !AppState.statisticsMode
) {

    AppState.statisticsMode = "thu";

}


/* =========================================================
   DATE UTILITIES
========================================================= */

/*
 * Tạo Date local an toàn.
 *
 * Không dùng:
 *
 * new Date("2026-08-22")
 *
 * vì JavaScript có thể hiểu thành UTC.
 */

function statisticsCreateLocalDate(
    year,
    month,
    day
) {

    const date =
        new Date(
            Number(year),
            Number(month),
            Number(day),
            12,
            0,
            0,
            0
        );

    return date;

}


/*
 * Chuyển Date -> YYYY-MM-DD
 */

function statisticsDateToString(
    date
) {

    if (
        !(date instanceof Date) ||
        isNaN(
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
        )
            .padStart(
                2,
                "0"
            );


    const day =
        String(
            date.getDate()
        )
            .padStart(
                2,
                "0"
            );


    return (
        year +
        "-" +
        month +
        "-" +
        day
    );

}


/*
 * Chuyển YYYY-MM-DD -> Date local
 */

function statisticsStringToDate(
    value
) {

    if (!value) {

        return null;

    }


    const text =
        String(value)
            .slice(
                0,
                10
            );


    const match =
        text.match(
            /^(\d{4})-(\d{2})-(\d{2})$/
        );


    if (!match) {

        return null;

    }


    const year =
        Number(
            match[1]
        );


    const month =
        Number(
            match[2]
        ) - 1;


    const day =
        Number(
            match[3]
        );


    const date =
        statisticsCreateLocalDate(
            year,
            month,
            day
        );


    if (
        isNaN(
            date.getTime()
        )
    ) {

        return null;

    }


    return date;

}


/*
 * Chuẩn hóa AppState.statisticsDate
 */

function statisticsNormalizeDate() {

    if (
        !(AppState.statisticsDate instanceof Date) ||
        isNaN(
            AppState.statisticsDate.getTime()
        )
    ) {

        AppState.statisticsDate =
            new Date();

    }


    /*
     * Đưa về 12h trưa.
     *
     * Tránh các lỗi DST / timezone.
     */

    AppState.statisticsDate =
        statisticsCreateLocalDate(
            AppState.statisticsDate.getFullYear(),
            AppState.statisticsDate.getMonth(),
            AppState.statisticsDate.getDate()
        );

}


/* =========================================================
   SET MODE
========================================================= */

function setStatisticsMode(
    mode
) {

    AppState.statisticsMode =
        mode === "chi"
            ? "chi"
            : "thu";

}


/* =========================================================
   PERIOD
========================================================= */

function setStatisticsPeriod(
    period
) {

    if (
        ![
            "day",
            "week",
            "month"
        ].includes(
            period
        )
    ) {

        period = "day";

    }


    statisticsNormalizeDate();


    AppState.statisticsPeriod =
        period;


    /*
     * Khi chuyển sang MONTH,
     * luôn giữ tháng/năm hiện tại.
     *
     * Ngày được đưa về 1 để tránh
     * lỗi ngày 29/30/31.
     */

    if (
        period === "month"
    ) {

        AppState.statisticsDate =
            statisticsCreateLocalDate(
                AppState.statisticsDate.getFullYear(),
                AppState.statisticsDate.getMonth(),
                1
            );

    }


    /*
     * Khi chuyển sang WEEK,
     * vẫn giữ ngày hiện tại.
     */

    document
        .querySelectorAll(
            ".period-tab"
        )
        .forEach(
            button => {

                button.classList.toggle(
                    "active",
                    button.dataset.period ===
                    period
                );

            }
        );


    renderStatistics();

}


/* =========================================================
   DATE RANGE
========================================================= */

function getStatisticsRange() {

    statisticsNormalizeDate();


    const baseDate =
        statisticsCreateLocalDate(
            AppState.statisticsDate.getFullYear(),
            AppState.statisticsDate.getMonth(),
            AppState.statisticsDate.getDate()
        );


    let start;
    let end;


    /* =====================================================
       DAY
    ===================================================== */

    if (
        AppState.statisticsPeriod ===
        "day"
    ) {

        start =
            baseDate;


        end =
            baseDate;

    }


    /* =====================================================
       WEEK
    ===================================================== */

    else if (
        AppState.statisticsPeriod ===
        "week"
    ) {

        const day =
            baseDate.getDay();


        /*
         * Monday = 1
         * Sunday = 0
         */

        const diff =
            day === 0
                ? -6
                : 1 - day;


        start =
            statisticsCreateLocalDate(
                baseDate.getFullYear(),
                baseDate.getMonth(),
                baseDate.getDate()
            );


        start.setDate(
            start.getDate() +
            diff
        );


        end =
            statisticsCreateLocalDate(
                start.getFullYear(),
                start.getMonth(),
                start.getDate()
            );


        end.setDate(
            end.getDate() +
            6
        );

    }


    /* =====================================================
       MONTH
    ===================================================== */

    else {

        start =
            statisticsCreateLocalDate(
                baseDate.getFullYear(),
                baseDate.getMonth(),
                1
            );


        end =
            statisticsCreateLocalDate(
                baseDate.getFullYear(),
                baseDate.getMonth() + 1,
                0
            );

    }


    return {

        start:
            statisticsDateToString(
                start
            ),

        end:
            statisticsDateToString(
                end
            )

    };

}


/* =========================================================
   TRANSACTION DATE
========================================================= */

function statisticsGetTransactionDate(
    transaction
) {

    if (
        !transaction ||
        !transaction.date
    ) {

        return "";

    }


    /*
     * Lấy trực tiếp YYYY-MM-DD.
     *
     * Không new Date() để tránh lệch ngày.
     */

    return String(
        transaction.date
    )
        .slice(
            0,
            10
        );

}


/* =========================================================
   FILTER TRANSACTIONS
========================================================= */

function getStatisticsTransactions() {

    const range =
        getStatisticsRange();


    const transactions =
        Array.isArray(
            AppState.transactions
        )
            ? AppState.transactions
            : [];


    return transactions.filter(
        transaction => {

            const date =
                statisticsGetTransactionDate(
                    transaction
                );


            if (!date) {

                return false;

            }


            return (
                date >= range.start &&
                date <= range.end
            );

        }
    );

}


/* =========================================================
   SAFE TEXT
========================================================= */

function statisticsSafeText(
    value
) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(
        value
    );

}


/* =========================================================
   SAFE HTML
========================================================= */

function statisticsEscapeHTML(
    value
) {

    const text =
        statisticsSafeText(
            value
        );


    if (
        typeof escapeHTML ===
        "function"
    ) {

        try {

            return escapeHTML(
                text
            );

        } catch (error) {

            console.warn(
                "escapeHTML error:",
                error
            );

        }

    }


    return text
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
   NUMBER
========================================================= */

function statisticsNumber(
    value
) {

    if (
        typeof toNumber ===
        "function"
    ) {

        try {

            return Number(
                toNumber(
                    value
                )
            ) || 0;

        } catch (error) {}

    }


    if (
        typeof value ===
        "number"
    ) {

        return isFinite(
            value
        )
            ? value
            : 0;

    }


    const number =
        Number(
            String(
                value || 0
            )
                .replace(
                    /[^\d.-]/g,
                    ""
                )
        );


    return isFinite(
        number
    )
        ? number
        : 0;

}


/* =========================================================
   MONEY
========================================================= */

function statisticsMoney(
    value
) {

    if (
        typeof formatMoney ===
        "function"
    ) {

        try {

            return formatMoney(
                statisticsNumber(
                    value
                )
            );

        } catch (error) {}

    }


    return (
        statisticsNumber(
            value
        )
            .toLocaleString(
                "vi-VN"
            ) +
        " ₫"
    );

}


/* =========================================================
   SET TEXT
========================================================= */

function statisticsSetText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (!element) {

        return;

    }


    element.textContent =
        statisticsSafeText(
            value
        );

}


/*
 * Dùng setText của project nếu có.
 */

function statisticsSetTextCompat(
    id,
    value
) {

    if (
        typeof setText ===
        "function"
    ) {

        try {

            setText(
                id,
                value
            );

            return;

        } catch (error) {}

    }


    statisticsSetText(
        id,
        value
    );

}


/* =========================================================
   GET DISH COST
========================================================= */

function statisticsGetDishCost(
    transaction
) {

    if (
        !transaction
    ) {

        return 0;

    }


    if (
        typeof getTransactionDishCost ===
        "function"
    ) {

        try {

            return statisticsNumber(
                getTransactionDishCost(
                    transaction
                )
            );

        } catch (error) {

            console.warn(
                "getTransactionDishCost error:",
                error
            );

        }

    }


    /*
     * Fallback.
     */

    return statisticsNumber(
        transaction.cost ||
        transaction.dish_cost ||
        transaction.food_cost ||
        0
    );

}


/* =========================================================
   MAIN RENDER
========================================================= */

function renderStatistics() {

    try {

        statisticsNormalizeDate();


        const transactions =
            getStatisticsTransactions();


        const income =
            transactions.filter(
                transaction =>
                    transaction &&
                    transaction.type ===
                    "thu"
            );


        const expenses =
            transactions.filter(
                transaction =>
                    transaction &&
                    transaction.type ===
                    "chi"
            );


        /* =================================================
           REVENUE
        ================================================= */

        const revenue =
            income.reduce(
                (
                    sum,
                    transaction
                ) => {

                    return (
                        sum +
                        statisticsNumber(
                            transaction.amount
                        )
                    );

                },
                0
            );


        /* =================================================
           EXPENSE
        ================================================= */

        const expense =
            expenses.reduce(
                (
                    sum,
                    transaction
                ) => {

                    return (
                        sum +
                        statisticsNumber(
                            transaction.amount
                        )
                    );

                },
                0
            );


        /* =================================================
           SHOPEE FEE
        ================================================= */

        const shopeeFee =
            income
                .filter(
                    transaction =>
                        transaction.source ===
                        "ShopeeFood"
                )
                .reduce(
                    (
                        sum,
                        transaction
                    ) => {

                        return (
                            sum +
                            statisticsNumber(
                                transaction.app_fee
                            )
                        );

                    },
                    0
                );


        /* =================================================
           GRAB FEE
        ================================================= */

        const grabFee =
            income
                .filter(
                    transaction =>
                        transaction.source ===
                        "GrabFood"
                )
                .reduce(
                    (
                        sum,
                        transaction
                    ) => {

                        return (
                            sum +
                            statisticsNumber(
                                transaction.app_fee
                            )
                        );

                    },
                    0
                );


        /* =================================================
           COD / COST
        ================================================= */

        const codCost =
            calculatePeriodCODCost(
                income
            );


        /* =================================================
           PROFIT
        ================================================= */

        const profit =
            revenue -
            codCost -
            expense -
            shopeeFee -
            grabFee;


        /* =================================================
           MAIN UI
        ================================================= */

        statisticsSetTextCompat(
            "statisticsRevenue",
            statisticsMoney(
                revenue
            )
        );


        statisticsSetTextCompat(
            "statisticsCOD",
            statisticsMoney(
                codCost
            )
        );


        statisticsSetTextCompat(
            "statisticsExpense",
            statisticsMoney(
                expense
            )
        );


        statisticsSetTextCompat(
            "statisticsShopeeFee",
            statisticsMoney(
                shopeeFee
            )
        );


        statisticsSetTextCompat(
            "statisticsGrabFee",
            statisticsMoney(
                grabFee
            )
        );


        statisticsSetTextCompat(
            "statisticsProfit",
            statisticsMoney(
                profit
            )
        );


        /*
         * Thêm class màu cho lợi nhuận.
         */

        const profitElement =
            document.getElementById(
                "statisticsProfit"
            );


        if (profitElement) {

            profitElement.classList.toggle(
                "profit-positive",
                profit >= 0
            );


            profitElement.classList.toggle(
                "profit-negative",
                profit < 0
            );

        }


        /* =================================================
           SECTIONS
        ================================================= */

        renderStatisticsExpenses(
            expenses
        );


        renderStatisticsDishes(
            income
        );


        renderStatisticsSources(
            income
        );


        renderStatisticsChart(
            transactions
        );


        renderStatisticsPercentWheel(
            revenue,
            expense,
            income,
            expenses
        );


        /* =================================================
           PERIOD LABEL
        ================================================= */

        statisticsSetTextCompat(
            "statisticsPeriodLabel",
            getPeriodLabel()
        );


        /*
         * Một số HTML cũ dùng id khác.
         */

        statisticsSetTextCompat(
            "statisticsDateLabel",
            getPeriodLabel()
        );


        /* =================================================
           PERIOD BUTTON
        ================================================= */

        document
            .querySelectorAll(
                ".period-tab"
            )
            .forEach(
                button => {

                    button.classList.toggle(
                        "active",
                        button.dataset.period ===
                        AppState.statisticsPeriod
                    );

                }
            );


        hideOldStatisticsModeTabs();


        /*
         * Cập nhật trạng thái nút ngày.
         */

        updateStatisticsNavigationButtons();


    } catch (error) {

        console.error(
            "Statistics render error:",
            error
        );

    }

}


/* =========================================================
   HIDE OLD TABS
========================================================= */

function hideOldStatisticsModeTabs() {

    [
        "statisticsIncomeTab",
        "statisticsExpenseTab"
    ]
        .forEach(
            id => {

                const element =
                    document.getElementById(
                        id
                    );


                if (element) {

                    element.style.display =
                        "none";

                }

            }
        );

}


/* =========================================================
   COD COST
========================================================= */

function calculatePeriodCODCost(
    transactions
) {

    if (
        !Array.isArray(
            transactions
        )
    ) {

        return 0;

    }


    let total = 0;


    transactions.forEach(
        transaction => {

            total +=
                statisticsGetDishCost(
                    transaction
                );

        }
    );


    return total;

}


/* =========================================================
   DISH STATISTICS
========================================================= */

function renderStatisticsDishes(
    transactions
) {

    const container =
        document.getElementById(
            "statisticsDishList"
        );


    if (!container) {

        return;

    }


    const map = {};


    (
        Array.isArray(
            transactions
        )
            ? transactions
            : []
    )
        .forEach(
            transaction => {

                if (!transaction) {

                    return;

                }


                const name =
                    statisticsSafeText(
                        transaction.dish_name ||
                        transaction.name ||
                        "Không tên"
                    );


                if (!map[name]) {

                    map[name] = {

                        quantity: 0,

                        revenue: 0,

                        fee: 0,

                        cost: 0

                    };

                }


                map[name].quantity +=
                    1;


                map[name].revenue +=
                    statisticsNumber(
                        transaction.amount
                    );


                map[name].fee +=
                    statisticsNumber(
                        transaction.app_fee
                    );


                map[name].cost +=
                    statisticsGetDishCost(
                        transaction
                    );

            }
        );


    container.innerHTML = "";


    const entries =
        Object.entries(
            map
        )
            .sort(
                (
                    a,
                    b
                ) =>
                    b[1].revenue -
                    a[1].revenue
            );


    if (
        !entries.length
    ) {

        container.innerHTML = `

            <div class="statistics-empty">

                <div class="statistics-empty-icon">
                    🍜
                </div>

                <strong>
                    Chưa có đơn bán
                </strong>

                <span>
                    Không có món nào trong kỳ này.
                </span>

            </div>

        `;

        return;

    }


    entries.forEach(
        (
            [name, item]
        ) => {

            const profit =
                item.revenue -
                item.fee -
                item.cost;


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "statistics-dish-row";


            row.innerHTML = `

                <div class="statistics-dish-top">

                    <span class="statistics-dish-name">

                        <span class="statistics-dish-icon">
                            🍜
                        </span>

                        ${statisticsEscapeHTML(
                            name
                        )}

                    </span>


                    <strong class="
                        statistics-dish-profit
                        ${profit >= 0
                            ? "positive"
                            : "negative"}
                    ">

                        ${statisticsMoney(
                            profit
                        )}

                    </strong>

                </div>


                <div class="statistics-dish-detail">

                    <span>
                        ${item.quantity} đơn
                    </span>

                    <span>
                        Thu:
                        ${statisticsMoney(
                            item.revenue
                        )}
                    </span>

                    <span>
                        Vốn:
                        ${statisticsMoney(
                            item.cost
                        )}
                    </span>

                    <span>
                        App:
                        ${statisticsMoney(
                            item.fee
                        )}
                    </span>

                </div>

            `;


            container.appendChild(
                row
            );

        }
    );

}


/* =========================================================
   SOURCE
========================================================= */

function renderStatisticsSources(
    transactions
) {

    const container =
        document.getElementById(
            "statisticsSourceList"
        );


    if (!container) {

        return;

    }


    const sources = [

        {
            name: "ShopeeFood",
            icon: "🟠"
        },

        {
            name: "GrabFood",
            icon: "🟢"
        },

        {
            name: "Ngoài sàn",
            icon: "🔵"
        }

    ];


    container.innerHTML = "";


    sources.forEach(
        source => {

            const items =
                (
                    Array.isArray(
                        transactions
                    )
                        ? transactions
                        : []
                )
                    .filter(
                        transaction =>
                            transaction &&
                            transaction.source ===
                            source.name
                    );


            const revenue =
                items.reduce(
                    (
                        sum,
                        transaction
                    ) =>
                        sum +
                        statisticsNumber(
                            transaction.amount
                        ),
                    0
                );


            const fee =
                items.reduce(
                    (
                        sum,
                        transaction
                    ) =>
                        sum +
                        statisticsNumber(
                            transaction.app_fee
                        ),
                    0
                );


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "statistics-source-row";


            row.innerHTML = `

                <div class="statistics-source-left">

                    <span class="statistics-source-icon">
                        ${source.icon}
                    </span>


                    <div>

                        <strong>
                            ${statisticsEscapeHTML(
                                source.name
                            )}
                        </strong>

                        <small>
                            ${items.length} đơn
                        </small>

                    </div>

                </div>


                <div class="statistics-source-money">

                    <strong>
                        ${statisticsMoney(
                            revenue
                        )}
                    </strong>

                    <small>
                        Phí:
                        ${statisticsMoney(
                            fee
                        )}
                    </small>

                </div>

            `;


            container.appendChild(
                row
            );

        }
    );

}


/* =========================================================
   EXPENSE MAIN
========================================================= */

function renderStatisticsExpenses(
    expenses
) {

    if (
        !Array.isArray(
            expenses
        )
    ) {

        expenses = [];

    }


    const total =
        expenses.reduce(
            (
                sum,
                transaction
            ) =>
                sum +
                statisticsNumber(
                    transaction.amount
                ),
            0
        );


    const count =
        expenses.length;


    const average =
        count > 0
            ? total / count
            : 0;


    statisticsSetTextCompat(
        "statisticsTotalExpense",
        statisticsMoney(
            total
        )
    );


    statisticsSetTextCompat(
        "statisticsExpenseAmount",
        statisticsMoney(
            total
        )
    );


    statisticsSetTextCompat(
        "statisticsExpenseCount",
        count
    );


    statisticsSetTextCompat(
        "statisticsExpenseAverage",
        statisticsMoney(
            average
        )
    );


    renderStatisticsExpenseCategories(
        expenses,
        total
    );


    renderStatisticsExpenseList(
        expenses
    );

}


/* =========================================================
   EXPENSE CATEGORY
========================================================= */

function renderStatisticsExpenseCategories(
    expenses,
    total
) {

    const container =
        document.getElementById(
            "statisticsExpenseCategoryList"
        );


    if (!container) {

        return;

    }


    const map = {};


    expenses.forEach(
        transaction => {

            if (!transaction) {

                return;

            }


            const category =
                statisticsSafeText(
                    transaction.category_name ||
                    transaction.category ||
                    "Khác"
                );


            if (!map[category]) {

                map[category] =
                    0;

            }


            map[category] +=
                statisticsNumber(
                    transaction.amount
                );

        }
    );


    const entries =
        Object.entries(
            map
        )
            .sort(
                (
                    a,
                    b
                ) =>
                    b[1] -
                    a[1]
            );


    container.innerHTML = "";


    if (
        !entries.length
    ) {

        container.innerHTML = `

            <div class="statistics-empty">

                <div class="statistics-empty-icon">
                    💸
                </div>

                <strong>
                    Chưa có khoản chi
                </strong>

                <span>
                    Các khoản chi sẽ xuất hiện ở đây.
                </span>

            </div>

        `;

        return;

    }


    entries.forEach(
        (
            [name, amount]
        ) => {

            const percent =
                total > 0
                    ? (
                        amount /
                        total
                    ) *
                    100
                    : 0;


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "statistics-expense-category-row";


            row.innerHTML = `

                <div class="
                    statistics-expense-category-top
                ">

                    <span class="
                        statistics-expense-category-name
                    ">

                        📁
                        ${statisticsEscapeHTML(
                            name
                        )}

                    </span>


                    <strong class="
                        statistics-expense-category-money
                    ">

                        ${statisticsMoney(
                            amount
                        )}

                    </strong>

                </div>


                <div class="
                    statistics-expense-category-bar
                ">

                    <span
                        style="
                            width:${Math.min(
                                Math.max(
                                    percent,
                                    0
                                ),
                                100
                            )}%;
                        "
                    ></span>

                </div>


                <div class="
                    statistics-expense-category-percent
                ">

                    ${percent.toFixed(
                        1
                    )}%

                </div>

            `;


            container.appendChild(
                row
            );

        }
    );

}


/* =========================================================
   EXPENSE LIST
========================================================= */

function renderStatisticsExpenseList(
    expenses
) {

    const container =
        document.getElementById(
            "statisticsExpenseList"
        );


    if (!container) {

        return;

    }


    container.innerHTML = "";


    if (
        !expenses.length
    ) {

        container.innerHTML = `

            <div class="statistics-empty">

                <div class="statistics-empty-icon">
                    🧾
                </div>

                <strong>
                    Chưa có khoản chi
                </strong>

                <span>
                    Chưa phát sinh chi phí trong kỳ.
                </span>

            </div>

        `;

        return;

    }


    const sorted =
        [...expenses]
            .sort(
                (
                    a,
                    b
                ) => {

                    return String(
                        b.date || ""
                    )
                        .localeCompare(
                            String(
                                a.date || ""
                            )
                        );

                }
            );


    sorted.forEach(
        transaction => {

            if (!transaction) {

                return;

            }


            const name =
                statisticsSafeText(
                    transaction.dish_name ||
                    transaction.name ||
                    "Khoản chi"
                );


            const category =
                statisticsSafeText(
                    transaction.category_name ||
                    transaction.category ||
                    "Khác"
                );


            let dateLabel =
                statisticsGetTransactionDate(
                    transaction
                );


            try {

                if (
                    typeof formatVietnameseDate ===
                    "function"
                ) {

                    dateLabel =
                        formatVietnameseDate(
                            transaction.date
                        );

                }

            } catch (error) {}


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "statistics-expense-row";


            row.innerHTML = `

                <div class="
                    statistics-expense-icon
                ">
                    ↓
                </div>


                <div class="
                    statistics-expense-info
                ">

                    <div class="
                        statistics-expense-name
                    ">

                        ${statisticsEscapeHTML(
                            name
                        )}

                    </div>


                    <div class="
                        statistics-expense-category
                    ">

                        ${statisticsEscapeHTML(
                            category
                        )}

                    </div>


                    <div class="
                        statistics-expense-date
                    ">

                        ${statisticsEscapeHTML(
                            dateLabel
                        )}

                    </div>

                </div>


                <div class="
                    statistics-expense-money
                ">

                    -
                    ${statisticsMoney(
                        transaction.amount
                    )}

                </div>

            `;


            container.appendChild(
                row
            );

        }
    );

}


/* =========================================================
   CHART
========================================================= */

function renderStatisticsChart(
    transactions
) {

    const chart =
        document.getElementById(
            "statisticsChart"
        );


    if (!chart) {

        return;

    }


    chart.innerHTML = "";


    if (
        !transactions.length
    ) {

        chart.innerHTML = `

            <div class="empty-chart">

                <span>
                    📊
                </span>

                <strong>
                    Chưa có dữ liệu
                </strong>

                <small>
                    Không có giao dịch trong kỳ này.
                </small>

            </div>

        `;

        return;

    }


    const daily = {};


    transactions.forEach(
        transaction => {

            if (
                !transaction
            ) {

                return;

            }


            const date =
                statisticsGetTransactionDate(
                    transaction
                );


            if (!date) {

                return;

            }


            if (
                !daily[date]
            ) {

                daily[date] = {

                    thu: 0,

                    chi: 0

                };

            }


            const amount =
                statisticsNumber(
                    transaction.amount
                );


            if (
                transaction.type ===
                "thu"
            ) {

                daily[date].thu +=
                    amount;

            }


            if (
                transaction.type ===
                "chi"
            ) {

                daily[date].chi +=
                    amount;

            }

        }
    );


    const dates =
        Object.keys(
            daily
        )
            .sort();


    if (
        !dates.length
    ) {

        chart.innerHTML = `

            <div class="empty-chart">
                📊 Chưa có dữ liệu
            </div>

        `;

        return;

    }


    const maxValue =
        Math.max(
            ...dates.map(
                date =>
                    Math.max(
                        daily[date].thu,
                        daily[date].chi
                    )
            ),
            1
        );


    const legend =
        document.createElement(
            "div"
        );


    legend.className =
        "statistics-chart-legend";


    legend.innerHTML = `

        <span>

            <i class="legend-dot income"></i>

            Thu

        </span>


        <span>

            <i class="legend-dot expense"></i>

            Chi

        </span>

    `;


    chart.appendChild(
        legend
    );


    const chartBody =
        document.createElement(
            "div"
        );


    chartBody.className =
        "statistics-chart-body";


    dates.forEach(
        date => {

            const data =
                daily[date];


            const maxHeight =
                145;


            const incomeHeight =
                data.thu > 0
                    ? Math.max(
                        8,
                        (
                            data.thu /
                            maxValue
                        ) *
                        maxHeight
                    )
                    : 0;


            const expenseHeight =
                data.chi > 0
                    ? Math.max(
                        8,
                        (
                            data.chi /
                            maxValue
                        ) *
                        maxHeight
                    )
                    : 0;


            const dateObject =
                statisticsStringToDate(
                    date
                );


            let label =
                date;


            if (
                dateObject
            ) {

                label =
                    dateObject.getDate() +
                    "/" +
                    (
                        dateObject.getMonth() +
                        1
                    );

            }


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "chart-day";


            item.innerHTML = `

                <div class="chart-bars">

                    <div
                        class="
                            chart-bar
                            income
                        "
                        style="
                            height:${incomeHeight}px;
                        "
                        title="Thu: ${statisticsMoney(
                            data.thu
                        )}"
                    ></div>


                    <div
                        class="
                            chart-bar
                            expense
                        "
                        style="
                            height:${expenseHeight}px;
                        "
                        title="Chi: ${statisticsMoney(
                            data.chi
                        )}"
                    ></div>

                </div>


                <div class="chart-date">

                    ${statisticsEscapeHTML(
                        label
                    )}

                </div>

            `;


            chartBody.appendChild(
                item
            );

        }
    );


    chart.appendChild(
        chartBody
    );

}


/* =========================================================
   CREATE DONUT
========================================================= */

function statisticsCreateDonut(
    percent,
    type
) {

    const safePercent =
        Math.min(
            Math.max(
                Number(
                    percent
                ) || 0,
                0
            ),
            100
        );


    return `

        <div
            class="
                statistics-mini-donut
                ${type}
            "
            style="
                --percent:${safePercent};
            "
        >

            <div class="
                statistics-mini-donut-inner
            ">

                <strong>
                    ${safePercent.toFixed(
                        0
                    )}%
                </strong>

            </div>

        </div>

    `;

}


/* =========================================================
   PERCENT WHEEL
========================================================= */

function renderStatisticsPercentWheel(
    revenue,
    expense,
    income,
    expenses
) {

    let section =
        document.getElementById(
            "statisticsPercentWheel"
        );


    /*
     * Nếu HTML chưa có,
     * tự tạo section.
     */

    if (!section) {

        const page =
            document.getElementById(
                "statisticsPage"
            );


        if (!page) {

            return;

        }


        section =
            document.createElement(
                "section"
            );


        section.id =
            "statisticsPercentWheel";


        section.className =
            "card statistics-percent-section";


        page.appendChild(
            section
        );

    }


    const total =
        revenue +
        expense;


    const incomePercent =
        total > 0
            ? (
                revenue /
                total
            ) *
            100
            : 0;


    const expensePercent =
        total > 0
            ? (
                expense /
                total
            ) *
            100
            : 0;


    /* =====================================================
       DISH MAP
    ===================================================== */

    const dishMap = {};


    (
        Array.isArray(
            income
        )
            ? income
            : []
    )
        .forEach(
            transaction => {

                if (!transaction) {

                    return;

                }


                const name =
                    statisticsSafeText(
                        transaction.dish_name ||
                        transaction.name ||
                        "Không tên"
                    );


                if (
                    !dishMap[name]
                ) {

                    dishMap[name] = {

                        revenue: 0,

                        quantity: 0

                    };

                }


                dishMap[name].revenue +=
                    statisticsNumber(
                        transaction.amount
                    );


                dishMap[name].quantity +=
                    1;

            }
        );


    const dishes =
        Object.entries(
            dishMap
        )
            .sort(
                (
                    a,
                    b
                ) =>
                    b[1].revenue -
                    a[1].revenue
            );


    /* =====================================================
       EXPENSE MAP
    ===================================================== */

    const expenseMap = {};


    (
        Array.isArray(
            expenses
        )
            ? expenses
            : []
    )
        .forEach(
            transaction => {

                if (!transaction) {

                    return;

                }


                const category =
                    statisticsSafeText(
                        transaction.category_name ||
                        transaction.category ||
                        "Khác"
                    );


                if (
                    !expenseMap[category]
                ) {

                    expenseMap[category] =
                        0;

                }


                expenseMap[category] +=
                    statisticsNumber(
                        transaction.amount
                    );

            }
        );


    const expenseCategories =
        Object.entries(
            expenseMap
        )
            .sort(
                (
                    a,
                    b
                ) =>
                    b[1] -
                    a[1]
            );


    const topDishes =
        dishes.slice(
            0,
            8
        );


    const topExpenses =
        expenseCategories.slice(
            0,
            8
        );


    /* =====================================================
       DISH HTML
    ===================================================== */

    let dishesHTML = "";


    if (
        topDishes.length
    ) {

        topDishes.forEach(
            (
                [name, item]
            ) => {

                const percent =
                    revenue > 0
                        ? (
                            item.revenue /
                            revenue
                        ) *
                            100
                        : 0;


                dishesHTML += `

                    <div class="
                        statistics-detail-wheel-card
                        income
                    ">

                        ${statisticsCreateDonut(
                            percent,
                            "income"
                        )}


                        <div class="
                            statistics-detail-wheel-info
                        ">

                            <div class="
                                statistics-detail-wheel-name
                            "
                            title="${statisticsEscapeHTML(
                                name
                            )}">

                                ${statisticsEscapeHTML(
                                    name
                                )}

                            </div>


                            <div class="
                                statistics-detail-wheel-money
                            ">

                                ${statisticsMoney(
                                    item.revenue
                                )}

                            </div>


                            <small>
                                ${item.quantity} đơn
                            </small>

                        </div>

                    </div>

                `;

            }
        );

    }

    else {

        dishesHTML = `

            <div class="statistics-empty">

                <div class="statistics-empty-icon">
                    🍜
                </div>

                <strong>
                    Chưa có món thu
                </strong>

                <span>
                    Dữ liệu món sẽ xuất hiện tại đây.
                </span>

            </div>

        `;

    }


    /* =====================================================
       EXPENSE WHEEL HTML
    ===================================================== */

    let expenseHTML = "";


    if (
        topExpenses.length
    ) {

        topExpenses.forEach(
            (
                [name, amount]
            ) => {

                const percent =
                    expense > 0
                        ? (
                            amount /
                            expense
                        ) *
                            100
                        : 0;


                expenseHTML += `

                    <div class="
                        statistics-detail-wheel-card
                        expense
                    ">

                        ${statisticsCreateDonut(
                            percent,
                            "expense"
                        )}


                        <div class="
                            statistics-detail-wheel-info
                        ">

                            <div class="
                                statistics-detail-wheel-name
                            "
                            title="${statisticsEscapeHTML(
                                name
                            )}">

                                ${statisticsEscapeHTML(
                                    name
                                )}

                            </div>


                            <div class="
                                statistics-detail-wheel-money
                            ">

                                ${statisticsMoney(
                                    amount
                                )}

                            </div>

                        </div>

                    </div>

                `;

            }
        );

    }

    else {

        expenseHTML = `

            <div class="statistics-empty">

                <div class="statistics-empty-icon">
                    💸
                </div>

                <strong>
                    Chưa có khoản chi
                </strong>

                <span>
                    Dữ liệu chi sẽ xuất hiện tại đây.
                </span>

            </div>

        `;

    }


    /* =====================================================
       EXPENSE ANALYSIS
    ===================================================== */

    let expenseAnalysisHTML = "";


    if (
        topExpenses.length
    ) {

        expenseAnalysisHTML =
            topExpenses
                .map(
                    (
                        [name, amount]
                    ) => {

                        const percent =
                            expense > 0
                                ? (
                                    amount /
                                    expense
                                ) *
                                    100
                                : 0;


                        return `

                            <div class="
                                statistics-expense-analysis-row
                            ">

                                <div class="
                                    statistics-expense-analysis-top
                                ">

                                    <span class="
                                        statistics-expense-analysis-name
                                    ">

                                        <span>
                                            📁
                                        </span>

                                        ${statisticsEscapeHTML(
                                            name
                                        )}

                                    </span>


                                    <strong class="
                                        statistics-expense-analysis-money
                                    ">

                                        ${statisticsMoney(
                                            amount
                                        )}

                                    </strong>

                                </div>


                                <div class="
                                    statistics-expense-analysis-bar
                                ">

                                    <span
                                        style="
                                            width:${Math.min(
                                                Math.max(
                                                    percent,
                                                    0
                                                ),
                                                100
                                            )}%;
                                        "
                                    ></span>

                                </div>


                                <div class="
                                    statistics-expense-analysis-percent
                                ">

                                    ${percent.toFixed(
                                        1
                                    )}%

                                </div>

                            </div>

                        `;

                    }
                )
                .join("");

    }

    else {

        expenseAnalysisHTML = `

            <div class="statistics-empty">

                <div class="statistics-empty-icon">
                    💸
                </div>

                <strong>
                    Chưa có dữ liệu chi
                </strong>

                <span>
                    Phân tích chi phí sẽ xuất hiện ở đây.
                </span>

            </div>

        `;

    }


    /* =====================================================
       RENDER SECTION
    ===================================================== */

    section.innerHTML = `

        <!-- =================================================
             HEADING
        ================================================= -->

        <div class="
            statistics-wheel-heading
        ">

            <div>

                <span>
                    TỶ TRỌNG TÀI CHÍNH
                </span>

                <h2>
                    🥧 Thu & Chi
                </h2>

            </div>


            <small>
                Tổng
                ${statisticsMoney(
                    total
                )}
            </small>

        </div>


        <!-- =================================================
             TOTAL DONUTS
        ================================================= -->

        <div class="
            statistics-wheel-grid
        ">

            <!-- THU -->

            <div class="
                statistics-wheel-card
                income
            ">

                <div
                    class="
                        statistics-donut
                        income-donut
                    "
                    style="
                        --percent:${incomePercent};
                    "
                >

                    <div class="
                        statistics-donut-inner
                    ">

                        <strong>
                            ${incomePercent.toFixed(
                                0
                            )}%
                        </strong>

                        <span>
                            THU
                        </span>

                    </div>

                </div>


                <div class="
                    statistics-wheel-info
                ">

                    <strong>
                        Doanh thu
                    </strong>

                    <span>
                        ${statisticsMoney(
                            revenue
                        )}
                    </span>

                </div>

            </div>


            <!-- CHI -->

            <div class="
                statistics-wheel-card
                expense
            ">

                <div
                    class="
                        statistics-donut
                        expense-donut
                    "
                    style="
                        --percent:${expensePercent};
                    "
                >

                    <div class="
                        statistics-donut-inner
                    ">

                        <strong>
                            ${expensePercent.toFixed(
                                0
                            )}%
                        </strong>

                        <span>
                            CHI
                        </span>

                    </div>

                </div>


                <div class="
                    statistics-wheel-info
                ">

                    <strong>
                        Chi phí
                    </strong>

                    <span>
                        ${statisticsMoney(
                            expense
                        )}
                    </span>

                </div>

            </div>

        </div>


        <!-- =================================================
             DISH DETAIL
        ================================================= -->

        <div class="
            statistics-detail-wheel-section
        ">

            <div class="
                statistics-detail-wheel-title
            ">

                <div>

                    <span>
                        DOANH THU
                    </span>

                    <strong>
                        🍜 Tỷ trọng từng món
                    </strong>

                </div>


                <small>
                    % trên tổng thu
                </small>

            </div>


            <div class="
                statistics-detail-wheel-grid
            ">

                ${dishesHTML}

            </div>

        </div>


        <!-- =================================================
             EXPENSE ANALYSIS
        ================================================= -->

        <div class="
            statistics-expense-analysis
        ">

            <div class="
                statistics-expense-analysis-heading
            ">

                <div class="
                    statistics-expense-analysis-heading-icon
                ">
                    💸
                </div>


                <div>

                    <span>
                        CHI PHÍ
                    </span>

                    <strong>
                        Phân tích chi phí
                    </strong>

                </div>


                <small>
                    ${statisticsMoney(
                        expense
                    )}
                </small>

            </div>


            <div class="
                statistics-expense-analysis-list
            ">

                ${expenseAnalysisHTML}

            </div>

        </div>


        <!-- =================================================
             EXPENSE DETAIL WHEELS
        ================================================= -->

        <div class="
            statistics-detail-wheel-section
            expense-section
        ">

            <div class="
                statistics-detail-wheel-title
            ">

                <div>

                    <span>
                        CHI PHÍ
                    </span>

                    <strong>
                        💸 Tỷ trọng từng nhóm chi
                    </strong>

                </div>


                <small>
                    % trên tổng chi
                </small>

            </div>


            <div class="
                statistics-detail-wheel-grid
            ">

                ${expenseHTML}

            </div>

        </div>

    `;

}


/* =========================================================
   PREVIOUS
   QUAN TRỌNG:
   SỬA LỖI CHUYỂN NGÀY / THÁNG
========================================================= */

function statisticsPrevious() {

    statisticsNormalizeDate();


    const current =
        AppState.statisticsDate;


    /* =====================================================
       DAY
    ===================================================== */

    if (
        AppState.statisticsPeriod ===
        "day"
    ) {

        const previous =
            statisticsCreateLocalDate(
                current.getFullYear(),
                current.getMonth(),
                current.getDate()
            );


        previous.setDate(
            previous.getDate() -
            1
        );


        AppState.statisticsDate =
            previous;

    }


    /* =====================================================
       WEEK
    ===================================================== */

    else if (
        AppState.statisticsPeriod ===
        "week"
    ) {

        const previous =
            statisticsCreateLocalDate(
                current.getFullYear(),
                current.getMonth(),
                current.getDate()
            );


        previous.setDate(
            previous.getDate() -
            7
        );


        AppState.statisticsDate =
            previous;

    }


    /* =====================================================
       MONTH
    ===================================================== */

    else {

        /*
         * LUÔN đưa về ngày 1 trước khi setMonth.
         *
         * Đây là phần sửa lỗi quan trọng.
         *
         * Ví dụ:
         *
         * 31/03 -> tháng trước
         *
         * Không còn:
         *
         * 03/03 hoặc 01/03 sai.
         */

        const previous =
            statisticsCreateLocalDate(
                current.getFullYear(),
                current.getMonth(),
                1
            );


        previous.setMonth(
            previous.getMonth() -
            1
        );


        AppState.statisticsDate =
            previous;

    }


    renderStatistics();

}


/* =========================================================
   NEXT
========================================================= */

function statisticsNext() {

    statisticsNormalizeDate();


    const current =
        AppState.statisticsDate;


    /* =====================================================
       DAY
    ===================================================== */

    if (
        AppState.statisticsPeriod ===
        "day"
    ) {

        const next =
            statisticsCreateLocalDate(
                current.getFullYear(),
                current.getMonth(),
                current.getDate()
            );


        next.setDate(
            next.getDate() +
            1
        );


        AppState.statisticsDate =
            next;

    }


    /* =====================================================
       WEEK
    ===================================================== */

    else if (
        AppState.statisticsPeriod ===
        "week"
    ) {

        const next =
            statisticsCreateLocalDate(
                current.getFullYear(),
                current.getMonth(),
                current.getDate()
            );


        next.setDate(
            next.getDate() +
            7
        );


        AppState.statisticsDate =
            next;

    }


    /* =====================================================
       MONTH
    ===================================================== */

    else {

        /*
         * LUÔN dùng ngày 1.
         */

        const next =
            statisticsCreateLocalDate(
                current.getFullYear(),
                current.getMonth(),
                1
            );


        next.setMonth(
            next.getMonth() +
            1
        );


        AppState.statisticsDate =
            next;

    }


    renderStatistics();

}


/* =========================================================
   GO TODAY
========================================================= */

function statisticsToday() {

    const now =
        new Date();


    AppState.statisticsDate =
        statisticsCreateLocalDate(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
        );


    renderStatistics();

}


/* =========================================================
   PERIOD LABEL
========================================================= */

function getPeriodLabel() {

    const range =
        getStatisticsRange();


    const start =
        statisticsStringToDate(
            range.start
        );


    const end =
        statisticsStringToDate(
            range.end
        );


    if (
        AppState.statisticsPeriod ===
        "day"
    ) {

        if (
            typeof formatVietnameseDate ===
            "function"
        ) {

            try {

                return formatVietnameseDate(
                    range.start
                );

            } catch (error) {}

        }


        return range.start;

    }


    if (
        AppState.statisticsPeriod ===
        "month"
    ) {

        if (
            start
        ) {

            const month =
                String(
                    start.getMonth() + 1
                )
                    .padStart(
                        2,
                        "0"
                    );


            return (
                "Tháng " +
                month +
                "/" +
                start.getFullYear()
            );

        }

    }


    if (
        start &&
        end
    ) {

        if (
            typeof formatVietnameseDate ===
            "function"
        ) {

            try {

                return (
                    formatVietnameseDate(
                        range.start
                    ) +
                    " - " +
                    formatVietnameseDate(
                        range.end
                    )
                );

            } catch (error) {}

        }


        return (
            range.start +
            " - " +
            range.end
        );

    }


    return "";

}


/* =========================================================
   NAVIGATION BUTTON STATE
========================================================= */

function updateStatisticsNavigationButtons() {

    /*
     * Không khóa nút.
     *
     * Người dùng có thể xem:
     *
     * hôm qua / ngày mai
     * tuần trước / tuần sau
     * tháng trước / tháng sau
     */

    document
        .querySelectorAll(
            ".statistics-date-row button"
        )
        .forEach(
            button => {

                button.disabled =
                    false;

                button.removeAttribute(
                    "aria-disabled"
                );

            }
        );

}


/* =========================================================
   EVENT DELEGATION
   Hỗ trợ cả onclick cũ lẫn data-action mới
========================================================= */

function statisticsBindNavigation() {

    document.addEventListener(
        "click",
        event => {

            const target =
                event.target.closest(
                    "[data-statistics-action]"
                );


            if (!target) {

                return;

            }


            const action =
                target.dataset
                    .statisticsAction;


            if (
                action ===
                "previous"
            ) {

                event.preventDefault();

                statisticsPrevious();

            }


            if (
                action ===
                "next"
            ) {

                event.preventDefault();

                statisticsNext();

            }


            if (
                action ===
                "today"
            ) {

                event.preventDefault();

                statisticsToday();

            }

        }
    );

}


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        statisticsNormalizeDate();


        hideOldStatisticsModeTabs();


        statisticsBindNavigation();


        /*
         * Cho toàn bộ HTML render xong.
         */

        setTimeout(
            () => {

                renderStatistics();

            },
            0
        );

    }
);


/* =========================================================
   GLOBAL COMPATIBILITY
   ---------------------------------------------------------
   Đảm bảo HTML onclick cũ vẫn chạy.
========================================================= */

window.setStatisticsMode =
    setStatisticsMode;

window.setStatisticsPeriod =
    setStatisticsPeriod;

window.getStatisticsRange =
    getStatisticsRange;

window.getStatisticsTransactions =
    getStatisticsTransactions;

window.renderStatistics =
    renderStatistics;

window.statisticsPrevious =
    statisticsPrevious;

window.statisticsNext =
    statisticsNext;

window.statisticsToday =
    statisticsToday;

window.getPeriodLabel =
    getPeriodLabel;

/* =========================================================
   STATISTICS DATE PICKER
   ---------------------------------------------------------
   ✓ Click vào ngày / tháng / năm để mở bảng chọn
   ✓ Chọn ngày
   ✓ Chọn tháng
   ✓ Chọn năm
   ✓ Có nút Hôm nay
   ✓ Tự cập nhật statistics
   ✓ Không dùng new Date("YYYY-MM-DD")
   ✓ Không lỗi ngày 29/30/31
========================================================= */

(function () {

    /* =====================================================
       CSS
    ===================================================== */

    function statisticsInjectDatePickerCSS() {

        if (
            document.getElementById(
                "statisticsDatePickerCSS"
            )
        ) {
            return;
        }

        const style =
            document.createElement("style");

        style.id =
            "statisticsDatePickerCSS";

        style.textContent = `

            .statistics-date-picker {
                position: fixed;
                z-index: 999999;
                width: 320px;
                max-width: calc(100vw - 24px);
                background: var(--card-bg, #ffffff);
                color: var(--text-color, #111827);
                border: 1px solid rgba(0,0,0,.08);
                border-radius: 20px;
                padding: 16px;
                box-shadow:
                    0 20px 60px rgba(0,0,0,.18),
                    0 4px 16px rgba(0,0,0,.08);
                animation:
                    statisticsDatePickerShow
                    .18s ease;
            }

            @keyframes statisticsDatePickerShow {

                from {
                    opacity: 0;
                    transform: translateY(-6px) scale(.98);
                }

                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }

            }


            .statistics-date-picker-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 10px;
                margin-bottom: 14px;
            }


            .statistics-date-picker-title {
                font-size: 16px;
                font-weight: 800;
            }


            .statistics-date-picker-close {
                width: 32px;
                height: 32px;
                border: 0;
                border-radius: 10px;
                background: rgba(0,0,0,.06);
                cursor: pointer;
                font-size: 18px;
                line-height: 1;
            }


            .statistics-date-picker-tabs {
                display: grid;
                grid-template-columns:
                    repeat(3, 1fr);
                gap: 6px;
                margin-bottom: 14px;
                padding: 4px;
                background: rgba(0,0,0,.05);
                border-radius: 12px;
            }


            .statistics-date-picker-tab {
                border: 0;
                background: transparent;
                border-radius: 9px;
                padding: 9px 6px;
                font-weight: 700;
                cursor: pointer;
                color: inherit;
            }


            .statistics-date-picker-tab.active {
                background: #ffffff;
                color: #2563eb;
                box-shadow:
                    0 2px 8px rgba(0,0,0,.08);
            }


            .statistics-date-picker-nav {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 12px;
            }


            .statistics-date-picker-nav button {
                width: 36px;
                height: 36px;
                border: 0;
                border-radius: 10px;
                background: rgba(37,99,235,.09);
                color: #2563eb;
                cursor: pointer;
                font-size: 18px;
                font-weight: 800;
            }


            .statistics-date-picker-current {
                font-weight: 800;
                font-size: 15px;
                text-align: center;
            }


            .statistics-date-picker-grid {
                display: grid;
                grid-template-columns:
                    repeat(7, 1fr);
                gap: 5px;
            }


            .statistics-date-picker-grid.year-grid {
                grid-template-columns:
                    repeat(4, 1fr);
            }


            .statistics-date-picker-day-name {
                text-align: center;
                font-size: 11px;
                font-weight: 800;
                color: #9ca3af;
                padding: 4px 0;
            }


            .statistics-date-picker-cell {
                min-height: 36px;
                border: 0;
                border-radius: 10px;
                background: transparent;
                cursor: pointer;
                font-weight: 700;
                color: inherit;
            }


            .statistics-date-picker-cell:hover {
                background: rgba(37,99,235,.10);
                color: #2563eb;
            }


            .statistics-date-picker-cell.selected {
                background: #2563eb;
                color: #ffffff;
            }


            .statistics-date-picker-cell.today {
                box-shadow:
                    inset 0 0 0 2px #2563eb;
            }


            .statistics-date-picker-cell.muted {
                color: #c4c9d1;
                cursor: default;
            }


            .statistics-date-picker-footer {
                display: flex;
                gap: 8px;
                margin-top: 14px;
            }


            .statistics-date-picker-footer button {
                flex: 1;
                border: 0;
                border-radius: 12px;
                padding: 10px;
                font-weight: 800;
                cursor: pointer;
            }


            .statistics-date-picker-today {
                background: #2563eb;
                color: white;
            }


            .statistics-date-picker-cancel {
                background: rgba(0,0,0,.06);
                color: inherit;
            }


            /* Phần ngày hiện tại có thể click */

            #statisticsPeriodLabel,
            #statisticsDateLabel,
            .statistics-date-clickable {
                cursor: pointer;
                user-select: none;
            }


            #statisticsPeriodLabel:hover,
            #statisticsDateLabel:hover,
            .statistics-date-clickable:hover {
                color: #2563eb;
            }


            /* Dark mode */

            .dark .statistics-date-picker,
            [data-theme="dark"] .statistics-date-picker,
            body.dark-mode .statistics-date-picker {
                background: #171a21;
                color: #f3f4f6;
                border-color: rgba(255,255,255,.08);
                box-shadow:
                    0 20px 60px rgba(0,0,0,.55);
            }


            .dark .statistics-date-picker-tabs,
            [data-theme="dark"] .statistics-date-picker-tabs,
            body.dark-mode .statistics-date-picker-tabs {
                background: rgba(255,255,255,.06);
            }


            .dark .statistics-date-picker-tab.active,
            [data-theme="dark"] .statistics-date-picker-tab.active,
            body.dark-mode .statistics-date-picker-tab.active {
                background: #252a34;
            }


            .dark .statistics-date-picker-close,
            [data-theme="dark"] .statistics-date-picker-close,
            body.dark-mode .statistics-date-picker-close {
                background: rgba(255,255,255,.08);
                color: #fff;
            }

        `;

        document.head.appendChild(style);

    }


    /* =====================================================
       STATE
    ===================================================== */

    let picker = null;

    let pickerView =
        "day";

    let pickerMonth =
        null;

    let pickerYear =
        null;


    /* =====================================================
       CREATE
    ===================================================== */

    function statisticsCreateDatePicker() {

        if (picker) {

            return picker;

        }

        picker =
            document.createElement("div");

        picker.id =
            "statisticsDatePicker";

        picker.className =
            "statistics-date-picker";

        picker.style.display =
            "none";

        document.body.appendChild(
            picker
        );

        return picker;

    }


    /* =====================================================
       FORMAT
    ===================================================== */

    function statisticsPickerMonthName(
        month
    ) {

        const names = [
            "Tháng 1",
            "Tháng 2",
            "Tháng 3",
            "Tháng 4",
            "Tháng 5",
            "Tháng 6",
            "Tháng 7",
            "Tháng 8",
            "Tháng 9",
            "Tháng 10",
            "Tháng 11",
            "Tháng 12"
        ];

        return names[month] || "";

    }


    /* =====================================================
       RENDER
    ===================================================== */

    function statisticsRenderDatePicker() {

        const box =
            statisticsCreateDatePicker();

        if (
            !pickerMonth &&
            pickerMonth !== 0
        ) {

            pickerMonth =
                AppState.statisticsDate.getMonth();

        }

        if (!pickerYear) {

            pickerYear =
                AppState.statisticsDate.getFullYear();

        }


        const selected =
            AppState.statisticsDate;


        const selectedDay =
            selected.getDate();

        const selectedMonth =
            selected.getMonth();

        const selectedYear =
            selected.getFullYear();


        let content = "";


        /* =================================================
           HEADER
        ================================================= */

        content += `

            <div class="
                statistics-date-picker-header
            ">

                <div class="
                    statistics-date-picker-title
                ">
                    Chọn thời gian
                </div>

                <button
                    type="button"
                    class="
                        statistics-date-picker-close
                    "
                    data-picker-action="close"
                >
                    ×
                </button>

            </div>

        `;


        /* =================================================
           TABS
        ================================================= */

        content += `

            <div class="
                statistics-date-picker-tabs
            ">

                <button
                    type="button"
                    class="
                        statistics-date-picker-tab
                        ${pickerView === "day"
                            ? "active"
                            : ""}
                    "
                    data-picker-view="day"
                >
                    Ngày
                </button>

                <button
                    type="button"
                    class="
                        statistics-date-picker-tab
                        ${pickerView === "month"
                            ? "active"
                            : ""}
                    "
                    data-picker-view="month"
                >
                    Tháng
                </button>

                <button
                    type="button"
                    class="
                        statistics-date-picker-tab
                        ${pickerView === "year"
                            ? "active"
                            : ""}
                    "
                    data-picker-view="year"
                >
                    Năm
                </button>

            </div>

        `;


        /* =================================================
           DAY
        ================================================= */

        if (
            pickerView === "day"
        ) {

            content += `

                <div class="
                    statistics-date-picker-nav
                ">

                    <button
                        type="button"
                        data-picker-action="prev-month"
                    >
                        ‹
                    </button>

                    <div class="
                        statistics-date-picker-current
                    ">
                        ${statisticsPickerMonthName(
                            pickerMonth
                        )}
                        ${pickerYear}
                    </div>

                    <button
                        type="button"
                        data-picker-action="next-month"
                    >
                        ›
                    </button>

                </div>

            `;


            const firstDay =
                new Date(
                    pickerYear,
                    pickerMonth,
                    1
                );


            /*
             * Monday = 0
             */

            let startDay =
                firstDay.getDay();

            startDay =
                startDay === 0
                    ? 6
                    : startDay - 1;


            const daysInMonth =
                new Date(
                    pickerYear,
                    pickerMonth + 1,
                    0
                ).getDate();


            const daysInPreviousMonth =
                new Date(
                    pickerYear,
                    pickerMonth,
                    0
                ).getDate();


            content += `

                <div class="
                    statistics-date-picker-grid
                ">

                    <div class="
                        statistics-date-picker-day-name
                    ">
                        T2
                    </div>

                    <div class="
                        statistics-date-picker-day-name
                    ">
                        T3
                    </div>

                    <div class="
                        statistics-date-picker-day-name
                    ">
                        T4
                    </div>

                    <div class="
                        statistics-date-picker-day-name
                    ">
                        T5
                    </div>

                    <div class="
                        statistics-date-picker-day-name
                    ">
                        T6
                    </div>

                    <div class="
                        statistics-date-picker-day-name
                    ">
                        T7
                    </div>

                    <div class="
                        statistics-date-picker-day-name
                    ">
                        CN
                    </div>

            `;


            /* Ngày tháng trước */

            for (
                let i = startDay - 1;
                i >= 0;
                i--
            ) {

                const day =
                    daysInPreviousMonth - i;

                content += `

                    <button
                        type="button"
                        class="
                            statistics-date-picker-cell
                            muted
                        "
                        disabled
                    >
                        ${day}
                    </button>

                `;

            }


            /* Ngày hiện tại */

            for (
                let day = 1;
                day <= daysInMonth;
                day++
            ) {

                const isSelected =
                    day === selectedDay &&
                    pickerMonth === selectedMonth &&
                    pickerYear === selectedYear;


                const now =
                    new Date();

                const isToday =
                    day === now.getDate() &&
                    pickerMonth === now.getMonth() &&
                    pickerYear === now.getFullYear();


                content += `

                    <button
                        type="button"
                        class="
                            statistics-date-picker-cell
                            ${isSelected
                                ? "selected"
                                : ""}
                            ${isToday
                                ? "today"
                                : ""}
                        "
                        data-picker-day="${day}"
                    >
                        ${day}
                    </button>

                `;

            }


            content += `

                </div>

            `;

        }


        /* =================================================
           MONTH
        ================================================= */

        if (
            pickerView === "month"
        ) {

            content += `

                <div class="
                    statistics-date-picker-nav
                ">

                    <button
                        type="button"
                        data-picker-action="prev-year"
                    >
                        ‹
                    </button>

                    <div class="
                        statistics-date-picker-current
                    ">
                        ${pickerYear}
                    </div>

                    <button
                        type="button"
                        data-picker-action="next-year"
                    >
                        ›
                    </button>

                </div>

            `;


            content += `

                <div
                    class="
                        statistics-date-picker-grid
                        year-grid
                    "
                >

            `;


            for (
                let month = 0;
                month < 12;
                month++
            ) {

                const isSelected =
                    month === selectedMonth &&
                    pickerYear === selectedYear;


                content += `

                    <button
                        type="button"
                        class="
                            statistics-date-picker-cell
                            ${isSelected
                                ? "selected"
                                : ""}
                        "
                        data-picker-month="${month}"
                    >
                        ${statisticsPickerMonthName(
                            month
                        ).replace(
                            "Tháng ",
                            "T"
                        )}
                    </button>

                `;

            }


            content += `

                </div>

            `;

        }


        /* =================================================
           YEAR
        ================================================= */

        if (
            pickerView === "year"
        ) {

            const startYear =
                Math.floor(
                    pickerYear / 12
                ) * 12;


            content += `

                <div class="
                    statistics-date-picker-nav
                ">

                    <button
                        type="button"
                        data-picker-action="prev-year-page"
                    >
                        ‹
                    </button>

                    <div class="
                        statistics-date-picker-current
                    ">
                        ${startYear}
                        -
                        ${startYear + 11}
                    </div>

                    <button
                        type="button"
                        data-picker-action="next-year-page"
                    >
                        ›
                    </button>

                </div>

            `;


            content += `

                <div
                    class="
                        statistics-date-picker-grid
                        year-grid
                    "
                >

            `;


            for (
                let year = startYear;
                year <= startYear + 11;
                year++
            ) {

                const isSelected =
                    year === selectedYear;


                content += `

                    <button
                        type="button"
                        class="
                            statistics-date-picker-cell
                            ${isSelected
                                ? "selected"
                                : ""}
                        "
                        data-picker-year="${year}"
                    >
                        ${year}
                    </button>

                `;

            }


            content += `

                </div>

            `;

        }


        /* =================================================
           FOOTER
        ================================================= */

        content += `

            <div class="
                statistics-date-picker-footer
            ">

                <button
                    type="button"
                    class="
                        statistics-date-picker-cancel
                    "
                    data-picker-action="close"
                >
                    Đóng
                </button>

                <button
                    type="button"
                    class="
                        statistics-date-picker-today
                    "
                    data-picker-action="today"
                >
                    Hôm nay
                </button>

            </div>

        `;


        box.innerHTML =
            content;


        statisticsPositionDatePicker();

    }


    /* =====================================================
       POSITION
    ===================================================== */

    function statisticsPositionDatePicker() {

        if (
            !picker ||
            picker.style.display === "none"
        ) {

            return;

        }


        const target =
            document.getElementById(
                "statisticsPeriodLabel"
            ) ||
            document.getElementById(
                "statisticsDateLabel"
            );


        if (!target) {

            picker.style.left =
                "50%";

            picker.style.top =
                "50%";

            picker.style.transform =
                "translate(-50%, -50%)";

            return;

        }


        const rect =
            target.getBoundingClientRect();


        picker.style.transform =
            "none";


        let left =
            rect.left +
            rect.width / 2 -
            160;


        let top =
            rect.bottom +
            10;


        const maxLeft =
            window.innerWidth -
            picker.offsetWidth -
            12;


        const maxTop =
            window.innerHeight -
            picker.offsetHeight -
            12;


        left =
            Math.max(
                12,
                Math.min(
                    left,
                    maxLeft
                )
            );


        if (
            top > maxTop
        ) {

            top =
                rect.top -
                picker.offsetHeight -
                10;

        }


        top =
            Math.max(
                12,
                top
            );


        picker.style.left =
            left + "px";

        picker.style.top =
            top + "px";

    }


    /* =====================================================
       OPEN
    ===================================================== */

    function statisticsOpenDatePicker() {

        statisticsInjectDatePickerCSS();

        statisticsCreateDatePicker();


        statisticsNormalizeDate();


        pickerMonth =
            AppState.statisticsDate.getMonth();


        pickerYear =
            AppState.statisticsDate.getFullYear();


        /*
         * Nếu đang xem tháng
         * thì mở tab tháng.
         */

        if (
            AppState.statisticsPeriod ===
            "month"
        ) {

            pickerView =
                "month";

        } else {

            pickerView =
                "day";

        }


        picker.style.display =
            "block";


        statisticsRenderDatePicker();


        setTimeout(
            () => {

                statisticsPositionDatePicker();

            },
            0
        );

    }


    /* =====================================================
       CLOSE
    ===================================================== */

    function statisticsCloseDatePicker() {

        if (!picker) {

            return;

        }


        picker.style.display =
            "none";

    }


    /* =====================================================
       SELECT DAY
    ===================================================== */

    function statisticsSelectDay(
        day
    ) {

        const safeDay =
            Math.min(
                Number(day),
                new Date(
                    pickerYear,
                    pickerMonth + 1,
                    0
                ).getDate()
            );


        AppState.statisticsDate =
            statisticsCreateLocalDate(
                pickerYear,
                pickerMonth,
                safeDay
            );


        /*
         * Chọn ngày => chế độ ngày
         */

        AppState.statisticsPeriod =
            "day";


        statisticsCloseDatePicker();

        renderStatistics();

    }


    /* =====================================================
       SELECT MONTH
    ===================================================== */

    function statisticsSelectMonth(
        month
    ) {

        pickerMonth =
            Number(month);


        /*
         * Đưa về ngày 1 để không lỗi
         * 29 / 30 / 31.
         */

        AppState.statisticsDate =
            statisticsCreateLocalDate(
                pickerYear,
                pickerMonth,
                1
            );


        AppState.statisticsPeriod =
            "month";


        statisticsCloseDatePicker();

        renderStatistics();

    }


    /* =====================================================
       SELECT YEAR
    ===================================================== */

    function statisticsSelectYear(
        year
    ) {

        pickerYear =
            Number(year);


        /*
         * Nếu đang chọn năm,
         * giữ tháng hiện tại.
         */

        AppState.statisticsDate =
            statisticsCreateLocalDate(
                pickerYear,
                pickerMonth,
                1
            );


        /*
         * Sau khi chọn năm,
         * chuyển sang chọn tháng.
         */

        pickerView =
            "month";


        statisticsRenderDatePicker();

    }


    /* =====================================================
       EVENTS PICKER
    ===================================================== */

    document.addEventListener(
        "click",
        function (event) {

            const target =
                event.target;


            if (
                target.closest(
                    "[data-picker-view]"
                )
            ) {

                const button =
                    target.closest(
                        "[data-picker-view]"
                    );


                pickerView =
                    button.dataset
                        .pickerView;


                statisticsRenderDatePicker();

                return;

            }


            if (
                target.closest(
                    "[data-picker-action]"
                )
            ) {

                const button =
                    target.closest(
                        "[data-picker-action]"
                    );


                const action =
                    button.dataset
                        .pickerAction;


                /* Đóng */

                if (
                    action === "close"
                ) {

                    statisticsCloseDatePicker();

                    return;

                }


                /* Hôm nay */

                if (
                    action === "today"
                ) {

                    statisticsToday();

                    statisticsCloseDatePicker();

                    return;

                }


                /* Tháng trước */

                if (
                    action === "prev-month"
                ) {

                    pickerMonth--;

                    if (
                        pickerMonth < 0
                    ) {

                        pickerMonth = 11;
                        pickerYear--;

                    }

                    statisticsRenderDatePicker();

                    return;

                }


                /* Tháng sau */

                if (
                    action === "next-month"
                ) {

                    pickerMonth++;

                    if (
                        pickerMonth > 11
                    ) {

                        pickerMonth = 0;
                        pickerYear++;

                    }

                    statisticsRenderDatePicker();

                    return;

                }


                /* Năm trước */

                if (
                    action === "prev-year"
                ) {

                    pickerYear--;

                    statisticsRenderDatePicker();

                    return;

                }


                /* Năm sau */

                if (
                    action === "next-year"
                ) {

                    pickerYear++;

                    statisticsRenderDatePicker();

                    return;

                }


                /* Trang năm trước */

                if (
                    action ===
                    "prev-year-page"
                ) {

                    pickerYear -= 12;

                    statisticsRenderDatePicker();

                    return;

                }


                /* Trang năm sau */

                if (
                    action ===
                    "next-year-page"
                ) {

                    pickerYear += 12;

                    statisticsRenderDatePicker();

                    return;

                }

            }


            /* Chọn ngày */

            const dayButton =
                target.closest(
                    "[data-picker-day]"
                );


            if (dayButton) {

                statisticsSelectDay(
                    dayButton.dataset
                        .pickerDay
                );

                return;

            }


            /* Chọn tháng */

            const monthButton =
                target.closest(
                    "[data-picker-month]"
                );


            if (monthButton) {

                statisticsSelectMonth(
                    monthButton.dataset
                        .pickerMonth
                );

                return;

            }


            /* Chọn năm */

            const yearButton =
                target.closest(
                    "[data-picker-year]"
                );


            if (yearButton) {

                statisticsSelectYear(
                    yearButton.dataset
                        .pickerYear
                );

                return;

            }


            /*
             * Click bên ngoài => đóng.
             */

            if (
                picker &&
                picker.style.display !== "none" &&
                !target.closest(
                    "#statisticsDatePicker"
                )
            ) {

                const periodLabel =
                    document.getElementById(
                        "statisticsPeriodLabel"
                    );


                const dateLabel =
                    document.getElementById(
                        "statisticsDateLabel"
                    );


                if (
                    target !== periodLabel &&
                    !periodLabel?.contains(target) &&
                    target !== dateLabel &&
                    !dateLabel?.contains(target)
                ) {

                    statisticsCloseDatePicker();

                }

            }

        }
    );


    /* =====================================================
       CLICK LABEL
    ===================================================== */

    document.addEventListener(
        "click",
        function (event) {

            const label =
                event.target.closest(
                    "#statisticsPeriodLabel, #statisticsDateLabel, .statistics-date-clickable"
                );


            if (!label) {

                return;

            }


            event.preventDefault();
            event.stopPropagation();


            statisticsOpenDatePicker();

        }
    );


    /* =====================================================
       RESIZE / SCROLL
    ===================================================== */

    window.addEventListener(
        "resize",
        function () {

            statisticsPositionDatePicker();

        }
    );


    window.addEventListener(
        "scroll",
        function () {

            statisticsPositionDatePicker();

        },
        true
    );


    /* =====================================================
       PUBLIC
    ===================================================== */

    window.statisticsOpenDatePicker =
        statisticsOpenDatePicker;

    window.statisticsCloseDatePicker =
        statisticsCloseDatePicker;

})();
