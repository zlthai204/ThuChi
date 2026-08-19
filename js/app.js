/* =========================================================
   QUẢN LÝ THU CHI - APP.JS
   ========================================================= */

"use strict";

/* =========================================================
   1. DỮ LIỆU
   ========================================================= */

const STORAGE_KEY = "quan_ly_thu_chi_data_v1";
const DARK_MODE_KEY = "quan_ly_dark_mode";

let data = {
    transactions: [],
    categories: [],
    dishes: [],
    cod: {}
};

let currentType = "thu";
let currentSource = "ShopeeFood";
let editingId = null;

let statisticType = "all";

let currentCODCategory = null;
let currentCODDish = null;


/* =========================================================
   2. KHỞI TẠO
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    console.log("APP.JS ĐÃ CHẠY");

    loadDarkMode();
    loadData();

    setDefaultDate();

    renderCategorySelect();
    renderDishSelect();
    renderMenu();
    renderCODCategories();

    renderMonthFilters();
    renderTransactions();
    renderSummary();
    renderStatistics();

    updateForm();

    goHome(false);
});


/* =========================================================
   3. LOCAL STORAGE
   ========================================================= */

function loadData() {

    try {

        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) return;

        const parsed = JSON.parse(saved);

        data = {
            transactions: Array.isArray(parsed.transactions)
                ? parsed.transactions
                : [],

            categories: Array.isArray(parsed.categories)
                ? parsed.categories
                : [],

            dishes: Array.isArray(parsed.dishes)
                ? parsed.dishes
                : [],

            cod: parsed.cod &&
                typeof parsed.cod === "object"
                ? parsed.cod
                : {}
        };

    } catch (error) {

        console.error("Lỗi đọc dữ liệu:", error);

        data = {
            transactions: [],
            categories: [],
            dishes: [],
            cod: {}
        };
    }
}


function saveData() {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(data)
        );

    } catch (error) {

        console.error("Lỗi lưu dữ liệu:", error);

        showToast("Không thể lưu dữ liệu!");
    }
}


/* =========================================================
   4. DARK MODE
   ========================================================= */

function toggleDark() {

    document.body.classList.toggle("dark");

    const isDark =
        document.body.classList.contains("dark");

    localStorage.setItem(
        DARK_MODE_KEY,
        isDark ? "1" : "0"
    );
}


function loadDarkMode() {

    const dark =
        localStorage.getItem(DARK_MODE_KEY);

    if (dark === "1") {

        document.body.classList.add("dark");
    }
}


/* =========================================================
   5. TIỆN ÍCH
   ========================================================= */

function formatMoney(value) {

    value = Number(value) || 0;

    return value.toLocaleString("vi-VN") + " ₫";
}


function formatShortMoney(value) {

    value = Number(value) || 0;

    if (value >= 1000000) {

        return (
            (value / 1000000)
                .toFixed(1)
                .replace(".0", "")
            + "tr"
        );
    }

    if (value >= 1000) {

        return (
            (value / 1000)
                .toFixed(0)
            + "k"
        );
    }

    return String(value);
}


function escapeHTML(value) {

    if (
        value === undefined ||
        value === null
    ) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function generateId() {

    return (
        Date.now().toString() +
        Math.random()
            .toString(36)
            .substring(2, 9)
    );
}


function showToast(message) {

    const toast =
        document.getElementById("toast");

    if (!toast) {

        alert(message);

        return;
    }

    toast.textContent = message;

    toast.classList.add("show");

    clearTimeout(window.toastTimer);

    window.toastTimer = setTimeout(
        function () {

            toast.classList.remove("show");

        },
        2500
    );
}


/* =========================================================
   6. NGÀY
   ========================================================= */

function getTodayString() {

    const date = new Date();

    const day =
        String(date.getDate())
            .padStart(2, "0");

    const month =
        String(date.getMonth() + 1)
            .padStart(2, "0");

    const year =
        date.getFullYear();

    return `${day}/${month}/${year}`;
}


function setDefaultDate() {

    const input =
        document.getElementById("date");

    if (!input) return;

    if (!input.value) {

        input.value =
            getTodayString();
    }
}


function formatDateInput(input) {

    let value =
        input.value.replace(/\D/g, "");

    if (value.length > 8) {

        value =
            value.substring(0, 8);
    }

    if (value.length >= 5) {

        value =
            value.substring(0, 2) +
            "/" +
            value.substring(2, 4) +
            "/" +
            value.substring(4);

    } else if (value.length >= 3) {

        value =
            value.substring(0, 2) +
            "/" +
            value.substring(2);
    }

    input.value = value;
}


function dateToKey(dateString) {

    if (!dateString) return "";

    const parts =
        dateString.split("/");

    if (parts.length !== 3) {

        return "";
    }

    return (
        `${parts[2]}-${parts[1]}-${parts[0]}`
    );
}


function isValidDate(dateString) {

    if (
        !/^\d{2}\/\d{2}\/\d{4}$/
            .test(dateString)
    ) {

        return false;
    }

    const parts =
        dateString.split("/");

    const day =
        Number(parts[0]);

    const month =
        Number(parts[1]);

    const year =
        Number(parts[2]);

    const date =
        new Date(
            year,
            month - 1,
            day
        );

    return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
    );
}


/* =========================================================
   7. THU / CHI
   ========================================================= */

function setType(type) {

    currentType = type;

    const thuBtn =
        document.getElementById("thuBtn");

    const chiBtn =
        document.getElementById("chiBtn");

    if (thuBtn) {

        thuBtn.classList.toggle(
            "active-thu",
            type === "thu"
        );
    }

    if (chiBtn) {

        chiBtn.classList.toggle(
            "active-chi",
            type === "chi"
        );
    }

    const sourceGroup =
        document.getElementById("sourceGroup");

    if (sourceGroup) {

        sourceGroup.style.display =
            type === "thu"
                ? "block"
                : "none";
    }

    updateForm();
}


function setSource(source) {

    currentSource = source;

    const buttons = [
        ["sourceShopee", "ShopeeFood"],
        ["sourceGrab", "GrabFood"],
        ["sourceOut", "Ngoài sàn"]
    ];

    buttons.forEach(
        function ([id, value]) {

            const button =
                document.getElementById(id);

            if (!button) return;

            button.classList.remove(
                "active-shopee",
                "active-grab",
                "active-out"
            );

            if (value === source) {

                if (source === "ShopeeFood") {

                    button.classList.add(
                        "active-shopee"
                    );

                } else if (
                    source === "GrabFood"
                ) {

                    button.classList.add(
                        "active-grab"
                    );

                } else {

                    button.classList.add(
                        "active-out"
                    );
                }
            }
        }
    );
}


