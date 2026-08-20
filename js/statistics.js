/* =========================================================
   STATISTICS.JS
   PREMIUM FULL VERSION

   FEATURES
   ---------------------------------------------------------
   ✓ Thu + Chi cùng lúc
   ✓ Không còn vòng lặp renderStatistics
   ✓ Không còn setStatisticsMode -> renderStatistics loop
   ✓ Biểu đồ Thu / Chi
   ✓ Bánh xe tổng Thu / Chi
   ✓ Bánh xe % từng món Thu
   ✓ Bánh xe % từng nhóm Chi
   ✓ Phân tích chi phí
   ✓ Lợi nhuận thực
   ✓ Tương thích HTML cũ
========================================================= */


/* =========================================================
   STATE
========================================================= */

if (!AppState.statisticsPeriod) {

    AppState.statisticsPeriod = "day";

}


if (!(AppState.statisticsDate instanceof Date)) {

    AppState.statisticsDate = new Date();

}


/* =========================================================
   SET MODE
   ---------------------------------------------------------
   Giữ lại để HTML cũ không lỗi.
   Tuyệt đối KHÔNG render tại đây.
========================================================= */

function setStatisticsMode(mode) {

    AppState.statisticsMode =
        mode === "chi"
            ? "chi"
            : "thu";

}


/* =========================================================
   PERIOD
========================================================= */

function setStatisticsPeriod(period) {

    if (
        ![
            "day",
            "week",
            "month"
        ].includes(period)
    ) {

        period = "day";

    }


    AppState.statisticsPeriod =
        period;


    document
        .querySelectorAll(".period-tab")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.period ===
                period
            );

        });


    renderStatistics();

}


/* =========================================================
   DATE RANGE
========================================================= */

function getStatisticsRange() {

    const baseDate =
        AppState.statisticsDate instanceof Date
            ? new Date(
                AppState.statisticsDate
            )
            : new Date();


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
            new Date(
                baseDate
            );


        end =
            new Date(
                baseDate
            );

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


        const diff =
            day === 0
                ? -6
                : 1 - day;


        start =
            new Date(
                baseDate
            );


        start.setDate(
            baseDate.getDate() +
            diff
        );


        end =
            new Date(
                start
            );


        end.setDate(
            start.getDate() +
            6
        );

    }


    /* =====================================================
       MONTH
    ===================================================== */

    else {

        start =
            new Date(
                baseDate.getFullYear(),
                baseDate.getMonth(),
                1
            );


        end =
            new Date(
                baseDate.getFullYear(),
                baseDate.getMonth() + 1,
                0
            );

    }


    return {

        start:
            getLocalDateString(
                start
            ),

        end:
            getLocalDateString(
                end
            )

    };

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

            if (
                !transaction ||
                !transaction.date
            ) {

                return false;

            }


            const date =
                String(
                    transaction.date
                ).slice(
                    0,
                    10
                );


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

