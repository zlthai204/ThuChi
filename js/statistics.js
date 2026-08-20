/* =========================================================
   STATISTICS.JS
   BẢN FIX HOÀN CHỈNH

   - Không còn vòng lặp renderStatistics()
   - Thu + Chi hiển thị cùng lúc
   - Biểu đồ Thu/Chi
   - Bánh xe % Thu/Chi
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
   Giữ lại để tránh lỗi nếu file HTML cũ còn gọi hàm.
   KHÔNG render lại tại đây.
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
        !["day", "week", "month"].includes(period)
    ) {
        period = "day";
    }

    AppState.statisticsPeriod = period;


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


    /* -------------------------
       NGÀY
    ------------------------- */

    if (
        AppState.statisticsPeriod === "day"
    ) {

        start = new Date(baseDate);

        end = new Date(baseDate);

    }


    /* -------------------------
       TUẦN
    ------------------------- */

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


    /* -------------------------
       THÁNG
    ------------------------- */

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

        start: getLocalDateString(start),

        end: getLocalDateString(end)

    };

}


/* =========================================================
   FILTER TRANSACTIONS
========================================================= */

function getStatisticsTransactions() {

    const range =
        getStatisticsRange();


    const transactions =
        Array.isArray(AppState.transactions)
            ? AppState.transactions
            : [];


    return transactions.filter(
        transaction => {

            if (!transaction) {
                return false;
            }


            if (!transaction.date) {
                return false;
            }


            const date =
                String(
                    transaction.date
                ).slice(0, 10);


            return (
                date >= range.start &&
                date <= range.end
            );

        }
    );

}