function updateForm() {

    const title =
        document.getElementById("formTitle");

    if (title) {

        title.textContent =
            editingId
                ? "Sửa giao dịch"
                : "Thêm giao dịch";
    }
}


/* =========================================================
   8. DANH MỤC
   ========================================================= */

function renderCategorySelect() {

    const category =
        document.getElementById("category");

    const menuCategory =
        document.getElementById(
            "menuDishCategory"
        );

    if (category) {

        const current =
            category.value;

        category.innerHTML =
            '<option value="">Chọn danh mục</option>';

        data.categories.forEach(
            function (cat) {

                const option =
                    document.createElement("option");

                option.value = cat;
                option.textContent = cat;

                category.appendChild(option);
            }
        );

        if (
            data.categories.includes(current)
        ) {

            category.value = current;
        }
    }

    if (menuCategory) {

        const current =
            menuCategory.value;

        menuCategory.innerHTML =
            '<option value="">Chọn danh mục</option>';

        data.categories.forEach(
            function (cat) {

                const option =
                    document.createElement("option");

                option.value = cat;
                option.textContent = cat;

                menuCategory.appendChild(option);
            }
        );

        if (
            data.categories.includes(current)
        ) {

            menuCategory.value = current;
        }
    }
}


function addCategory() {

    const input =
        document.getElementById("newCategory");

    if (!input) return;

    const name =
        input.value.trim();

    if (!name) {

        showToast(
            "Vui lòng nhập tên danh mục!"
        );

        return;
    }

    const exists =
        data.categories.some(
            function (cat) {

                return (
                    cat.toLowerCase() ===
                    name.toLowerCase()
                );
            }
        );

    if (exists) {

        showToast(
            "Danh mục này đã tồn tại!"
        );

        return;
    }

    data.categories.push(name);

    saveData();

    input.value = "";

    renderCategorySelect();
    renderMenu();
    renderCODCategories();

    showToast("Đã thêm danh mục!");
}


/* =========================================================
   9. MÓN ĂN
   ========================================================= */

function addDish() {

    const category =
        document.getElementById(
            "menuDishCategory"
        );

    const input =
        document.getElementById("newDish");

    if (!category || !input) return;

    const categoryName =
        category.value;

    const dishName =
        input.value.trim();

    if (!categoryName) {

        showToast(
            "Vui lòng chọn danh mục!"
        );

        return;
    }

    if (!dishName) {

        showToast(
            "Vui lòng nhập tên món!"
        );

        return;
    }

    const exists =
        data.dishes.some(
            function (dish) {

                return (
                    dish.category === categoryName &&
                    dish.name.toLowerCase() ===
                    dishName.toLowerCase()
                );
            }
        );

    if (exists) {

        showToast(
            "Món này đã tồn tại!"
        );

        return;
    }

    data.dishes.push({

        id: generateId(),

        name: dishName,

        category: categoryName
    });

    saveData();

    input.value = "";

    renderDishSelect();
    renderMenu();
    renderCODCategories();

    showToast("Đã thêm món!");
}


function deleteDish(id) {

    const dish =
        data.dishes.find(
            function (item) {

                return item.id === id;
            }
        );

    if (!dish) return;

    if (
        !confirm(
            `Xóa món "${dish.name}"?`
        )
    ) {

        return;
    }

    data.dishes =
        data.dishes.filter(
            function (item) {

                return item.id !== id;
            }
        );

    delete data.cod[id];

    saveData();

    renderDishSelect();
    renderMenu();
    renderCODCategories();

    showToast("Đã xóa món!");
}


function deleteCategory(categoryName) {

    const hasDish =
        data.dishes.some(
            function (dish) {

                return (
                    dish.category ===
                    categoryName
                );
            }
        );

    let confirmed = false;

    if (hasDish) {

        confirmed =
            confirm(
                `Danh mục "${categoryName}" đang có món.\n\nXóa danh mục và toàn bộ món bên trong?`
            );

    } else {

        confirmed =
            confirm(
                `Xóa danh mục "${categoryName}"?`
            );
    }

    if (!confirmed) return;

    const dishIds =
        data.dishes
            .filter(
                function (dish) {

                    return (
                        dish.category ===
                        categoryName
                    );
                }
            )
            .map(
                function (dish) {

                    return dish.id;
                }
            );

    data.dishes =
        data.dishes.filter(
            function (dish) {

                return (
                    dish.category !==
                    categoryName
                );
            }
        );

    dishIds.forEach(
        function (id) {

            delete data.cod[id];
        }
    );

    data.categories =
        data.categories.filter(
            function (cat) {

                return cat !== categoryName;
            }
        );

    saveData();

    renderCategorySelect();
    renderDishSelect();
    renderMenu();
    renderCODCategories();

    showToast("Đã xóa danh mục!");
}


/* =========================================================
   10. SELECT MÓN
   ========================================================= */

function renderDishSelect() {

    const name =
        document.getElementById("name");

    const category =
        document.getElementById("category");

    if (!name) return;

    const selectedCategory =
        category
            ? category.value
            : "";

    const current =
        name.value;

    name.innerHTML =
        '<option value="">Chọn món</option>';

    let dishes =
        [...data.dishes];

    if (selectedCategory) {

        dishes =
            dishes.filter(
                function (dish) {

                    return (
                        dish.category ===
                        selectedCategory
                    );
                }
            );
    }

    dishes.forEach(
        function (dish) {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                dish.id;

            option.textContent =
                dish.name;

            name.appendChild(option);
        }
    );

    const otherOption =
        document.createElement(
            "option"
        );

    otherOption.value =
        "__custom__";

    otherOption.textContent =
        "✏️ Khác / nhập tên";

    name.appendChild(otherOption);

    if (
        [...name.options].some(
            function (option) {

                return option.value === current;
            }
        )
    ) {

        name.value = current;
    }

    syncCustomName();
}


function syncCustomName() {

    const name =
        document.getElementById("name");

    const customGroup =
        document.getElementById(
            "customNameGroup"
        );

    if (!name || !customGroup) return;

    customGroup.style.display =
        name.value === "__custom__"
            ? "block"
            : "none";
}


/* =========================================================
   11. GIAO DỊCH
   ========================================================= */

