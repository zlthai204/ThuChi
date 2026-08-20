/* =========================================================
   STATISTICS
   THỐNG KÊ THU / CHI
========================================================= */


/* =========================================================
   STATE
========================================================= */

if (!AppState.statisticsMode) {

    AppState.statisticsMode = "thu";

}


/* =========================================================
   SET MODE
   thu = doanh thu
   chi = chi phí
========================================================= */

function setStatisticsMode(mode) {

    AppState.statisticsMode = mode;


    document
        .querySelectorAll(".statistics-mode-button")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.mode === mode
            );

        });


    renderStatistics();

}


/* =========================================================
   SET PERIOD
========================================================= */

function setStatisticsPeriod(period) {

    AppState.statisticsPeriod =
        period;


    document
        .querySelectorAll(".period-tab")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.period === period
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
            ? new Date(AppState.statisticsDate)
            : new Date();


    let start;
    let end;


    /* =========================
       DAY
    ========================= */

    if (
        AppState.statisticsPeriod === "day"
    ) {

        start =
            new Date(baseDate);

        end =
            new Date(baseDate);

    }


    /* =========================
       WEEK
    ========================= */

    else if (
        AppState.statisticsPeriod === "week"
    ) {

        const day =
            baseDate.getDay();


        const diff =
            day === 0
                ? -6
                : 1 - day;


        start =
            new Date(baseDate);


        start.setDate(
            baseDate.getDate() + diff
        );


        end =
            new Date(start);


        end.setDate(
            start.getDate() + 6
        );

    }


    /* =========================
       MONTH
    ========================= */

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
            getLocalDateString(start),

        end:
            getLocalDateString(end)

    };

}


/* =========================================================
   GET TRANSACTIONS IN PERIOD
========================================================= */

