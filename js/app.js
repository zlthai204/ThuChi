/* =========================================================
   QUẢN LÝ THU CHI - QUÁN
   app.js
   ========================================================= */

// =========================================================
// 1. DỮ LIỆU
// =========================================================

let transactions = JSON.parse(
    localStorage.getItem("transactions")
) || [];

let categories = JSON.parse(
    localStorage.getItem("categories")
) || [];

let dishes = JSON.parse(
    localStorage.getItem("dishes")
) || [];

let codData = JSON.parse(
    localStorage.getItem("codData")
) || {};

let currentType = "thu";
let currentSource = "ShopeeFood";

let editingId = null;

let statisticType = "all";

let currentCODCategory = null;
let currentCODDish = null;


// =========================================================
// 2. KHỞI ĐỘNG
// =========================================================

document.addEventListener("DOMContentLoaded", function () {

    initDate();

    renderCategories();
    renderDishSelect();

    renderTransactions();
    updateDashboard();

    renderStatistics();
    renderMenu();

    renderCODCategories();

    initMonthSelects();

    loadDarkMode();

});


// =========================================================
// 3. LOCAL STORAGE
// =========================================================

function saveData() {

    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );

    localStorage.setItem(
        "categories",
        JSON.stringify(categories)
    );

    localStorage.setItem(
        "dishes",
        JSON.stringify(dishes)
    );

    localStorage.setItem(
        "codData",
        JSON.stringify(codData)
    );
}


// =========================================================
// 4. TOAST
// =========================================================

function showToast(message) {

    const toast = document.getElementById("toast");

    if (!toast) return;

    toast.textContent = message;

    toast.classList.add("show");

    clearTimeout(window.toastTimer);

    window.toastTimer = setTimeout(function () {
        toast.classList.remove("show");
    }, 2500);
}


// =========================================================
// 5. ĐỊNH DẠNG TIỀN
// =========================================================

function formatMoney(number) {

    number = Number(number) || 0;

    return number.toLocaleString("vi-VN") + " ₫";
}


// =========================================================
// 6. ĐỊNH DẠNG NGÀY
// =========================================================

function getToday() {

    const date = new Date();

    const day = String(
        date.getDate()
    ).padStart(2, "0");

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
}


function initDate() {

    const dateInput =
        document.getElementById("date");

    if (
        dateInput &&
        dateInput.value.trim() === ""
    ) {
        dateInput.value = getToday();
    }
}


function formatDateInput(input) {

    let value = input.value
        .replace(/\D/g, "")
        .slice(0, 8);

    if (value.length >= 5) {

        value =
            value.slice(0, 2) +
            "/" +
            value.slice(2, 4) +
            "/" +
            value.slice(4);

    } else if (value.length >= 3) {

        value =
            value.slice(0, 2) +
            "/" +
            value.slice(2);

    }

    input.value = value;
}


function dateToKey(dateString) {

    if (!dateString) return "";

    const parts = dateString.split("/");

    if (parts.length !== 3) {
        return dateString;
    }

    return `${parts[2]}-${parts[1]}-${parts[0]}`;
}


function getMonthKey(dateString) {

    const key = dateToKey(dateString);

    if (!key) return "";

    return key.substring(0, 7);
}


// =========================================================
// 7. DARK MODE
// =========================================================

function toggleDark() {

    document.body.classList.toggle("dark-mode");

    const enabled =
        document.body.classList.contains("dark-mode");

    localStorage.setItem(
        "darkMode",
        enabled ? "1" : "0"
    );
}


function loadDarkMode() {

    if (
        localStorage.getItem("darkMode") === "1"
    ) {
        document.body.classList.add("dark-mode");
    }
}


// =========================================================
// 8. LOẠI THU / CHI
// =========================================================

function setType(type) {

    currentType = type;

    const thuBtn =
        document.getElementById("thuBtn");

    const chiBtn =
        document.getElementById("chiBtn");

    const sourceGroup =
        document.getElementById("sourceGroup");

    if (type === "thu") {

        thuBtn.classList.add("active-thu");
        chiBtn.classList.remove("active-chi");

        if (sourceGroup) {
            sourceGroup.style.display = "";
        }

    } else {

        thuBtn.classList.remove("active-thu");
        chiBtn.classList.add("active-chi");

        if (sourceGroup) {
            sourceGroup.style.display = "none";
        }
    }

    syncCustomName();
}


// =========================================================
// 9. NGUỒN ĐƠN
// =========================================================

function setSource(source) {

    currentSource = source;

    const buttons = [
        "sourceShopee",
        "sourceGrab",
        "sourceOut"
    ];

    buttons.forEach(function (id) {

        const button =
            document.getElementById(id);

        if (button) {
            button.classList.remove(
                "active-shopee",
                "active-grab",
                "active-out"
            );
        }
    });


    if (source === "ShopeeFood") {

        document
            .getElementById("sourceShopee")
            ?.classList.add("active-shopee");

    }

    if (source === "GrabFood") {

        document
            .getElementById("sourceGrab")
            ?.classList.add("active-grab");

    }

    if (source === "Ngoài sàn") {

        document
            .getElementById("sourceOut")
            ?.classList.add("active-out");

    }
}


// =========================================================
// 10. DANH MỤC
// =========================================================