function saveTransaction() {

    const nameSelect =
        document.getElementById("name");

    const category =
        document.getElementById("category");

    const customName =
        document.getElementById("customName");

    const amount =
        document.getElementById("amount");

    const date =
        document.getElementById("date");

    const note =
        document.getElementById("note");

    if (!amount || !date) return;

    let transactionName = "";

    if (
        nameSelect &&
        nameSelect.value &&
        nameSelect.value !== "__custom__"
    ) {

        const dish =
            data.dishes.find(
                function (dish) {

                    return (
                        dish.id ===
                        nameSelect.value
                    );
                }
            );

        if (dish) {

            transactionName =
                dish.name;

            if (category) {

                category.value =
                    dish.category;
            }
        }

    } else if (customName) {

        transactionName =
            customName.value.trim();
    }

    if (!transactionName) {

        showToast(
            "Vui lòng chọn hoặc nhập tên!"
        );

        return;
    }

    if (
        !category ||
        !category.value
    ) {

        showToast(
            "Vui lòng chọn danh mục!"
        );

        return;
    }

    const money =
        Number(amount.value);

    if (!money || money <= 0) {

        showToast(
            "Vui lòng nhập số tiền hợp lệ!"
        );

        return;
    }

    if (!isValidDate(date.value)) {

        showToast(
            "Ngày không hợp lệ! Ví dụ: 20/08/2026"
        );

        return;
    }

    const transaction = {

        id:
            editingId ||
            generateId(),

        type:
            currentType,

        name:
            transactionName,

        category:
            category.value,

        amount:
            money,

        date:
            date.value,

        source:
            currentType === "thu"
                ? currentSource
                : "",

        note:
            note
                ? note.value.trim()
                : "",

        createdAt:
            Date.now()
    };

    if (editingId) {

        const index =
            data.transactions.findIndex(
                function (item) {

                    return (
                        item.id ===
                        editingId
                    );
                }
            );

        if (index !== -1) {

            data.transactions[index] =
                transaction;
        }

        showToast(
            "Đã cập nhật giao dịch!"
        );

    } else {

        data.transactions.push(
            transaction
        );

        showToast(
            "Đã lưu giao dịch!"
        );
    }

    saveData();

    resetForm();

    renderAll();
}


function resetForm() {

    editingId = null;

    [
        "name",
        "category",
        "customName",
        "amount",
        "note"
    ].forEach(
        function (id) {

            const element =
                document.getElementById(id);

            if (!element) return;

            element.value = "";
        }
    );

    const date =
        document.getElementById("date");

    if (date) {

        date.value =
            getTodayString();
    }

    const cancel =
        document.getElementById(
            "cancelButton"
        );

    if (cancel) {

        cancel.style.display =
            "none";
    }

    currentType = "thu";
    currentSource = "ShopeeFood";

    setType("thu");
    setSource("ShopeeFood");

    updateForm();

    renderDishSelect();
}


function cancelEdit() {

    resetForm();

    showToast("Đã hủy sửa");
}


