/* ========================================================= 
   STATISTICS.JS 
   PREMIUM STATISTICS 
   FULL REBUILD 
   + DATE PICKER NGÀY / THÁNG / NĂM ĐỘNG 
========================================================= */ 
 
 
/* ========================================================= 
   STATE 
========================================================= */ 
 
if (typeof AppState === "undefined") { 
    window.AppState = {}; 
} 
 
if (!AppState.statisticsPeriod) { 
    AppState.statisticsPeriod = "day"; 
} 
 
if ( 
    !(AppState.statisticsDate instanceof Date) || 
    isNaN(AppState.statisticsDate.getTime()) 
) { 
    AppState.statisticsDate = new Date(); 
} 
 
if (!AppState.statisticsMode) { 
    AppState.statisticsMode = "thu"; 
} 
 
 
/* ========================================================= 
   DATE UTILITIES 
========================================================= */ 
 
function statisticsCreateLocalDate(year, month, day) { 
    return new Date( 
        Number(year), 
        Number(month), 
        Number(day), 
        12, 
        0, 
        0, 
        0 
    ); 
} 
 
 
function statisticsDateToString(date) { 
    if ( 
        !(date instanceof Date) || 
        isNaN(date.getTime()) 
    ) { 
        return ""; 
    } 
 
    return ( 
        date.getFullYear() + 
        "-" + 
        String(date.getMonth() + 1).padStart(2, "0") + 
        "-" + 
        String(date.getDate()).padStart(2, "0") 
    ); 
} 
 
 
function statisticsStringToDate(value) { 
    if (!value) { 
        return null; 
    } 
 
    const text = String(value).slice(0, 10); 
 
    const match = text.match( 
        /^(\d{4})-(\d{2})-(\d{2})$/ 
    ); 
 
    if (!match) { 
        return null; 
    } 
 
    const date = statisticsCreateLocalDate( 
        Number(match[1]), 
        Number(match[2]) - 1, 
        Number(match[3]) 
    ); 
 
    return isNaN(date.getTime()) 
        ? null 
        : date; 
} 
 
 
function statisticsNormalizeDate() { 
    if ( 
        !(AppState.statisticsDate instanceof Date) || 
        isNaN(AppState.statisticsDate.getTime()) 
    ) { 
        AppState.statisticsDate = new Date(); 
    } 
 
    AppState.statisticsDate = 
        statisticsCreateLocalDate( 
            AppState.statisticsDate.getFullYear(), 
            AppState.statisticsDate.getMonth(), 
            AppState.statisticsDate.getDate() 
        ); 
} 
 
 
/* ========================================================= 
   MONTH / DATE LABEL 
========================================================= */ 
 