function renderCategories() {

    const category =
        document.getElementById("category");

    const menuCategory =
        document.getElementById("menuDishCategory");

    if (!category || !menuCategory) return;


    category.innerHTML =
        `<option value="">Chọn danh mục</option>`;

    menuCategory.innerHTML =
        `<option value="">Chọn danh mục</option>`;


    categories.forEach(function (item) {

        const option1 =
            document.createElement("option");

        option1.value = item.id;
        option1.textContent = item.name;

        category.appendChild(option1);


        const option2 =
            document.createElement("option");

        option2.value = item.id;
        option2.textContent = item.name;

        menuCategory.appendChild(option2);

    });
}


// =========================================================
// 11. DANH SÁCH MÓN
// =========================================================

function renderDishSelect() {

    const categoryId =
        document.getElementById("category")?.value;

    const nameSelect =
        document.getElementById("name");

    if (!nameSelect) return;


    nameSelect.innerHTML =
        `<option value="">Chọn món</option>`;


    let list = [];

    if (categoryId) {

        list = dishes.filter(function (dish) {
            return String(dish.categoryId) ===
                String(categoryId);
        });

    } else {

        list = dishes;

    }


    list.forEach(function (dish) {

        const option =
            document.createElement("option");

        option.value = dish.id;

        option.textContent = dish.name;

        nameSelect.appendChild(option);

    });


    const customOption =
        document.createElement("option");

    customOption.value = "__custom__";

    customOption.textContent = "✏️ Nhập tên khác";

    nameSelect.appendChild(customOption);

    syncCustomName();
}


// =========================================================
// 12. TÊN KHÁC
// =========================================================

function syncCustomName() {

    const name =
        document.getElementById("name");

    const customGroup =
        document.getElementById("customNameGroup");

    if (!name || !customGroup) return;


    if (name.value === "__custom__") {

        customGroup.style.display = "block";

    } else {

        customGroup.style.display = "none";

    }
}


// =========================================================
// 13. LẤY TÊN GIAO DỊCH
// =========================================================

function getTransactionName() {

    const nameSelect =
        document.getElementById("name");

    const customName =
        document.getElementById("customName");


    if (
        nameSelect &&
        nameSelect.value === "__custom__"
    ) {

        return customName.value.trim();

    }


    if (nameSelect && nameSelect.value) {

        const dish =
            dishes.find(function (item) {

                return String(item.id) ===
                    String(nameSelect.value);

            });

        if (dish) {
            return dish.name;
        }

        return nameSelect.options[
            nameSelect.selectedIndex
        ].textContent;

    }


    return "";
}


// =========================================================
// 14. LƯU GIAO DỊCH
// =========================================================

function saveTransaction() {

    const name =
        getTransactionName();

    const categoryId =
        document.getElementById("category").value;

    const amount =
        Number(
            document.getElementById("amount").value
        );

    const date =
        document.getElementById("date").value.trim();

    const note =
        document.getElementById("note").value.trim();


    if (!name) {

        showToast("⚠️ Vui lòng chọn tên món / khoản");

        return;
    }


    if (!amount || amount <= 0) {

        showToast("⚠️ Vui lòng nhập số tiền");

        return;
    }


    if (!isValidDate(date)) {

        showToast("⚠️ Ngày không hợp lệ");

        return;
    }


    const category =
        categories.find(function (item) {

            return String(item.id) ===
                String(categoryId);

        });


    const data = {

        id: editingId || Date.now(),

        type: currentType,

        name: name,

        categoryId: categoryId,

        categoryName:
            category?.name || "Khác",

        source:
            currentType === "thu"
                ? currentSource
                : "",

        amount: amount,

        date: date,

        note: note,

        updatedAt: Date.now()

    };


    if (editingId) {

        const index =
            transactions.findIndex(function (item) {

                return item.id === editingId;

            });

        if (index !== -1) {

            transactions[index] = data;

        }

        showToast("✅ Đã cập nhật giao dịch");

    } else {

        transactions.push(data);

        showToast("✅ Đã lưu giao dịch");

    }


    saveData();

    clearTransactionForm();

    updateDashboard();

    renderTransactions();

    renderStatistics();

    cancelEdit();

}


// =========================================================
// 15. KIỂM TRA NGÀY
// =========================================================

function isValidDate(value) {

    const regex =
        /^(\d{2})\/(\d{2})\/(\d{4})$/;

    const match = value.match(regex);

    if (!match) return false;

    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3]);

    const date =
        new Date(year, month - 1, day);

    return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
    );
}


// =========================================================
// 16. XÓA FORM
// =========================================================

function clearTransactionForm() {

    document.getElementById("name").value = "";

    document.getElementById("category").value = "";

    document.getElementById("customName").value = "";

    document.getElementById("amount").value = "";

    document.getElementById("date").value =
        getToday();

    document.getElementById("note").value = "";

    document.getElementById("customNameGroup")
        .style.display = "none";

    currentType = "thu";

    setType("thu");

    currentSource = "ShopeeFood";

    setSource("ShopeeFood");
}


// =========================================================
// 17. SỬA GIAO DỊCH
// =========================================================