function editTransaction(id) {

    const transaction =
        data.transactions.find(
            function (item) {

                return item.id === id;
            }
        );

    if (!transaction) return;

    editingId = id;

    currentType =
        transaction.type;

    currentSource =
        transaction.source ||
        "ShopeeFood";

    const category =
        document.getElementById(
            "category"
        );

    const name =
        document.getElementById(
            "name"
        );

    const customName =
        document.getElementById(
            "customName"
        );

    const amount =
        document.getElementById(
            "amount"
        );

    const date =
        document.getElementById(
            "date"
        );

    const note =
        document.getElementById(
            "note"
        );

    if (category) {

        category.value =
            transaction.category;
    }

    renderDishSelect();

    const dish =
        data.dishes.find(
            function (item) {

                return (
                    item.name ===
                    transaction.name &&
                    item.category ===
                    transaction.category
                );
            }
        );

    if (dish && name) {

        name.value =
            dish.id;

    } else if (name) {

        name.value =
            "__custom__";

        if (customName) {

            customName.value =
                transaction.name;
        }
    }

    if (amount) {

        amount.value =
            transaction.amount;
    }

    if (date) {

        date.value =
            transaction.date;
    }

    if (note) {

        note.value =
            transaction.note || "";
    }

    const cancel =
        document.getElementById(
            "cancelButton"
        );

    if (cancel) {

        cancel.style.display =
            "block";
    }

    setType(currentType);
    setSource(currentSource);

    syncCustomName();
    updateForm();

    goAdd();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


function deleteTransaction(id) {

    const transaction =
        data.transactions.find(
            function (item) {

                return item.id === id;
            }
        );

    if (!transaction) return;

    if (
        !confirm(
            `Xóa giao dịch "${transaction.name}"?`
        )
    ) {

        return;
    }

    data.transactions =
        data.transactions.filter(
            function (item) {

                return item.id !== id;
            }
        );

    saveData();

    renderAll();

    showToast(
        "Đã xóa giao dịch!"
    );
}


/* =========================================================
   12. TỔNG TIỀN
   ========================================================= */

function calculateTotals(list) {

    let income = 0;
    let expense = 0;

    list.forEach(
        function (transaction) {

            if (
                transaction.type ===
                "thu"
            ) {

                income +=
                    Number(
                        transaction.amount
                    ) || 0;

            } else {

                expense +=
                    Number(
                        transaction.amount
                    ) || 0;
            }
        }
    );

    return {
        income: income,
        expense: expense,
        profit: income - expense
    };
}


function renderSummary() {

    const totals =
        calculateTotals(
            data.transactions
        );

    const profit =
        document.getElementById(
            "profit"
        );

    const income =
        document.getElementById(
            "totalIncome"
        );

    const expense =
        document.getElementById(
            "totalExpense"
        );

    const transactions =
        document.getElementById(
            "totalTransactions"
        );

    const quickIncome =
        document.getElementById(
            "quickIncome"
        );

    const quickExpense =
        document.getElementById(
            "quickExpense"
        );

    if (profit) {

        profit.textContent =
            formatMoney(
                totals.profit
            );
    }

    if (income) {

        income.textContent =
            formatMoney(
                totals.income
            );
    }

    if (expense) {

        expense.textContent =
            formatMoney(
                totals.expense
            );
    }

    if (transactions) {

        transactions.textContent =
            data.transactions.length;
    }

    if (quickIncome) {

        quickIncome.textContent =
            formatMoney(
                totals.income
            );
    }

    if (quickExpense) {

        quickExpense.textContent =
            formatMoney(
                totals.expense
            );
    }
}


/* =========================================================
   13. LỊCH SỬ
   ========================================================= */

function renderTransactions() {

    const container =
        document.getElementById(
            "transactions"
        );

    if (!container) return;

    const search =
        document.getElementById(
            "search"
        );

    const filterType =
        document.getElementById(
            "filterType"
        );

    const filterMonth =
        document.getElementById(
            "filterMonth"
        );

    const searchValue =
        search
            ? search.value
                .toLowerCase()
                .trim()
            : "";

    const type =
        filterType
            ? filterType.value
            : "all";

    const month =
        filterMonth
            ? filterMonth.value
            : "all";

    let list =
        [...data.transactions];

    if (searchValue) {

        list =
            list.filter(
                function (transaction) {

                    const text = [
                        transaction.name,
                        transaction.category,
                        transaction.note,
                        transaction.source,
                        transaction.date
                    ]
                        .join(" ")
                        .toLowerCase();

                    return text.includes(
                        searchValue
                    );
                }
            );
    }

    if (type !== "all") {

        list =
            list.filter(
                function (transaction) {

                    return (
                        transaction.type ===
                        type
                    );
                }
            );
    }

    if (month !== "all") {

        list =
            list.filter(
                function (transaction) {

                    return (
                        getMonthKey(
                            transaction.date
                        ) === month
                    );
                }
            );
    }

    list.sort(
        function (a, b) {

            return dateToKey(
                b.date
            ).localeCompare(
                dateToKey(a.date)
            );
        }
    );

    const historyCount =
        document.getElementById(
            "historyCount"
        );

    if (historyCount) {

        historyCount.textContent =
            `${list.length} giao dịch`;
    }

    if (!list.length) {

        container.innerHTML =
            `
            <div class="empty-state">
                Chưa có giao dịch
            </div>
            `;

        return;
    }

    container.innerHTML =
        list.map(
            function (transaction) {

                const isThu =
                    transaction.type ===
                    "thu";

                return `
                    <div class="transaction-item">

                        <div class="transaction-icon ${isThu ? "thu" : "chi"}">
                            ${isThu ? "↑" : "↓"}
                        </div>

                        <div class="transaction-info">

                            <strong>
                                ${escapeHTML(
                                    transaction.name
                                )}
                            </strong>

                            <span>
                                ${escapeHTML(
                                    transaction.category
                                )}

                                ${
                                    transaction.source
                                        ? " • " +
                                          escapeHTML(
                                              transaction.source
                                          )
                                        : ""
                                }
                            </span>

                            <small>
                                ${escapeHTML(
                                    transaction.date
                                )}

                                ${
                                    transaction.note
                                        ? " • " +
                                          escapeHTML(
                                              transaction.note
                                          )
                                        : ""
                                }
                            </small>

                        </div>

                        <div class="transaction-right">

                            <strong class="${
                                isThu
                                    ? "money-green"
                                    : "money-red"
                            }">
                                ${
                                    isThu
                                        ? "+"
                                        : "-"
                                }${formatMoney(
                                    transaction.amount
                                )}
                            </strong>

                            <div class="transaction-actions">

                                <button
                                    onclick="editTransaction('${transaction.id}')">
                                    ✏️
                                </button>

                                <button
                                    onclick="deleteTransaction('${transaction.id}')">
                                    🗑️
                                </button>

                            </div>

                        </div>

                    </div>
                `;
            }
        ).join("");
}


/* =========================================================
   14. THÁNG
   ========================================================= */

function getMonthKey(dateString) {

    if (!dateString) return "";

    const parts =
        dateString.split("/");

    if (parts.length !== 3) {

        return "";
    }

    return (
        `${parts[2]}-${parts[1]}`
    );
}


function getMonthLabel(monthKey) {

    if (monthKey === "all") {

        return "Tất cả";
    }

    const parts =
        monthKey.split("-");

    if (parts.length !== 2) {

        return monthKey;
    }

    return (
        `Tháng ${Number(parts[1])}/${parts[0]}`
    );
}


function getAvailableMonths() {

    const months =
        new Set();

    data.transactions.forEach(
        function (transaction) {

            const key =
                getMonthKey(
                    transaction.date
                );

            if (key) {

                months.add(key);
            }
        }
    );

    const current =
        new Date();

    months.add(
        `${current.getFullYear()}-${String(
            current.getMonth() + 1
        ).padStart(2, "0")}`
    );

    return [
        ...months
    ].sort().reverse();
}


function renderMonthFilters() {

    const filters = [
        "filterMonth",
        "statMonth"
    ];

    const months =
        getAvailableMonths();

    filters.forEach(
        function (id) {

            const select =
                document.getElementById(id);

            if (!select) return;

            const oldValue =
                select.value;

            select.innerHTML =
                '<option value="all">Tất cả tháng</option>';

            months.forEach(
                function (month) {

                    const option =
                        document.createElement(
                            "option"
                        );

                    option.value =
                        month;

                    option.textContent =
                        getMonthLabel(
                            month
                        );

                    select.appendChild(
                        option
                    );
                }
            );

            if (
                oldValue === "all" ||
                months.includes(oldValue)
            ) {

                select.value =
                    oldValue || "all";
            }
        }
    );
}


/* =========================================================
   15. THỐNG KÊ
   ========================================================= */

function setStatisticType(type) {

    statisticType = type;

    const tabs = {
        all: "tabAll",
        thu: "tabThu",
        chi: "tabChi"
    };

    Object.entries(tabs).forEach(
        function ([key, id]) {

            const button =
                document.getElementById(id);

            if (!button) return;

            button.classList.toggle(
                "active",
                key === type
            );
        }
    );

    renderStatistics();
}


function renderStatistics() {

    const statMonth =
        document.getElementById(
            "statMonth"
        );

    const month =
        statMonth
            ? statMonth.value
            : "all";

    let list =
        [...data.transactions];

    if (month !== "all") {

        list =
            list.filter(
                function (transaction) {

                    return (
                        getMonthKey(
                            transaction.date
                        ) === month
                    );
                }
            );
    }

    if (statisticType !== "all") {

        list =
            list.filter(
                function (transaction) {

                    return (
                        transaction.type ===
                        statisticType
                    );
                }
            );
    }

    renderPieChart(list);
    renderDailyChart(list);
    renderCategoryStats(list);
}


/* =========================================================
   16. BIỂU ĐỒ TRÒN
   ========================================================= */

function renderPieChart(list) {

    const pie =
        document.getElementById("pie");

    const legend =
        document.getElementById("legend");

    const pieTotal =
        document.getElementById(
            "pieTotal"
        );

    const chartTotal =
        document.getElementById(
            "chartTotal"
        );

    const chartTitle =
        document.getElementById(
            "chartMainTitle"
        );

    if (!pie) return;

    const groups = {};

    list.forEach(
        function (transaction) {

            const key =
                transaction.category ||
                "Khác";

            groups[key] =
                (groups[key] || 0) +
                Number(
                    transaction.amount
                );
        }
    );

    const entries =
        Object.entries(groups)
            .sort(
                function (a, b) {

                    return b[1] - a[1];
                }
            );

    const total =
        entries.reduce(
            function (sum, item) {

                return sum + item[1];
            },
            0
        );

    if (pieTotal) {

        pieTotal.textContent =
            formatMoney(total);
    }

    if (chartTotal) {

        chartTotal.textContent =
            formatMoney(total);
    }

    if (chartTitle) {

        if (statisticType === "thu") {

            chartTitle.textContent =
                "Phân bổ khoản thu";

        } else if (
            statisticType === "chi"
        ) {

            chartTitle.textContent =
                "Phân bổ khoản chi";

        } else {

            chartTitle.textContent =
                "Phân bổ thu chi";
        }
    }

    if (!total) {

        pie.style.background =
            "#e5e7eb";

        if (legend) {

            legend.innerHTML =
                `
                <div class="empty-state">
                    Chưa có dữ liệu
                </div>
                `;
        }

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
        "#f97316"
    ];

    let current = 0;

    const gradients = [];

    entries.forEach(
        function ([category, value], index) {

            const percent =
                value / total * 100;

            const start =
                current;

            const end =
                current + percent;

            current = end;

            gradients.push(
                `${colors[index % colors.length]} ${start}% ${end}%`
            );
        }
    );

    pie.style.background =
        `conic-gradient(${gradients.join(", ")})`;

    if (legend) {

        legend.innerHTML =
            entries.map(
                function (
                    [category, value],
                    index
                ) {

                    const percent =
                        value / total * 100;

                    return `
                        <div class="legend-item">

                            <span
                                class="legend-color"
                                style="
                                    background:
                                    ${colors[index % colors.length]}
                                ">
                            </span>

                            <span class="legend-name">
                                ${escapeHTML(
                                    category
                                )}
                            </span>

                            <strong>
                                ${formatMoney(value)}
                            </strong>

                            <small>
                                ${percent.toFixed(1)}%
                            </small>

                        </div>
                    `;
                }
            ).join("");
    }
}


/* =========================================================
   17. BIỂU ĐỒ NGÀY
   ========================================================= */

function renderDailyChart(list) {

    const container =
        document.getElementById(
            "barChart"
        );

    const label =
        document.getElementById(
            "dailyLabel"
        );

    if (!container) return;

    const days = {};

    list.forEach(
        function (transaction) {

            days[transaction.date] =
                (days[transaction.date] || 0) +
                Number(
                    transaction.amount
                );
        }
    );

    const entries =
        Object.entries(days)
            .sort(
                function (a, b) {

                    return dateToKey(
                        a[0]
                    ).localeCompare(
                        dateToKey(b[0])
                    );
                }
            );

    if (label) {

        label.textContent =
            statisticType === "thu"
                ? "Thu"
                : statisticType === "chi"
                    ? "Chi"
                    : "Tất cả";
    }

    if (!entries.length) {

        container.innerHTML =
            `
            <div class="empty-state">
                Chưa có dữ liệu
            </div>
            `;

        return;
    }

    const max =
        Math.max(
            ...entries.map(
                function (item) {

                    return item[1];
                }
            )
        );

    container.innerHTML =
        entries.map(
            function ([date, value]) {

                const height =
                    max > 0
                        ? Math.max(
                            5,
                            value / max * 100
                        )
                        : 5;

                const day =
                    date.substring(0, 2);

                return `
                    <div class="bar-column">

                        <div class="bar-value">
                            ${formatShortMoney(value)}
                        </div>

                        <div
                            class="bar"
                            style="height:${height}%"
                            title="${escapeHTML(date)}: ${formatMoney(value)}">
                        </div>

                        <small>
                            ${escapeHTML(day)}
                        </small>

                    </div>
                `;
            }
        ).join("");
}


/* =========================================================
   18. THỐNG KÊ DANH MỤC
   ========================================================= */

function renderCategoryStats(list) {

    const container =
        document.getElementById(
            "categoryStats"
        );

    if (!container) return;

    const groups = {};

    list.forEach(
        function (transaction) {

            const key =
                transaction.category ||
                "Khác";

            if (!groups[key]) {

                groups[key] = {

                    total: 0,

                    count: 0,

                    sources: {}
                };
            }

            groups[key].total +=
                Number(
                    transaction.amount
                );

            groups[key].count++;

            if (transaction.source) {

                groups[key].sources[
                    transaction.source
                ] =
                    (
                        groups[key].sources[
                            transaction.source
                        ] || 0
                    ) +
                    Number(
                        transaction.amount
                    );
            }
        }
    );

    const entries =
        Object.entries(groups)
            .sort(
                function (a, b) {

                    return (
                        b[1].total -
                        a[1].total
                    );
                }
            );

    if (!entries.length) {

        container.innerHTML =
            `
            <div class="empty-state">
                Chưa có dữ liệu
            </div>
            `;

        return;
    }

    container.innerHTML =
        entries.map(
            function ([category, info]) {

                const sources =
                    Object.entries(
                        info.sources
                    );

                return `
                    <div class="category-stat">

                        <div class="category-stat-head">

                            <strong>
                                ${escapeHTML(
                                    category
                                )}
                            </strong>

                            <strong>
                                ${formatMoney(
                                    info.total
                                )}
                            </strong>

                        </div>

                        <div class="category-stat-count">
                            ${info.count} giao dịch
                        </div>

                        ${
                            sources.length
                                ? `
                                    <div class="category-sources">
                                        ${
                                            sources.map(
                                                function (
                                                    [source, amount]
                                                ) {

                                                    return `
                                                        <span>
                                                            ${escapeHTML(source)}:
                                                            ${formatMoney(amount)}
                                                        </span>
                                                    `;
                                                }
                                            ).join("")
                                        }
                                    </div>
                                `
                                : ""
                        }

                    </div>
                `;
            }
        ).join("");
}


/* =========================================================
   19. QUẢN LÝ QUÁN
   ========================================================= */

function renderMenu() {

    const container =
        document.getElementById(
            "menuList"
        );

    const count =
        document.getElementById(
            "menuCount"
        );

    if (!container) return;

    if (count) {

        count.textContent =
            `${data.categories.length} danh mục`;
    }

    if (!data.categories.length) {

        container.innerHTML =
            `
            <div class="empty-state">
                Chưa có danh mục nào.
            </div>
            `;

        return;
    }

    container.innerHTML =
        data.categories.map(
            function (category) {

                const dishes =
                    data.dishes.filter(
                        function (dish) {

                            return (
                                dish.category ===
                                category
                            );
                        }
                    );

                return `
                    <div class="menu-category">

                        <div class="menu-category-head">

                            <strong>
                                📁 ${escapeHTML(
                                    category
                                )}
                            </strong>

                            <button
                                class="menu-delete"
                                onclick="deleteCategory(${JSON.stringify(category)})">
                                🗑️
                            </button>

                        </div>

                        <div class="menu-dishes">

                            ${
                                dishes.length
                                    ? dishes.map(
                                        function (dish) {

                                            return `
                                                <div class="menu-dish">

                                                    <span>
                                                        🍜
                                                        ${escapeHTML(
                                                            dish.name
                                                        )}
                                                    </span>

                                                    <button
                                                        onclick="deleteDish('${dish.id}')">
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
            }
        ).join("");
}


/* =========================================================
   20. COD - DANH MỤC
   ========================================================= */

function renderCODCategories() {

    const container =
        document.getElementById(
            "codCategoryList"
        );

    if (!container) return;

    if (!data.categories.length) {

        container.innerHTML =
            `
            <div class="empty-state">
                Chưa có danh mục.
                Hãy tạo danh mục ở mục Quán.
            </div>
            `;

        return;
    }

    container.innerHTML =
        data.categories.map(
            function (category) {

                const dishes =
                    data.dishes.filter(
                        function (dish) {

                            return (
                                dish.category ===
                                category
                            );
                        }
                    );

                return `
                    <button
                        class="cod-category-button"
                        data-category="${escapeHTML(category)}">

                        <span>
                            📁
                            ${escapeHTML(category)}
                        </span>

                        <small>
                            ${dishes.length} món
                        </small>

                    </button>
                `;
            }
        ).join("");

    container
        .querySelectorAll(
            ".cod-category-button"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        showCODDishes(
                            button.dataset.category
                        );
                    }
                );
            }
        );
}


