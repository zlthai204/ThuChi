/* =========================================================
   STATISTICS STATE
========================================================= */

function setStatisticsMode(mode) {

    AppState.statisticsMode =
        mode === "chi"
            ? "chi"
            : "thu";


    const incomeTab =
        document.getElementById(
            "statisticsIncomeTab"
        );


    const expenseTab =
        document.getElementById(
            "statisticsExpenseTab"
        );


    if (incomeTab) {

        incomeTab.classList.toggle(
            "active",
            AppState.statisticsMode === "thu"
        );

    }


    if (expenseTab) {

        expenseTab.classList.toggle(
            "active",
            AppState.statisticsMode === "chi"
        );

    }


    const incomeView =
        document.getElementById(
            "statisticsIncomeView"
        );


    const expenseView =
        document.getElementById(
            "statisticsExpenseView"
        );


    if (incomeView) {

        incomeView.style.display =
            AppState.statisticsMode === "thu"
                ? "block"
                : "none";

    }


    if (expenseView) {

        expenseView.style.display =
            AppState.statisticsMode === "chi"
                ? "block"
                : "none";

    }


    renderStatistics();

}


/* =========================================================
   PERIOD
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
            ? new Date(
                AppState.statisticsDate
            )
            : new Date();


    let start;
    let end;


    /*
     * NGÀY
     */

    if (
        AppState.statisticsPeriod === "day"
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


    /*
     * TUẦN
     */

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
            new Date(
                baseDate
            );


        start.setDate(
            baseDate.getDate() + diff
        );


        end =
            new Date(
                start
            );


        end.setDate(
            start.getDate() + 6
        );

    }


    /*
     * THÁNG
     */

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

            if (!transaction.date) {

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
   MAIN RENDER
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


    /*
     * THU
     */

    const revenue =
        income.reduce(
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


    const expense =
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
                ) =>
                    sum +
                    toNumber(
                        transaction.app_fee
                    ),
                0
            );


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
                ) =>
                    sum +
                    toNumber(
                        transaction.app_fee
                    ),
                0
            );


    const codCost =
        calculatePeriodCODCost(
            income
        );


    const profit =
        revenue -
        codCost -
        expense -
        shopeeFee -
        grabFee;


    /*
     * THU UI
     */

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


    /*
     * CHI UI
     */

    renderStatisticsExpenses(
        expenses
    );


    /*
     * CHI TIẾT THU
     */

    renderStatisticsDishes(
        income
    );


    renderStatisticsSources(
        income
    );


    /*
     * BIỂU ĐỒ
     */

    renderStatisticsChart(
        transactions
    );


    /*
     * LABEL
     */

    setText(
        "statisticsPeriodLabel",
        getPeriodLabel()
    );


    /*
     * Đảm bảo tab đúng
     */

    setStatisticsMode(
        AppState.statisticsMode || "thu"
    );

}


/* =========================================================
   COD COST
========================================================= */

function calculatePeriodCODCost(
    transactions
) {

    let total = 0;


    transactions.forEach(
        transaction => {

            total +=
                getTransactionDishCost(
                    transaction
                );

        }
    );


    return total;

}


/* =========================================================
   THU - DISH
========================================================= */

function renderStatisticsDishes(
    transactions
) {

    const container =
        document.getElementById(
            "statisticsDishList"
        );


    if (!container) return;


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


            map[name].quantity++;


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


    container.innerHTML = "";


    const entries =
        Object.entries(
            map
        );


    if (!entries.length) {

        container.innerHTML = `
            <div class="statistics-empty">
                Chưa có đơn bán trong kỳ.
            </div>
        `;

        return;

    }


    entries.forEach(
        ([name, item]) => {

            const profit =
                item.revenue -
                item.fee -
                item.cost;


            container.innerHTML += `

                <div class="statistics-dish-row">

                    <div class="statistics-dish-top">

                        <span class="statistics-dish-name">
                            🍜
                            ${escapeHTML(name)}
                        </span>

                        <strong class="statistics-dish-profit">
                            ${formatMoney(profit)}
                        </strong>

                    </div>


                    <div class="statistics-dish-detail">

                        <span>
                            ${item.quantity} đơn
                        </span>

                        <span>
                            Doanh thu:
                            ${formatMoney(item.revenue)}
                        </span>

                        <span>
                            Vốn:
                            ${formatMoney(item.cost)}
                        </span>

                        <span>
                            App:
                            ${formatMoney(item.fee)}
                        </span>

                    </div>

                </div>

            `;

        }
    );

}