/* =========================================================
   MAIN
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
       THU
    ===================================================== */

    const revenue =
        income.reduce(
            (sum, transaction) => {

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
       CHI
    ===================================================== */

    const expense =
        expenses.reduce(
            (sum, transaction) => {

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
       APP FEE
    ===================================================== */

    const shopeeFee =
        income
            .filter(
                transaction =>
                    transaction.source ===
                    "ShopeeFood"
            )
            .reduce(
                (sum, transaction) => {

                    return (
                        sum +
                        toNumber(
                            transaction.app_fee
                        )
                    );

                },
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
                (sum, transaction) => {

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
       UPDATE THU
    ===================================================== */

    setText(
        "statisticsRevenue",
        formatMoney(revenue)
    );


    setText(
        "statisticsCOD",
        formatMoney(codCost)
    );


    /* =====================================================
       UPDATE CHI
    ===================================================== */

    setText(
        "statisticsExpense",
        formatMoney(expense)
    );


    setText(
        "statisticsShopeeFee",
        formatMoney(shopeeFee)
    );


    setText(
        "statisticsGrabFee",
        formatMoney(grabFee)
    );


    /* =====================================================
       PROFIT
    ===================================================== */

    setText(
        "statisticsProfit",
        formatMoney(profit)
    );


    /* =====================================================
       CHI TIẾT CHI
    ===================================================== */

    renderStatisticsExpenses(
        expenses
    );


    /* =====================================================
       CHI TIẾT MÓN
    ===================================================== */

    renderStatisticsDishes(
        income
    );


    /* =====================================================
       NGUỒN ĐƠN
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
       BÁNH XE %
    ===================================================== */

    renderStatisticsPercentWheel(
        revenue,
        expense
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

}


/* =========================================================
   COD COST
========================================================= */

function calculatePeriodCODCost(
    transactions
) {

    let total = 0;


    if (!Array.isArray(transactions)) {
        return 0;
    }


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
   THU - MÓN
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


    transactions.forEach(
        transaction => {

            const name =
                String(
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


    container.innerHTML = "";


    const entries =
        Object.entries(map);


    if (!entries.length) {

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
            (a, b) =>
                b[1].revenue -
                a[1].revenue
        )
        .forEach(
            ([name, item]) => {

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

                                ${escapeHTML(name)}

                            </span>


                            <strong class="
                                statistics-dish-profit
                            ">

                                ${formatMoney(profit)}

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
   THU - NGUỒN
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
                        transaction.source ===
                        source.name
                );


            const revenue =
                items.reduce(
                    (sum, transaction) => {

                        return (
                            sum +
                            toNumber(
                                transaction.amount
                            )
                        );

                    },
                    0
                );


            const fee =
                items.reduce(
                    (sum, transaction) => {

                        return (
                            sum +
                            toNumber(
                                transaction.app_fee
                            )
                        );

                    },
                    0
                );


            const orderCount =
                items.length;


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
                                ${escapeHTML(
                                    source.name
                                )}
                            </strong>

                            <small>
                                ${orderCount} đơn
                            </small>

                        </div>

                    </div>


                    <div class="
                        statistics-source-money
                    ">

                        <strong>
                            ${formatMoney(revenue)}
                        </strong>

                        <small>
                            Phí:
                            ${formatMoney(fee)}
                        </small>

                    </div>

                </div>

            `;

        }
    );

}


/* =========================================================
   CHI - TỔNG
========================================================= */

function renderStatisticsExpenses(
    expenses
) {

    const total =
        expenses.reduce(
            (sum, transaction) => {

                return (
                    sum +
                    toNumber(
                        transaction.amount
                    )
                );

            },
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


    if (!container) {
        return;
    }


    const map = {};


    expenses.forEach(
        transaction => {

            const category =
                String(
                    transaction.category_name ||
                    transaction.category ||
                    "Khác"
                );


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
        Object.entries(map)
            .sort(
                (a, b) =>
                    b[1] - a[1]
            );


    container.innerHTML = "";


    if (!entries.length) {

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
        ([name, amount]) => {

            const percent =
                total > 0
                    ? (amount / total) * 100
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


    if (!container) {
        return;
    }


    container.innerHTML = "";


    if (!expenses.length) {

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
            (a, b) => {

                return String(
                    b.date || ""
                ).localeCompare(
                    String(
                        a.date || ""
                    )
                );

            }
        );


    sorted.forEach(
        transaction => {

            const name =
                String(
                    transaction.dish_name ||
                    transaction.name ||
                    "Khoản chi"
                );


            const category =
                String(
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
   BIỂU ĐỒ THU / CHI
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
                <span>📊</span>
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
                ).slice(0, 10);


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
                transaction.type === "thu"
            ) {

                daily[date].thu +=
                    amount;

            }


            if (
                transaction.type === "chi"
            ) {

                daily[date].chi +=
                    amount;

            }

        }
    );


    const dates =
        Object.keys(daily).sort();


    if (!dates.length) {

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
       HEADER
    ===================================================== */

    const legend =
        document.createElement("div");


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


    /* =====================================================
       CHART BODY
    ===================================================== */

    const chartBody =
        document.createElement("div");


    chartBody.className =
        "statistics-chart-body";


    dates.forEach(
        date => {

            const data =
                daily[date];


            /*
             * Dùng px thay vì %
             * để chắc chắn thanh CHI hiện.
             */

            const maxHeight = 145;


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
                    dateObject.getMonth() + 1
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
   BÁNH XE % THU / CHI
========================================================= */

function renderStatisticsPercentWheel(
    revenue,
    expense
) {

    let section =
        document.getElementById(
            "statisticsPercentWheel"
        );


    /*
     * Nếu HTML chưa có,
     * tự tạo ở cuối phần thống kê.
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


    const total =
        revenue +
        expense;


    let incomePercent = 0;
    let expensePercent = 0;


    if (total > 0) {

        incomePercent =
            (revenue / total) * 100;


        expensePercent =
            (expense / total) * 100;

    }


    section.innerHTML = `

        <div class="
            statistics-wheel-heading
        ">

            <div>

                <span>
                    TỶ TRỌNG
                </span>

                <h2>
                    Thu & Chi
                </h2>

            </div>

            <small>
                ${formatMoney(total)}
            </small>

        </div>


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
                        ${formatMoney(revenue)}
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
                        ${formatMoney(expense)}
                    </span>

                </div>

            </div>

        </div>

    `;

}


/* =========================================================
   PERIOD PREVIOUS
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
   PERIOD NEXT
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
   FIX HTML CŨ
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /*
         * Nếu HTML cũ còn các nút Thu/Chi
         * thì ẩn luôn.
         */

        [
            "statisticsIncomeTab",
            "statisticsExpenseTab"
        ].forEach(id => {

            const element =
                document.getElementById(id);


            if (element) {

                element.style.display =
                    "none";

            }

        });


        /*
         * Ẩn view cũ nếu tồn tại.
         */

        const incomeView =
            document.getElementById(
                "statisticsIncomeView"
            );


        const expenseView =
            document.getElementById(
                "statisticsExpenseView"
            );


        if (incomeView) {
            incomeView.style.display = "block";
        }


        if (expenseView) {
            expenseView.style.display = "block";
        }

    }
);