function showCODCategories() {

    currentCODCategory = null;
    currentCODDish = null;

    const categoryPage =
        document.getElementById(
            "codCategoryPage"
        );

    const dishPage =
        document.getElementById(
            "codDishPage"
        );

    const detailPage =
        document.getElementById(
            "codDetailPage"
        );

    if (categoryPage) {

        categoryPage.style.display =
            "block";
    }

    if (dishPage) {

        dishPage.style.display =
            "none";
    }

    if (detailPage) {

        detailPage.style.display =
            "none";
    }

    renderCODCategories();
}


function showCODDishes(category) {

    currentCODCategory =
        category;

    const categoryPage =
        document.getElementById(
            "codCategoryPage"
        );

    const dishPage =
        document.getElementById(
            "codDishPage"
        );

    const detailPage =
        document.getElementById(
            "codDetailPage"
        );

    if (categoryPage) {

        categoryPage.style.display =
            "none";
    }

    if (dishPage) {

        dishPage.style.display =
            "block";
    }

    if (detailPage) {

        detailPage.style.display =
            "none";
    }

    const title =
        document.getElementById(
            "codDishCategoryTitle"
        );

    if (title) {

        title.textContent =
            `🍜 ${category}`;
    }

    const list =
        document.getElementById(
            "codDishList"
        );

    if (!list) return;

    const dishes =
        data.dishes.filter(
            function (dish) {

                return (
                    dish.category ===
                    category
                );
            }
        );

    if (!dishes.length) {

        list.innerHTML =
            `
            <div class="empty-state">
                Danh mục này chưa có món.
            </div>
            `;

        return;
    }

    list.innerHTML =
        dishes.map(
            function (dish) {

                const cod =
                    data.cod[dish.id];

                const totalCost =
                    cod
                        ? calculateCODTotal(cod)
                        : 0;

                return `
                    <button
                        class="cod-dish-button"
                        onclick="showCODDetail('${dish.id}')">

                        <div>

                            <strong>
                                🍜 ${escapeHTML(
                                    dish.name
                                )}
                            </strong>

                            <small>
                                Giá vốn:
                                ${formatMoney(
                                    totalCost
                                )}
                            </small>

                        </div>

                        <span>
                            →
                        </span>

                    </button>
                `;
            }
        ).join("");
}


