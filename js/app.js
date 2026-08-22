/* =========================================================
   STATISTICS ENGINE
   FULL REBUILD
   Compatible with existing AppState
========================================================= */


/* =========================================================
   MAIN RENDER
========================================================= */

function renderStatistics() {

    const page =
        document.getElementById("statisticsPage");

    if (!page) return;

    ensureStatisticsState();

    const data =
        buildStatisticsData();

    renderStatisticsDate();

    renderStatisticsSummary(data);

    renderStatisticsBreakdown(data);

    renderStatisticsDishList(data);

    renderStatisticsSourceList(data);

    renderStatisticsExpenseCategories(data);

    renderStatisticsExpenseList(data);

    renderStatisticsChart(data);

    renderStatisticsPercent(data);

    renderStatisticsDetailWheels(data);

    renderStatisticsExpenseAnalysis(data);

}


/* =========================================================
   STATE
========================================================= */

function ensureStatisticsState() {

    if (
        !AppState.statisticsPeriod
    ) {

        AppState.statisticsPeriod =
            "day";

    }

    if (
        !(AppState.statisticsDate instanceof Date) ||
        Number.isNaN(
            AppState.statisticsDate.getTime()
        )
    ) {

        AppState.statisticsDate =
            new Date();

    }

}


/* =========================================================
   HELPERS
========================================================= */

function statsNumber(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) return 0;

    if (typeof value === "number") {

        return Number.isFinite(value)
            ? value
            : 0;

    }

    const cleaned =
        String(value)
            .replace(/[^\d.-]/g, "");

    const number =
        Number(cleaned);

    return Number.isFinite(number)
        ? number
        : 0;

}


function statsMoney(value) {

    return statsNumber(value)
        .toLocaleString(
            "vi-VN"
        ) + " đ";

}


function statsDate(value) {

    if (!value) return null;

    if (value instanceof Date) {

        return new Date(value);

    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return null;

    }

    return date;

}


function statsSameDay(a, b) {

    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );

}


function statsStartOfDay(date) {

    const d = new Date(date);

    d.setHours(
        0, 0, 0, 0
    );

    return d;

}


function statsEndOfDay(date) {

    const d = new Date(date);

    d.setHours(
        23, 59, 59, 999
    );

    return d;

}


function statsStartOfMonth(date) {

    return new Date(
        date.getFullYear(),
        date.getMonth(),
        1,
        0, 0, 0, 0
    );

}


function statsEndOfMonth(date) {

    return new Date(
        date.getFullYear(),
        date.getMonth() + 1,
        0,
        23, 59, 59, 999
    );

}


function statsStartOfYear(date) {

    return new Date(
        date.getFullYear(),
        0,
        1,
        0, 0, 0, 0
    );

}


function statsEndOfYear(date) {

    return new Date(
        date.getFullYear(),
        11,
        31,
        23, 59, 59, 999
    );

}


/* =========================================================
   TRANSACTION DATE
========================================================= */

function getTransactionDate(transaction) {

    return statsDate(
        transaction?.date ||
        transaction?.created_at ||
        transaction?.createdAt ||
        transaction?.transaction_date
    );

}


/* =========================================================
   TRANSACTION TYPE
========================================================= */

function getTransactionType(transaction) {

    const type =
        String(
            transaction?.type ||
            transaction?.transaction_type ||
            transaction?.loai ||
            ""
        )
        .toLowerCase()
        .trim();

    if (
        type === "thu" ||
        type === "income" ||
        type === "revenue"
    ) {

        return "thu";

    }

    if (
        type === "chi" ||
        type === "expense" ||
        type === "cost"
    ) {

        return "chi";

    }

    return type.includes("chi")
        ? "chi"
        : "thu";

}


/* =========================================================
   TRANSACTION AMOUNT
========================================================= */

function getTransactionAmount(transaction) {

    return Math.abs(
        statsNumber(
            transaction?.amount ??
            transaction?.money ??
            transaction?.price ??
            transaction?.total ??
            transaction?.value ??
            0
        )
    );

}


/* =========================================================
   TRANSACTION NAME
========================================================= */

function getTransactionName(transaction) {

    return (
        transaction?.name ||
        transaction?.title ||
        transaction?.description ||
        transaction?.note ||
        transaction?.dish_name ||
        "Giao dịch"
    );

}


/* =========================================================
   CATEGORY
========================================================= */

function getTransactionCategory(transaction) {

    return (
        transaction?.category ||
        transaction?.category_name ||
        transaction?.categoryName ||
        transaction?.danh_muc ||
        "Khác"
    );

}


/* =========================================================
   SOURCE
========================================================= */