function editTransaction(id) {

    const transaction =
        transactions.find(function (item) {
            return item.id === id;
        });

    if (!transaction) return;


    editingId = id;

    currentType = transaction.type;

    setType(transaction.type);


    const category =
        document.getElementById("category");

    category.value =
        transaction.categoryId || "";


    renderDishSelect();


    const dish =
        dishes.find(function (item) {

            return item.name === transaction.name &&
                String(item.categoryId) ===
                String(transaction.categoryId);

        });


    if (dish) {

        document.getElementById("name").value =
            dish.id;

    } else {

        document.getElementById("name").value =
            "__custom__";

        document.getElementById("customName").value =
            transaction.name;

        syncCustomName();

    }


    document.getElementById("amount").value =
        transaction.amount;

    document.getElementById("date").value =
        transaction.date;

    document.getElementById("note").value =
        transaction.note || "";


    if (transaction.source) {

        setSource(transaction.source);

    }


    document.getElementById("formTitle")
        .textContent = "Sửa giao dịch";

    document.getElementById("cancelButton")
        .style.display = "block";


    goAdd();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


// =========================================================
// 18. HỦY SỬA
// =========================================================

function cancelEdit() {

    editingId = null;

    document.getElementById("formTitle")
        .textContent = "Thêm giao dịch";

    document.getElementById("cancelButton")
        .style.display = "none";

    clearTransactionForm();
}


// =========================================================
// 19. XÓA GIAO DỊCH
// =========================================================

function deleteTransaction(id) {

    if (
        !confirm(
            "Bạn có chắc muốn xóa giao dịch này?"
        )
    ) {
        return;
    }


    transactions =
        transactions.filter(function (item) {

            return item.id !== id;

        });


    saveData();

    updateDashboard();

    renderTransactions();

    renderStatistics();

    showToast("🗑️ Đã xóa giao dịch");
}


// =========================================================
// 20. DASHBOARD
// =========================================================

function updateDashboard() {

    let income = 0;
    let expense = 0;


    transactions.forEach(function (item) {

        if (item.type === "thu") {

            income += Number(item.amount);

        } else {

            expense += Number(item.amount);

        }

    });


    const profit = income - expense;


    document.getElementById("profit")
        .textContent = formatMoney(profit);

    document.getElementById("totalIncome")
        .textContent = formatMoney(income);

    document.getElementById("totalExpense")
        .textContent = formatMoney(expense);

    document.getElementById("totalTransactions")
        .textContent = transactions.length;


    document.getElementById("quickIncome")
        .textContent = formatMoney(income);

    document.getElementById("quickExpense")
        .textContent = formatMoney(expense);
}


// =========================================================
// 21. LỊCH SỬ GIAO DỊCH
// =========================================================

function renderTransactions() {

    const container =
        document.getElementById("transactions");

    if (!container) return;


    const search =
        (
            document.getElementById("search")?.value
            || ""
        ).toLowerCase().trim();


    const filterType =
        document.getElementById("filterType")?.value
        || "all";


    const filterMonth =
        document.getElementById("filterMonth")?.value
        || "all";


    let list =
        [...transactions];


    if (filterType !== "all") {

        list = list.filter(function (item) {

            return item.type === filterType;

        });

    }


    if (filterMonth !== "all") {

        list = list.filter(function (item) {

            return getMonthKey(item.date) ===
                filterMonth;

        });

    }


    if (search) {

        list = list.filter(function (item) {

            const text = [

                item.name,

                item.categoryName,

                item.source,

                item.note

            ].join(" ").toLowerCase();

            return text.includes(search);

        });

    }


    list.sort(function (a, b) {

        return (
            dateToKey(b.date)
                .localeCompare(dateToKey(a.date))
            ||
            b.id - a.id
        );

    });


    document.getElementById("historyCount")
        .textContent =
        `${list.length} giao dịch`;


    if (list.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                📭 Chưa có giao dịch
            </div>
        `;

        return;
    }


    container.innerHTML = list.map(function (item) {

        const isIncome =
            item.type === "thu";

        const color =
            isIncome ? "green" : "red";

        const sign =
            isIncome ? "+" : "-";

        return `

            <div class="transaction-item">

                <div class="transaction-main">

                    <div class="transaction-icon ${color}">
                        ${isIncome ? "↑" : "↓"}
                    </div>

                    <div class="transaction-info">

                        <strong>
                            ${escapeHTML(item.name)}
                        </strong>

                        <span>
                            ${escapeHTML(
                                item.categoryName || "Khác"
                            )}
                        </span>

                        <small>
                            ${escapeHTML(item.date)}
                            ${
                                item.source
                                    ? " • " +
                                      escapeHTML(item.source)
                                    : ""
                            }
                        </small>

                        ${
                            item.note
                                ? `
                                    <small>
                                        📝 ${escapeHTML(item.note)}
                                    </small>
                                  `
                                : ""
                        }

                    </div>

                </div>

                <div class="transaction-right">

                    <strong class="${color}">
                        ${sign}${formatMoney(item.amount)}
                    </strong>

                    <div class="transaction-actions">

                        <button
                            onclick="editTransaction(${item.id})">
                            ✏️
                        </button>

                        <button
                            onclick="deleteTransaction(${item.id})">
                            🗑️
                        </button>

                    </div>

                </div>

            </div>

        `;

    }).join("");
}


// =========================================================
// 22. ESCAPE HTML
// =========================================================

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// =========================================================
// 23. THÁNG
// =========================================================

function initMonthSelects() {

    const statMonth =
        document.getElementById("statMonth");

    const filterMonth =
        document.getElementById("filterMonth");


    const months = new Set();


    transactions.forEach(function (item) {

        const key =
            getMonthKey(item.date);

        if (key) {
            months.add(key);
        }

    });


    // Tháng hiện tại
    const now = new Date();

    const current =
        `${now.getFullYear()}-${String(
            now.getMonth() + 1
        ).padStart(2, "0")}`;

    months.add(current);


    const sorted =
        [...months].sort().reverse();


    if (statMonth) {

        const oldValue =
            statMonth.value;

        statMonth.innerHTML = "";

        sorted.forEach(function (month) {

            const option =
                document.createElement("option");

            option.value = month;

            option.textContent =
                formatMonth(month);

            statMonth.appendChild(option);

        });


        if (sorted.includes(oldValue)) {
            statMonth.value = oldValue;
        }

    }


    if (filterMonth) {

        const oldValue =
            filterMonth.value || "all";

        filterMonth.innerHTML =
            `<option value="all">Tất cả tháng</option>`;


        sorted.forEach(function (month) {

            const option =
                document.createElement("option");

            option.value = month;

            option.textContent =
                formatMonth(month);

            filterMonth.appendChild(option);

        });


        if (
            oldValue &&
            [...filterMonth.options]
                .some(o => o.value === oldValue)
        ) {
            filterMonth.value = oldValue;
        }

    }
}


function formatMonth(month) {

    const parts =
        month.split("-");

    if (parts.length !== 2) {
        return month;
    }

    return `${parts[1]}/${parts[0]}`;
}


// =========================================================
// 24. THỐNG KÊ
// =========================================================

function setStatisticType(type) {

    statisticType = type;


    document
        .getElementById("tabAll")
        ?.classList.remove("active");

    document
        .getElementById("tabThu")
        ?.classList.remove("active");

    document
        .getElementById("tabChi")
        ?.classList.remove("active");


    if (type === "all") {

        document
            .getElementById("tabAll")
            ?.classList.add("active");

    }

    if (type === "thu") {

        document
            .getElementById("tabThu")
            ?.classList.add("active");

    }

    if (type === "chi") {

        document
            .getElementById("tabChi")
            ?.classList.add("active");

    }


    renderStatistics();
}


// =========================================================
// 25. RENDER THỐNG KÊ
// =========================================================

function renderStatistics() {

    const month =
        document.getElementById("statMonth")?.value;


    let list =
        transactions.filter(function (item) {

            if (
                month &&
                getMonthKey(item.date) !== month
            ) {
                return false;
            }

            if (
                statisticType !== "all" &&
                item.type !== statisticType
            ) {
                return false;
            }

            return true;

        });


    renderPieChart(list);

    renderDailyChart(list);

    renderCategoryStats(list);
}


// =========================================================
// 26. PIE CHART
// =========================================================

function renderPieChart(list) {

    const pie =
        document.getElementById("pie");

    const legend =
        document.getElementById("legend");

    const pieTotal =
        document.getElementById("pieTotal");

    const chartTotal =
        document.getElementById("chartTotal");


    if (!pie || !legend) return;


    const groups = {};


    list.forEach(function (item) {

        const key =
            item.categoryName || "Khác";

        groups[key] =
            (groups[key] || 0) +
            Number(item.amount);

    });


    const entries =
        Object.entries(groups);


    const total =
        entries.reduce(
            (sum, item) => sum + item[1],
            0
        );


    pieTotal.textContent =
        formatMoney(total);

    chartTotal.textContent =
        formatMoney(total);


    if (entries.length === 0) {

        pie.style.background =
            "#e5e7eb";

        legend.innerHTML =
            `<span>Chưa có dữ liệu</span>`;

        return;
    }


    const colors = [
        "#22c55e",
        "#ef4444",
        "#3b82f6",
        "#f59e0b",
        "#8b5cf6",
        "#ec4899",
        "#14b8a6",
        "#f97316",
        "#06b6d4",
        "#84cc16"
    ];


    let start = 0;

    const parts = [];


    entries.forEach(function (entry, index) {

        const percent =
            entry[1] / total * 100;

        const end =
            start + percent;

        parts.push(
            `${colors[index % colors.length]} ${start}% ${end}%`
        );

        start = end;

    });


    pie.style.background =
        `conic-gradient(${parts.join(",")})`;


    legend.innerHTML =
        entries.map(function (entry, index) {

            const percent =
                ((entry[1] / total) * 100)
                    .toFixed(1);

            return `

                <div class="legend-item">

                    <span
                        class="legend-color"
                        style="
                            background:
                            ${colors[index % colors.length]}
                        ">
                    </span>

                    <span>
                        ${escapeHTML(entry[0])}
                    </span>

                    <strong>
                        ${formatMoney(entry[1])}
                        (${percent}%)
                    </strong>

                </div>

            `;

        }).join("");
}


// =========================================================
// 27. BIỂU ĐỒ THEO NGÀY
// =========================================================

function renderDailyChart(list) {

    const container =
        document.getElementById("barChart");

    const label =
        document.getElementById("dailyLabel");


    if (!container) return;


    const days = {};


    list.forEach(function (item) {

        const key = item.date;

        days[key] =
            (days[key] || 0) +
            Number(item.amount);

    });


    const entries =
        Object.entries(days)
            .sort(function (a, b) {

                return dateToKey(a[0])
                    .localeCompare(
                        dateToKey(b[0])
                    );

            });


    if (label) {

        if (statisticType === "thu") {
            label.textContent = "Thu";
        } else if (statisticType === "chi") {
            label.textContent = "Chi";
        } else {
            label.textContent = "Tất cả";
        }

    }


    if (entries.length === 0) {

        container.innerHTML =
            `<div class="empty-state">
                Chưa có dữ liệu
            </div>`;

        return;
    }


    const max =
        Math.max(
            ...entries.map(item => item[1])
        );


    container.innerHTML =
        entries.map(function (entry) {

            const percent =
                max > 0
                    ? (entry[1] / max) * 100
                    : 0;

            const shortDate =
                entry[0].slice(0, 5);


            return `

                <div class="bar-item">

                    <div class="bar-value">
                        ${formatMoney(entry[1])}
                    </div>

                    <div class="bar-track">

                        <div
                            class="bar-fill"
                            style="
                                height:${percent}%;
                            ">
                        </div>

                    </div>

                    <div class="bar-label">
                        ${shortDate}
                    </div>

                </div>

            `;

        }).join("");
}


// =========================================================
// 28. CHI TIẾT DANH MỤC / NGUỒN
// =========================================================

function renderCategoryStats(list) {

    const container =
        document.getElementById("categoryStats");

    if (!container) return;


    const groups = {};


    list.forEach(function (item) {

        let key =
            item.categoryName || "Khác";


        if (
            statisticType === "thu" &&
            item.source
        ) {
            key += ` • ${item.source}`;
        }


        groups[key] =
            (groups[key] || 0) +
            Number(item.amount);

    });


    const entries =
        Object.entries(groups)
            .sort((a, b) => b[1] - a[1]);


    if (entries.length === 0) {

        container.innerHTML =
            `<div class="empty-state">
                Chưa có dữ liệu
            </div>`;

        return;
    }


    const total =
        entries.reduce(
            (sum, item) => sum + item[1],
            0
        );


    container.innerHTML =
        entries.map(function (entry) {

            const percent =
                total > 0
                    ? entry[1] / total * 100
                    : 0;


            return `

                <div class="category-stat">

                    <div class="category-stat-head">

                        <strong>
                            ${escapeHTML(entry[0])}
                        </strong>

                        <span>
                            ${formatMoney(entry[1])}
                        </span>

                    </div>

                    <div class="category-stat-track">

                        <div
                            class="category-stat-fill"
                            style="
                                width:${percent}%;
                            ">
                        </div>

                    </div>

                </div>

            `;

        }).join("");
}


// =========================================================
// 29. QUẢN LÝ DANH MỤC QUÁN
// =========================================================

function addCategory() {

    const input =
        document.getElementById("newCategory");

    const name =
        input.value.trim();


    if (!name) {

        showToast("⚠️ Nhập tên danh mục");

        return;
    }


    const exists =
        categories.some(function (item) {

            return item.name
                .toLowerCase() ===
                name.toLowerCase();

        });


    if (exists) {

        showToast("⚠️ Danh mục đã tồn tại");

        return;
    }


    const category = {

        id: Date.now(),

        name: name

    };


    categories.push(category);

    saveData();

    input.value = "";

    renderCategories();

    renderDishSelect();

    renderMenu();

    renderCODCategories();

    showToast("✅ Đã thêm danh mục");
}


// =========================================================
// 30. THÊM MÓN
// =========================================================

function addDish() {

    const categoryId =
        document.getElementById(
            "menuDishCategory"
        ).value;


    const input =
        document.getElementById("newDish");


    const name =
        input.value.trim();


    if (!categoryId) {

        showToast("⚠️ Chọn danh mục");

        return;
    }


    if (!name) {

        showToast("⚠️ Nhập tên món");

        return;
    }


    const exists =
        dishes.some(function (item) {

            return (
                String(item.categoryId) ===
                String(categoryId)
                &&
                item.name.toLowerCase() ===
                name.toLowerCase()
            );

        });


    if (exists) {

        showToast("⚠️ Món đã tồn tại");

        return;
    }


    dishes.push({

        id: Date.now(),

        categoryId: categoryId,

        name: name

    });


    saveData();

    input.value = "";

    renderDishSelect();

    renderMenu();

    renderCODCategories();

    showToast("✅ Đã thêm món");
}


// =========================================================
// 31. HIỂN THỊ MENU
// =========================================================

function renderMenu() {

    const container =
        document.getElementById("menuList");

    const count =
        document.getElementById("menuCount");


    if (!container) return;


    if (count) {

        count.textContent =
            `${categories.length} danh mục`;

    }


    if (categories.length === 0) {

        container.innerHTML =
            `<div class="empty-state">
                Chưa có danh mục
            </div>`;

        return;
    }


    container.innerHTML =
        categories.map(function (category) {

            const categoryDishes =
                dishes.filter(function (dish) {

                    return String(dish.categoryId) ===
                        String(category.id);

                });


            return `

                <div class="menu-category">

                    <div class="menu-category-head">

                        <strong>
                            📁
                            ${escapeHTML(category.name)}
                        </strong>

                        <button
                            onclick="
                                deleteCategory(${category.id})
                            ">
                            🗑️
                        </button>

                    </div>

                    <div class="menu-dishes">

                        ${
                            categoryDishes.length
                                ? categoryDishes.map(
                                    function (dish) {

                                        return `

                                            <div
                                                class="menu-dish">

                                                <span>
                                                    🍜
                                                    ${escapeHTML(
                                                        dish.name
                                                    )}
                                                </span>

                                                <button
                                                    onclick="
                                                        deleteDish(
                                                            ${dish.id}
                                                        )
                                                    ">
                                                    🗑️
                                                </button>

                                            </div>

                                        `;

                                    }
                                ).join("")
                                : `
                                    <small>
                                        Chưa có món
                                    </small>
                                `
                        }

                    </div>

                </div>

            `;

        }).join("");
}


// =========================================================
// 32. XÓA DANH MỤC
// =========================================================

function deleteCategory(id) {

    const hasDish =
        dishes.some(function (dish) {

            return String(dish.categoryId) ===
                String(id);

        });


    if (hasDish) {

        if (
            !confirm(
                "Danh mục này có món. Xóa danh mục sẽ xóa luôn các món. Tiếp tục?"
            )
        ) {
            return;
        }

    } else {

        if (
            !confirm(
                "Bạn có chắc muốn xóa danh mục này?"
            )
        ) {
            return;
        }

    }


    categories =
        categories.filter(function (item) {

            return item.id !== id;

        });


    dishes =
        dishes.filter(function (dish) {

            return String(dish.categoryId) !==
                String(id);

        });


    saveData();

    renderCategories();

    renderDishSelect();

    renderMenu();

    renderCODCategories();

    showToast("🗑️ Đã xóa danh mục");
}


// =========================================================
// 33. XÓA MÓN
// =========================================================

function deleteDish(id) {

    if (
        !confirm(
            "Bạn có chắc muốn xóa món này?"
        )
    ) {
        return;
    }


    dishes =
        dishes.filter(function (item) {

            return item.id !== id;

        });


    delete codData[id];


    saveData();

    renderDishSelect();

    renderMenu();

    renderCODCategories();

    showToast("🗑️ Đã xóa món");
}


// =========================================================
// 34. ĐIỀU HƯỚNG
// =========================================================

function hideAllSections() {

    document.getElementById("homeSection")
        .style.display = "none";

    document.getElementById("codSection")
        .style.display = "none";
}


function clearNavActive() {

    document.querySelectorAll(".nav-button")
        .forEach(function (button) {

            button.classList.remove("active");

        });
}


function goHome() {

    hideAllSections();

    document.getElementById("homeSection")
        .style.display = "block";

    clearNavActive();

    document.getElementById("navHome")
        .classList.add("active");

    document.getElementById("pageTitle")
        .textContent = "Thu Chi";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


function goAdd() {

    hideAllSections();

    document.getElementById("homeSection")
        .style.display = "block";

    clearNavActive();

    document.getElementById("navAdd")
        .classList.add("active");

    document.getElementById("pageTitle")
        .textContent = "Thêm giao dịch";


    setTimeout(function () {

        document.getElementById("addSection")
            ?.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

    }, 50);
}


function goStatistics() {

    hideAllSections();

    document.getElementById("homeSection")
        .style.display = "block";

    clearNavActive();

    document.getElementById("navStatistics")
        .classList.add("active");

    document.getElementById("pageTitle")
        .textContent = "Thống kê";


    setTimeout(function () {

        document.getElementById(
            "statisticsSection"
        )?.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }, 50);
}


function goHistory() {

    hideAllSections();

    document.getElementById("homeSection")
        .style.display = "block";

    clearNavActive();

    document.getElementById("navHistory")
        .classList.add("active");

    document.getElementById("pageTitle")
        .textContent = "Lịch sử";


    setTimeout(function () {

        document.getElementById(
            "historySection"
        )?.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }, 50);
}


function goRestaurant() {

    hideAllSections();

    document.getElementById("homeSection")
        .style.display = "block";

    clearNavActive();

    document.getElementById("navRestaurant")
        .classList.add("active");

    document.getElementById("pageTitle")
        .textContent = "Quản lý Quán";


    setTimeout(function () {

        document.getElementById(
            "restaurantSection"
        )?.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }, 50);
}


function goCOD() {

    hideAllSections();

    document.getElementById("codSection")
        .style.display = "block";

    clearNavActive();

    document.getElementById("navCOD")
        .classList.add("active");

    document.getElementById("pageTitle")
        .textContent = "COD - Giá vốn";

    renderCODCategories();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// =========================================================
// 35. COD - DANH MỤC
// =========================================================

function renderCODCategories() {

    const container =
        document.getElementById(
            "codCategoryList"
        );

    if (!container) return;


    document.getElementById(
        "codCategoryPage"
    ).style.display = "block";

    document.getElementById(
        "codDishPage"
    ).style.display = "none";

    document.getElementById(
        "codDetailPage"
    ).style.display = "none";


    if (categories.length === 0) {

        container.innerHTML =
            `<div class="empty-state">
                Chưa có danh mục món.
                Hãy tạo danh mục ở phần Quản lý Quán.
            </div>`;

        return;
    }


    container.innerHTML =
        categories.map(function (category) {

            const dishCount =
                dishes.filter(function (dish) {

                    return String(dish.categoryId) ===
                        String(category.id);

                }).length;


            return `

                <button
                    class="cod-category-button"
                    onclick="
                        showCODDishes(${category.id})
                    ">

                    <span>
                        📁
                        ${escapeHTML(category.name)}
                    </span>

                    <small>
                        ${dishCount} món →
                    </small>

                </button>

            `;

        }).join("");
}


// =========================================================
// 36. COD - MÓN
// =========================================================

function showCODDishes(categoryId) {

    currentCODCategory = categoryId;


    const category =
        categories.find(function (item) {

            return String(item.id) ===
                String(categoryId);

        });


    if (!category) return;


    document.getElementById(
        "codCategoryPage"
    ).style.display = "none";

    document.getElementById(
        "codDishPage"
    ).style.display = "block";

    document.getElementById(
        "codDetailPage"
    ).style.display = "none";


    document.getElementById(
        "codDishCategoryTitle"
    ).textContent =
        `🍜 ${category.name}`;


    const container =
        document.getElementById(
            "codDishList"
        );


    const categoryDishes =
        dishes.filter(function (dish) {

            return String(dish.categoryId) ===
                String(categoryId);

        });


    if (categoryDishes.length === 0) {

        container.innerHTML =
            `<div class="empty-state">
                Chưa có món trong danh mục này.
            </div>`;

        return;
    }


    container.innerHTML =
        categoryDishes.map(function (dish) {

            const data =
                codData[dish.id] || {};

            const parts =
                data.parts || [];

            const total =
                parts.reduce(
                    (sum, part) =>
                        sum + Number(part.amount || 0),
                    0
                );


            return `

                <button
                    class="cod-dish-button"
                    onclick="
                        showCODDetail(${dish.id})
                    ">

                    <div>

                        <strong>
                            🍜
                            ${escapeHTML(dish.name)}
                        </strong>

                        <small>
                            ${
                                parts.length
                            } thành phần
                        </small>

                    </div>

                    <strong>
                        ${formatMoney(total)}
                    </strong>

                </button>

            `;

        }).join("");
}


function showCODCategories() {

    currentCODCategory = null;

    currentCODDish = null;

    renderCODCategories();
}


// =========================================================
// 37. COD - CHI TIẾT MÓN
// =========================================================

function showCODDetail(dishId) {

    currentCODDish = dishId;


    const dish =
        dishes.find(function (item) {

            return item.id === dishId;

        });


    if (!dish) return;


    const category =
        categories.find(function (item) {

            return String(item.id) ===
                String(dish.categoryId);

        });


    document.getElementById(
        "codCategoryPage"
    ).style.display = "none";

    document.getElementById(
        "codDishPage"
    ).style.display = "none";

    document.getElementById(
        "codDetailPage"
    ).style.display = "block";


    document.getElementById(
        "codDetailName"
    ).textContent = dish.name;


    document.getElementById(
        "codDetailCategory"
    ).textContent =
        category?.name || "Khác";


    const data =
        codData[dishId] || {

            sellingPrice: 0,

            parts: []

        };


    document.getElementById(
        "codSellingPrice"
    ).value =
        data.sellingPrice || "";


    renderCODDetail();
}


// =========================================================
// 38. COD - RENDER CHI TIẾT
// =========================================================

function renderCODDetail() {

    const data =
        codData[currentCODDish] || {

            sellingPrice: 0,

            parts: []

        };


    const parts =
        data.parts || [];


    const container =
        document.getElementById(
            "codPartList"
        );


    document.getElementById(
        "codPartCount"
    ).textContent =
        `${parts.length} phần`;


    if (parts.length === 0) {

        container.innerHTML =
            `<div class="empty-state">
                Chưa có thành phần giá vốn.
            </div>`;

    } else {

        container.innerHTML =
            parts.map(function (part, index) {

                return `

                    <div class="cod-part-item">

                        <div>

                            <strong>
                                ${escapeHTML(part.name)}
                            </strong>

                            ${
                                part.note
                                    ? `
                                        <small>
                                            ${escapeHTML(
                                                part.note
                                            )}
                                        </small>
                                      `
                                    : ""
                            }

                        </div>

                        <div>

                            <strong>
                                ${formatMoney(part.amount)}
                            </strong>

                            <button
                                onclick="
                                    deleteCODPart(${index})
                                ">
                                🗑️
                            </button>

                        </div>

                    </div>

                `;

            }).join("");

    }


    renderCODDetailSummary();
}


// =========================================================
// 39. COD - TỔNG TIỀN
// =========================================================

function renderCODDetailSummary() {

    const data =
        codData[currentCODDish] || {

            sellingPrice: 0,

            parts: []

        };


    const parts =
        data.parts || [];


    const totalCost =
        parts.reduce(
            (sum, part) =>
                sum + Number(part.amount || 0),
            0
        );


    const sellingPrice =
        Number(
            document.getElementById(
                "codSellingPrice"
            )?.value
        ) || Number(data.sellingPrice || 0);


    const profit =
        sellingPrice - totalCost;


    document.getElementById(
        "codTotalCost"
    ).textContent =
        formatMoney(totalCost);


    document.getElementById(
        "codProfit"
    ).textContent =
        formatMoney(profit);
}


// =========================================================
// 40. COD - THÊM THÀNH PHẦN
// =========================================================

function addCODPart() {

    if (!currentCODDish) {

        showToast("⚠️ Chưa chọn món");

        return;
    }


    const name =
        document.getElementById(
            "codPartName"
        ).value.trim();


    const amount =
        Number(
            document.getElementById(
                "codPartAmount"
            ).value
        );


    const note =
        document.getElementById(
            "codPartNote"
        ).value.trim();


    if (!name) {

        showToast("⚠️ Nhập tên phần");

        return;
    }


    if (!amount || amount < 0) {

        showToast("⚠️ Nhập giá tiền");

        return;
    }


    if (!codData[currentCODDish]) {

        codData[currentCODDish] = {

            sellingPrice: 0,

            parts: []

        };

    }


    codData[currentCODDish].parts.push({

        name: name,

        amount: amount,

        note: note

    });


    saveData();


    document.getElementById(
        "codPartName"
    ).value = "";

    document.getElementById(
        "codPartAmount"
    ).value = "";

    document.getElementById(
        "codPartNote"
    ).value = "";


    renderCODDetail();

    showToast("✅ Đã thêm thành phần");
}


// =========================================================
// 41. COD - XÓA THÀNH PHẦN
// =========================================================

function deleteCODPart(index) {

    if (!codData[currentCODDish]) {
        return;
    }


    if (
        !confirm(
            "Bạn có chắc muốn xóa thành phần này?"
        )
    ) {
        return;
    }


    codData[currentCODDish].parts.splice(
        index,
        1
    );


    saveData();

    renderCODDetail();

    showToast("🗑️ Đã xóa thành phần");
}


// =========================================================
// 42. COD - LƯU GIÁ VỐN
// =========================================================

function saveCODDish() {

    if (!currentCODDish) {

        showToast("⚠️ Chưa chọn món");

        return;
    }


    const sellingPrice =
        Number(
            document.getElementById(
                "codSellingPrice"
            ).value
        ) || 0;


    if (!codData[currentCODDish]) {

        codData[currentCODDish] = {

            sellingPrice: 0,

            parts: []

        };

    }


    codData[currentCODDish]
        .sellingPrice =
        sellingPrice;


    saveData();

    renderCODDetail();

    renderCODDishesAfterSave();

    showToast("✅ Đã lưu giá vốn món");
}


function renderCODDishesAfterSave() {

    if (currentCODCategory) {

        showCODDishes(
            currentCODCategory
        );

    }
}


// =========================================================
// 43. COD - QUAY LẠI
// =========================================================

function showCODDishesBack() {

    if (currentCODCategory) {

        showCODDishes(
            currentCODCategory
        );

    } else {

        showCODCategories();

    }
}


// =========================================================
// 44. BACKUP JSON
// =========================================================

function backup() {

    const data = {

        version: 1,

        exportedAt:
            new Date().toISOString(),

        transactions:
            transactions,

        categories:
            categories,

        dishes:
            dishes,

        codData:
            codData

    };


    const json =
        JSON.stringify(
            data,
            null,
            2
        );


    const blob =
        new Blob(
            [json],
            {
                type: "application/json"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const a =
        document.createElement("a");

    a.href = url;

    a.download =
        `backup-thu-chi-${getToday()
            .replaceAll("/", "-")}.json`;


    a.click();


    URL.revokeObjectURL(url);

    showToast("📤 Đã sao lưu dữ liệu");
}


// =========================================================
// 45. RESTORE JSON
// =========================================================

function restore(event) {

    const file =
        event.target.files[0];

    if (!file) return;


    const reader =
        new FileReader();


    reader.onload = function (e) {

        try {

            const data =
                JSON.parse(e.target.result);


            if (
                !data ||
                !Array.isArray(
                    data.transactions
                )
            ) {

                throw new Error(
                    "File không hợp lệ"
                );

            }


            if (
                !confirm(
                    "Khôi phục sẽ thay thế dữ liệu hiện tại. Tiếp tục?"
                )
            ) {
                return;
            }


            transactions =
                Array.isArray(
                    data.transactions
                )
                    ? data.transactions
                    : [];


            categories =
                Array.isArray(
                    data.categories
                )
                    ? data.categories
                    : [];


            dishes =
                Array.isArray(
                    data.dishes
                )
                    ? data.dishes
                    : [];


            codData =
                data.codData &&
                typeof data.codData === "object"
                    ? data.codData
                    : {};


            saveData();


            initMonthSelects();

            renderCategories();

            renderDishSelect();

            renderMenu();

            updateDashboard();

            renderTransactions();

            renderStatistics();

            renderCODCategories();


            showToast(
                "📥 Khôi phục dữ liệu thành công"
            );


        } catch (error) {

            alert(
                "Không thể khôi phục file: " +
                error.message
            );

        }


        event.target.value = "";

    };


    reader.readAsText(file);
}


// =========================================================
// 46. XUẤT CSV
// =========================================================

function exportCSV() {

    if (transactions.length === 0) {

        showToast(
            "⚠️ Chưa có dữ liệu để xuất"
        );

        return;
    }


    const headers = [

        "Ngày",

        "Loại",

        "Tên",

        "Danh mục",

        "Nguồn đơn",

        "Số tiền",

        "Ghi chú"

    ];


    const rows =
        transactions.map(function (item) {

            return [

                item.date,

                item.type === "thu"
                    ? "Thu"
                    : "Chi",

                item.name,

                item.categoryName || "",

                item.source || "",

                item.amount,

                item.note || ""

            ];

        });


    const csv = [

        headers,

        ...rows

    ].map(function (row) {

        return row.map(function (value) {

            return `"${String(value)
                .replace(/"/g, '""')}"`;

        }).join(",");

    }).join("\n");


    const blob =
        new Blob(
            [
                "\uFEFF" + csv
            ],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const a =
        document.createElement("a");


    a.href = url;

    a.download =
        `thu-chi-${getToday()
            .replaceAll("/", "-")}.csv`;


    a.click();


    URL.revokeObjectURL(url);


    showToast("📊 Đã xuất file CSV");
}


// =========================================================
// 47. XÓA TOÀN BỘ
// =========================================================

function deleteAll() {

    if (
        !confirm(
            "⚠️ Bạn có chắc muốn XÓA TOÀN BỘ dữ liệu không?"
        )
    ) {
        return;
    }


    if (
        !confirm(
            "Hành động này không thể hoàn tác. Tiếp tục?"
        )
    ) {
        return;
    }


    transactions = [];

    categories = [];

    dishes = [];

    codData = {};


    saveData();


    renderCategories();

    renderDishSelect();

    renderMenu();

    updateDashboard();

    renderTransactions();

    initMonthSelects();

    renderStatistics();

    renderCODCategories();


    clearTransactionForm();


    showToast(
        "🗑️ Đã xóa toàn bộ dữ liệu"
    );
}


// =========================================================
// 48. KHỞI TẠO TRẠNG THÁI BAN ĐẦU
// =========================================================

setTimeout(function () {

    if (
        document.getElementById("homeSection")
    ) {

        document.getElementById(
            "homeSection"
        ).style.display = "block";

    }


    if (
        document.getElementById("codSection")
    ) {

        document.getElementById(
            "codSection"
        ).style.display = "none";

    }

}, 100);