/* =========================================================
   21. COD - CHI TIẾT
   ========================================================= */

function showCODDetail(dishId) {

    currentCODDish =
        dishId;

    const dish =
        data.dishes.find(
            function (item) {

                return (
                    item.id ===
                    dishId
                );
            }
        );

    if (!dish) return;

    if (!data.cod[dishId]) {

        data.cod[dishId] = {

            sellingPrice: 0,

            parts: []
        };
    }

    const categoryPage =
        document.getElementById(
            "codCategoryPage"
        );

    const dishPage =
        document.getElementById(
            "codDishPage"
        );

    const detailPage =
        document.getElementById(
            "codDetailPage"
        );

    if (categoryPage) {

        categoryPage.style.display =
            "none";
    }

    if (dishPage) {

        dishPage.style.display =
            "none";
    }

    if (detailPage) {

        detailPage.style.display =
            "block";
    }

    const name =
        document.getElementById(
            "codDetailName"
        );

    const category =
        document.getElementById(
            "codDetailCategory"
        );

    const selling =
        document.getElementById(
            "codSellingPrice"
        );

    if (name) {

        name.textContent =
            dish.name;
    }

    if (category) {

        category.textContent =
            dish.category;
    }

    if (selling) {

        selling.value =
            data.cod[dishId].sellingPrice ||
            "";
    }

    clearCODPartInputs();

    renderCODDetail();
}


function calculateCODTotal(cod) {

    if (
        !cod ||
        !Array.isArray(cod.parts)
    ) {

        return 0;
    }

    return cod.parts.reduce(
        function (sum, part) {

            return (
                sum +
                Number(
                    part.amount || 0
                )
            );
        },
        0
    );
}


