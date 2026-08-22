/* =========================================================
   STATISTICS.JS
   BẾP NHÀ DUYÊN
========================================================= */

(function () {

    "use strict";


    /* =====================================================
       FORMAT
    ===================================================== */

    function formatMoney(value) {

        const number = Number(value) || 0;

        return number.toLocaleString("vi-VN") + " ₫";

    }


    window.formatMoney = formatMoney;


    /* =====================================================
       STATE
    ===================================================== */

    function getState() {

        if (
            typeof window.AppState === "undefined"
        ) {
            return null;
        }

        return window.AppState;

    }


    /* =====================================================
       TRANSACTIONS
    ===================================================== */

    function getTransactions() {

        const state = getState();

        if (!state) {
            return [];
        }

        return Array.isArray(
            state.transactions
        )
            ? state.transactions
            : [];

    }


    /* =====================================================
       DATE HELPERS
    ===================================================== */

    function parseDate(value) {

        if (!value) {
            return null;
        }

        const date =
            value instanceof Date
                ? new Date(value)
                : new Date(value);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return null;
        }

        return date;

    }


    function startOfDay(date) {

        const result =
            new Date(date);

        result.setHours(
            0,
            0,
            0,
            0
        );

        return result;

    }


    function endOfDay(date) {

        const result =
            new Date(date);

        result.setHours(
            23,
            59,
            59,
            999
        );

        return result;

    }


    function startOfWeek(date) {

        const result =
            startOfDay(date);

        const day =
            result.getDay();

        const diff =
            day === 0
                ? -6
                : 1 - day;

        result.setDate(
            result.getDate() + diff
        );

        return result;

    }


    function endOfWeek(date) {

        const result =
            startOfWeek(date);

        result.setDate(
            result.getDate() + 6
        );

        return endOfDay(result);

    }


    function startOfMonth(date) {

        return new Date(
            date.getFullYear(),
            date.getMonth(),
            1,
            0,
            0,
            0,
            0
        );

    }


    function endOfMonth(date) {

        return new Date(
            date.getFullYear(),
            date.getMonth() + 1,
            0,
            23,
            59,
            59,
            999
        );

    }


    /* =====================================================
       STATISTICS RANGE
    ===================================================== */

    function getStatisticsRange() {

        const state =
            getState();

        const period =
            state?.statisticsPeriod ||
            "day";

        const selectedDate =
            parseDate(
                state?.statisticsDate
            ) || new Date();


        let start;

        let end;


        if (period === "week") {

            start =
                startOfWeek(
                    selectedDate
                );

            end =
                endOfWeek(
                    selectedDate
                );

        }

        else if (period === "month") {

            start =
                startOfMonth(
                    selectedDate
                );

            end =
                endOfMonth(
                    selectedDate
                );

        }

        else {

            start =
                startOfDay(
                    selectedDate
                );

            end =
                endOfDay(
                    selectedDate
                );

        }


        return {
            start,
            end
        };

    }


    window.getStatisticsTransactions =
        function () {

            const range =
                getStatisticsRange();

            return getTransactions()
                .filter(transaction => {

                    const date =
                        parseDate(
                            transaction.date
                        );

                    if (!date) {
                        return false;
                    }

                    return (
                        date >= range.start &&
                        date <= range.end
                    );

                });

        };


    /* =====================================================
       NORMALIZE TRANSACTION
    ===================================================== */

    function normalizeTransaction(
        transaction
    ) {

        const amount =
            Number(
                transaction.amount ??
                transaction.money ??
                transaction.value ??
                0
            ) || 0;


        const appFee =
            Number(
                transaction.app_fee ??
                transaction.appFee ??
                transaction.platform_fee ??
                transaction.fee ??
                0
            ) || 0;


        const cost =
            Number(
                transaction.cost ??
                transaction.cod_cost ??
                transaction.cost_price ??
                transaction.cogs ??
                0
            ) || 0;


        const type =
            String(
                transaction.type ??
                ""
            )
            .toLowerCase()
            .trim();


        const source =
            transaction.order_source ??
            transaction.orderSource ??
            transaction.source ??
            "Khác";


        return {

            ...transaction,

            amount,

            appFee,

            cost,

            type,

            source

        };

    }


    /* =====================================================
       CALCULATE
    ===================================================== */

    function calculateStatistics(
        transactions
    ) {

        let revenue = 0;

        let expense = 0;

        let appFee = 0;

        let cost = 0;

        let orders = 0;

        let expenseCount = 0;


        const dishes = {};

        const categories = {};

        const sources = {};


        transactions.forEach(
            rawTransaction => {

                const transaction =
                    normalizeTransaction(
                        rawTransaction
                    );


                if (
                    transaction.type ===
                    "thu"
                ) {

                    revenue +=
                        transaction.amount;

                    orders++;


                    appFee +=
                        transaction.appFee;

                    cost +=
                        transaction.cost;


                    const dish =
                        transaction.dish_name ??
                        transaction.dish ??
                        transaction.name ??
                        "Không rõ";


                    if (!dishes[dish]) {

                        dishes[dish] = {

                            name: dish,

                            amount: 0,

                            count: 0

                        };

                    }


                    dishes[dish].amount +=
                        transaction.amount;

                    dishes[dish].count++;


                    const source =
                        transaction.source;


                    if (!sources[source]) {

                        sources[source] = {

                            name: source,

                            revenue: 0,

                            fee: 0,

                            count: 0

                        };

                    }


                    sources[source].revenue +=
                        transaction.amount;

                    sources[source].fee +=
                        transaction.appFee;

                    sources[source].count++;

                }


                if (
                    transaction.type ===
                    "chi"
                ) {

                    expense +=
                        transaction.amount;

                    expenseCount++;


                    const category =
                        transaction.category_name ??
                        transaction.category ??
                        "Khác";


                    if (
                        !categories[category]
                    ) {

                        categories[category] = {

                            name: category,

                            amount: 0,

                            count: 0

                        };

                    }


                    categories[category].amount +=
                        transaction.amount;

                    categories[category].count++;

                }

            }
        );


        const profit =
            revenue -
            expense -
            appFee -
            cost;


        return {

            revenue,

            expense,

            appFee,

            cost,

            profit,

            orders,

            expenseCount,

            expenseAverage:
                expenseCount > 0
                    ? expense /
                      expenseCount
                    : 0,

            dishes:
                Object.values(
                    dishes
                ),

            categories:
                Object.values(
                    categories
                ),

            sources:
                Object.values(
                    sources
                )

        };

    }


    /* =====================================================
       PERIOD LABEL
    ===================================================== */

    function updatePeriodLabel() {

        const state =
            getState();

        if (!state) {
            return;
        }


        const period =
            state.statisticsPeriod ||
            "day";


        const date =
            parseDate(
                state.statisticsDate
            ) || new Date();


        const element =
            document.getElementById(
                "statisticsPeriodLabel"
            );


        if (!element) {
            return;
        }


        if (period === "month") {

            element.textContent =
                `Tháng ${
                    date.getMonth() + 1
                }/${date.getFullYear()}`;

        }

        else if (period === "week") {

            const start =
                startOfWeek(date);

            const end =
                endOfWeek(date);


            element.textContent =
                `${start.toLocaleDateString(
                    "vi-VN"
                )} - ${end.toLocaleDateString(
                    "vi-VN"
                )}`;

        }

        else {

            element.textContent =
                date.toLocaleDateString(
                    "vi-VN",
                    {
                        weekday: "long",
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric"
                    }
                );

        }

    }


    /* =====================================================
       PERIOD BUTTON
    ===================================================== */

    function updatePeriodButtons() {

        const state =
            getState();

        const period =
            state?.statisticsPeriod ||
            "day";


        document
            .querySelectorAll(
                ".period-tab"
            )
            .forEach(button => {

                button.classList.toggle(
                    "active",
                    button.dataset.period ===
                    period
                );

            });

    }


    /* =====================================================
       OVERVIEW
    ===================================================== */

    function renderOverview(
        stats
    ) {

        setText(
            "statisticsProfit",
            formatMoney(stats.profit)
        );


        setText(
            "statisticsRevenue",
            formatMoney(stats.revenue)
        );


        setText(
            "statisticsExpense",
            formatMoney(stats.expense)
        );


        setText(
            "statisticsCOD",
            formatMoney(stats.cost)
        );


        setText(
            "statisticsShopeeFee",
            formatMoney(stats.appFee)
        );


        setText(
            "statisticsTotalExpense",
            formatMoney(stats.expense)
        );


        setText(
            "statisticsExpenseCount",
            stats.expenseCount
        );


        setText(
            "statisticsExpenseAverage",
            formatMoney(
                stats.expenseAverage
            )
        );


        setText(
            "statisticsFinalProfit",
            formatMoney(stats.profit)
        );

    }


    /* =====================================================
       DISH LIST
    ===================================================== */

    function renderDishList(
        stats
    ) {

        const container =
            document.getElementById(
                "statisticsDishList"
            );


        if (!container) {
            return;
        }


        if (
            stats.dishes.length === 0
        ) {

            container.innerHTML = `
                <div class="statistics-empty">
                    Chưa có dữ liệu doanh thu
                    trong kỳ này.
                </div>
            `;

            return;

        }


        const sorted =
            [...stats.dishes]
                .sort(
                    (a, b) =>
                        b.amount -
                        a.amount
                );


        container.innerHTML =
            sorted.map(
                item => `

                    <div class="statistics-detail-row">

                        <div>
                            <strong>
                                ${escapeHTML(item.name)}
                            </strong>

                            <small>
                                ${item.count} đơn
                            </small>
                        </div>

                        <strong class="green-text">
                            ${formatMoney(item.amount)}
                        </strong>

                    </div>

                `
            ).join("");

    }


    /* =====================================================
       EXPENSE CATEGORY
    ===================================================== */

    function renderExpenseCategories(
        stats
    ) {

        const container =
            document.getElementById(
                "statisticsExpenseCategoryList"
            );


        if (!container) {
            return;
        }


        if (
            stats.categories.length === 0
        ) {

            container.innerHTML = `
                <div class="statistics-empty">
                    Chưa có khoản chi trong kỳ này.
                </div>
            `;

            return;

        }


        const sorted =
            [...stats.categories]
                .sort(
                    (a, b) =>
                        b.amount -
                        a.amount
                );


        container.innerHTML =
            sorted.map(
                item => `

                    <div class="statistics-category-row">

                        <div class="statistics-category-info">

                            <strong>
                                ${escapeHTML(item.name)}
                            </strong>

                            <small>
                                ${item.count} khoản
                            </small>

                        </div>

                        <strong class="red-text">
                            ${formatMoney(item.amount)}
                        </strong>

                    </div>

                `
            ).join("");

    }


    /* =====================================================
       EXPENSE DETAIL
    ===================================================== */

    function renderExpenseList(
        transactions
    ) {

        const container =
            document.getElementById(
                "statisticsExpenseList"
            );


        if (!container) {
            return;
        }


        const expenses =
            transactions.filter(
                transaction =>
                    String(
                        transaction.type
                    )
                    .toLowerCase()
                    .trim() === "chi"
            );


        if (
            expenses.length === 0
        ) {

            container.innerHTML = `
                <div class="statistics-empty">
                    Chưa có khoản chi trong kỳ này.
                </div>
            `;

            return;

        }


        container.innerHTML =
            expenses.map(
                raw => {

                    const item =
                        normalizeTransaction(
                            raw
                        );


                    const name =
                        item.name ??
                        item.category_name ??
                        item.category ??
                        "Khoản chi";


                    return `

                        <div class="statistics-detail-row">

                            <div>

                                <strong>
                                    ${escapeHTML(name)}
                                </strong>

                                <small>
                                    ${formatDate(item.date)}
                                </small>

                            </div>

                            <strong class="red-text">
                                ${formatMoney(item.amount)}
                            </strong>

                        </div>

                    `;

                }
            ).join("");

    }


    /* =====================================================
       SOURCE
    ===================================================== */

    function renderSources(
        stats
    ) {

        const container =
            document.getElementById(
                "statisticsSourceList"
            );


        if (!container) {
            return;
        }


        if (
            stats.sources.length === 0
        ) {

            container.innerHTML = `
                <div class="statistics-empty">
                    Chưa có đơn hàng trong kỳ này.
                </div>
            `;

            return;

        }


        container.innerHTML =
            stats.sources.map(
                source => `

                    <div class="statistics-source-row">

                        <div>

                            <strong>
                                ${escapeHTML(source.name)}
                            </strong>

                            <small>
                                ${source.count} đơn
                            </small>

                        </div>

                        <div class="statistics-source-values">

                            <strong>
                                ${formatMoney(
                                    source.revenue
                                )}
                            </strong>

                            <small>
                                Phí:
                                ${formatMoney(
                                    source.fee
                                )}
                            </small>

                        </div>

                    </div>

                `
            ).join("");

    }


    /* =====================================================
       BAR CHART
    ===================================================== */

    function renderChart(
        transactions
    ) {

        const container =
            document.getElementById(
                "statisticsChart"
            );


        if (!container) {
            return;
        }


        const daily = {};


        transactions.forEach(
            raw => {

                const item =
                    normalizeTransaction(
                        raw
                    );


                const date =
                    parseDate(
                        item.date
                    );


                if (!date) {
                    return;
                }


                const key =
                    date.toISOString()
                        .slice(
                            0,
                            10
                        );


                if (!daily[key]) {

                    daily[key] = {

                        income: 0,

                        expense: 0

                    };

                }


                if (
                    item.type === "thu"
                ) {

                    daily[key].income +=
                        item.amount;

                }


                if (
                    item.type === "chi"
                ) {

                    daily[key].expense +=
                        item.amount;

                }

            }
        );


        const days =
            Object.entries(
                daily
            )
            .sort(
                ([a], [b]) =>
                    a.localeCompare(b)
            );


        if (days.length === 0) {

            container.innerHTML = `
                <div class="statistics-empty">
                    Chưa có dữ liệu biểu đồ.
                </div>
            `;

            return;

        }


        const max =
            Math.max(
                ...days.flatMap(
                    ([, item]) => [
                        item.income,
                        item.expense
                    ]
                ),
                1
            );


        container.innerHTML =
            days.map(
                ([date, item]) => {

                    const incomeHeight =
                        Math.max(
                            4,
                            item.income /
                            max *
                            100
                        );


                    const expenseHeight =
                        Math.max(
                            4,
                            item.expense /
                            max *
                            100
                        );


                    return `

                        <div class="statistics-chart-column">

                            <div class="statistics-chart-bars">

                                <div
                                    class="statistics-bar income"
                                    style="height:${incomeHeight}%"
                                    title="Thu: ${formatMoney(item.income)}">
                                </div>

                                <div
                                    class="statistics-bar expense"
                                    style="height:${expenseHeight}%"
                                    title="Chi: ${formatMoney(item.expense)}">
                                </div>

                            </div>

                            <small>
                                ${formatShortDate(date)}
                            </small>

                        </div>

                    `;

                }
            ).join("");

    }


    /* =====================================================
       PIE CHART
    ===================================================== */

    function renderPie(
        stats
    ) {

        const total =
            stats.revenue +
            stats.expense;


        const incomePercent =
            total > 0
                ? stats.revenue /
                  total *
                  100
                : 0;


        const expensePercent =
            total > 0
                ? stats.expense /
                  total *
                  100
                : 0;


        const pie =
            document.getElementById(
                "statisticsPieChart"
            );


        if (pie) {

            pie.style.background =
                total > 0
                    ? `conic-gradient(
                        #22c55e 0% ${incomePercent}%,
                        #ef4444 ${incomePercent}% 100%
                    )`
                    : `
                        conic-gradient(
                            #e5e7eb 0% 100%
                        )
                    `;

        }


        setText(
            "statisticsIncomePercent",
            incomePercent.toFixed(1) + "%"
        );


        setText(
            "statisticsExpensePercent",
            expensePercent.toFixed(1) + "%"
        );


        setText(
            "statisticsPieTotal",
            formatMoney(total)
        );

    }


    /* =====================================================
       MAIN RENDER
    ===================================================== */

    function renderStatistics() {

        const state =
            getState();


        if (!state) {
            return;
        }


        updatePeriodLabel();

        updatePeriodButtons();


        const transactions =
            window.getStatisticsTransactions
                ? window.getStatisticsTransactions()
                : getTransactions();


        const stats =
            calculateStatistics(
                transactions
            );


        renderOverview(
            stats
        );


        renderDishList(
            stats
        );


        renderExpenseCategories(
            stats
        );


        renderExpenseList(
            transactions
        );


        renderSources(
            stats
        );


        renderChart(
            transactions
        );


        renderPie(
            stats
        );

    }


    window.renderStatistics =
        renderStatistics;


    /* =====================================================
       PERIOD CONTROL
    ===================================================== */

    window.setStatisticsPeriod =
        function (period) {

            const state =
                getState();

            if (!state) {
                return;
            }


            state.statisticsPeriod =
                period;


            renderStatistics();

            if (
                typeof window.updateStatisticsPie ===
                "function"
            ) {

                window.updateStatisticsPie();

            }

        };


    window.statisticsPrevious =
        function () {

            const state =
                getState();

            if (!state) {
                return;
            }


            const date =
                parseDate(
                    state.statisticsDate
                ) || new Date();


            if (
                state.statisticsPeriod ===
                "month"
            ) {

                date.setMonth(
                    date.getMonth() - 1
                );

            }

            else if (
                state.statisticsPeriod ===
                "week"
            ) {

                date.setDate(
                    date.getDate() - 7
                );

            }

            else {

                date.setDate(
                    date.getDate() - 1
                );

            }


            state.statisticsDate =
                date;


            renderStatistics();

        };


    window.statisticsNext =
        function () {

            const state =
                getState();

            if (!state) {
                return;
            }


            const date =
                parseDate(
                    state.statisticsDate
                ) || new Date();


            if (
                state.statisticsPeriod ===
                "month"
            ) {

                date.setMonth(
                    date.getMonth() + 1
                );

            }

            else if (
                state.statisticsPeriod ===
                "week"
            ) {

                date.setDate(
                    date.getDate() + 7
                );

            }

            else {

                date.setDate(
                    date.getDate() + 1
                );

            }


            state.statisticsDate =
                date;


            renderStatistics();

        };


    /* =====================================================
       HELPERS
    ===================================================== */

    function setText(
        id,
        value
    ) {

        const element =
            document.getElementById(id);


        if (element) {

            element.textContent =
                value;

        }

    }


    function escapeHTML(value) {

        return String(
            value ?? ""
        )
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


    function formatDate(
        value
    ) {

        const date =
            parseDate(value);


        if (!date) {
            return "";
        }


        return date.toLocaleDateString(
            "vi-VN"
        );

    }


    function formatShortDate(
        value
    ) {

        const date =
            parseDate(value);


        if (!date) {
            return "";
        }


        return `${String(
            date.getDate()
        ).padStart(2, "0")}/${
            String(
                date.getMonth() + 1
            ).padStart(2, "0")
        }`;

    }


    /* =====================================================
       INITIALIZE
    ===================================================== */

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            setTimeout(
                function () {

                    if (
                        getState()
                    ) {

                        renderStatistics();

                    }

                },
                150
            );

        }
    );


})();