function getStatisticsTransactions() {

    const range =
        getStatisticsRange();


    if (
        !Array.isArray(
            AppState.transactions
        )
    ) {

        return [];

    }


    return AppState.transactions.filter(
        transaction => {

            if (!transaction.date) {

                return false;

            }


            const date =
                String(
                    transaction.date
                ).substring(
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
   RENDER STATISTICS
========================================================= */

function renderStatistics() {

    const transactions =
        getStatisticsTransactions();


    const income =
        transactions.filter(
            transaction =>
                transaction.type === "thu"
        );


    const expenses =
        transactions.filter(
            transaction =>
                transaction.type === "chi"
        );


    /* =====================================================
       INCOME
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


    const appFee =
        income.reduce(
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


    const codCost =
        income.reduce(
            (
                sum,
                transaction
            ) => {

                return (
                    sum +
                    getTransactionDishCost(
                        transaction
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
       PROFIT
    ===================================================== */

    const profit =
        revenue -
        appFee -
        codCost -
        expense;


    /* =====================================================
       MODE
    ===================================================== */

    if (
        AppState.statisticsMode === "chi"
    ) {

        renderExpenseStatistics(
            expenses
        );

    }

    else {

        renderIncomeStatistics(
            income,
            revenue,
            appFee,
            codCost,
            profit
        );

    }


    /* =====================================================
       COMMON
    ===================================================== */

    renderStatisticsPeriodLabel();

    renderStatisticsChart(
        transactions
    );

}


/* =========================================================
   INCOME STATISTICS
========================================================= */

function renderIncomeStatistics(
    transactions,
    revenue,
    appFee,
    codCost,
    profit
) {

    setText(
        "statisticsProfit",
        formatMoney(profit)
    );


    setText(
        "statisticsRevenue",
        formatMoney(revenue)
    );


    setText(
        "statisticsCOD",
        formatMoney(codCost)
    );


    setText(
        "statisticsExpense",
        formatMoney(
            transactions.length
                ? 0
                : 0
        )
    );


    const shopeeFee =
        transactions
            .filter(
                transaction =>
                    transaction.source ===
                    "ShopeeFood"
            )
            .reduce(
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


    const grabFee =
        transactions
            .filter(
                transaction =>
                    transaction.source ===
                    "GrabFood"
            )
            .reduce(
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


    setText(
        "statisticsShopeeFee",
        formatMoney(shopeeFee)
    );


    setText(
        "statisticsGrabFee",
        formatMoney(grabFee)
    );


    renderStatisticsDishes(
        transactions
    );


    renderStatisticsSources(
        transactions
    );

}


/* =========================================================
   EXPENSE STATISTICS
========================================================= */

function renderExpenseStatistics(
    transactions
) {

    const totalExpense =
        transactions.reduce(
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


    const expenseCount =
        transactions.length;


    /* =====================================================
       HEADER
    ===================================================== */

    setText(
        "statisticsProfit",
        formatMoney(
            -totalExpense
        )
    );


    setText(
        "statisticsRevenue",
        formatMoney(0)
    );


    setText(
        "statisticsCOD",
        formatMoney(0)
    );


    setText(
        "statisticsExpense",
        formatMoney(
            totalExpense
        )
    );


    setText(
        "statisticsShopeeFee",
        formatMoney(0)
    );


    setText(
        "statisticsGrabFee",
        formatMoney(0)
    );


    /* =====================================================
       CHI TIẾT KHOẢN CHI
    ===================================================== */

    renderExpenseDetails(
        transactions
    );


    /* =====================================================
       THEO NGUỒN
       Không áp dụng cho chi
    ===================================================== */

    renderExpenseSources(
        transactions
    );

}


/* =========================================================
   EXPENSE DETAILS
========================================================= */

function renderExpenseDetails(
    transactions
) {

    const container =
        document.getElementById(
            "statisticsDishList"
        );


    if (!container) {

        return;

    }


    container.innerHTML = "";


    if (!transactions.length) {

        container.innerHTML = `
            <div class="statistics-empty">
                Chưa có khoản chi trong thời gian này.
            </div>
        `;

        return;

    }


    const map = {};


    transactions.forEach(
        transaction => {

            const name =
                transaction.dish_name ||
                transaction.category_name ||
                transaction.note ||
                "Khoản chi";


            if (!map[name]) {

                map[name] = {

                    quantity: 0,

                    amount: 0,

                    category:
                        transaction.category_name ||
                        "",

                    note:
                        transaction.note ||
                        ""

                };

            }


            map[name].quantity += 1;


            map[name].amount +=
                toNumber(
                    transaction.amount
                );

        }
    );


    Object.entries(map)
        .sort(
            (
                [, a],
                [, b]
            ) =>
                b.amount -
                a.amount
        )
        .forEach(
            (
                [name, item]
            ) => {

                container.innerHTML += `

                    <div class="statistics-dish-row expense-stat-row">

                        <div class="statistics-dish-top">

                            <span class="statistics-dish-name">

                                🔴
                                ${escapeHTML(name)}

                            </span>

                            <strong
                                class="
                                    statistics-dish-profit
                                    red-text
                                ">

                                -${formatMoney(
                                    item.amount
                                )}

                            </strong>

                        </div>


                        <div class="statistics-dish-detail">

                            <span>
                                ${item.quantity} khoản
                            </span>


                            ${
                                item.category
                                    ? `
                                    <span>
                                        Danh mục:
                                        ${escapeHTML(
                                            item.category
                                        )}
                                    </span>
                                    `
                                    : ""
                            }


                            ${
                                item.note
                                    ? `
                                    <span>
                                        ${escapeHTML(
                                            item.note
                                        )}
                                    </span>
                                    `
                                    : ""
                            }

                        </div>

                    </div>

                `;

            }
        );

}


/* =========================================================
   INCOME DISHES
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


    container.innerHTML = "";


    if (!transactions.length) {

        container.innerHTML = `
            <div class="statistics-empty">
                Chưa có đơn hàng trong thời gian này.
            </div>
        `;

        return;

    }


    const map = {};


    transactions.forEach(
        transaction => {

            const name =
                transaction.dish_name ||
                "Không tên";


            if (!map[name]) {

                map[name] = {

                    quantity: 0,

                    revenue: 0,

                    fee: 0,

                    cost: 0

                };

            }


            map[name].quantity += 1;


            map[name].revenue +=
                toNumber(
                    transaction.amount
                );


            map[name].fee +=
                toNumber(
                    transaction.app_fee
                );


            map[name].cost +=
                getTransactionDishCost(
                    transaction
                );

        }
    );


    Object.entries(map)
        .sort(
            (
                [, a],
                [, b]
            ) =>
                b.revenue -
                a.revenue
        )
        .forEach(
            (
                [name, item]
            ) => {

                const itemProfit =
                    item.revenue -
                    item.fee -
                    item.cost;


                container.innerHTML += `

                    <div class="statistics-dish-row">

                        <div class="statistics-dish-top">

                            <span class="statistics-dish-name">

                                🟢
                                ${escapeHTML(name)}

                            </span>


                            <strong
                                class="
                                    statistics-dish-profit
                                    green-text
                                ">

                                ${formatMoney(
                                    itemProfit
                                )}

                            </strong>

                        </div>


                        <div class="statistics-dish-detail">

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
   SOURCE - INCOME
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
        "ShopeeFood",
        "GrabFood",
        "Ngoài sàn"
    ];


    container.innerHTML = "";


    sources.forEach(
        source => {

            const items =
                transactions.filter(
                    transaction =>
                        transaction.source ===
                        source
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

                <div class="statistics-source-row">

                    <strong>
                        ${escapeHTML(source)}
                    </strong>


                    <div class="statistics-source-money">

                        Doanh thu:
                        ${formatMoney(revenue)}

                        <br>

                        Khấu trừ:
                        ${formatMoney(fee)}

                    </div>

                </div>

            `;

        }
    );

}


/* =========================================================
   SOURCE - EXPENSE
========================================================= */

function renderExpenseSources(
    transactions
) {

    const container =
        document.getElementById(
            "statisticsSourceList"
        );


    if (!container) {

        return;

    }


    container.innerHTML = "";


    if (!transactions.length) {

        container.innerHTML = `
            <div class="statistics-empty">
                Chưa có khoản chi.
            </div>
        `;

        return;

    }


    const map = {};


    transactions.forEach(
        transaction => {

            const category =
                transaction.category_name ||
                "Khác";


            if (!map[category]) {

                map[category] = {

                    amount: 0,

                    count: 0

                };

            }


            map[category].amount +=
                toNumber(
                    transaction.amount
                );


            map[category].count += 1;

        }
    );


    Object.entries(map)
        .sort(
            (
                [, a],
                [, b]
            ) =>
                b.amount -
                a.amount
        )
        .forEach(
            (
                [category, item]
            ) => {

                container.innerHTML += `

                    <div class="statistics-source-row">

                        <strong>

                            🔴
                            ${escapeHTML(
                                category
                            )}

                        </strong>


                        <div
                            class="
                                statistics-source-money
                                red-text
                            ">

                            ${item.count} khoản

                            <br>

                            Tổng chi:
                            ${formatMoney(
                                item.amount
                            )}

                        </div>

                    </div>

                `;

            }
        );

}


/* =========================================================
   PERIOD NAVIGATION
========================================================= */

function statisticsPrevious() {

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


function statisticsNext() {

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

function renderStatisticsPeriodLabel() {

    const label =
        getPeriodLabel();


    setText(
        "statisticsPeriodLabel",
        label
    );

}


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


    if (!transactions.length) {

        chart.innerHTML = `
            <div class="empty-chart">
                Chưa có dữ liệu để hiển thị
            </div>
        `;

        return;

    }


    const daily = {};


    transactions.forEach(
        transaction => {

            if (!transaction.date) {

                return;

            }


            const date =
                String(
                    transaction.date
                ).substring(
                    0,
                    10
                );


            if (!daily[date]) {

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


    if (!dates.length) {

        chart.innerHTML = `
            <div class="empty-chart">
                Chưa có dữ liệu
            </div>
        `;

        return;

    }


    const mode =
        AppState.statisticsMode;


    const maxValue =
        Math.max(
            ...dates.map(
                date =>
                    mode === "thu"
                        ? daily[date].thu
                        : daily[date].chi
            ),
            1
        );


    dates.forEach(
        date => {

            const data =
                daily[date];


            const value =
                mode === "thu"
                    ? data.thu
                    : data.chi;


            const percent =
                (
                    value /
                    maxValue
                ) * 100;


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
                            ${
                                mode === "thu"
                                    ? "income"
                                    : "expense"
                            }
                        "
                        style="
                            height:${Math.max(
                                percent,
                                3
                            )}%;
                        "
                        title="${
                            mode === "thu"
                                ? "Thu"
                                : "Chi"
                        }: ${formatMoney(value)}">

                    </div>

                </div>


                <div class="chart-date">
                    ${label}
                </div>

            `;


            chart.appendChild(
                item
            );

        }
    );

}


/* =========================================================
   REFRESH AFTER TRANSACTION
========================================================= */

function refreshStatistics() {

    renderStatistics();

}


/* =========================================================
   INITIAL MODE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        AppState.statisticsMode =
            "thu";


        document
            .querySelectorAll(
                ".statistics-mode-button"
            )
            .forEach(
                button => {

                    button.classList.toggle(
                        "active",
                        button.dataset.mode ===
                        "thu"
                    );

                }
            );

    }
);