function statisticsSafeText(value) {

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

function statisticsEscapeHTML(value) {

    const text =
        statisticsSafeText(
            value
        );


    /*
     * Nếu project đã có escapeHTML
     * thì dùng nó.
     */

    if (
        typeof escapeHTML ===
        "function"
    ) {

        try {

            return escapeHTML(
                text
            );

        } catch (error) {

            /*
             * Không để lỗi escapeHTML
             * phá toàn bộ thống kê.
             */

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
   MAIN RENDER
========================================================= */

function renderStatistics() {

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


    /* =====================================================
       REVENUE
    ===================================================== */

    const revenue =
        income.reduce(
            (
                sum,
                transaction
            ) => {

                return (
                    sum +
                    toNumber(
                        transaction.amount
                    )
                );

            },
            0
        );


    /* =====================================================
       EXPENSE
    ===================================================== */

    const expense =
        expenses.reduce(
            (
                sum,
                transaction
            ) => {

                return (
                    sum +
                    toNumber(
                        transaction.amount
                    )
                );

            },
            0
        );


    /* =====================================================
       SHOPEE FEE
    ===================================================== */

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
                        toNumber(
                            transaction.app_fee
                        )
                    );

                },
                0
            );


    /* =====================================================
       GRAB FEE
    ===================================================== */

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
                        toNumber(
                            transaction.app_fee
                        )
                    );

                },
                0
            );


    /* =====================================================
       COD
    ===================================================== */

    const codCost =
        calculatePeriodCODCost(
            income
        );


    /* =====================================================
       PROFIT
    ===================================================== */

    const profit =
        revenue -
        codCost -
        expense -
        shopeeFee -
        grabFee;


    /* =====================================================
       UPDATE MAIN UI
    ===================================================== */

    setText(
        "statisticsRevenue",
        formatMoney(
            revenue
        )
    );


    setText(
        "statisticsCOD",
        formatMoney(
            codCost
        )
    );


    setText(
        "statisticsExpense",
        formatMoney(
            expense
        )
    );


    setText(
        "statisticsShopeeFee",
        formatMoney(
            shopeeFee
        )
    );


    setText(
        "statisticsGrabFee",
        formatMoney(
            grabFee
        )
    );


    setText(
        "statisticsProfit",
        formatMoney(
            profit
        )
    );


    /* =====================================================
       CHI
    ===================================================== */

    renderStatisticsExpenses(
        expenses
    );


    /* =====================================================
       MÓN THU
    ===================================================== */

    renderStatisticsDishes(
        income
    );


    /* =====================================================
       NGUỒN
    ===================================================== */

    renderStatisticsSources(
        income
    );


    /* =====================================================
       BIỂU ĐỒ
    ===================================================== */

    renderStatisticsChart(
        transactions
    );


    /* =====================================================
       BÁNH XE TỔNG + CHI TIẾT
    ===================================================== */

    renderStatisticsPercentWheel(
        revenue,
        expense,
        income,
        expenses
    );


    /* =====================================================
       LABEL
    ===================================================== */

    setText(
        "statisticsPeriodLabel",
        getPeriodLabel()
    );


    /* =====================================================
       PERIOD TAB
    ===================================================== */

    document
        .querySelectorAll(".period-tab")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.period ===
                AppState.statisticsPeriod
            );

        });


    /*
     * Ẩn tab Thu / Chi cũ.
     */

    hideOldStatisticsModeTabs();

}