function getTransactionSource(transaction) {

    return (
        transaction?.source ||
        transaction?.source_name ||
        transaction?.order_source ||
        transaction?.orderSource ||
        transaction?.platform ||
        transaction?.channel ||
        "Khác"
    );

}


/* =========================================================
   DISH
========================================================= */

function getTransactionDish(transaction) {

    return (
        transaction?.dish ||
        transaction?.dish_name ||
        transaction?.dishName ||
        transaction?.product ||
        transaction?.product_name ||
        ""
    );

}


/* =========================================================
   PERIOD RANGE
========================================================= */

function getStatisticsRange() {

    const date =
        new Date(
            AppState.statisticsDate
        );

    const period =
        AppState.statisticsPeriod;

    if (period === "month") {

        return {
            start: statsStartOfMonth(date),
            end: statsEndOfMonth(date)
        };

    }

    if (period === "year") {

        return {
            start: statsStartOfYear(date),
            end: statsEndOfYear(date)
        };

    }

    return {

        start:
            statsStartOfDay(date),

        end:
            statsEndOfDay(date)

    };

}


/* =========================================================
   FILTER TRANSACTIONS
========================================================= */

function getStatisticsTransactions() {

    const range =
        getStatisticsRange();

    return (
        Array.isArray(
            AppState.transactions
        )
            ? AppState.transactions
            : []
    )
    .filter(transaction => {

        const date =
            getTransactionDate(
                transaction
            );

        if (!date) return false;

        return (
            date >= range.start &&
            date <= range.end
        );

    });

}


/* =========================================================
   BUILD DATA
========================================================= */

function buildStatisticsData() {

    const transactions =
        getStatisticsTransactions();

    const income =
        transactions
            .filter(
                t =>
                    getTransactionType(t) === "thu"
            );

    const expenses =
        transactions
            .filter(
                t =>
                    getTransactionType(t) === "chi"
            );

    const totalIncome =
        income.reduce(
            (sum, t) =>
                sum +
                getTransactionAmount(t),
            0
        );

    const totalExpense =
        expenses.reduce(
            (sum, t) =>
                sum +
                getTransactionAmount(t),
            0
        );

    const profit =
        totalIncome -
        totalExpense;

    return {

        transactions,

        income,

        expenses,

        totalIncome,

        totalExpense,

        profit,

        transactionCount:
            transactions.length,

        incomeCount:
            income.length,

        expenseCount:
            expenses.length

    };

}


/* =========================================================
   DATE LABEL
========================================================= */