function renderCODDetail() {

    if (!currentCODDish) return;

    const cod =
        data.cod[currentCODDish];

    if (!cod) return;

    const total =
        calculateCODTotal(cod);

    const selling =
        Number(
            cod.sellingPrice || 0
        );

    const profit =
        selling - total;

    const totalElement =
        document.getElementById(
            "codTotalCost"
        );

    const profitElement =
        document.getElementById(
            "codProfit"
        );

    const count =
        document.getElementById(
            "codPartCount"
        );

    const list =
        document.getElementById(
            "codPartList"
        );

    if (totalElement) {

        totalElement.textContent =
            formatMoney(total);
    }

    if (profitElement) {

        profitElement.textContent =
            formatMoney(profit);
    }

    if (count) {

        count.textContent =
            `${cod.parts.length} phần`;
    }

    if (!list) return;

    if (!cod.parts.length) {

        list.innerHTML =
            `
            <div class="empty-state">
                Chưa có thành phần giá vốn.
            </div>
            `;

        return;
    }

    list.innerHTML =
        cod.parts.map(
            function (part) {

                return `
                    <div class="cod-part">

                        <div>

                            <strong>
                                ${escapeHTML(
                                    part.name
                                )}
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
                                ${formatMoney(
                                    part.amount
                                )}
                            </strong>

                            <button
                                onclick="deleteCODPart('${part.id}')">
                                🗑️
                            </button>

                        </div>

                    </div>
                `;
            }
        ).join("");
}


function renderCODDetailSummary() {

    if (!currentCODDish) return;

    const input =
        document.getElementById(
            "codSellingPrice"
        );

    const cod =
        data.cod[currentCODDish];

    if (!cod) return;

    cod.sellingPrice =
        Number(
            input
                ? input.value
                : 0
        );

    const total =
        calculateCODTotal(cod);

    const profit =
        cod.sellingPrice -
        total;

    const totalElement =
        document.getElementById(
            "codTotalCost"
        );

    const profitElement =
        document.getElementById(
            "codProfit"
        );

    if (totalElement) {

        totalElement.textContent =
            formatMoney(total);
    }

    if (profitElement) {

        profitElement.textContent =
            formatMoney(profit);
    }
}


function addCODPart() {

    if (!currentCODDish) {

        showToast(
            "Chưa chọn món!"
        );

        return;
    }

    const name =
        document.getElementById(
            "codPartName"
        );

    const amount =
        document.getElementById(
            "codPartAmount"
        );

    const note =
        document.getElementById(
            "codPartNote"
        );

    if (!name || !amount) return;

    const partName =
        name.value.trim();

    const partAmount =
        Number(amount.value);

    if (!partName) {

        showToast(
            "Nhập tên phần!"
        );

        return;
    }

    if (
        !partAmount ||
        partAmount <= 0
    ) {

        showToast(
            "Nhập giá tiền hợp lệ!"
        );

        return;
    }

    if (!data.cod[currentCODDish]) {

        data.cod[currentCODDish] = {

            sellingPrice: 0,

            parts: []
        };
    }

    data.cod[currentCODDish].parts.push({

        id:
            generateId(),

        name:
            partName,

        amount:
            partAmount,

        note:
            note
                ? note.value.trim()
                : ""
    });

    saveData();

    clearCODPartInputs();

    renderCODDetail();

    showToast(
        "Đã thêm thành phần!"
    );
}


function clearCODPartInputs() {

    [
        "codPartName",
        "codPartAmount",
        "codPartNote"
    ].forEach(
        function (id) {

            const element =
                document.getElementById(id);

            if (element) {

                element.value = "";
            }
        }
    );
}


function deleteCODPart(partId) {

    if (!currentCODDish) return;

    const cod =
        data.cod[currentCODDish];

    if (!cod) return;

    cod.parts =
        cod.parts.filter(
            function (part) {

                return (
                    part.id !==
                    partId
                );
            }
        );

    saveData();

    renderCODDetail();

    showToast(
        "Đã xóa thành phần!"
    );
}


function saveCODDish() {

    if (!currentCODDish) {

        showToast(
            "Chưa chọn món!"
        );

        return;
    }

    const input =
        document.getElementById(
            "codSellingPrice"
        );

    if (!data.cod[currentCODDish]) {

        data.cod[currentCODDish] = {

            sellingPrice: 0,

            parts: []
        };
    }

    data.cod[currentCODDish].sellingPrice =
        Number(
            input
                ? input.value
                : 0
        );

    saveData();

    renderCODDetail();

    if (currentCODCategory) {

        showCODDishes(
            currentCODCategory
        );
    }

    showToast(
        "Đã lưu giá vốn món!"
    );
}


/* =========================================================
   22. ĐIỀU HƯỚNG
   ========================================================= */

function hideAllMainSections() {

    const home =
        document.getElementById(
            "homeSection"
        );

    const cod =
        document.getElementById(
            "codSection"
        );

    if (home) {

        home.style.display =
            "none";
    }

    if (cod) {

        cod.style.display =
            "none";
    }
}


function clearNavActive() {

    document
        .querySelectorAll(".nav-button")
        .forEach(
            function (button) {

                button.classList.remove(
                    "active"
                );
            }
        );
}


function activateNav(id) {

    clearNavActive();

    const button =
        document.getElementById(id);

    if (button) {

        button.classList.add(
            "active"
        );
    }
}


function goHome(scroll = true) {

    hideAllMainSections();

    activateNav("navHome");

    const home =
        document.getElementById(
            "homeSection"
        );

    if (home) {

        home.style.display =
            "block";
    }

    if (scroll) {

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }
}