/* =========================================================
   HIDE OLD THU / CHI TABS
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


    /*
     * Không ép incomeView / expenseView
     * vì HTML mới có thể dùng chung.
     */

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

            try {

                if (
                    typeof getTransactionDishCost ===
                    "function"
                ) {

                    total +=
                        toNumber(
                            getTransactionDishCost(
                                transaction
                            )
                        );

                }

            } catch (error) {

                /*
                 * Bỏ qua transaction lỗi.
                 */

            }

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


    if (
        !Array.isArray(
            transactions
        )
    ) {

        transactions = [];

    }


    transactions.forEach(
        transaction => {

            if (!transaction) {

                return;

            }


            const rawName =
                transaction.dish_name ||
                transaction.name ||
                "Không tên";


            const name =
                statisticsSafeText(
                    rawName
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
                toNumber(
                    transaction.amount
                );


            map[name].fee +=
                toNumber(
                    transaction.app_fee
                );


            try {

                map[name].cost +=
                    toNumber(
                        getTransactionDishCost(
                            transaction
                        )
                    );

            } catch (error) {

                map[name].cost += 0;

            }

        }
    );


    container.innerHTML = "";


    const entries =
        Object.entries(
            map
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


    entries
        .sort(
            (
                a,
                b
            ) =>
                b[1].revenue -
                a[1].revenue
        )
        .forEach(
            (
                [name, item]
            ) => {

                const profit =
                    item.revenue -
                    item.fee -
                    item.cost;


                container.innerHTML += `

                    <div class="
                        statistics-dish-row
                    ">

                        <div class="
                            statistics-dish-top
                        ">

                            <span class="
                                statistics-dish-name
                            ">

                                <span class="
                                    statistics-dish-icon
                                ">
                                    🍜
                                </span>

                                ${statisticsEscapeHTML(
                                    name
                                )}

                            </span>


                            <strong class="
                                statistics-dish-profit
                            ">

                                ${formatMoney(
                                    profit
                                )}

                            </strong>

                        </div>


                        <div class="
                            statistics-dish-detail
                        ">

                            <span>
                                ${item.quantity} đơn
                            </span>

                            <span>
                                Doanh thu:
                                ${formatMoney(
                                    item.revenue
                                )}
                            </span>

                            <span>
                                Vốn:
                                ${formatMoney(
                                    item.cost
                                )}
                            </span>

                            <span>
                                App:
                                ${formatMoney(
                                    item.fee
                                )}
                            </span>

                        </div>

                    </div>

                `;

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
                transactions.filter(
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
                        toNumber(
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
                        toNumber(
                            transaction.app_fee
                        ),
                    0
                );


            container.innerHTML += `

                <div class="
                    statistics-source-row
                ">

                    <div class="
                        statistics-source-left
                    ">

                        <span class="
                            statistics-source-icon
                        ">
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


                    <div class="
                        statistics-source-money
                    ">

                        <strong>
                            ${formatMoney(
                                revenue
                            )}
                        </strong>

                        <small>
                            Phí:
                            ${formatMoney(
                                fee
                            )}
                        </small>

                    </div>

                </div>

            `;

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
                toNumber(
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


    setText(
        "statisticsTotalExpense",
        formatMoney(
            total
        )
    );


    setText(
        "statisticsExpenseAmount",
        formatMoney(
            total
        )
    );


    setText(
        "statisticsExpenseCount",
        count
    );


    setText(
        "statisticsExpenseAverage",
        formatMoney(
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


            if (
                !map[category]
            ) {

                map[category] =
                    0;

            }


            map[category] +=
                toNumber(
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


            container.innerHTML += `

                <div class="
                    statistics-expense-category-row
                ">

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

                            ${formatMoney(
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
                            ">
                        </span>

                    </div>


                    <div class="
                        statistics-expense-category-percent
                    ">

                        ${percent.toFixed(
                            1
                        )}%

                    </div>

                </div>

            `;

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
        [...expenses].sort(
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


            container.innerHTML += `

                <div class="
                    statistics-expense-row
                ">

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

                            ${formatVietnameseDate(
                                transaction.date
                            )}

                        </div>

                    </div>


                    <div class="
                        statistics-expense-money
                    ">

                        -
                        ${formatMoney(
                            transaction.amount
                        )}

                    </div>

                </div>

            `;

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

                Chưa có dữ liệu để hiển thị

            </div>

        `;

        return;

    }


    const daily = {};


    transactions.forEach(
        transaction => {

            if (
                !transaction ||
                !transaction.date
            ) {

                return;

            }


            const date =
                String(
                    transaction.date
                )
                    .slice(
                        0,
                        10
                    );


            if (
                !daily[date]
            ) {

                daily[date] = {

                    thu: 0,

                    chi: 0

                };

            }


            const amount =
                toNumber(
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
        ).sort();


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


    /* =====================================================
       LEGEND
    ===================================================== */

    const legend =
        document.createElement(
            "div"
        );


    legend.className =
        "statistics-chart-legend";


    legend.innerHTML = `

        <span>

            <i class="
                legend-dot
                income
            "></i>

            Thu

        </span>


        <span>

            <i class="
                legend-dot
                expense
            "></i>

            Chi

        </span>

    `;


    chart.appendChild(
        legend
    );


    /* =====================================================
       BODY
    ===================================================== */

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


            const thuHeight =
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


            const chiHeight =
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
                new Date(
                    date +
                    "T00:00:00"
                );


            const label =
                dateObject.getDate() +
                "/" +
                (
                    dateObject.getMonth() +
                    1
                );


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
                            height:${thuHeight}px;
                        "
                        title="Thu: ${formatMoney(
                            data.thu
                        )}">
                    </div>


                    <div
                        class="
                            chart-bar
                            expense
                        "
                        style="
                            height:${chiHeight}px;
                        "
                        title="Chi: ${formatMoney(
                            data.chi
                        )}">
                    </div>

                </div>


                <div class="chart-date">

                    ${label}

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
   CREATE DONUT HTML
========================================================= */

function statisticsCreateDonut(
    percent,
    type,
    sizeClass = ""
) {

    const safePercent =
        Math.min(
            Math.max(
                Number(percent) || 0,
                0
            ),
            100
        );


    return `

        <div
            class="
                ${sizeClass}
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
                    ${safePercent.toFixed(0)}%
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
    income = [],
    expenses = []
) {

    let section =
        document.getElementById(
            "statisticsPercentWheel"
        );


    /*
     * Tự tạo nếu HTML chưa có.
     */

    if (!section) {

        const statisticsPage =
            document.getElementById(
                "statisticsPage"
            );


        if (!statisticsPage) {

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


        statisticsPage.appendChild(
            section
        );

    }


    /* =====================================================
       TOTAL
    ===================================================== */

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
       GROUP MÓN THU
    ===================================================== */

    const dishMap = {};


    if (
        Array.isArray(
            income
        )
    ) {

        income.forEach(
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
                    toNumber(
                        transaction.amount
                    );


                dishMap[name].quantity +=
                    1;

            }
        );

    }


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
       GROUP CHI
    ===================================================== */

    const expenseMap = {};


    if (
        Array.isArray(
            expenses
        )
    ) {

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


                if (
                    !expenseMap[category]
                ) {

                    expenseMap[category] =
                        0;

                }


                expenseMap[category] +=
                    toNumber(
                        transaction.amount
                    );

            }
        );

    }


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


    /* =====================================================
       TOP 8
    ===================================================== */

    const topDishes =
        dishes.slice(
            0,
            8
        );


    const topExpenseCategories =
        expenseCategories.slice(
            0,
            8
        );


    /* =====================================================
       BUILD DISH HTML
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

                                ${formatMoney(
                                    item.revenue
                                )}

                            </div>


                            <div style="
                                margin-top:3px;
                                color:#9aa3b2;
                                font-size:9px;
                                font-weight:700;
                            ">

                                ${item.quantity}
                                đơn

                            </div>

                        </div>

                    </div>

                `;

            }
        );

    }


    else {

        dishesHTML = `

            <div class="
                statistics-empty
            ">

                <div class="
                    statistics-empty-icon
                ">
                    🍜
                </div>

                <strong>
                    Chưa có món thu
                </strong>

            </div>

        `;

    }


    /* =====================================================
       BUILD EXPENSE HTML
    ===================================================== */

    let expenseHTML = "";


    if (
        topExpenseCategories.length
    ) {

        topExpenseCategories.forEach(
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

                                ${formatMoney(
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

            <div class="
                statistics-empty
            ">

                <div class="
                    statistics-empty-icon
                ">
                    💸
                </div>

                <strong>
                    Chưa có khoản chi
                </strong>

            </div>

        `;

    }


    /* =====================================================
       RENDER
    ===================================================== */

    section.innerHTML = `

        <div class="
            statistics-wheel-heading
        ">

            <div>

                <span>
                    TỶ TRỌNG
                </span>

                <h2>
                    🥧 Thu / Chi
                </h2>

            </div>


            <small>
                Tổng:
                ${formatMoney(
                    total
                )}
            </small>

        </div>


        <!-- ================================================
             TỔNG THU CHI
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
                            ${incomePercent.toFixed(0)}%
                        </strong>

                        <span>
                            Thu
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
                        ${formatMoney(
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
                            ${expensePercent.toFixed(0)}%
                        </strong>

                        <span>
                            Chi
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
                        ${formatMoney(
                            expense
                        )}
                    </span>

                </div>

            </div>

        </div>


        <!-- ================================================
             CHI TIẾT MÓN THU
        ================================================= -->

        <div class="
            statistics-detail-wheel-section
        ">

            <div class="
                statistics-detail-wheel-title
            ">

                <strong>
                    🍜 Tỷ trọng từng món
                </strong>

                <span>
                    % trên tổng thu
                </span>

            </div>


            <div class="
                statistics-detail-wheel-grid
            ">

                ${dishesHTML}

            </div>

        </div>


        <!-- ================================================
             PHÂN TÍCH CHI PHÍ
        ================================================= -->

        <div class="
            statistics-expense-analysis
        ">

            <div class="
                statistics-expense-analysis-title
            ">

                <div class="
                    statistics-expense-analysis-icon
                ">
                    🔴
                </div>


                <div>

                    <strong>
                        Phân tích chi phí
                    </strong>

                    <small>
                        Tỷ trọng từng nhóm chi
                    </small>

                </div>

            </div>


            ${topExpenseCategories
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

                                        📁
                                        ${statisticsEscapeHTML(
                                            name
                                        )}

                                    </span>


                                    <strong class="
                                        statistics-expense-analysis-money
                                    ">

                                        ${formatMoney(
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
                .join("")}

            ${
                !topExpenseCategories.length
                    ? `
                        <div class="
                            statistics-empty
                        ">

                            <div class="
                                statistics-empty-icon
                            ">
                                💸
                            </div>

                            <strong>
                                Chưa có dữ liệu chi
                            </strong>

                        </div>
                    `
                    : ""
            }

        </div>


        <!-- ================================================
             BÁNH XE CHI TIẾT NHÓM CHI
        ================================================= -->

        <div class="
            statistics-detail-wheel-section
        ">

            <div class="
                statistics-detail-wheel-title
            ">

                <strong>
                    💸 Tỷ trọng từng khoản chi
                </strong>

                <span>
                    % trên tổng chi
                </span>

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
========================================================= */

function statisticsPrevious() {

    if (
        !(AppState.statisticsDate instanceof Date)
    ) {

        AppState.statisticsDate =
            new Date();

    }


    if (
        AppState.statisticsPeriod ===
        "day"
    ) {

        AppState.statisticsDate.setDate(
            AppState.statisticsDate.getDate() -
            1
        );

    }


    else if (
        AppState.statisticsPeriod ===
        "week"
    ) {

        AppState.statisticsDate.setDate(
            AppState.statisticsDate.getDate() -
            7
        );

    }


    else {

        AppState.statisticsDate.setMonth(
            AppState.statisticsDate.getMonth() -
            1
        );

    }


    renderStatistics();

}


/* =========================================================
   NEXT
========================================================= */

function statisticsNext() {

    if (
        !(AppState.statisticsDate instanceof Date)
    ) {

        AppState.statisticsDate =
            new Date();

    }


    if (
        AppState.statisticsPeriod ===
        "day"
    ) {

        AppState.statisticsDate.setDate(
            AppState.statisticsDate.getDate() +
            1
        );

    }


    else if (
        AppState.statisticsPeriod ===
        "week"
    ) {

        AppState.statisticsDate.setDate(
            AppState.statisticsDate.getDate() +
            7
        );

    }


    else {

        AppState.statisticsDate.setMonth(
            AppState.statisticsDate.getMonth() +
            1
        );

    }


    renderStatistics();

}


/* =========================================================
   PERIOD LABEL
========================================================= */

function getPeriodLabel() {

    const range =
        getStatisticsRange();


    if (
        AppState.statisticsPeriod ===
        "day"
    ) {

        return formatVietnameseDate(
            range.start
        );

    }


    return (
        formatVietnameseDate(
            range.start
        ) +
        " - " +
        formatVietnameseDate(
            range.end
        )
    );

}


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        hideOldStatisticsModeTabs();


        /*
         * Render sau khi toàn bộ HTML đã có.
         */

        setTimeout(
            () => {

                try {

                    renderStatistics();

                } catch (error) {

                    console.error(
                        "Statistics render error:",
                        error
                    );

                }

            },
            0
        );

    }
);