function statisticsMonthName(month) { 
    const months = [ 
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
 
    return months[month] || ""; 
} 
 
 
function statisticsFormatDayMonthYear(date) { 
    if (!(date instanceof Date)) { 
        return ""; 
    } 
 
    return ( 
        String(date.getDate()).padStart(2, "0") + 
        "/" + 
        String(date.getMonth() + 1).padStart(2, "0") + 
        "/" + 
        date.getFullYear() 
    ); 
} 
 
 
/* ========================================================= 
   SET MODE 
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
 
    statisticsNormalizeDate(); 
 
    AppState.statisticsPeriod = period; 
 
    if (period === "month") { 
        AppState.statisticsDate = 
            statisticsCreateLocalDate( 
                AppState.statisticsDate.getFullYear(), 
                AppState.statisticsDate.getMonth(), 
                1 
            ); 
    } 
 
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
   RANGE 
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
 
    if ( 
        AppState.statisticsPeriod === "day" 
    ) { 
        start = baseDate; 
        end = baseDate; 
    } 
 
    else if ( 
        AppState.statisticsPeriod === "week" 
    ) { 
        const day = baseDate.getDay(); 
 
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
            start.getDate() + diff 
        ); 
 
        end = 
            statisticsCreateLocalDate( 
                start.getFullYear(), 
                start.getMonth(), 
                start.getDate() 
            ); 
 
        end.setDate( 
            end.getDate() + 6 
        ); 
    } 
 
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
        start: statisticsDateToString(start), 
        end: statisticsDateToString(end) 
    }; 
} 
 
 
/* ========================================================= 
   TRANSACTION DATE 
========================================================= */ 
 
function statisticsGetTransactionDate(transaction) { 
    if ( 
        !transaction || 
        !transaction.date 
    ) { 
        return ""; 
    } 
 
    return String(transaction.date).slice(0, 10); 
} 
 
 
/* ========================================================= 
   FILTER TRANSACTIONS 
========================================================= */ 
 
function getStatisticsTransactions() { 
    const range = getStatisticsRange(); 
 
    const transactions = 
        Array.isArray(AppState.transactions) 
            ? AppState.transactions 
            : []; 
 
    return transactions.filter(transaction => { 
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
    }); 
} 
 
 
/* ========================================================= 
   SAFE 
========================================================= */ 
 
function statisticsSafeText(value) { 
    if ( 
        value === null || 
        value === undefined 
    ) { 
        return ""; 
    } 
 
    return String(value); 
} 
 
 
function statisticsEscapeHTML(value) { 
    const text = 
        statisticsSafeText(value); 
 
    if (typeof escapeHTML === "function") { 
        try { 
            return escapeHTML(text); 
        } catch (error) {} 
    } 
 
    return text 
        .replace(/&/g, "&amp;") 
        .replace(/</g, "&lt;") 
        .replace(/>/g, "&gt;") 
        .replace(/"/g, "&quot;") 
        .replace(/'/g, "&#039;"); 
} 
 
 
/* ========================================================= 
   NUMBER 
========================================================= */ 
 
function statisticsNumber(value) { 
    if (typeof toNumber === "function") { 
        try { 
            return Number(toNumber(value)) || 0; 
        } catch (error) {} 
    } 
 
    if (typeof value === "number") { 
        return isFinite(value) 
            ? value 
            : 0; 
    } 
 
    const number = 
        Number( 
            String(value || 0) 
                .replace(/[^\d.-]/g, "") 
        ); 
 
    return isFinite(number) 
        ? number 
        : 0; 
} 
 
 
/* ========================================================= 
   MONEY 
========================================================= */ 
 
function statisticsMoney(value) { 
    if (typeof formatMoney === "function") { 
        try { 
            return formatMoney( 
                statisticsNumber(value) 
            ); 
        } catch (error) {} 
    } 
 
    return ( 
        statisticsNumber(value) 
            .toLocaleString("vi-VN") + 
        " ₫" 
    ); 
} 
 
 
/* ========================================================= 
   SET TEXT 
========================================================= */ 
 
function statisticsSetText(id, value) { 
    const element = 
        document.getElementById(id); 
 
    if (!element) { 
        return; 
    } 
 
    element.textContent = 
        statisticsSafeText(value); 
} 
 
 
function statisticsSetTextCompat(id, value) { 
    if (typeof setText === "function") { 
        try { 
            setText(id, value); 
            return; 
        } catch (error) {} 
    } 
 
    statisticsSetText(id, value); 
} 
 
 
/* ========================================================= 
   DISH COST 
========================================================= */ 
 
function statisticsGetDishCost(transaction) { 
    if (!transaction) { 
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
        } catch (error) {} 
    } 
 
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
                    transaction.type === "thu" 
            ); 
 
        const expenses = 
            transactions.filter( 
                transaction => 
                    transaction && 
                    transaction.type === "chi" 
            ); 
 
 
        /* ================================================= 
           REVENUE 
        ================================================= */ 
 
        const revenue = 
            income.reduce( 
                (sum, transaction) => 
                    sum + 
                    statisticsNumber( 
                        transaction.amount 
                    ), 
                0 
            ); 
 
 
        /* ================================================= 
           EXPENSE 
        ================================================= */ 
 
        const expense = 
            expenses.reduce( 
                (sum, transaction) => 
                    sum + 
                    statisticsNumber( 
                        transaction.amount 
                    ), 
                0 
            ); 
 
 
        /* ================================================= 
           APP FEES 
        ================================================= */ 
 
        const shopeeFee = 
            income 
                .filter( 
                    transaction => 
                        transaction.source === 
                        "ShopeeFood" 
                ) 
                .reduce( 
                    (sum, transaction) => 
                        sum + 
                        statisticsNumber( 
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
                    (sum, transaction) => 
                        sum + 
                        statisticsNumber( 
                            transaction.app_fee 
                        ), 
                    0 
                ); 
 
 
        /* ================================================= 
           COST 
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
            statisticsMoney(revenue) 
        ); 
 
        statisticsSetTextCompat( 
            "statisticsCOD", 
            statisticsMoney(codCost) 
        ); 
 
        statisticsSetTextCompat( 
            "statisticsExpense", 
            statisticsMoney(expense) 
        ); 
 
        statisticsSetTextCompat( 
            "statisticsShopeeFee", 
            statisticsMoney(shopeeFee) 
        ); 
 
        statisticsSetTextCompat( 
            "statisticsGrabFee", 
            statisticsMoney(grabFee) 
        ); 
 
        statisticsSetTextCompat( 
            "statisticsProfit", 
            statisticsMoney(profit) 
        ); 
 
 
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
           EXTRA OVERVIEW 
        ================================================= */ 
 
        statisticsSetTextCompat( 
            "statisticsTotalRevenue", 
            statisticsMoney(revenue) 
        ); 
 
        statisticsSetTextCompat( 
            "statisticsTotalExpense", 
            statisticsMoney(expense) 
        ); 
 
        statisticsSetTextCompat( 
            "statisticsTotalCost", 
            statisticsMoney(codCost) 
        ); 
 
        statisticsSetTextCompat( 
            "statisticsTotalAppFee", 
            statisticsMoney( 
                shopeeFee + grabFee 
            ) 
        ); 
 
 
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
           LABEL 
        ================================================= */ 
 
        const periodLabel = 
            getPeriodLabel(); 
 
        statisticsSetTextCompat( 
            "statisticsPeriodLabel", 
            periodLabel 
        ); 
 
        statisticsSetTextCompat( 
            "statisticsDateLabel", 
            periodLabel 
        ); 
 
        statisticsSetTextCompat( 
            "statisticsDatePickerLabel", 
            periodLabel 
        ); 
 
 
        document 
            .querySelectorAll(".period-tab") 
            .forEach(button => { 
                button.classList.toggle( 
                    "active", 
                    button.dataset.period === 
                    AppState.statisticsPeriod 
                ); 
            }); 
 
 
        hideOldStatisticsModeTabs(); 
 
        updateStatisticsNavigationButtons(); 
 
        updateStatisticsDateDisplay(); 
 
    } catch (error) { 
        console.error( 
            "Statistics render error:", 
            error 
        ); 
    } 
} 
 
 
/* ========================================================= 
   OLD TABS 
========================================================= */ 
 
function hideOldStatisticsModeTabs() { 
    [ 
        "statisticsIncomeTab", 
        "statisticsExpenseTab" 
    ].forEach(id => { 
        const element = 
            document.getElementById(id); 
 
        if (element) { 
            element.style.display = "none"; 
        } 
    }); 
} 
 
 
/* ========================================================= 
   COST 
========================================================= */ 
 
function calculatePeriodCODCost(transactions) { 
    if (!Array.isArray(transactions)) { 
        return 0; 
    } 
 
    return transactions.reduce( 
        (total, transaction) => 
            total + 
            statisticsGetDishCost( 
                transaction 
            ), 
        0 
    ); 
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
        Array.isArray(transactions) 
            ? transactions 
            : [] 
    ).forEach(transaction => { 
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
 
        map[name].quantity++; 
 
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
    }); 
 
    container.innerHTML = ""; 
 
    const entries = 
        Object.entries(map) 
            .sort( 
                (a, b) => 
                    b[1].revenue - 
                    a[1].revenue 
            ); 
 
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
 
    entries.forEach( 
        ([name, item]) => { 
            const profit = 
                item.revenue - 
                item.fee - 
                item.cost; 
 
            const row = 
                document.createElement("div"); 
 
            row.className = 
                "statistics-dish-row"; 
 
            row.innerHTML = ` 
                <div class="statistics-dish-top"> 
                    <span class="statistics-dish-name"> 
                        <span class="statistics-dish-icon"> 
                            🍜 
                        </span> 
                        ${statisticsEscapeHTML(name)} 
                    </span> 
 
                    <strong class=" 
                        statistics-dish-profit 
                        ${profit >= 0 
                            ? "positive" 
                            : "negative"} 
                    "> 
                        ${statisticsMoney(profit)} 
                    </strong> 
                </div> 
 
                <div class="statistics-dish-detail"> 
                    <span>${item.quantity} đơn</span> 
 
                    <span> 
                        Thu: 
                        ${statisticsMoney(item.revenue)} 
                    </span> 
 
                    <span> 
                        Vốn: 
                        ${statisticsMoney(item.cost)} 
                    </span> 
 
                    <span> 
                        App: 
                        ${statisticsMoney(item.fee)} 
                    </span> 
                </div> 
            `; 
 
            container.appendChild(row); 
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
 
    sources.forEach(source => { 
        const items = 
            ( 
                Array.isArray(transactions) 
                    ? transactions 
                    : [] 
            ).filter( 
                transaction => 
                    transaction && 
                    transaction.source === 
                    source.name 
            ); 
 
        const revenue = 
            items.reduce( 
                (sum, transaction) => 
                    sum + 
                    statisticsNumber( 
                        transaction.amount 
                    ), 
                0 
            ); 
 
        const fee = 
            items.reduce( 
                (sum, transaction) => 
                    sum + 
                    statisticsNumber( 
                        transaction.app_fee 
                    ), 
                0 
            ); 
 
        const row = 
            document.createElement("div"); 
 
        row.className = 
            "statistics-source-row"; 
 
        row.innerHTML = ` 
            <div class="statistics-source-left"> 
                <span class="statistics-source-icon"> 
                    ${source.icon} 
                </span> 
 
                <div> 
                    <strong> 
                        ${statisticsEscapeHTML(source.name)} 
                    </strong> 
 
                    <small> 
                        ${items.length} đơn 
                    </small> 
                </div> 
            </div> 
 
            <div class="statistics-source-money"> 
                <strong> 
                    ${statisticsMoney(revenue)} 
                </strong> 
 
                <small> 
                    Phí: 
                    ${statisticsMoney(fee)} 
                </small> 
            </div> 
        `; 
 
        container.appendChild(row); 
    }); 
} 
 
 
/* ========================================================= 
   EXPENSE 
========================================================= */ 
 
function renderStatisticsExpenses( 
    expenses 
) { 
    if (!Array.isArray(expenses)) { 
        expenses = []; 
    } 
 
    const total = 
        expenses.reduce( 
            (sum, transaction) => 
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
        statisticsMoney(total) 
    ); 
 
    statisticsSetTextCompat( 
        "statisticsExpenseAmount", 
        statisticsMoney(total) 
    ); 
 
    statisticsSetTextCompat( 
        "statisticsExpenseCount", 
        count 
    ); 
 
    statisticsSetTextCompat( 
        "statisticsExpenseAverage", 
        statisticsMoney(average) 
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
 
    expenses.forEach(transaction => { 
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
            map[category] = 0; 
        } 
 
        map[category] += 
            statisticsNumber( 
                transaction.amount 
            ); 
    }); 
 
    const entries = 
        Object.entries(map) 
            .sort( 
                (a, b) => 
                    b[1] - 
                    a[1] 
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
                    ? amount / total * 100 
                    : 0; 
 
            const row = 
                document.createElement("div"); 
 
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
                        ${statisticsEscapeHTML(name)} 
                    </span> 
 
                    <strong class=" 
                        statistics-expense-category-money 
                    "> 
                        ${statisticsMoney(amount)} 
                    </strong> 
                </div> 
 
                <div class=" 
                    statistics-expense-category-bar 
                "> 
                    <span 
                        style=" 
                            width:${Math.min( 
                                Math.max(percent, 0), 
                                100 
                            )}%; 
                        " 
                    ></span> 
                </div> 
 
                <div class=" 
                    statistics-expense-category-percent 
                "> 
                    ${percent.toFixed(1)}% 
                </div> 
            `; 
 
            container.appendChild(row); 
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
            (a, b) => 
                String(b.date || "") 
                    .localeCompare( 
                        String(a.date || "") 
                    ) 
        ); 
 
    sorted.forEach(transaction => { 
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
            document.createElement("div"); 
 
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
                    ${statisticsEscapeHTML(name)} 
                </div> 
 
                <div class=" 
                    statistics-expense-category 
                "> 
                    ${statisticsEscapeHTML(category)} 
                </div> 
 
                <div class=" 
                    statistics-expense-date 
                "> 
                    ${statisticsEscapeHTML(dateLabel)} 
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
 
        container.appendChild(row); 
    }); 
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
                <span>📊</span> 
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
 
    transactions.forEach(transaction => { 
        if (!transaction) { 
            return; 
        } 
 
        const date = 
            statisticsGetTransactionDate( 
                transaction 
            ); 
 
        if (!date) { 
            return; 
        } 
 
        if (!daily[date]) { 
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
            transaction.type === "thu" 
        ) { 
            daily[date].thu += amount; 
        } 
 
        if ( 
            transaction.type === "chi" 
        ) { 
            daily[date].chi += amount; 
        } 
    }); 
 
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
 
    chart.appendChild(legend); 
 
    const chartBody = 
        document.createElement("div"); 
 
    chartBody.className = 
        "statistics-chart-body"; 
 
    dates.forEach(date => { 
        const data = daily[date]; 
 
        const maxHeight = 145; 
 
        const incomeHeight = 
            data.thu > 0 
                ? Math.max( 
                    8, 
                    data.thu / 
                    maxValue * 
                    maxHeight 
                ) 
                : 0; 
 
        const expenseHeight = 
            data.chi > 0 
                ? Math.max( 
                    8, 
                    data.chi / 
                    maxValue * 
                    maxHeight 
                ) 
                : 0; 
 
        const dateObject = 
            statisticsStringToDate(date); 
 
        let label = date; 
 
        if (dateObject) { 
            label = 
                dateObject.getDate() + 
                "/" + 
                ( 
                    dateObject.getMonth() + 1 
                ); 
        } 
 
        const item = 
            document.createElement("div"); 
 
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
                ${statisticsEscapeHTML(label)} 
            </div> 
        `; 
 
        chartBody.appendChild(item); 
    }); 
 
    chart.appendChild(chartBody); 
} 
 
 
/* ========================================================= 
   DONUT 
========================================================= */ 
 
function statisticsCreateDonut( 
    percent, 
    type 
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
    income, 
    expenses 
) { 
    let section = 
        document.getElementById( 
            "statisticsPercentWheel" 
        ); 
 
    if (!section) { 
        const page = 
            document.getElementById( 
                "statisticsPage" 
            ); 
 
        if (!page) { 
            return; 
        } 
 
        section = 
            document.createElement("section"); 
 
        section.id = 
            "statisticsPercentWheel"; 
 
        section.className = 
            "card statistics-percent-section"; 
 
        page.appendChild(section); 
    } 
 
    const total = 
        revenue + 
        expense; 
 
    const incomePercent = 
        total > 0 
            ? revenue / total * 100 
            : 0; 
 
    const expensePercent = 
        total > 0 
            ? expense / total * 100 
            : 0; 
 
 
    /* ===================================================== 
       DISH MAP 
    ===================================================== */ 
 
    const dishMap = {}; 
 
    ( 
        Array.isArray(income) 
            ? income 
            : [] 
    ).forEach(transaction => { 
        if (!transaction) { 
            return; 
        } 
 
        const name = 
            statisticsSafeText( 
                transaction.dish_name || 
                transaction.name || 
                "Không tên" 
            ); 
 
        if (!dishMap[name]) { 
            dishMap[name] = { 
                revenue: 0, 
                quantity: 0 
            }; 
        } 
 
        dishMap[name].revenue += 
            statisticsNumber( 
                transaction.amount 
            ); 
 
        dishMap[name].quantity++; 
    }); 
 
    const dishes = 
        Object.entries(dishMap) 
            .sort( 
                (a, b) => 
                    b[1].revenue - 
                    a[1].revenue 
            ); 
 
 
    /* ===================================================== 
       EXPENSE MAP 
    ===================================================== */ 
 
    const expenseMap = {}; 
 
    ( 
        Array.isArray(expenses) 
            ? expenses 
            : [] 
    ).forEach(transaction => { 
        if (!transaction) { 
            return; 
        } 
 
        const category = 
            statisticsSafeText( 
                transaction.category_name || 
                transaction.category || 
                "Khác" 
            ); 
 
        if (!expenseMap[category]) { 
            expenseMap[category] = 0; 
        } 
 
        expenseMap[category] += 
            statisticsNumber( 
                transaction.amount 
            ); 
    }); 
 
    const expenseCategories = 
        Object.entries(expenseMap) 
            .sort( 
                (a, b) => 
                    b[1] - 
                    a[1] 
            ); 
 
    const topDishes = 
        dishes.slice(0, 8); 
 
    const topExpenses = 
        expenseCategories.slice(0, 8); 
 
 
    /* ===================================================== 
       DISH HTML 
    ===================================================== */ 
 
    let dishesHTML = ""; 
 
    if (topDishes.length) { 
        topDishes.forEach( 
            ([name, item]) => { 
                const percent = 
                    revenue > 0 
                        ? item.revenue / 
                          revenue * 
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
                            <div 
                                class=" 
                                    statistics-detail-wheel-name 
                                " 
                                title="${statisticsEscapeHTML(name)}" 
                            > 
                                ${statisticsEscapeHTML(name)} 
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
       EXPENSE HTML 
    ===================================================== */ 
 
    let expenseHTML = ""; 
 
    if (topExpenses.length) { 
        topExpenses.forEach( 
            ([name, amount]) => { 
                const percent = 
                    expense > 0 
                        ? amount / 
                          expense * 
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
                            <div 
                                class=" 
                                    statistics-detail-wheel-name 
                                " 
                                title="${statisticsEscapeHTML(name)}" 
                            > 
                                ${statisticsEscapeHTML(name)} 
                            </div> 
 
                            <div class=" 
                                statistics-detail-wheel-money 
                            "> 
                                ${statisticsMoney(amount)} 
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
 
    if (topExpenses.length) { 
        expenseAnalysisHTML = 
            topExpenses 
                .map( 
                    ([name, amount]) => { 
                        const percent = 
                            expense > 0 
                                ? amount / 
                                  expense * 
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
 
                                        ${statisticsEscapeHTML(name)} 
                                    </span> 
 
                                    <strong class=" 
                                        statistics-expense-analysis-money 
                                    "> 
                                        ${statisticsMoney(amount)} 
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
                                    ${percent.toFixed(1)}% 
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
       RENDER 
    ===================================================== */ 
 
    section.innerHTML = ` 
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
                ${statisticsMoney(total)} 
            </small> 
        </div> 
 
 
        <div class=" 
            statistics-wheel-grid 
        "> 
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
                        ${statisticsMoney(revenue)} 
                    </span> 
                </div> 
            </div> 
 
 
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
                        ${statisticsMoney(expense)} 
                    </span> 
                </div> 
            </div> 
        </div> 
 
 
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
                    ${statisticsMoney(expense)} 
                </small> 
            </div> 
 
            <div class=" 
                statistics-expense-analysis-list 
            "> 
                ${expenseAnalysisHTML} 
            </div> 
        </div> 
 
 
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
========================================================= */ 
 
function statisticsPrevious() { 
    statisticsNormalizeDate(); 
 
    const current = 
        AppState.statisticsDate; 
 
    if ( 
        AppState.statisticsPeriod === "day" 
    ) { 
        const previous = 
            statisticsCreateLocalDate( 
                current.getFullYear(), 
                current.getMonth(), 
                current.getDate() 
            ); 
 
        previous.setDate( 
            previous.getDate() - 1 
        ); 
 
        AppState.statisticsDate = 
            previous; 
    } 
 
    else if ( 
        AppState.statisticsPeriod === "week" 
    ) { 
        const previous = 
            statisticsCreateLocalDate( 
                current.getFullYear(), 
                current.getMonth(), 
                current.getDate() 
            ); 
 
        previous.setDate( 
            previous.getDate() - 7 
        ); 
 
        AppState.statisticsDate = 
            previous; 
    } 
 
    else { 
        const previous = 
            statisticsCreateLocalDate( 
                current.getFullYear(), 
                current.getMonth(), 
                1 
            ); 
 
        previous.setMonth( 
            previous.getMonth() - 1 
        ); 
 
        AppState.statisticsDate = 
            previous; 
    } 
 
    closeStatisticsDatePicker(); 
 
    renderStatistics(); 
} 
 
 
/* ========================================================= 
   NEXT 
========================================================= */ 
 
function statisticsNext() { 
    statisticsNormalizeDate(); 
 
    const current = 
        AppState.statisticsDate; 
 
    if ( 
        AppState.statisticsPeriod === "day" 
    ) { 
        const next = 
            statisticsCreateLocalDate( 
                current.getFullYear(), 
                current.getMonth(), 
                current.getDate() 
            ); 
 
        next.setDate( 
            next.getDate() + 1 
        ); 
 
        AppState.statisticsDate = 
            next; 
    } 
 
    else if ( 
        AppState.statisticsPeriod === "week" 
    ) { 
        const next = 
            statisticsCreateLocalDate( 
                current.getFullYear(), 
                current.getMonth(), 
                current.getDate() 
            ); 
 
        next.setDate( 
            next.getDate() + 7 
        ); 
 
        AppState.statisticsDate = 
            next; 
    } 
 
    else { 
        const next = 
            statisticsCreateLocalDate( 
                current.getFullYear(), 
                current.getMonth(), 
                1 
            ); 
 
        next.setMonth( 
            next.getMonth() + 1 
        ); 
 
        AppState.statisticsDate = 
            next; 
    } 
 
    closeStatisticsDatePicker(); 
 
    renderStatistics(); 
} 
 
 
/* ========================================================= 
   TODAY 
========================================================= */ 
 
function statisticsToday() { 
    const now = new Date(); 
 
    AppState.statisticsDate = 
        statisticsCreateLocalDate( 
            now.getFullYear(), 
            now.getMonth(), 
            now.getDate() 
        ); 
 
    closeStatisticsDatePicker(); 
 
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
        AppState.statisticsPeriod === "day" 
    ) { 
        return start 
            ? statisticsFormatDayMonthYear(start) 
            : range.start; 
    } 
 
    if ( 
        AppState.statisticsPeriod === "month" 
    ) { 
        if (start) { 
            return ( 
                statisticsMonthName( 
                    start.getMonth() 
                ) + 
                "/" + 
                start.getFullYear() 
            ); 
        } 
    } 
 
    if (start && end) { 
        return ( 
            statisticsFormatDayMonthYear(start) + 
            " - " + 
            statisticsFormatDayMonthYear(end) 
        ); 
    } 
 
    return ""; 
} 
 
 
/* ========================================================= 
   UPDATE DATE DISPLAY 
========================================================= */ 
 
function updateStatisticsDateDisplay() { 
    statisticsNormalizeDate(); 
 
    const date = 
        AppState.statisticsDate; 
 
    let label = ""; 
 
    if ( 
        AppState.statisticsPeriod === "day" 
    ) { 
        label = 
            statisticsFormatDayMonthYear( 
                date 
            ); 
    } 
 
    else if ( 
        AppState.statisticsPeriod === "month" 
    ) { 
        label = 
            statisticsMonthName( 
                date.getMonth() 
            ) + 
            "/" + 
            date.getFullYear(); 
    } 
 
    else { 
        label = 
            getPeriodLabel(); 
    } 
 
    const ids = [ 
        "statisticsDateLabel", 
        "statisticsPeriodLabel", 
        "statisticsDatePickerLabel" 
    ]; 
 
    ids.forEach(id => { 
        statisticsSetTextCompat( 
            id, 
            label 
        ); 
    }); 
 
 
    /* 
     * Cập nhật tất cả phần tử dùng 
     * data-statistics-date-display 
     */ 
 
    document 
        .querySelectorAll( 
            "[data-statistics-date-display]" 
        ) 
        .forEach(element => { 
            element.textContent = label; 
        }); 
} 
 
 
/* ========================================================= 
   NAVIGATION BUTTON STATE 
========================================================= */ 
 
function updateStatisticsNavigationButtons() { 
    document 
        .querySelectorAll( 
            ".statistics-date-row button" 
        ) 
        .forEach(button => { 
            button.disabled = false; 
            button.removeAttribute( 
                "aria-disabled" 
            ); 
        }); 
} 
 
 
/* ========================================================= 
   DATE PICKER 
   --------------------------------------------------------- 
   BẤM: 
      22/08/2026 
 
   SẼ HIỆN: 
      Năm 
      Tháng 
      Ngày 
 
   Tất cả đều sinh động theo năm/tháng hiện tại. 
========================================================= */ 
 
let statisticsPickerYear = null; 
let statisticsPickerMonth = null; 
 
 
function createStatisticsDatePicker() { 
    let picker = 
        document.getElementById( 
            "statisticsDatePicker" 
        ); 
 
    if (picker) { 
        return picker; 
    } 
 
    picker = 
        document.createElement("div"); 
 
    picker.id = 
        "statisticsDatePicker"; 
 
    picker.className = 
        "statistics-date-picker"; 
 
    picker.innerHTML = ` 
        <div class=" 
            statistics-date-picker-backdrop 
        "></div> 
 
        <div class=" 
            statistics-date-picker-panel 
        "> 
            <div class=" 
                statistics-date-picker-header 
            "> 
                <div> 
                    <small> 
                        CHỌN THỜI GIAN 
                    </small> 
 
                    <strong 
                        id=" 
                            statisticsPickerTitle 
                        " 
                    > 
                        22/08/2026 
                    </strong> 
                </div> 
 
                <button 
                    type="button" 
                    class=" 
                        statistics-picker-close 
                    " 
                    data-picker-action="close" 
                    aria-label="Đóng" 
                > 
                    × 
                </button> 
            </div> 
 
 
            <div class=" 
                statistics-picker-periods 
            "> 
                <button 
                    type="button" 
                    data-picker-period="day" 
                > 
                    Ngày 
                </button> 
 
                <button 
                    type="button" 
                    data-picker-period="week" 
                > 
                    Tuần 
                </button> 
 
                <button 
                    type="button" 
                    data-picker-period="month" 
                > 
                    Tháng 
                </button> 
            </div> 
 
 
            <div 
                id=" 
                    statisticsPickerContent 
                " 
                class=" 
                    statistics-picker-content 
                " 
            ></div> 
 
 
            <div class=" 
                statistics-picker-footer 
            "> 
                <button 
                    type="button" 
                    data-picker-action="today" 
                > 
                    Hôm nay 
                </button> 
 
                <button 
                    type="button" 
                    class=" 
                        primary 
                    " 
                    data-picker-action="apply" 
                > 
                    Chọn 
                </button> 
            </div> 
        </div> 
    `; 
 
    document.body.appendChild(picker); 
 
    return picker; 
} 
 
 
/* ========================================================= 
   OPEN PICKER 
========================================================= */ 
 
function openStatisticsDatePicker() { 
    statisticsNormalizeDate(); 
 
    const picker = 
        createStatisticsDatePicker(); 
 
    statisticsPickerYear = 
        AppState.statisticsDate.getFullYear(); 
 
    statisticsPickerMonth = 
        AppState.statisticsDate.getMonth(); 
 
    picker.classList.add("open"); 
 
    renderStatisticsDatePicker(); 
 
    setTimeout(() => { 
        document.body.classList.add( 
            "statistics-picker-open" 
        ); 
    }, 0); 
} 
 
 
/* ========================================================= 
   CLOSE PICKER 
========================================================= */ 
 
function closeStatisticsDatePicker() { 
    const picker = 
        document.getElementById( 
            "statisticsDatePicker" 
        ); 
 
    if (picker) { 
        picker.classList.remove("open"); 
    } 
 
    document.body.classList.remove( 
        "statistics-picker-open" 
    ); 
} 
 
 
/* ========================================================= 
   RENDER PICKER 
========================================================= */ 
 
function renderStatisticsDatePicker() { 
    const picker = 
        document.getElementById( 
            "statisticsDatePicker" 
        ); 
 
    if (!picker) { 
        return; 
    } 
 
    const content = 
        document.getElementById( 
            "statisticsPickerContent" 
        ); 
 
    if (!content) { 
        return; 
    } 
 
    const selected = 
        AppState.statisticsDate; 
 
    const period = 
        AppState.statisticsPeriod; 
 
    picker 
        .querySelectorAll( 
            "[data-picker-period]" 
        ) 
        .forEach(button => { 
            button.classList.toggle( 
                "active", 
                button.dataset.pickerPeriod === 
                period 
            ); 
        }); 
 
 
    /* 
     * TITLE 
     */ 
 
    const title = 
        document.getElementById( 
            "statisticsPickerTitle" 
        ); 
 
    if (title) { 
        title.textContent = 
            statisticsFormatDayMonthYear( 
                selected 
            ); 
    } 
 
 
    /* ===================================================== 
       DAY 
    ===================================================== */ 
 
    if (period === "day") { 
        renderStatisticsDayPicker( 
            content 
        ); 
        return; 
    } 
 
 
    /* ===================================================== 
       WEEK 
    ===================================================== */ 
 
    if (period === "week") { 
        renderStatisticsWeekPicker( 
            content 
        ); 
        return; 
    } 
 
 
    /* ===================================================== 
       MONTH 
    ===================================================== */ 
 
    renderStatisticsMonthPicker( 
        content 
    ); 
} 
 
 
/* ========================================================= 
   YEAR SELECTOR 
========================================================= */ 
 
function renderStatisticsYearSelector( 
    currentYear 
) { 
    let html = ` 
        <div class=" 
            statistics-picker-section-title 
        "> 
            Năm 
        </div> 
 
        <div class=" 
            statistics-year-grid 
        "> 
    `; 
 
    /* 
     * Không cố định. 
     * 
     * Luôn tạo vùng: 
     * 
     * năm hiện tại - 6 
     * đến 
     * năm hiện tại + 6 
     */ 
 
    for ( 
        let year = currentYear - 6; 
        year <= currentYear + 6; 
        year++ 
    ) { 
        html += ` 
            <button 
                type="button" 
                class=" 
                    statistics-year-item 
                    ${year === 
                    statisticsPickerYear 
                        ? "active" 
                        : ""} 
                " 
                data-picker-year="${year}" 
            > 
                ${year} 
            </button> 
        `; 
    } 
 
    html += `</div>`; 
 
    return html; 
} 
 
 
/* ========================================================= 
   MONTH GRID 
========================================================= */ 
 
function renderStatisticsMonthGrid() { 
    let html = ` 
        <div class=" 
            statistics-picker-section-title 
        "> 
            Tháng 
        </div> 
 
        <div class=" 
            statistics-month-grid 
        "> 
    `; 
 
    for ( 
        let month = 0; 
        month < 12; 
        month++ 
    ) { 
        html += ` 
            <button 
                type="button" 
                class=" 
                    statistics-month-item 
                    ${month === 
                    statisticsPickerMonth 
                        ? "active" 
                        : ""} 
                " 
                data-picker-month="${month}" 
            > 
                ${statisticsMonthName(month)} 
            </button> 
        `; 
    } 
 
    html += `</div>`; 
 
    return html; 
} 
 
 
/* ========================================================= 
   DAY GRID 
========================================================= */ 
 
function renderStatisticsCalendar() { 
    const year = 
        statisticsPickerYear; 
 
    const month = 
        statisticsPickerMonth; 
 
    const firstDay = 
        statisticsCreateLocalDate( 
            year, 
            month, 
            1 
        ); 
 
    const lastDay = 
        statisticsCreateLocalDate( 
            year, 
            month + 1, 
            0 
        ); 
 
    /* 
     * Monday = 0 
     */ 
 
    let startDay = 
        firstDay.getDay() - 1; 
 
    if (startDay < 0) { 
        startDay = 6; 
    } 
 
    const daysInMonth = 
        lastDay.getDate(); 
 
    let html = ` 
        <div class=" 
            statistics-picker-calendar-header 
        "> 
            <button 
                type="button" 
                data-picker-calendar="prev-year" 
            > 
                ‹ 
            </button> 
 
            <strong> 
                ${statisticsMonthName(month)} 
                ${year} 
            </strong> 
 
            <button 
                type="button" 
                data-picker-calendar="next-year" 
            > 
                › 
            </button> 
        </div> 
 
        <div class=" 
            statistics-calendar-weekdays 
        "> 
            <span>T2</span> 
            <span>T3</span> 
            <span>T4</span> 
            <span>T5</span> 
            <span>T6</span> 
            <span>T7</span> 
            <span>CN</span> 
        </div> 
 
        <div class=" 
            statistics-calendar-grid 
        "> 
    `; 
 
 
    /* 
     * Ô trống đầu tháng 
     */ 
 
    for ( 
        let i = 0; 
        i < startDay; 
        i++ 
    ) { 
        html += ` 
            <span 
                class=" 
                    statistics-calendar-empty 
                " 
            ></span> 
        `; 
    } 
 
 
    /* 
     * Ngày trong tháng 
     */ 
 
    for ( 
        let day = 1; 
        day <= daysInMonth; 
        day++ 
    ) { 
        const isSelected = 
            AppState.statisticsDate.getFullYear() === year && 
            AppState.statisticsDate.getMonth() === month && 
            AppState.statisticsDate.getDate() === day; 
 
        const now = 
            new Date(); 
 
        const isToday = 
            now.getFullYear() === year && 
            now.getMonth() === month && 
            now.getDate() === day; 
 
        html += ` 
            <button 
                type="button" 
                class=" 
                    statistics-calendar-day 
                    ${isSelected 
                        ? "active" 
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
 
    html += ` 
        </div> 
    `; 
 
    return html; 
} 
 
 
/* ========================================================= 
   DAY PICKER 
========================================================= */ 
 
function renderStatisticsDayPicker( 
    content 
) { 
    content.innerHTML = ` 
        <div class=" 
            statistics-picker-scroll 
        "> 
 
            ${renderStatisticsYearSelector( 
                statisticsPickerYear 
            )} 
 
            ${renderStatisticsMonthGrid()} 
 
            <div 
                class=" 
                    statistics-picker-section-title 
                " 
            > 
                Ngày 
            </div> 
 
            ${renderStatisticsCalendar()} 
 
        </div> 
    `; 
} 
 
 
/* ========================================================= 
   WEEK PICKER 
========================================================= */ 
 
function renderStatisticsWeekPicker( 
    content 
) { 
    const selected = 
        AppState.statisticsDate; 
 
    const selectedYear = 
        selected.getFullYear(); 
 
    const selectedMonth = 
        selected.getMonth(); 
 
    content.innerHTML = ` 
        <div class=" 
            statistics-picker-scroll 
        "> 
 
            ${renderStatisticsYearSelector( 
                selectedYear 
            )} 
 
            ${renderStatisticsMonthGrid()} 
 
            <div 
                class=" 
                    statistics-picker-section-title 
                " 
            > 
                Chọn một ngày trong tuần 
            </div> 
 
            ${renderStatisticsCalendar()} 
 
        </div> 
    `; 
} 
 
 
/* ========================================================= 
   MONTH PICKER 
========================================================= */ 
 
function renderStatisticsMonthPicker( 
    content 
) { 
    content.innerHTML = ` 
        <div class=" 
            statistics-picker-scroll 
        "> 
 
            ${renderStatisticsYearSelector( 
                statisticsPickerYear 
            )} 
 
            ${renderStatisticsMonthGrid()} 
 
        </div> 
    `; 
} 
 
 
/* ========================================================= 
   APPLY PICKER 
========================================================= */ 
 
function applyStatisticsDatePicker() { 
    const selected = 
        AppState.statisticsDate; 
 
    if ( 
        AppState.statisticsPeriod === 
        "month" 
    ) { 
        AppState.statisticsDate = 
            statisticsCreateLocalDate( 
                statisticsPickerYear, 
                statisticsPickerMonth, 
                1 
            ); 
    } 
 
    else { 
        const day = 
            selected.getDate(); 
 
        /* 
         * Khi đổi tháng: 
         * nếu ngày cũ không tồn tại 
         * trong tháng mới thì đưa về 
         * ngày cuối tháng. 
         */ 
 
        const maxDay = 
            statisticsCreateLocalDate( 
                statisticsPickerYear, 
                statisticsPickerMonth + 1, 
                0 
            ).getDate(); 
 
        AppState.statisticsDate = 
            statisticsCreateLocalDate( 
                statisticsPickerYear, 
                statisticsPickerMonth, 
                Math.min( 
                    day, 
                    maxDay 
                ) 
            ); 
    } 
 
    closeStatisticsDatePicker(); 
 
    renderStatistics(); 
} 
 
 
/* ========================================================= 
   PICKER EVENTS 
========================================================= */ 
 
function statisticsBindDatePicker() { 
    if ( 
        window.__statisticsDatePickerBound 
    ) { 
        return; 
    } 
 
    window.__statisticsDatePickerBound = 
        true; 
 
    document.addEventListener( 
        "click", 
        event => { 
 
            const periodButton = 
                event.target.closest( 
                    "[data-picker-period]" 
                ); 
 
            if (periodButton) { 
                event.preventDefault(); 
 
                const period = 
                    periodButton.dataset 
                        .pickerPeriod; 
 
                if ( 
                    ["day", "week", "month"] 
                        .includes(period) 
                ) { 
                    AppState.statisticsPeriod = 
                        period; 
 
                    renderStatisticsDatePicker(); 
                } 
 
                return; 
            } 
 
 
            const yearButton = 
                event.target.closest( 
                    "[data-picker-year]" 
                ); 
 
            if (yearButton) { 
                event.preventDefault(); 
 
                statisticsPickerYear = 
                    Number( 
                        yearButton.dataset 
                            .pickerYear 
                    ); 
 
                renderStatisticsDatePicker(); 
 
                return; 
            } 
 
 
            const monthButton = 
                event.target.closest( 
                    "[data-picker-month]" 
                ); 
 
            if (monthButton) { 
                event.preventDefault(); 
 
                statisticsPickerMonth = 
                    Number( 
                        monthButton.dataset 
                            .pickerMonth 
                    ); 
 
                renderStatisticsDatePicker(); 
 
                return; 
            } 
 
 
            const dayButton = 
                event.target.closest( 
                    "[data-picker-day]" 
                ); 
 
            if (dayButton) { 
                event.preventDefault(); 
 
                const day = 
                    Number( 
                        dayButton.dataset 
                            .pickerDay 
                    ); 
 
                const maxDay = 
                    statisticsCreateLocalDate( 
                        statisticsPickerYear, 
                        statisticsPickerMonth + 1, 
                        0 
                    ).getDate(); 
 
                AppState.statisticsDate = 
                    statisticsCreateLocalDate( 
                        statisticsPickerYear, 
                        statisticsPickerMonth, 
                        Math.min( 
                            day, 
                            maxDay 
                        ) 
                    ); 
 
                renderStatisticsDatePicker(); 
 
                return; 
            } 
 
 
            const calendarButton = 
                event.target.closest( 
                    "[data-picker-calendar]" 
                ); 
 
            if (calendarButton) { 
                event.preventDefault(); 
 
                const action = 
                    calendarButton.dataset 
                        .pickerCalendar; 
 
                if ( 
                    action === "prev-year" 
                ) { 
                    statisticsPickerYear--; 
                } 
 
                if ( 
                    action === "next-year" 
                ) { 
                    statisticsPickerYear++; 
                } 
 
                renderStatisticsDatePicker(); 
 
                return; 
            } 
 
 
            const actionButton = 
                event.target.closest( 
                    "[data-picker-action]" 
                ); 
 
            if (actionButton) { 
                event.preventDefault(); 
 
                const action = 
                    actionButton.dataset 
                        .pickerAction; 
 
                if (action === "close") { 
                    closeStatisticsDatePicker(); 
                } 
 
                if (action === "today") { 
                    const now = 
                        new Date(); 
 
                    statisticsPickerYear = 
                        now.getFullYear(); 
 
                    statisticsPickerMonth = 
                        now.getMonth(); 
 
                    AppState.statisticsDate = 
                        statisticsCreateLocalDate( 
                            now.getFullYear(), 
                            now.getMonth(), 
                            now.getDate() 
                        ); 
 
                    renderStatisticsDatePicker(); 
                } 
 
                if (action === "apply") { 
                    applyStatisticsDatePicker(); 
                } 
 
                return; 
            } 
 
 
            if ( 
                event.target.closest( 
                    ".statistics-date-picker-backdrop" 
                ) 
            ) { 
                closeStatisticsDatePicker(); 
            } 
        } 
    ); 
} 
 
 
/* ========================================================= 
   FIND / BIND DATE DISPLAY 
========================================================= */ 
 
function statisticsBindDateDisplay() { 
    if ( 
        window.__statisticsDateDisplayBound 
    ) { 
        return; 
    } 
 
    window.__statisticsDateDisplayBound = 
        true; 
 
    document.addEventListener( 
        "click", 
        event => { 
 
            /* 
             * Hỗ trợ: 
             * 
             * data-statistics-date-picker 
             * 
             * và các id cũ. 
             */ 
 
            const target = 
                event.target.closest( 
                    "[data-statistics-date-picker]" 
                ); 
 
            if (target) { 
                event.preventDefault(); 
                openStatisticsDatePicker(); 
                return; 
            } 
 
 
            const ids = [ 
                "statisticsDateLabel", 
                "statisticsDatePickerLabel" 
            ]; 
 
            const idTarget = 
                event.target.closest( 
                    ids 
                        .map( 
                            id => 
                                "#" + id 
                        ) 
                        .join(",") 
                ); 
 
            if (idTarget) { 
                event.preventDefault(); 
                openStatisticsDatePicker(); 
                return; 
            } 
 
 
            /* 
             * Nếu HTML có cấu trúc: 
             * 
             * <div class="statistics-date-row"> 
             *    <button>‹</button> 
             *    <strong>22/08/2026</strong> 
             *    <button>›</button> 
             * </div> 
             * 
             * thì click vào phần giữa cũng mở picker. 
             */ 
 
            const row = 
                event.target.closest( 
                    ".statistics-date-row" 
                ); 
 
            if (!row) { 
                return; 
            } 
 
            const middle = 
                event.target.closest( 
                    "strong, span, .statistics-date-label, .statistics-period-label" 
                ); 
 
            if (middle) { 
                event.preventDefault(); 
                openStatisticsDatePicker(); 
            } 
        } 
    ); 
} 
 
 
/* ========================================================= 
   NAVIGATION 
========================================================= */ 
 
function statisticsBindNavigation() { 
    if ( 
        window.__statisticsNavigationBound 
    ) { 
        return; 
    } 
 
    window.__statisticsNavigationBound = 
        true; 
 
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
                action === "previous" 
            ) { 
                event.preventDefault(); 
                statisticsPrevious(); 
            } 
 
            if ( 
                action === "next" 
            ) { 
                event.preventDefault(); 
                statisticsNext(); 
            } 
 
            if ( 
                action === "today" 
            ) { 
                event.preventDefault(); 
                statisticsToday(); 
            } 
        } 
    ); 
} 
 
 
/* ========================================================= 
   AUTO CREATE CSS 
   --------------------------------------------------------- 
   JS tự thêm CSS để không cần sửa HTML. 
========================================================= */ 
 
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
 
        body.statistics-picker-open { 
            overflow: hidden; 
        } 
 
        .statistics-date-picker { 
            position: fixed; 
            inset: 0; 
            z-index: 999999; 
            display: none; 
            align-items: center; 
            justify-content: center; 
            padding: 16px; 
        } 
 
        .statistics-date-picker.open { 
            display: flex; 
        } 
 
        .statistics-date-picker-backdrop { 
            position: absolute; 
            inset: 0; 
            background: 
                rgba(8, 15, 30, .58); 
            backdrop-filter: 
                blur(7px); 
        } 
 
        .statistics-date-picker-panel { 
            position: relative; 
            width: min( 
                480px, 
                100% 
            ); 
            max-height: 
                min(760px, 92vh); 
            overflow: hidden; 
            display: flex; 
            flex-direction: column; 
            border-radius: 24px; 
            background: 
                var( 
                    --card-bg, 
                    #ffffff 
                ); 
            color: 
                var( 
                    --text-color, 
                    #111827 
                ); 
            box-shadow: 
                0 30px 90px 
                rgba(0,0,0,.28); 
            animation: 
                statisticsPickerIn 
                .22s 
                ease; 
        } 
 
        @keyframes statisticsPickerIn { 
            from { 
                opacity: 0; 
                transform: 
                    translateY(16px) 
                    scale(.97); 
            } 
 
            to { 
                opacity: 1; 
                transform: 
                    translateY(0) 
                    scale(1); 
            } 
        } 
 
        .statistics-date-picker-header { 
            display: flex; 
            align-items: center; 
            justify-content: space-between; 
            gap: 16px; 
            padding: 
                20px 20px 14px; 
        } 
 
        .statistics-date-picker-header > div { 
            display: flex; 
            flex-direction: column; 
            gap: 5px; 
        } 
 
        .statistics-date-picker-header small { 
            font-size: 10px; 
            font-weight: 800; 
            letter-spacing: .12em; 
            opacity: .55; 
        } 
 
        .statistics-date-picker-header strong { 
            font-size: 24px; 
            line-height: 1.15; 
        } 
 
        .statistics-picker-close { 
            width: 38px; 
            height: 38px; 
            flex: 0 0 38px; 
            border: 0; 
            border-radius: 50%; 
            background: 
                rgba(127,127,127,.12); 
            color: inherit; 
            font-size: 25px; 
            cursor: pointer; 
        } 
 
        .statistics-picker-periods { 
            display: grid; 
            grid-template-columns: 
                repeat(3, 1fr); 
            gap: 7px; 
            margin: 
                0 20px 12px; 
            padding: 5px; 
            border-radius: 14px; 
            background: 
                rgba(127,127,127,.10); 
        } 
 
        .statistics-picker-periods button { 
            border: 0; 
            border-radius: 10px; 
            padding: 10px 8px; 
            background: transparent; 
            color: inherit; 
            font-weight: 700; 
            cursor: pointer; 
        } 
 
        .statistics-picker-periods button.active { 
            background: 
                #2563eb; 
            color: #fff; 
            box-shadow: 
                0 5px 14px 
                rgba(37,99,235,.28); 
        } 
 
        .statistics-picker-content { 
            min-height: 0; 
            overflow: hidden; 
        } 
 
        .statistics-picker-scroll { 
            overflow-y: auto; 
            max-height: 
                58vh; 
            padding: 
                0 20px 10px; 
        } 
 
        .statistics-picker-section-title { 
            margin: 
                12px 0 9px; 
            font-size: 12px; 
            font-weight: 800; 
            text-transform: uppercase; 
            letter-spacing: .06em; 
            opacity: .58; 
        } 
 
        .statistics-year-grid { 
            display: grid; 
            grid-template-columns: 
                repeat(5, 1fr); 
            gap: 7px; 
        } 
 
        .statistics-year-item, 
        .statistics-month-item { 
            min-height: 40px; 
            border: 1px solid 
                rgba(127,127,127,.15); 
            border-radius: 11px; 
            background: 
                rgba(127,127,127,.055); 
            color: inherit; 
            font-weight: 700; 
            cursor: pointer; 
        } 
 
        .statistics-year-item:hover, 
        .statistics-month-item:hover, 
        .statistics-calendar-day:hover { 
            border-color: 
                #2563eb; 
            color: 
                #2563eb; 
        } 
 
        .statistics-year-item.active, 
        .statistics-month-item.active { 
            background: 
                #2563eb; 
            color: #fff; 
            border-color: 
                #2563eb; 
            box-shadow: 
                0 5px 13px 
                rgba(37,99,235,.25); 
        } 
 
        .statistics-month-grid { 
            display: grid; 
            grid-template-columns: 
                repeat(4, 1fr); 
            gap: 8px; 
        } 
 
        .statistics-picker-calendar-header { 
            display: grid; 
            grid-template-columns: 
                42px 1fr 42px; 
            align-items: center; 
            gap: 8px; 
            margin-bottom: 8px; 
        } 
 
        .statistics-picker-calendar-header strong { 
            text-align: center; 
            font-size: 15px; 
        } 
 
        .statistics-picker-calendar-header button { 
            width: 38px; 
            height: 38px; 
            border: 0; 
            border-radius: 10px; 
            background: 
                rgba(127,127,127,.08); 
            color: inherit; 
            font-size: 25px; 
            cursor: pointer; 
        } 
 
        .statistics-calendar-weekdays { 
            display: grid; 
            grid-template-columns: 
                repeat(7, 1fr); 
            margin-bottom: 4px; 
        } 
 
        .statistics-calendar-weekdays span { 
            text-align: center; 
            padding: 6px 0; 
            font-size: 10px; 
            font-weight: 800; 
            opacity: .5; 
        } 
 
        .statistics-calendar-grid { 
            display: grid; 
            grid-template-columns: 
                repeat(7, 1fr); 
            gap: 5px; 
        } 
 
        .statistics-calendar-day, 
        .statistics-calendar-empty { 
            aspect-ratio: 1; 
            min-height: 40px; 
        } 
 
        .statistics-calendar-day { 
            border: 1px solid 
                rgba(127,127,127,.12); 
            border-radius: 11px; 
            background: 
                rgba(127,127,127,.045); 
            color: inherit; 
            font-weight: 700; 
            cursor: pointer; 
        } 
 
        .statistics-calendar-day.today { 
            box-shadow: 
                inset 0 0 0 2px 
                rgba(37,99,235,.32); 
        } 
 
        .statistics-calendar-day.active { 
            background: 
                #2563eb; 
            border-color: 
                #2563eb; 
            color: #fff; 
            box-shadow: 
                0 5px 13px 
                rgba(37,99,235,.28); 
        } 
 
        .statistics-picker-footer { 
            display: flex; 
            justify-content: space-between; 
            gap: 10px; 
            padding: 
                14px 20px 18px; 
            border-top: 
                1px solid 
                rgba(127,127,127,.12); 
        } 
 
        .statistics-picker-footer button { 
            min-width: 100px; 
            border: 0; 
            border-radius: 12px; 
            padding: 11px 16px; 
            background: 
                rgba(127,127,127,.10); 
            color: inherit; 
            font-weight: 800; 
            cursor: pointer; 
        } 
 
        .statistics-picker-footer button.primary { 
            background: 
                #2563eb; 
            color: #fff; 
            box-shadow: 
                0 6px 16px 
                rgba(37,99,235,.25); 
        } 
 
        @media (max-width: 520px) { 
 
            .statistics-date-picker { 
                padding: 8px; 
            } 
 
            .statistics-date-picker-panel { 
                border-radius: 20px; 
                max-height: 96vh; 
            } 
 
            .statistics-picker-scroll { 
                max-height: 62vh; 
                padding-left: 14px; 
                padding-right: 14px; 
            } 
 
            .statistics-date-picker-header { 
                padding: 
                    16px 14px 10px; 
            } 
 
            .statistics-picker-periods { 
                margin: 
                    0 14px 10px; 
            } 
 
            .statistics-picker-footer { 
                padding: 
                    12px 14px 14px; 
            } 
 
            .statistics-year-grid { 
                grid-template-columns: 
                    repeat(4, 1fr); 
            } 
 
            .statistics-month-grid { 
                grid-template-columns: 
                    repeat(3, 1fr); 
            } 
 
            .statistics-calendar-day, 
            .statistics-calendar-empty { 
                min-height: 36px; 
            } 
        } 
 
        @media (prefers-color-scheme: dark) { 
 
            .statistics-date-picker-panel { 
                background: 
                    #111827; 
                color: 
                    #f3f4f6; 
            } 
 
            .statistics-date-picker-backdrop { 
                background: 
                    rgba(0,0,0,.70); 
            } 
        } 
 
    `; 
 
    document.head.appendChild(style); 
} 
 
 
/* ========================================================= 
   AUTO MAKE DATE LABEL CLICKABLE 
========================================================= */ 
 
function statisticsMakeDateLabelClickable() { 
    const selectors = [ 
        "#statisticsDateLabel", 
        "#statisticsDatePickerLabel", 
        ".statistics-date-label", 
        ".statistics-period-label" 
    ]; 
 
    document 
        .querySelectorAll( 
            selectors.join(",") 
        ) 
        .forEach(element => { 
            element.style.cursor = 
                "pointer"; 
 
            element.setAttribute( 
                "data-statistics-date-picker", 
                "true" 
            ); 
 
            element.setAttribute( 
                "title", 
                "Bấm để chọn ngày / tháng / năm" 
            ); 
        }); 
} 
 
 
/* ========================================================= 
   DOM READY 
========================================================= */ 
 
document.addEventListener( 
    "DOMContentLoaded", 
    () => { 
 
        statisticsNormalizeDate(); 
 
        hideOldStatisticsModeTabs(); 
 
        statisticsInjectDatePickerCSS(); 
 
        statisticsBindNavigation(); 
 
        statisticsBindDatePicker(); 
 
        statisticsBindDateDisplay(); 
 
        statisticsMakeDateLabelClickable(); 
 
        setTimeout( 
            () => { 
                renderStatistics(); 
                statisticsMakeDateLabelClickable(); 
            }, 
            0 
        ); 
    } 
); 
 
 
/* ========================================================= 
   GLOBAL COMPATIBILITY 
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
 
window.openStatisticsDatePicker = 
    openStatisticsDatePicker; 
 
window.closeStatisticsDatePicker = 
    closeStatisticsDatePicker; 
 
window.applyStatisticsDatePicker = 
    applyStatisticsDatePicker;