function goAdd() {

    goHome(false);

    activateNav("navAdd");

    const section =
        document.getElementById(
            "addSection"
        );

    if (section) {

        section.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
}


function goStatistics() {

    goHome(false);

    activateNav("navStatistics");

    const section =
        document.getElementById(
            "statisticsSection"
        );

    if (section) {

        section.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
}


function goHistory() {

    goHome(false);

    activateNav("navHistory");

    const section =
        document.getElementById(
            "historySection"
        );

    if (section) {

        section.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
}


function goRestaurant() {

    goHome(false);

    activateNav("navRestaurant");

    const section =
        document.getElementById(
            "restaurantSection"
        );

    if (section) {

        section.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
}


function goCOD() {

    hideAllMainSections();

    activateNav("navCOD");

    const cod =
        document.getElementById(
            "codSection"
        );

    if (cod) {

        cod.style.display =
            "block";
    }

    showCODCategories();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================================
   23. SAO LƯU
   ========================================================= */

function backup() {

    saveData();

    const backupData = {

        version: 1,

        exportedAt:
            new Date().toISOString(),

        data: data
    };

    const blob =
        new Blob(
            [
                JSON.stringify(
                    backupData,
                    null,
                    2
                )
            ],
            {
                type:
                    "application/json"
            }
        );

    const url =
        URL.createObjectURL(blob);

    const a =
        document.createElement("a");

    const date =
        new Date()
            .toISOString()
            .slice(0, 10);

    a.href = url;

    a.download =
        `backup-quan-ly-thu-chi-${date}.json`;

    document.body.appendChild(a);

    a.click();

    a.remove();

    URL.revokeObjectURL(url);

    showToast(
        "Đã sao lưu dữ liệu!"
    );
}


/* =========================================================
   24. KHÔI PHỤC
   ========================================================= */

function restore(event) {

    const file =
        event.target.files[0];

    if (!file) return;

    const reader =
        new FileReader();

    reader.onload =
        function (e) {

            try {

                const parsed =
                    JSON.parse(
                        e.target.result
                    );

                let restoredData;

                if (
                    parsed &&
                    parsed.data
                ) {

                    restoredData =
                        parsed.data;

                } else {

                    restoredData =
                        parsed;
                }

                if (
                    !restoredData ||
                    !Array.isArray(
                        restoredData.transactions
                    )
                ) {

                    throw new Error(
                        "File không đúng định dạng"
                    );
                }

                data = {

                    transactions:
                        Array.isArray(
                            restoredData.transactions
                        )
                            ? restoredData.transactions
                            : [],

                    categories:
                        Array.isArray(
                            restoredData.categories
                        )
                            ? restoredData.categories
                            : [],

                    dishes:
                        Array.isArray(
                            restoredData.dishes
                        )
                            ? restoredData.dishes
                            : [],

                    cod:
                        restoredData.cod &&
                        typeof restoredData.cod ===
                        "object"
                            ? restoredData.cod
                            : {}
                };

                saveData();

                renderAll();

                showToast(
                    "Đã khôi phục dữ liệu!"
                );

            } catch (error) {

                console.error(error);

                showToast(
                    "File khôi phục không hợp lệ!"
                );
            }

            event.target.value = "";
        };

    reader.readAsText(file);
}


/* =========================================================
   25. CSV
   ========================================================= */

function exportCSV() {

    if (
        !data.transactions.length
    ) {

        showToast(
            "Chưa có dữ liệu để xuất!"
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
        data.transactions.map(
            function (transaction) {

                return [

                    transaction.date,

                    transaction.type === "thu"
                        ? "THU"
                        : "CHI",

                    transaction.name,

                    transaction.category,

                    transaction.source || "",

                    transaction.amount,

                    transaction.note || ""
                ];
            }
        );

    const csv =
        [
            headers,
            ...rows
        ]
            .map(
                function (row) {

                    return row.map(
                        function (value) {

                            const text =
                                String(
                                    value ?? ""
                                );

                            return (
                                '"' +
                                text.replace(
                                    /"/g,
                                    '""'
                                ) +
                                '"'
                            );
                        }
                    ).join(",");
                }
            )
            .join("\n");

    const blob =
        new Blob(
            [
                "\ufeff" + csv
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
        "lich-su-giao-dich.csv";

    document.body.appendChild(a);

    a.click();

    a.remove();

    URL.revokeObjectURL(url);

    showToast(
        "Đã xuất CSV!"
    );
}


/* =========================================================
   26. XÓA TOÀN BỘ
   ========================================================= */

function deleteAll() {

    const confirmed =
        confirm(
            "Bạn có chắc muốn XÓA TOÀN BỘ dữ liệu không?\n\nHành động này không thể hoàn tác."
        );

    if (!confirmed) return;

    data = {

        transactions: [],

        categories: [],

        dishes: [],

        cod: {}
    };

    saveData();

    resetForm();

    renderAll();

    showToast(
        "Đã xóa toàn bộ dữ liệu!"
    );
}


/* =========================================================
   27. RENDER TẤT CẢ
   ========================================================= */

function renderAll() {

    renderCategorySelect();

    renderDishSelect();

    renderMenu();

    renderCODCategories();

    renderMonthFilters();

    renderTransactions();

    renderSummary();

    renderStatistics();
}


/* =========================================================
   28. ENTER
   ========================================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key !== "Enter"
        ) {
            return;
        }

        const target =
            event.target;

        if (!target) return;

        if (
            target.id === "amount"
        ) {

            event.preventDefault();

            saveTransaction();

            return;
        }

        if (
            target.id ===
            "newCategory"
        ) {

            event.preventDefault();

            addCategory();

            return;
        }

        if (
            target.id ===
            "newDish"
        ) {

            event.preventDefault();

            addDish();

            return;
        }

        if (
            target.id ===
            "codPartAmount"
        ) {

            event.preventDefault();

            addCODPart();

            return;
        }
    }
);


/* =========================================================
   29. PHÒNG TRƯỜNG HỢP HTML CHẠY TRƯỚC JS
   ========================================================= */

window.toggleDark =
    toggleDark;

window.setType =
    setType;

window.setSource =
    setSource;

window.formatDateInput =
    formatDateInput;

window.syncCustomName =
    syncCustomName;

window.saveTransaction =
    saveTransaction;

window.cancelEdit =
    cancelEdit;

window.editTransaction =
    editTransaction;

window.deleteTransaction =
    deleteTransaction;

window.addCategory =
    addCategory;

window.deleteCategory =
    deleteCategory;

window.addDish =
    addDish;

window.deleteDish =
    deleteDish;

window.renderDishSelect =
    renderDishSelect;

window.renderStatistics =
    renderStatistics;

window.setStatisticType =
    setStatisticType;

window.addCODPart =
    addCODPart;

window.deleteCODPart =
    deleteCODPart;

window.saveCODDish =
    saveCODDish;

window.renderCODDetailSummary =
    renderCODDetailSummary;

window.showCODCategories =
    showCODCategories;

window.showCODDishes =
    showCODDishes;

window.showCODDetail =
    showCODDetail;

window.goHome =
    goHome;

window.goAdd =
    goAdd;

window.goStatistics =
    goStatistics;

window.goHistory =
    goHistory;

window.goRestaurant =
    goRestaurant;

window.goCOD =
    goCOD;

window.backup =
    backup;

window.restore =
    restore;

window.exportCSV =
    exportCSV;

window.deleteAll =
    deleteAll;

console.log(
    "Quản lý Thu Chi: JS đã sẵn sàng."
);