/* =========================================================
   THU - SOURCE
========================================================= */

function renderStatisticsSources(
    transactions
) {

    const container =
        document.getElementById(
            "statisticsSourceList"
        );


    if (!container) return;


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
   CHI - MAIN
========================================================= */

function renderStatisticsExpenses(
    expenses
) {

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
        count
            ? total / count
            : 0;


    setText(
        "statisticsTotalExpense",
        formatMoney(total)
    );


    setText(
        "statisticsExpenseAmount",
        formatMoney(total)
    );


    setText(
        "statisticsExpenseCount",
        count
    );


    setText(
        "statisticsExpenseAverage",
        formatMoney(average)
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
   CHI - CATEGORY
========================================================= */

function renderStatisticsExpenseCategories(
    expenses,
    total
) {

    const container =
        document.getElementById(
            "statisticsExpenseCategoryList"
        );


    if (!container) return;


    const map = {};


    expenses.forEach(
        transaction => {

            const category =
                transaction.category_name ||
                "Khác";


            if (!map[category]) {

                map[category] = 0;

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
                    b[1] - a[1]
            );


    container.innerHTML = "";


    if (!entries.length) {

        container.innerHTML = `
            <div class="statistics-empty">
                Chưa có khoản chi trong kỳ.
            </div>
        `;

        return;

    }


    entries.forEach(
        ([name, amount]) => {

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
                            ${escapeHTML(name)}
                        </span>

                        <strong class="
                            statistics-expense-category-money
                        ">
                            ${formatMoney(amount)}
                        </strong>

                    </div>


                    <div class="
                        statistics-expense-category-bar
                    ">

                        <span
                            style="
                                width:${Math.max(
                                    percent,
                                    1
                                )}%
                            ">
                        </span>

                    </div>


                    <div class="
                        statistics-expense-category-percent
                    ">

                        ${percent.toFixed(1)}%

                    </div>

                </div>

            `;

        }
    );

}


/* =========================================================
   CHI - DETAIL
========================================================= */

function renderStatisticsExpenseList(
    expenses
) {

    const container =
        document.getElementById(
            "statisticsExpenseList"
        );


    if (!container) return;


    container.innerHTML = "";


    if (!expenses.length) {

        container.innerHTML = `
            <div class="statistics-empty">
                Chưa có khoản chi trong kỳ.
            </div>
        `;

        return;

    }


    /*
     * Mới nhất lên đầu
     */

    const sorted =
        [...expenses].sort(
            (
                a,
                b
            ) =>
                String(
                    b.date || ""
                ).localeCompare(
                    String(
                        a.date || ""
                    )
                )
        );


    sorted.forEach(
        transaction => {

            const name =
                transaction.dish_name ||
                "Khoản chi";


            const category =
                transaction.category_name ||
                "Khác";


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
                            ${escapeHTML(name)}
                        </div>


                        <div class="
                            statistics-expense-category
                        ">
                            ${escapeHTML(category)}
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


    if (!chart) return;


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
                ).slice(
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


            else if (
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


    dates.forEach(
        date => {

            const data =
                daily[date];


            const thuPercent =
                (
                    data.thu /
                    maxValue
                ) *
                100;


            const chiPercent =
                (
                    data.chi /
                    maxValue
                ) *
                100;


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
                        class="chart-bar income"
                        style="
                            height:${Math.max(
                                thuPercent,
                                2
                            )}%
                        "
                        title="Thu: ${formatMoney(
                            data.thu
                        )}">
                    </div>


                    <div
                        class="chart-bar expense"
                        style="
                            height:${Math.max(
                                chiPercent,
                                2
                            )}%
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


            chart.appendChild(
                item
            );

        }
    );

}