function getStatisticsDateLabel() {

    const date =
        new Date(
            AppState.statisticsDate
        );

    const period =
        AppState.statisticsPeriod;

    if (period === "year") {

        return `Năm ${date.getFullYear()}`;

    }

    if (period === "month") {

        return date.toLocaleDateString(
            "vi-VN",
            {
                month: "long",
                year: "numeric"
            }
        );

    }

    return date.toLocaleDateString(
        "vi-VN",
        {
            weekday: "long",
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );

}


/* =========================================================
   DATE RENDER
========================================================= */

function renderStatisticsDate() {

    const page =
        document.getElementById(
            "statisticsPage"
        );

    if (!page) return;

    const label =
        page.querySelector(
            ".statistics-date-row strong"
        );

    if (label) {

        label.textContent =
            getStatisticsDateLabel();

        label.style.cursor =
            "pointer";

        label.title =
            "Nhấn để chọn ngày / tháng / năm";

        label.onclick =
            openStatisticsDatePicker;

    }

    document
        .querySelectorAll(
            ".period-tab"
        )
        .forEach(tab => {

            const value =
                tab.dataset.period ||
                tab.dataset.value ||
                tab.getAttribute(
                    "data-period"
                );

            tab.classList.toggle(
                "active",
                value ===
                    AppState.statisticsPeriod
            );

        });

}


/* =========================================================
   PERIOD CHANGE
========================================================= */

function setStatisticsPeriod(period) {

    if (
        ![
            "day",
            "month",
            "year"
        ].includes(period)
    ) {

        return;

    }

    AppState.statisticsPeriod =
        period;

    renderStatistics();

}


/* =========================================================
   NEXT / PREVIOUS
========================================================= */

function changeStatisticsDate(direction) {

    const date =
        new Date(
            AppState.statisticsDate
        );

    const period =
        AppState.statisticsPeriod;

    if (period === "year") {

        date.setFullYear(
            date.getFullYear() +
            direction
        );

    } else if (period === "month") {

        date.setMonth(
            date.getMonth() +
            direction
        );

    } else {

        date.setDate(
            date.getDate() +
            direction
        );

    }

    AppState.statisticsDate =
        date;

    renderStatistics();

}


/* =========================================================
   DATE PICKER
========================================================= */

function openStatisticsDatePicker() {

    const existing =
        document.getElementById(
            "statisticsDatePicker"
        );

    if (existing) {

        existing.remove();

        return;

    }

    const period =
        AppState.statisticsPeriod;

    const overlay =
        document.createElement("div");

    overlay.id =
        "statisticsDatePicker";

    overlay.className =
        "statistics-date-picker-overlay";

    const box =
        document.createElement("div");

    box.className =
        "statistics-date-picker";

    let content = "";

    if (period === "day") {

        const value =
            formatInputDate(
                AppState.statisticsDate
            );

        content = `
            <div class="stats-picker-head">
                <div>
                    <small>CHỌN NGÀY</small>
                    <strong>Ngày thống kê</strong>
                </div>
                <button type="button"
                        data-close-picker>×</button>
            </div>

            <div class="stats-picker-field">
                <label>Ngày</label>
                <input
                    id="statsPickerDay"
                    type="date"
                    value="${value}">
            </div>

            <button
                class="stats-picker-confirm"
                type="button"
                data-confirm-day>
                Xác nhận
            </button>
        `;

    } else if (period === "month") {

        const date =
            AppState.statisticsDate;

        content = `
            <div class="stats-picker-head">
                <div>
                    <small>CHỌN THÁNG</small>
                    <strong>Tháng thống kê</strong>
                </div>
                <button type="button"
                        data-close-picker>×</button>
            </div>

            <div class="stats-picker-grid">
                <div class="stats-picker-field">
                    <label>Tháng</label>
                    <select id="statsPickerMonth">
                        ${Array.from(
                            { length: 12 },
                            (_, i) => `
                                <option value="${i}"
                                    ${i === date.getMonth() ? "selected" : ""}>
                                    Tháng ${i + 1}
                                </option>
                            `
                        ).join("")}
                    </select>
                </div>

                <div class="stats-picker-field">
                    <label>Năm</label>
                    <input
                        id="statsPickerYear"
                        type="number"
                        value="${date.getFullYear()}"
                        min="2000"
                        max="2100">
                </div>
            </div>

            <button
                class="stats-picker-confirm"
                type="button"
                data-confirm-month>
                Xác nhận
            </button>
        `;

    } else {

        const year =
            AppState.statisticsDate
                .getFullYear();

        content = `
            <div class="stats-picker-head">
                <div>
                    <small>CHỌN NĂM</small>
                    <strong>Năm thống kê</strong>
                </div>
                <button type="button"
                        data-close-picker>×</button>
            </div>

            <div class="stats-picker-field">
                <label>Năm</label>
                <input
                    id="statsPickerYear"
                    type="number"
                    value="${year}"
                    min="2000"
                    max="2100">
            </div>

            <button
                class="stats-picker-confirm"
                type="button"
                data-confirm-year>
                Xác nhận
            </button>
        `;

    }

    box.innerHTML =
        content;

    overlay.appendChild(box);

    document.body.appendChild(
        overlay
    );

    requestAnimationFrame(() => {

        overlay.classList.add(
            "show"
        );

    });

    overlay.addEventListener(
        "click",
        event => {

            if (
                event.target === overlay ||
                event.target.closest(
                    "[data-close-picker]"
                )
            ) {

                closeStatisticsDatePicker();

            }

        }
    );

    const dayButton =
        box.querySelector(
            "[data-confirm-day]"
        );

    if (dayButton) {

        dayButton.onclick =
            () => {

                const input =
                    document.getElementById(
                        "statsPickerDay"
                    );

                if (!input?.value) return;

                const date =
                    new Date(
                        `${input.value}T00:00:00`
                    );

                AppState.statisticsDate =
                    date;

                closeStatisticsDatePicker();

                renderStatistics();

            };

    }

    const monthButton =
        box.querySelector(
            "[data-confirm-month]"
        );

    if (monthButton) {

        monthButton.onclick =
            () => {

                const month =
                    Number(
                        document.getElementById(
                            "statsPickerMonth"
                        ).value
                    );

                const year =
                    Number(
                        document.getElementById(
                            "statsPickerYear"
                        ).value
                    );

                if (
                    !Number.isFinite(year)
                ) return;

                AppState.statisticsDate =
                    new Date(
                        year,
                        month,
                        1
                    );

                closeStatisticsDatePicker();

                renderStatistics();

            };

    }

    const yearButton =
        box.querySelector(
            "[data-confirm-year]"
        );

    if (yearButton) {

        yearButton.onclick =
            () => {

                const year =
                    Number(
                        document.getElementById(
                            "statsPickerYear"
                        ).value
                    );

                if (
                    !Number.isFinite(year)
                ) return;

                AppState.statisticsDate =
                    new Date(
                        year,
                        0,
                        1
                    );

                closeStatisticsDatePicker();

                renderStatistics();

            };

    }

}


function closeStatisticsDatePicker() {

    const picker =
        document.getElementById(
            "statisticsDatePicker"
        );

    if (!picker) return;

    picker.classList.remove(
        "show"
    );

    setTimeout(
        () => picker.remove(),
        180
    );

}


function formatInputDate(date) {

    const d =
        new Date(date);

    const year =
        d.getFullYear();

    const month =
        String(
            d.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            d.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;

}


/* =========================================================
   SUMMARY
========================================================= */

function renderStatisticsSummary(data) {

    const profit =
        document.querySelector(
            ".profit-summary strong"
        );

    if (profit) {

        profit.textContent =
            statsMoney(
                data.profit
            );

        profit.classList.toggle(
            "profit-positive",
            data.profit >= 0
        );

        profit.classList.toggle(
            "profit-negative",
            data.profit < 0
        );

    }

    const summary =
        document.querySelector(
            ".profit-summary"
        );

    if (!summary) return;

    const breakdown =
        summary.nextElementSibling;

    if (
        breakdown &&
        breakdown.classList.contains(
            "breakdown-list"
        )
    ) {

        const rows =
            breakdown.querySelectorAll(
                ".breakdown-row"
            );

        const values = [

            data.totalIncome,

            data.totalExpense,

            data.profit,

            data.incomeCount,

            data.expenseCount

        ];

        rows.forEach(
            (row, index) => {

                const strong =
                    row.querySelector(
                        "strong"
                    );

                if (!strong) return;

                if (
                    index < 3
                ) {

                    strong.textContent =
                        statsMoney(
                            values[index]
                        );

                } else {

                    strong.textContent =
                        values[index];

                }

            }
        );

    }

}


/* =========================================================
   GENERIC LIST FINDER
========================================================= */

function findContainer(
    selectors
) {

    for (
        const selector of selectors
    ) {

        const element =
            document.querySelector(
                selector
            );

        if (element) return element;

    }

    return null;

}


/* =========================================================
   DISH LIST
========================================================= */

function renderStatisticsDishList(data) {

    const container =
        findContainer([
            ".statistics-dish-list",
            "[data-statistics-dishes]"
        ]);

    if (!container) return;

    const map =
        new Map();

    data.transactions
        .forEach(transaction => {

            const dish =
                getTransactionDish(
                    transaction
                );

            if (!dish) return;

            const amount =
                getTransactionAmount(
                    transaction
                );

            const type =
                getTransactionType(
                    transaction
                );

            if (!map.has(dish)) {

                map.set(
                    dish,
                    {
                        name: dish,
                        income: 0,
                        expense: 0,
                        count: 0
                    }
                );

            }

            const item =
                map.get(dish);

            item.count++;

            if (type === "thu") {

                item.income += amount;

            } else {

                item.expense += amount;

            }

        });

    const list =
        [...map.values()]
            .map(item => {

                item.profit =
                    item.income -
                    item.expense;

                return item;

            })
            .sort(
                (a, b) =>
                    Math.abs(b.profit) -
                    Math.abs(a.profit)
            );

    if (!list.length) {

        container.innerHTML =
            statisticsEmpty(
                "🍽️",
                "Chưa có dữ liệu món ăn",
                "Các món phát sinh trong kỳ sẽ hiển thị ở đây."
            );

        return;

    }

    container.innerHTML =
        list.map(item => {

            const positive =
                item.profit >= 0;

            return `
                <div class="statistics-dish-row">

                    <div class="statistics-dish-top">

                        <div class="statistics-dish-name">

                            <span class="statistics-dish-icon">
                                🍽️
                            </span>

                            <span>
                                ${escapeHtml(item.name)}
                            </span>

                        </div>

                        <strong
                            class="statistics-dish-profit
                            ${positive ? "positive" : "negative"}">

                            ${positive ? "+" : ""}
                            ${statsMoney(item.profit)}

                        </strong>

                    </div>

                    <div class="statistics-dish-detail">

                        <span>
                            Thu ${statsMoney(item.income)}
                        </span>

                        <span>
                            Chi ${statsMoney(item.expense)}
                        </span>

                        <span>
                            ${item.count} giao dịch
                        </span>

                    </div>

                </div>
            `;

        }).join("");

}


/* =========================================================
   SOURCE LIST
========================================================= */

function renderStatisticsSourceList(data) {

    const container =
        findContainer([
            ".statistics-source-list",
            "[data-statistics-sources]"
        ]);

    if (!container) return;

    const map =
        new Map();

    data.income
        .forEach(transaction => {

            const source =
                getTransactionSource(
                    transaction
                );

            const amount =
                getTransactionAmount(
                    transaction
                );

            if (!map.has(source)) {

                map.set(
                    source,
                    {
                        name: source,
                        money: 0,
                        count: 0
                    }
                );

            }

            const item =
                map.get(source);

            item.money += amount;

            item.count++;

        });

    const list =
        [...map.values()]
            .sort(
                (a, b) =>
                    b.money - a.money
            );

    if (!list.length) {

        container.innerHTML =
            statisticsEmpty(
                "💰",
                "Chưa có nguồn thu",
                "Nguồn thu trong kỳ sẽ hiển thị ở đây."
            );

        return;

    }

    const total =
        data.totalIncome || 1;

    container.innerHTML =
        list.map(item => {

            const percent =
                item.money /
                total *
                100;

            return `
                <div class="statistics-source-row">

                    <div class="statistics-source-left">

                        <span
                            class="statistics-source-icon">
                            💰
                        </span>

                        <div>

                            <strong>
                                ${escapeHtml(item.name)}
                            </strong>

                            <small>
                                ${item.count} giao dịch
                            </small>

                        </div>

                    </div>

                    <div
                        class="statistics-source-money">

                        <strong>
                            ${statsMoney(item.money)}
                        </strong>

                        <small>
                            ${percent.toFixed(1)}%
                        </small>

                    </div>

                </div>
            `;

        }).join("");

}


/* =========================================================
   EXPENSE CATEGORY
========================================================= */

function renderStatisticsExpenseCategories(data) {

    const container =
        findContainer([
            ".statistics-expense-category-list",
            "[data-statistics-expense-categories]"
        ]);

    if (!container) return;

    const map =
        new Map();

    data.expenses
        .forEach(transaction => {

            const category =
                getTransactionCategory(
                    transaction
                );

            const amount =
                getTransactionAmount(
                    transaction
                );

            map.set(
                category,
                (map.get(category) || 0) +
                amount
            );

        });

    const list =
        [...map.entries()]
            .map(
                ([name, money]) => ({
                    name,
                    money
                })
            )
            .sort(
                (a, b) =>
                    b.money - a.money
            );

    if (!list.length) {

        container.innerHTML =
            statisticsEmpty(
                "📊",
                "Chưa có khoản chi",
                "Danh mục chi tiêu sẽ được phân tích ở đây."
            );

        return;

    }

    const total =
        data.totalExpense || 1;

    container.innerHTML =
        list.map(item => {

            const percent =
                item.money /
                total *
                100;

            return `
                <div
                    class="statistics-expense-category-row">

                    <div
                        class="statistics-expense-category-top">

                        <span
                            class="statistics-expense-category-name">

                            ${escapeHtml(item.name)}

                        </span>

                        <strong
                            class="statistics-expense-category-money">

                            ${statsMoney(item.money)}

                        </strong>

                    </div>

                    <div
                        class="statistics-expense-category-bar">

                        <span
                            style="width:${Math.min(percent,100)}%">
                        </span>

                    </div>

                    <div
                        class="statistics-expense-category-percent">

                        ${percent.toFixed(1)}%

                    </div>

                </div>
            `;

        }).join("");

}


/* =========================================================
   EXPENSE LIST
========================================================= */

function renderStatisticsExpenseList(data) {

    const container =
        findContainer([
            ".statistics-expense-list",
            "[data-statistics-expenses]"
        ]);

    if (!container) return;

    const list =
        [...data.expenses]
            .sort(
                (a, b) =>
                    getTransactionAmount(b) -
                    getTransactionAmount(a)
            );

    if (!list.length) {

        container.innerHTML =
            statisticsEmpty(
                "🧾",
                "Chưa có khoản chi",
                "Các khoản chi trong kỳ sẽ hiển thị ở đây."
            );

        return;

    }

    container.innerHTML =
        list.map(transaction => {

            const amount =
                getTransactionAmount(
                    transaction
                );

            const name =
                getTransactionName(
                    transaction
                );

            const category =
                getTransactionCategory(
                    transaction
                );

            const date =
                getTransactionDate(
                    transaction
                );

            return `
                <div
                    class="statistics-expense-row">

                    <span
                        class="statistics-expense-icon">
                        ↓
                    </span>

                    <div
                        class="statistics-expense-info">

                        <div
                            class="statistics-expense-name">

                            ${escapeHtml(name)}

                        </div>

                        <div
                            class="statistics-expense-category">

                            ${escapeHtml(category)}

                        </div>

                        <div
                            class="statistics-expense-date">

                            ${date
                                ? date.toLocaleDateString("vi-VN")
                                : ""}

                        </div>

                    </div>

                    <strong
                        class="statistics-expense-money">

                        -${statsMoney(amount)}

                    </strong>

                </div>
            `;

        }).join("");

}


/* =========================================================
   CHART
========================================================= */

function renderStatisticsChart(data) {

    const container =
        findContainer([
            ".statistics-chart",
            "[data-statistics-chart]"
        ]);

    if (!container) return;

    const body =
        container.querySelector(
            ".statistics-chart-body"
        );

    if (!body) return;

    let groups = [];

    const date =
        new Date(
            AppState.statisticsDate
        );

    if (
        AppState.statisticsPeriod ===
        "day"
    ) {

        groups =
            Array.from(
                { length: 24 },
                (_, hour) => ({
                    label:
                        `${String(hour).padStart(2,"0")}h`,
                    income: 0,
                    expense: 0
                })
            );

        data.transactions
            .forEach(transaction => {

                const d =
                    getTransactionDate(
                        transaction
                    );

                if (!d) return;

                const hour =
                    d.getHours();

                const amount =
                    getTransactionAmount(
                        transaction
                    );

                if (
                    getTransactionType(
                        transaction
                    ) === "thu"
                ) {

                    groups[hour].income += amount;

                } else {

                    groups[hour].expense += amount;

                }

            });

    } else if (
        AppState.statisticsPeriod ===
        "month"
    ) {

        const days =
            new Date(
                date.getFullYear(),
                date.getMonth() + 1,
                0
            ).getDate();

        groups =
            Array.from(
                { length: days },
                (_, i) => ({
                    label:
                        `${i + 1}`,
                    income: 0,
                    expense: 0
                })
            );

        data.transactions
            .forEach(transaction => {

                const d =
                    getTransactionDate(
                        transaction
                    );

                if (!d) return;

                const index =
                    d.getDate() - 1;

                const amount =
                    getTransactionAmount(
                        transaction
                    );

                if (
                    getTransactionType(
                        transaction
                    ) === "thu"
                ) {

                    groups[index].income += amount;

                } else {

                    groups[index].expense += amount;

                }

            });

    } else {

        groups =
            Array.from(
                { length: 12 },
                (_, i) => ({
                    label:
                        `T${i + 1}`,
                    income: 0,
                    expense: 0
                })
            );

        data.transactions
            .forEach(transaction => {

                const d =
                    getTransactionDate(
                        transaction
                    );

                if (!d) return;

                const index =
                    d.getMonth();

                const amount =
                    getTransactionAmount(
                        transaction
                    );

                if (
                    getTransactionType(
                        transaction
                    ) === "thu"
                ) {

                    groups[index].income += amount;

                } else {

                    groups[index].expense += amount;

                }

            });

    }

    const max =
        Math.max(
            ...groups.map(
                item =>
                    Math.max(
                        item.income,
                        item.expense
                    )
            ),
            1
        );

    body.innerHTML =
        groups.map(item => {

            const incomeHeight =
                item.income /
                max *
                145;

            const expenseHeight =
                item.expense /
                max *
                145;

            return `
                <div class="chart-day">

                    <div class="chart-bars">

                        <span
                            class="chart-bar income"
                            style="height:${incomeHeight}px"
                            title="Thu: ${statsMoney(item.income)}">
                        </span>

                        <span
                            class="chart-bar expense"
                            style="height:${expenseHeight}px"
                            title="Chi: ${statsMoney(item.expense)}">
                        </span>

                    </div>

                    <span class="chart-date">
                        ${item.label}
                    </span>

                </div>
            `;

        }).join("");

}


/* =========================================================
   PERCENT
========================================================= */

function renderStatisticsPercent(data) {

    const section =
        document.querySelector(
            ".statistics-percent-section"
        );

    if (!section) return;

    const total =
        data.totalIncome +
        data.totalExpense;

    const incomePercent =
        total
            ? data.totalIncome /
              total *
              100
            : 0;

    const expensePercent =
        total
            ? data.totalExpense /
              total *
              100
            : 0;

    const incomeDonut =
        section.querySelector(
            ".income-donut"
        );

    const expenseDonut =
        section.querySelector(
            ".expense-donut"
        );

    if (incomeDonut) {

        incomeDonut.style
            .setProperty(
                "--percent",
                incomePercent
            );

        const strong =
            incomeDonut.querySelector(
                "strong"
            );

        if (strong) {

            strong.textContent =
                `${incomePercent.toFixed(1)}%`;

        }

    }

    if (expenseDonut) {

        expenseDonut.style
            .setProperty(
                "--percent",
                expensePercent
            );

        const strong =
            expenseDonut.querySelector(
                "strong"
            );

        if (strong) {

            strong.textContent =
                `${expensePercent.toFixed(1)}%`;

        }

    }

}


/* =========================================================
   DETAIL WHEELS
========================================================= */

function renderStatisticsDetailWheels(data) {

    document
        .querySelectorAll(
            ".statistics-mini-donut"
        )
        .forEach(
            donut => {

                const percent =
                    Number(
                        donut.dataset.percent ||
                        donut.style.getPropertyValue(
                            "--percent"
                        ) ||
                        0
                    );

                donut.style.setProperty(
                    "--percent",
                    Math.max(
                        0,
                        Math.min(
                            100,
                            percent
                        )
                    )
                );

            }
        );

}


/* =========================================================
   EXPENSE ANALYSIS
========================================================= */

function renderStatisticsExpenseAnalysis(data) {

    const container =
        findContainer([
            ".statistics-expense-analysis-list",
            "[data-statistics-expense-analysis]"
        ]);

    if (!container) return;

    const map =
        new Map();

    data.expenses
        .forEach(transaction => {

            const category =
                getTransactionCategory(
                    transaction
                );

            const amount =
                getTransactionAmount(
                    transaction
                );

            map.set(
                category,
                (map.get(category) || 0) +
                amount
            );

        });

    const list =
        [...map.entries()]
            .map(
                ([name, money]) => ({
                    name,
                    money
                })
            )
            .sort(
                (a, b) =>
                    b.money - a.money
            );

    const total =
        data.totalExpense || 1;

    if (!list.length) {

        container.innerHTML =
            statisticsEmpty(
                "📉",
                "Chưa có dữ liệu phân tích",
                "Các khoản chi sẽ được phân tích tại đây."
            );

        return;

    }

    container.innerHTML =
        list.map(item => {

            const percent =
                item.money /
                total *
                100;

            return `
                <div
                    class="statistics-expense-analysis-row">

                    <div
                        class="statistics-expense-analysis-top">

                        <div
                            class="statistics-expense-analysis-name">

                            <span>🔻</span>

                            ${escapeHtml(item.name)}

                        </div>

                        <strong
                            class="statistics-expense-analysis-money">

                            ${statsMoney(item.money)}

                        </strong>

                    </div>

                    <div
                        class="statistics-expense-analysis-bar">

                        <span
                            style="width:${Math.min(percent,100)}%">
                        </span>

                    </div>

                    <div
                        class="statistics-expense-analysis-percent">

                        ${percent.toFixed(1)}%

                    </div>

                </div>
            `;

        }).join("");

}


/* =========================================================
   BREAKDOWN
========================================================= */

function renderStatisticsBreakdown(data) {

    const container =
        document.querySelector(
            ".breakdown-list"
        );

    if (!container) return;

    const values = [

        statsMoney(
            data.totalIncome
        ),

        statsMoney(
            data.totalExpense
        ),

        statsMoney(
            data.profit
        ),

        data.incomeCount,

        data.expenseCount

    ];

    container
        .querySelectorAll(
            ".breakdown-row strong"
        )
        .forEach(
            (element, index) => {

                if (
                    values[index] !== undefined
                ) {

                    element.textContent =
                        values[index];

                }

            }
        );

}


/* =========================================================
   EMPTY STATE
========================================================= */

function statisticsEmpty(
    icon,
    title,
    message
) {

    return `
        <div class="statistics-empty">

            <div
                class="statistics-empty-icon">
                ${icon}
            </div>

            <strong>
                ${escapeHtml(title)}
            </strong>

            <span>
                ${escapeHtml(message)}
            </span>

        </div>
    `;

}


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHtml(value) {

    return String(value ?? "")
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
   GLOBAL COMPATIBILITY
========================================================= */

window.renderStatistics =
    renderStatistics;

window.setStatisticsPeriod =
    setStatisticsPeriod;

window.changeStatisticsDate =
    changeStatisticsDate;

window.openStatisticsDatePicker =
    openStatisticsDatePicker;


/* =========================================================
   AUTO DETECT PERIOD BUTTONS
========================================================= */

document.addEventListener(
    "click",
    event => {

        const tab =
            event.target.closest(
                ".period-tab"
            );

        if (tab) {

            const period =
                tab.dataset.period ||
                tab.dataset.value;

            if (period) {

                setStatisticsPeriod(
                    period
                );

            }

            return;

        }


        const previous =
            event.target.closest(
                ".statistics-date-row button:first-child"
            );

        const next =
            event.target.closest(
                ".statistics-date-row button:last-child"
            );

        if (previous) {

            changeStatisticsDate(
                -1
            );

        }

        if (next) {

            changeStatisticsDate(
                1
            );

        }

    }
);


/* =========================================================
   STATISTICS PICKER CSS
   INJECTED WITHOUT CHANGING HTML
========================================================= */

(function injectStatisticsPickerStyle() {

    if (
        document.getElementById(
            "statisticsPickerRuntimeStyle"
        )
    ) return;

    const style =
        document.createElement("style");

    style.id =
        "statisticsPickerRuntimeStyle";

    style.textContent = `

        .statistics-date-picker-overlay {
            position: fixed;
            inset: 0;
            z-index: 99999;
            display: flex;
            align-items: flex-end;
            justify-content: center;
            padding: 18px;
            background: rgba(12,18,32,.42);
            backdrop-filter: blur(7px);
            -webkit-backdrop-filter: blur(7px);
            opacity: 0;
            transition: opacity .18s ease;
        }

        .statistics-date-picker-overlay.show {
            opacity: 1;
        }

        .statistics-date-picker {
            width: min(100%, 430px);
            padding: 20px;
            border-radius: 26px;
            background: #fff;
            box-shadow:
                0 25px 70px rgba(0,0,0,.22);
            transform: translateY(30px) scale(.97);
            transition:
                transform .22s cubic-bezier(.2,.8,.2,1);
        }

        .statistics-date-picker-overlay.show
        .statistics-date-picker {
            transform: translateY(0) scale(1);
        }

        .stats-picker-head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            margin-bottom: 20px;
        }

        .stats-picker-head small {
            display: block;
            color: #9aa2b1;
            font-size: 9px;
            font-weight: 950;
            letter-spacing: 1.5px;
        }

        .stats-picker-head strong {
            display: block;
            margin-top: 4px;
            color: #29344b;
            font-size: 19px;
            font-weight: 950;
        }

        .stats-picker-head button {
            display: grid;
            place-items: center;
            width: 38px;
            height: 38px;
            border: 0;
            border-radius: 12px;
            color: #667085;
            background: #f1f3f7;
            font-size: 24px;
            cursor: pointer;
        }

        .stats-picker-field {
            display: flex;
            flex-direction: column;
            gap: 7px;
        }

        .stats-picker-field label {
            color: #788295;
            font-size: 11px;
            font-weight: 850;
        }

        .stats-picker-field input,
        .stats-picker-field select {
            width: 100%;
            min-height: 48px;
            padding: 0 13px;
            border: 1px solid #e7eaf0;
            border-radius: 14px;
            outline: none;
            color: #29344b;
            background: #f8f9fb;
            font: inherit;
            font-size: 14px;
            font-weight: 800;
            box-sizing: border-box;
        }

        .stats-picker-field input:focus,
        .stats-picker-field select:focus {
            border-color: #4776e6;
            background: #fff;
            box-shadow:
                0 0 0 4px rgba(71,118,230,.10);
        }

        .stats-picker-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
        }

        .stats-picker-confirm {
            width: 100%;
            min-height: 50px;
            margin-top: 16px;
            border: 0;
            border-radius: 15px;
            color: #fff;
            background:
                linear-gradient(
                    135deg,
                    #4776e6,
                    #3559b7
                );
            box-shadow:
                0 10px 22px
                rgba(55,89,180,.22);
            font-size: 14px;
            font-weight: 900;
            cursor: pointer;
        }

        body.dark .statistics-date-picker {
            background: #1c222d;
        }

        body.dark .stats-picker-head strong {
            color: #edf1f7;
        }

        body.dark .stats-picker-head small {
            color: #8f98a8;
        }

        body.dark .stats-picker-head button {
            color: #dce2eb;
            background: #292f3b;
        }

        body.dark .stats-picker-field label {
            color: #9ca5b5;
        }

        body.dark .stats-picker-field input,
        body.dark .stats-picker-field select {
            border-color: #343c4b;
            color: #e8edf4;
            background: #252b37;
        }

        @media (max-width: 520px) {

            .statistics-date-picker-overlay {
                padding: 10px;
            }

            .statistics-date-picker {
                padding: 18px;
                border-radius: 23px;
            }

        }

    `;

    document.head.appendChild(style);

})();
