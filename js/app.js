let data =
            JSON.parse(
                localStorage.getItem("thuChiBanHangV5")
            ) || [];


        let menuData =
            JSON.parse(
                localStorage.getItem("thuChiMenuV1")
            ) || [];


        /*
        COD DATA
        
        {
          "categoryId-dishId":{
              sellingPrice:35000,
              parts:[
                  {
                     id:123,
                     name:"Mì",
                     amount:5000,
                     note:"..."
                  }
              ]
          }
        }
        */

        let codData =
            JSON.parse(
                localStorage.getItem("thuChiCODV1")
            ) || {};


        let currentType = "thu";
        let currentSource = "ShopeeFood";
        let editId = null;
        let statisticType = "all";

        let currentCODCategoryId = null;
        let currentCODDishId = null;

        const colors = [
            "#ee4d2d",
            "#00a85a",
            "#2563eb",
            "#7c3aed",
            "#ec4899",
            "#f97316",
            "#eab308",
            "#16a34a",
            "#0891b2",
            "#ef4444",
            "#14b8a6",
            "#8b5cf6"
        ];

        const sourceColors = {
            "ShopeeFood": "#ee4d2d",
            "GrabFood": "#00a85a",
            "Ngoài sàn": "#2563eb"
        };


        /* =====================================================
           BASIC
        ===================================================== */

        function money(number) {

            return new Intl.NumberFormat(
                "vi-VN",
                {
                    style: "currency",
                    currency: "VND",
                    maximumFractionDigits: 0
                }
            ).format(Number(number) || 0);

        }


        function escapeHTML(value) {

            return String(value || "")
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");

        }


        function todayVN() {

            const d = new Date();

            return String(d.getDate()).padStart(2, "0")
                + "/" +
                String(d.getMonth() + 1).padStart(2, "0")
                + "/" +
                d.getFullYear();

        }


        function formatDateInput(input) {

            let value = input.value
                .replace(/\D/g, "")
                .slice(0, 8);

            if (value.length >= 5) {

                value =
                    value.slice(0, 2) + "/" +
                    value.slice(2, 4) + "/" +
                    value.slice(4);

            }

            else if (value.length >= 3) {

                value =
                    value.slice(0, 2) + "/" +
                    value.slice(2);

            }

            input.value = value;

        }


        function dateToISO(date) {

            const p = date.split("/");

            if (p.length !== 3)
                return "";

            const day = Number(p[0]);
            const month = Number(p[1]);
            const year = Number(p[2]);

            const test = new Date(
                year,
                month - 1,
                day
            );

            if (
                year < 2000 ||
                month < 1 ||
                month > 12 ||
                day < 1 ||
                day > 31 ||
                test.getDate() !== day ||
                test.getMonth() !== month - 1
            )
                return "";

            return year +
                "-" +
                String(month).padStart(2, "0") +
                "-" +
                String(day).padStart(2, "0");

        }


        function isoToVN(date) {

            if (!date)
                return "";

            const p = date.split("-");

            if (p.length !== 3)
                return date;

            return p[2] + "/" + p[1] + "/" + p[0];

        }


        function saveData() {

            localStorage.setItem(
                "thuChiBanHangV5",
                JSON.stringify(data)
            );

        }


        function saveMenuData() {

            localStorage.setItem(
                "thuChiMenuV1",
                JSON.stringify(menuData)
            );

        }


        function saveCODData() {

            localStorage.setItem(
                "thuChiCODV1",
                JSON.stringify(codData)
            );

        }


        function toast(message) {

            const el =
                document.getElementById("toast");

            el.innerText = message;

            el.classList.add("show");

            setTimeout(
                () => {
                    el.classList.remove("show");
                },
                2200
            );

        }


        /* =====================================================
           TYPE
        ===================================================== */

        function setType(type) {

            currentType = type;

            document.getElementById("thuBtn")
                .className = "type-button";

            document.getElementById("chiBtn")
                .className = "type-button";

            if (type === "thu") {

                document.getElementById("thuBtn")
                    .classList.add("active-thu");

                document.getElementById("sourceGroup")
                    .style.display = "block";

            } else {

                document.getElementById("chiBtn")
                    .classList.add("active-chi");

                document.getElementById("sourceGroup")
                    .style.display = "none";

            }

            renderCategorySelect();

        }


        function setSource(source) {

            currentSource = source;

            document
                .querySelectorAll(".source-button")
                .forEach(
                    x => x.className = "source-button"
                );

            if (source === "ShopeeFood")
                document.getElementById("sourceShopee")
                    .classList.add("active-shopee");

            if (source === "GrabFood")
                document.getElementById("sourceGrab")
                    .classList.add("active-grab");

            if (source === "Ngoài sàn")
                document.getElementById("sourceOut")
                    .classList.add("active-out");

        }


        /* =====================================================
           MENU
        ===================================================== */

        function addCategory() {

            const input =
                document.getElementById("newCategory");

            const name = input.value.trim();

            if (!name) {

                toast("⚠️ Nhập tên danh mục");

                return;

            }

            if (
                menuData.some(
                    x => x.name.toLowerCase() === name.toLowerCase()
                )
            ) {

                toast("⚠️ Danh mục đã tồn tại");

                return;

            }

            menuData.push({

                id: Date.now(),
                name: name,
                dishes: []

            });

            saveMenuData();

            input.value = "";

            renderMenuAll();

            toast("✅ Đã thêm danh mục");

        }


        function addDish() {

            const categoryId =
                Number(
                    document.getElementById("menuDishCategory").value
                );

            const input =
                document.getElementById("newDish");

            const name = input.value.trim();

            if (!categoryId) {

                toast("⚠️ Hãy chọn danh mục");

                return;

            }

            if (!name) {

                toast("⚠️ Nhập tên món");

                return;

            }

            const category =
                menuData.find(
                    x => x.id === categoryId
                );

            if (!category)
                return;

            if (
                category.dishes.some(
                    x => x.name.toLowerCase() === name.toLowerCase()
                )
            ) {

                toast("⚠️ Món này đã có");

                return;

            }

            category.dishes.push({

                id: Date.now(),
                name: name

            });

            saveMenuData();

            input.value = "";

            renderMenuAll();

            toast("🍜 Đã thêm món");

        }


        function deleteCategory(id) {

            const category =
                menuData.find(
                    x => x.id === id
                );

            if (!category)
                return;

            if (
                !confirm(
                    "Xóa danh mục \"" +
                    category.name +
                    "\" và toàn bộ món?"
                )
            )
                return;

            menuData =
                menuData.filter(
                    x => x.id !== id
                );

            saveMenuData();

            renderMenuAll();

            toast("🗑️ Đã xóa danh mục");

        }


        function deleteDish(categoryId, dishId) {

            const category =
                menuData.find(
                    x => x.id === categoryId
                );

            if (!category)
                return;

            const dish =
                category.dishes.find(
                    x => x.id === dishId
                );

            if (!dish)
                return;

            if (
                !confirm(
                    "Xóa món \"" +
                    dish.name +
                    "\"?"
                )
            )
                return;

            category.dishes =
                category.dishes.filter(
                    x => x.id !== dishId
                );

            saveMenuData();

            renderMenuAll();

            toast("🗑️ Đã xóa món");

        }


        /* =====================================================
           MENU SELECT
        ===================================================== */

        function renderCategorySelect() {

            const select =
                document.getElementById("category");

            const old = select.value;

            select.innerHTML =
                `
<option value="">
Chọn danh mục
</option>
`;

            menuData.forEach(
                category => {

                    select.innerHTML +=
                        `
<option value="${category.id}">
${escapeHTML(category.name)}
</option>
`;

                }
            );

            if (
                [...select.options]
                    .some(x => x.value === old)
            ) {

                select.value = old;

            }

            renderDishSelect();

        }


        function renderDishSelect() {

            const categoryId =
                Number(
                    document.getElementById("category").value
                );

            const select =
                document.getElementById("name");

            const old = select.value;

            select.innerHTML =
                `
<option value="">
Chọn món
</option>
`;

            if (!categoryId) {

                select.innerHTML +=
                    `
<option value="__other__">
✍️ Nhập tên khác
</option>
`;

                syncCustomName();

                return;

            }

            const category =
                menuData.find(
                    x => x.id === categoryId
                );

            if (!category)
                return;

            category.dishes.forEach(
                dish => {

                    select.innerHTML +=
                        `
<option value="${escapeHTML(dish.name)}">
${escapeHTML(dish.name)}
</option>
`;

                }
            );

            select.innerHTML +=
                `
<option value="__other__">
✍️ Nhập tên khác
</option>
`;

            if (
                [...select.options]
                    .some(x => x.value === old)
            ) {

                select.value = old;

            }

            syncCustomName();

        }


        function syncCustomName() {

            const select =
                document.getElementById("name");

            document.getElementById("customNameGroup")
                .style.display =
                select.value === "__other__"
                    ? "block"
                    : "none";

        }


        function renderMenuCategorySelect() {

            const select =
                document.getElementById("menuDishCategory");

            const old = select.value;

            select.innerHTML =
                `
<option value="">
Chọn danh mục
</option>
`;

            menuData.forEach(
                category => {

                    select.innerHTML +=
                        `
<option value="${category.id}">
${escapeHTML(category.name)}
</option>
`;

                }
            );

            if (
                [...select.options]
                    .some(x => x.value === old)
            ) {

                select.value = old;

            }

        }


        function renderMenuList() {

            const box =
                document.getElementById("menuList");

            document.getElementById("menuCount")
                .innerText =
                menuData.length +
                " danh mục";

            if (!menuData.length) {

                box.innerHTML =
                    `
<div class="empty">
Chưa có danh mục nào.
</div>
`;

                return;

            }

            box.innerHTML =
                menuData.map(
                    category => `

<div class="menu-category">

<div class="menu-category-head">

<div>

<div class="menu-category-name">

📁
${escapeHTML(category.name)}

</div>

<div class="menu-category-count">

${category.dishes.length} món

</div>

</div>

<div class="menu-category-actions">

<button
class="small-button"
onclick="focusAddDish(${category.id})">

➕🍜

</button>

<button
class="small-button"
onclick="deleteCategory(${category.id})">

🗑️

</button>

</div>

</div>


<div class="menu-dishes">

${category.dishes.length

                            ?

                            category.dishes.map(
                                dish => `

<div class="menu-dish">

<div class="menu-dish-name">

🍜
${escapeHTML(dish.name)}

</div>

<button
class="menu-dish-delete"
onclick="
deleteDish(
${category.id},
${dish.id}
)">

🗑️

</button>

</div>

`
                            ).join("")

                            :

                            `
<div
style="
padding:12px 0;
color:#9aa0ae;
font-size:11px">

Chưa có món.

</div>
`
                        }

</div>

</div>

`
                ).join("");

        }


        function renderMenuAll() {

            renderMenuCategorySelect();
            renderCategorySelect();
            renderMenuList();

        }


        function focusAddDish(id) {

            document.getElementById(
                "menuDishCategory"
            ).value = id;

            document.getElementById(
                "newDish"
            ).focus();

        }


        /* =====================================================
           TRANSACTIONS
        ===================================================== */

        function saveTransaction() {

            let name = "";

            const select =
                document.getElementById("name");

            if (select.value === "__other__") {

                name =
                    document.getElementById(
                        "customName"
                    ).value.trim();

            } else {

                name = select.value.trim();

            }

            const categoryId =
                Number(
                    document.getElementById("category").value
                );

            const category =
                menuData.find(
                    x => x.id === categoryId
                );

            if (!category) {

                toast("⚠️ Vui lòng chọn danh mục");

                return;

            }

            if (!name) {

                toast("⚠️ Vui lòng chọn tên món");

                return;

            }

            const amount =
                Number(
                    document.getElementById("amount").value
                );

            if (amount <= 0) {

                toast("⚠️ Nhập số tiền");

                return;

            }

            const dateVN =
                document.getElementById("date").value.trim();

            const date =
                dateToISO(dateVN);

            if (!date) {

                toast("⚠️ Ngày không hợp lệ");

                return;

            }

            const item = {

                id: editId || Date.now(),

                type: currentType,

                name: name,

                category: category.name,

                categoryId: categoryId,

                amount: amount,

                date: date,

                note:
                    document.getElementById("note").value.trim(),

                source:
                    currentType === "thu"
                        ? currentSource
                        : ""

            };

            if (editId) {

                const index =
                    data.findIndex(
                        x => x.id === editId
                    );

                if (index !== -1)
                    data[index] = item;

                toast("✅ Đã cập nhật");

            } else {

                data.push(item);

                toast(
                    currentType === "thu"
                        ? "💚 Đã thêm khoản thu"
                        : "❤️ Đã thêm khoản chi"
                );

            }

            saveData();

            cancelEdit();

            renderAll();

        }


        function editTransaction(id) {

            const item =
                data.find(
                    x => x.id === id
                );

            if (!item)
                return;

            editId = id;

            setType(item.type);

            const category =
                menuData.find(
                    x => x.id === Number(item.categoryId)
                ) ||
                menuData.find(
                    x => x.name === item.category
                );

            if (category) {

                document.getElementById(
                    "category"
                ).value = category.id;

                renderDishSelect();

            }

            const nameSelect =
                document.getElementById("name");

            if (
                [...nameSelect.options]
                    .some(x => x.value === item.name)
            ) {

                nameSelect.value = item.name;

            } else {

                nameSelect.value = "__other__";

                document.getElementById(
                    "customName"
                ).value = item.name;

            }

            syncCustomName();

            document.getElementById(
                "amount"
            ).value = item.amount;

            document.getElementById(
                "date"
            ).value = isoToVN(item.date);

            document.getElementById(
                "note"
            ).value = item.note || "";

            if (item.source)
                setSource(item.source);

            document.getElementById(
                "formTitle"
            ).innerText = "Sửa giao dịch";

            document.getElementById(
                "cancelButton"
            ).style.display = "block";

            goAdd();

        }


        function cancelEdit() {

            editId = null;

            document.getElementById(
                "formTitle"
            ).innerText = "Thêm giao dịch";

            document.getElementById(
                "cancelButton"
            ).style.display = "none";

            document.getElementById("name").value = "";
            document.getElementById("customName").value = "";
            document.getElementById("amount").value = "";
            document.getElementById("date").value = todayVN();
            document.getElementById("note").value = "";

            setType("thu");

        }


        function deleteTransaction(id) {

            if (
                !confirm("Xóa giao dịch này?")
            )
                return;

            data =
                data.filter(
                    x => x.id !== id
                );

            saveData();

            renderAll();

            toast("🗑️ Đã xóa giao dịch");

        }


        /* =====================================================
           DASHBOARD
        ===================================================== */

        function renderDashboard() {

            let income = 0;
            let expense = 0;

            data.forEach(
                item => {

                    if (item.type === "thu")
                        income += Number(item.amount);

                    else
                        expense += Number(item.amount);

                }
            );

            const profit = income - expense;

            document.getElementById(
                "profit"
            ).innerText = money(profit);

            document.getElementById(
                "totalIncome"
            ).innerText = money(income);

            document.getElementById(
                "totalExpense"
            ).innerText = money(expense);

            document.getElementById(
                "totalTransactions"
            ).innerText = data.length;

            document.getElementById(
                "quickIncome"
            ).innerText = money(income);

            document.getElementById(
                "quickExpense"
            ).innerText = money(expense);

        }


        /* =====================================================
           HISTORY
        ===================================================== */

        function renderTransactions() {

            const search =
                document.getElementById("search")
                    .value.toLowerCase();

            const type =
                document.getElementById("filterType")
                    .value;

            const month =
                document.getElementById("filterMonth")
                    .value;

            let list = data.filter(
                item => {

                    const text =
                        (
                            item.name +
                            " " +
                            item.category +
                            " " +
                            (item.note || "")
                        ).toLowerCase();

                    if (
                        search &&
                        !text.includes(search)
                    )
                        return false;

                    if (
                        type !== "all" &&
                        item.type !== type
                    )
                        return false;

                    if (
                        month !== "all" &&
                        !item.date.startsWith(month)
                    )
                        return false;

                    return true;

                }
            );

            list.sort(
                (a, b) => b.date.localeCompare(a.date)
            );

            document.getElementById(
                "historyCount"
            ).innerText =
                list.length +
                " giao dịch";

            const box =
                document.getElementById("transactions");

            if (!list.length) {

                box.innerHTML =
                    `
<div class="empty">
Không có giao dịch.
</div>
`;

                return;

            }

            box.innerHTML =
                list.map(
                    item => `

<div class="transaction">

<div class="tx-icon ${item.type}">

${item.type === "thu" ? "↑" : "↓"}

</div>


<div class="tx-info">

<div class="tx-name">

${escapeHTML(item.name)}

</div>

<div class="tx-category">

📁 ${escapeHTML(item.category)}

</div>

${item.source
                            ?
                            `
<div
class="tx-source"
style="
color:${sourceColors[item.source] || "#2563eb"}">

${escapeHTML(item.source)}

</div>
`
                            : ""
                        }

<div class="tx-date">

${isoToVN(item.date)}

</div>

</div>


<div class="tx-right">

<div
class="tx-money ${item.type === "thu" ? "green" : "red"}">

${item.type === "thu" ? "+" : "-"}
${money(item.amount)}

</div>


<div class="tx-actions">

<button
class="small-button"
onclick="editTransaction(${item.id})">

✏️

</button>

<button
class="small-button"
onclick="deleteTransaction(${item.id})">

🗑️

</button>

</div>

</div>

</div>

`
                ).join("");

        }


        /* =====================================================
           MONTH FILTER
        ===================================================== */

        function renderMonthSelects() {

            const months = new Set();

            data.forEach(
                item => {
                    if (item.date)
                        months.add(item.date.slice(0, 7));
                }
            );

            const list =
                [...months].sort().reverse();

            const stat =
                document.getElementById("statMonth");

            const filter =
                document.getElementById("filterMonth");

            const oldStat = stat.value;
            const oldFilter = filter.value;

            stat.innerHTML =
                `
<option value="all">
Tất cả
</option>
`;

            filter.innerHTML =
                `
<option value="all">
Tất cả tháng
</option>
`;

            list.forEach(
                month => {

                    const [year, m] = month.split("-");

                    const text =
                        `Tháng ${Number(m)}/${year}`;

                    stat.innerHTML +=
                        `
<option value="${month}">
${text}
</option>
`;

                    filter.innerHTML +=
                        `
<option value="${month}">
${text}
</option>
`;

                }
            );

            if (
                [...stat.options]
                    .some(x => x.value === oldStat)
            )
                stat.value = oldStat;

            if (
                [...filter.options]
                    .some(x => x.value === oldFilter)
            )
                filter.value = oldFilter;

        }


        /* =====================================================
           STATISTICS
        ===================================================== */

        function setStatisticType(type) {

            statisticType = type;

            document
                .querySelectorAll(".stat-tab")
                .forEach(
                    x => x.classList.remove("active")
                );

            document.getElementById(
                type === "all"
                    ? "tabAll"
                    : type === "thu"
                        ? "tabThu"
                        : "tabChi"
            ).classList.add("active");

            renderStatistics();

        }


        function renderStatistics() {

            const month =
                document.getElementById("statMonth").value;

            let list = data.filter(
                item => {

                    if (
                        statisticType !== "all" &&
                        item.type !== statisticType
                    )
                        return false;

                    if (
                        month !== "all" &&
                        !item.date.startsWith(month)
                    )
                        return false;

                    return true;

                }
            );

            const total =
                list.reduce(
                    (sum, x) => sum + Number(x.amount),
                    0
                );

            document.getElementById(
                "chartTotal"
            ).innerText = money(total);

            document.getElementById(
                "pieTotal"
            ).innerText = money(total);

            document.getElementById(
                "pieLabel"
            ).innerText =
                statisticType === "all"
                    ? "Tổng"
                    : statisticType === "thu"
                        ? "Thu"
                        : "Chi";


            /* CATEGORY */

            const map = {};

            list.forEach(
                item => {

                    const key =
                        item.category || "Khác";

                    map[key] =
                        (map[key] || 0) + Number(item.amount);

                }
            );

            const entries =
                Object.entries(map)
                    .sort((a, b) => b[1] - a[1]);

            const legend =
                document.getElementById("legend");

            if (!entries.length) {

                legend.innerHTML =
                    `
<div class="empty">
Chưa có dữ liệu.
</div>
`;

                document.getElementById("pie")
                    .style.background = "#e8ebf1";

            } else {

                let start = 0;

                const gradients = [];

                entries.forEach(
                    ([name, value], index) => {

                        const percent =
                            value / total * 100;

                        const end =
                            start + percent;

                        gradients.push(
                            `${colors[index % colors.length]} ${start}% ${end}%`
                        );

                        start = end;

                    }
                );

                document.getElementById(
                    "pie"
                ).style.background =
                    `conic-gradient(${gradients.join(",")})`;


                legend.innerHTML =
                    entries.map(
                        ([name, value], index) => {

                            const percent =
                                total
                                    ?
                                    value / total * 100
                                    : 0;

                            return `

<div class="legend-item">

<div
class="legend-dot"
style="
background:${colors[index % colors.length]}">
</div>

<div class="legend-content">

<div class="legend-name">
${escapeHTML(name)}
</div>

<div class="legend-value">
${money(value)}
</div>

</div>

<div class="legend-percent">
${percent.toFixed(1)}%
</div>

</div>

`;

                        }
                    ).join("");

            }


            /* DAILY */

            const daily = {};

            list.forEach(
                item => {

                    daily[item.date] =
                        (daily[item.date] || 0)
                        +
                        Number(item.amount);

                }
            );

            const dates =
                Object.keys(daily).sort();

            const max =
                Math.max(
                    ...dates.map(x => daily[x]),
                    1
                );

            document.getElementById(
                "barChart"
            ).innerHTML =
                dates.length
                    ?
                    dates.map(
                        date => {

                            const height =
                                Math.max(
                                    3,
                                    daily[date] / max * 160
                                );

                            return `

<div class="bar-column">

<div class="bar-value">
${money(daily[date])}
</div>

<div
class="bar"
style="
height:${height}px">
</div>

<div class="bar-date">
${isoToVN(date).slice(0, 5)}
</div>

</div>

`;

                        }
                    ).join("")
                    :
                    `
<div class="empty">
Chưa có dữ liệu.
</div>
`;


            /* CATEGORY DETAIL */

            const catBox =
                document.getElementById("categoryStats");

            catBox.innerHTML =
                entries.map(
                    ([name, value], index) => {

                        const percent =
                            total
                                ?
                                value / total * 100
                                : 0;

                        return `

<div class="stat-row">

<div class="stat-top">

<div class="stat-name">
${escapeHTML(name)}
</div>

<div class="stat-money">
${money(value)}
</div>

</div>

<div class="progress">

<div
class="progress-bar"
style="
width:${percent}%;
background:${colors[index % colors.length]}">

</div>

</div>

</div>

`;

                    }
                ).join("");

        }


        /* =====================================================
           COD - HELPERS
        ===================================================== */

        function getCODKey(categoryId, dishId) {

            return String(categoryId) + "-" + String(dishId);

        }


        function getCODDish(categoryId, dishId) {

            const key =
                getCODKey(
                    categoryId,
                    dishId
                );

            if (!codData[key]) {

                codData[key] = {

                    sellingPrice: 0,
                    parts: []

                };

            }

            if (!Array.isArray(codData[key].parts))
                codData[key].parts = [];

            return codData[key];

        }


        function getCODTotal(categoryId, dishId) {

            const item =
                getCODDish(
                    categoryId,
                    dishId
                );

            return item.parts.reduce(
                (sum, x) =>
                    sum + Number(x.amount || 0),
                0
            );

        }


        /* =====================================================
           COD PAGE
        ===================================================== */

        function goCOD() {

            hideAllMain();

            document.getElementById(
                "codSection"
            ).style.display = "block";

            setActiveNav("navCOD");

            document.getElementById(
                "pageTitle"
            ).innerText = "COD";

            showCODCategories();

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }


        function showCODCategories() {

            currentCODCategoryId = null;
            currentCODDishId = null;

            document.getElementById(
                "codCategoryPage"
            ).style.display = "block";

            document.getElementById(
                "codDishPage"
            ).style.display = "none";

            document.getElementById(
                "codDetailPage"
            ).style.display = "none";

            renderCODCategories();

        }


        function renderCODCategories() {

            const box =
                document.getElementById(
                    "codCategoryList"
                );

            if (!menuData.length) {

                box.innerHTML =
                    `
<div class="cod-empty">

Chưa có danh mục nào.

<br>

Hãy vào <b>🍜 Quán</b>
để tạo danh mục và món trước.

</div>
`;

                return;

            }

            box.innerHTML =
                menuData.map(
                    category => `

<div class="cod-category">

<button
class="cod-category-button"
onclick="
openCODCategory(
${category.id}
)">

<div class="cod-category-left">

<div class="cod-folder">
📁
</div>

<div>

<div class="cod-category-name">

${escapeHTML(category.name)}

</div>

<div class="cod-category-count">

${category.dishes.length}
món

</div>

</div>

</div>

<div class="cod-arrow">
›
</div>

</button>

</div>

`
                ).join("");

        }


        function openCODCategory(categoryId) {

            const category =
                menuData.find(
                    x => x.id === categoryId
                );

            if (!category)
                return;

            currentCODCategoryId = categoryId;

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
            ).innerText =
                "🍜 " + category.name;

            renderCODDishes();

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }


        function renderCODDishes() {

            const category =
                menuData.find(
                    x => x.id === currentCODCategoryId
                );

            const box =
                document.getElementById(
                    "codDishList"
                );

            if (!category) {

                box.innerHTML =
                    `
<div class="cod-empty">
Không tìm thấy danh mục.
</div>
`;

                return;

            }

            if (!category.dishes.length) {

                box.innerHTML =
                    `
<div class="cod-empty">

Danh mục này chưa có món.

<br>

Hãy vào <b>🍜 Quán</b>
để thêm món.

</div>
`;

                return;

            }

            box.innerHTML =
                category.dishes.map(
                    dish => {

                        const total =
                            getCODTotal(
                                category.id,
                                dish.id
                            );

                        const cod =
                            getCODDish(
                                category.id,
                                dish.id
                            );

                        return `

<div class="cod-dish-card">

<button
class="cod-dish-card-button"
onclick="
openCODDish(
${category.id},
${dish.id}
)">

<div>

<div class="cod-dish-name">

🍜
${escapeHTML(dish.name)}

</div>

<div class="cod-dish-info">

${cod.parts.length}
thành phần giá vốn

</div>

</div>

<div>

<div class="cod-dish-cost">

${money(total)}

</div>

<div
style="
color:#8b91a1;
font-size:9px;
text-align:right">

giá vốn

</div>

</div>

</button>

</div>

`;

                    }
                ).join("");

        }


        function showCODDishes() {

            if (currentCODCategoryId !== null)
                openCODCategory(
                    currentCODCategoryId
                );

        }


        function openCODDish(categoryId, dishId) {

            const category =
                menuData.find(
                    x => x.id === categoryId
                );

            if (!category)
                return;

            const dish =
                category.dishes.find(
                    x => x.id === dishId
                );

            if (!dish)
                return;

            currentCODCategoryId = categoryId;
            currentCODDishId = dishId;

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
            ).innerText =
                "🍜 " + dish.name;

            document.getElementById(
                "codDetailCategory"
            ).innerText =
                "📁 " + category.name;

            const cod =
                getCODDish(
                    categoryId,
                    dishId
                );

            document.getElementById(
                "codSellingPrice"
            ).value =
                cod.sellingPrice || "";

            renderCODDetail();

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }


        function renderCODDetail() {

            if (
                currentCODCategoryId === null ||
                currentCODDishId === null
            )
                return;

            const cod =
                getCODDish(
                    currentCODCategoryId,
                    currentCODDishId
                );

            document.getElementById(
                "codSellingPrice"
            ).value =
                cod.sellingPrice || "";

            renderCODParts();

            renderCODDetailSummary();

        }


        /* =====================================================
           COD PARTS
        ===================================================== */

        function renderCODParts() {

            const cod =
                getCODDish(
                    currentCODCategoryId,
                    currentCODDishId
                );

            const box =
                document.getElementById(
                    "codPartList"
                );

            document.getElementById(
                "codPartCount"
            ).innerText =
                cod.parts.length + " phần";

            if (!cod.parts.length) {

                box.innerHTML =
                    `
<div class="cod-empty">

Chưa có thành phần giá vốn.

<br>

Ví dụ: Mì, thịt,
rau, hộp, sốt...

</div>
`;

                return;

            }

            box.innerHTML =
                cod.parts.map(
                    part => `

<div class="cod-part">

<div class="cod-part-icon">
📦
</div>

<div class="cod-part-info">

<div class="cod-part-name">

${escapeHTML(part.name)}

</div>

${part.note
                            ?
                            `
<div class="cod-part-note">
${escapeHTML(part.note)}
</div>
`
                            : ""
                        }

</div>

<div class="cod-part-money">

${money(part.amount)}

</div>

<div class="cod-part-actions">

<button
onclick="
editCODPart(
${part.id}
)">

✏️

</button>

<button
onclick="
deleteCODPart(
${part.id}
)">

🗑️

</button>

</div>

</div>

`
                ).join("");

        }


        function addCODPart() {

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

                toast("⚠️ Nhập tên thành phần");

                return;

            }

            if (amount <= 0) {

                toast("⚠️ Nhập giá tiền");

                return;

            }

            const cod =
                getCODDish(
                    currentCODCategoryId,
                    currentCODDishId
                );

            cod.parts.push({

                id: Date.now(),

                name: name,

                amount: amount,

                note: note

            });

            saveCODData();

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

            toast("✅ Đã thêm thành phần");

        }


        function editCODPart(id) {

            const cod =
                getCODDish(
                    currentCODCategoryId,
                    currentCODDishId
                );

            const part =
                cod.parts.find(
                    x => x.id === id
                );

            if (!part)
                return;

            const name =
                prompt(
                    "Tên thành phần:",
                    part.name
                );

            if (name === null)
                return;

            const amount =
                prompt(
                    "Giá tiền:",
                    part.amount
                );

            if (amount === null)
                return;

            const note =
                prompt(
                    "Ghi chú:",
                    part.note || ""
                );

            part.name = name.trim();

            part.amount =
                Number(amount) || 0;

            part.note =
                note === null
                    ?
                    part.note
                    :
                    note.trim();

            if (!part.name) {

                toast("⚠️ Tên không được để trống");

                return;

            }

            if (part.amount <= 0) {

                toast("⚠️ Giá tiền không hợp lệ");

                return;

            }

            saveCODData();

            renderCODDetail();

            toast("✏️ Đã sửa thành phần");

        }


        function deleteCODPart(id) {

            const cod =
                getCODDish(
                    currentCODCategoryId,
                    currentCODDishId
                );

            const part =
                cod.parts.find(
                    x => x.id === id
                );

            if (!part)
                return;

            if (
                !confirm(
                    "Xóa thành phần \"" +
                    part.name +
                    "\"?"
                )
            )
                return;

            cod.parts =
                cod.parts.filter(
                    x => x.id !== id
                );

            saveCODData();

            renderCODDetail();

            toast("🗑️ Đã xóa thành phần");

        }


        /* =====================================================
           COD SAVE
        ===================================================== */

        function saveCODDish() {

            const cod =
                getCODDish(
                    currentCODCategoryId,
                    currentCODDishId
                );

            const sellingPrice =
                Number(
                    document.getElementById(
                        "codSellingPrice"
                    ).value
                );

            cod.sellingPrice =
                sellingPrice || 0;

            saveCODData();

            renderCODDetail();

            toast("💾 Đã lưu giá vốn món");

        }


        function renderCODDetailSummary() {

            if (
                currentCODCategoryId === null ||
                currentCODDishId === null
            )
                return;

            const cod =
                getCODDish(
                    currentCODCategoryId,
                    currentCODDishId
                );

            const total =
                cod.parts.reduce(
                    (sum, x) =>
                        sum + Number(x.amount || 0),
                    0
                );

            const selling =
                Number(
                    document.getElementById(
                        "codSellingPrice"
                    ).value
                ) || 0;

            const profit =
                selling - total;

            document.getElementById(
                "codTotalCost"
            ).innerText =
                money(total);

            document.getElementById(
                "codProfit"
            ).innerText =
                money(profit);

        }


        /* =====================================================
           NAVIGATION
        ===================================================== */

        function hideAllMain() {

            document.getElementById(
                "homeSection"
            ).style.display = "none";

            document.getElementById(
                "codSection"
            ).style.display = "none";

        }


        function setActiveNav(id) {

            document
                .querySelectorAll(".nav-button")
                .forEach(
                    x => x.classList.remove("active")
                );

            document.getElementById(id)
                .classList.add("active");

        }


        function goHome() {

            hideAllMain();

            document.getElementById(
                "homeSection"
            ).style.display = "block";

            document.getElementById(
                "pageTitle"
            ).innerText = "Thu Chi";

            setActiveNav("navHome");

            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });

        }


        function goAdd() {

            goHome();

            setTimeout(
                () => {

                    document.getElementById(
                        "addSection"
                    ).scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                },
                50
            );

            setActiveNav("navAdd");

        }


        function goStatistics() {

            goHome();

            setTimeout(
                () => {

                    document.getElementById(
                        "statisticsSection"
                    ).scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                },
                50
            );

            setActiveNav("navStatistics");

        }


        function goHistory() {

            goHome();

            setTimeout(
                () => {

                    document.getElementById(
                        "historySection"
                    ).scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                },
                50
            );

            setActiveNav("navHistory");

        }


        function goRestaurant() {

            goHome();

            setTimeout(
                () => {

                    document.getElementById(
                        "restaurantSection"
                    ).scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                },
                50
            );

            setActiveNav("navRestaurant");

        }


        /* =====================================================
           DARK MODE
        ===================================================== */

        function toggleDark() {

            document.body.classList.toggle("dark");

            localStorage.setItem(
                "thuChiDark",
                document.body.classList.contains("dark")
                    ? "1"
                    : "0"
            );

        }


        /* =====================================================
           BACKUP
        ===================================================== */

        function backup() {

            const backupData = {

                version: 2,

                transactions: data,

                menu: menuData,

                cod: codData

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
                        type: "application/json"
                    }
                );

            const url =
                URL.createObjectURL(blob);

            const a =
                document.createElement("a");

            a.href = url;

            a.download =
                "thu-chi-quan-backup.json";

            a.click();

            URL.revokeObjectURL(url);

            toast("📤 Đã sao lưu");

        }


        function restore(event) {

            const file =
                event.target.files[0];

            if (!file)
                return;

            const reader =
                new FileReader();

            reader.onload =
                function (e) {

                    try {

                        const obj =
                            JSON.parse(e.target.result);

                        if (
                            Array.isArray(obj)
                        ) {

                            data = obj;

                        } else {

                            data =
                                obj.transactions || [];

                            menuData =
                                obj.menu || [];

                            codData =
                                obj.cod || {};

                        }

                        saveData();

                        saveMenuData();

                        saveCODData();

                        renderAll();

                        toast("📥 Đã khôi phục");

                    } catch (err) {

                        toast("❌ File không hợp lệ");

                    }

                };

            reader.readAsText(file);

            event.target.value = "";

        }


        /* =====================================================
           CSV
        ===================================================== */

        function exportCSV() {

            if (!data.length) {

                toast("Không có dữ liệu");

                return;

            }

            const rows = [

                [
                    "Ngày",
                    "Loại",
                    "Tên",
                    "Danh mục",
                    "Nguồn",
                    "Số tiền",
                    "Ghi chú"
                ]

            ];

            data.forEach(
                item => {

                    rows.push([
                        isoToVN(item.date),
                        item.type === "thu" ? "Thu" : "Chi",
                        item.name,
                        item.category,
                        item.source || "",
                        item.amount,
                        item.note || ""
                    ]);

                }
            );

            const csv =
                "\uFEFF" +
                rows.map(
                    row =>
                        row.map(
                            cell =>
                                `"${String(cell)
                                    .replace(/"/g, '""')}"`
                        ).join(",")
                ).join("\n");

            const blob =
                new Blob(
                    [csv],
                    {
                        type: "text/csv;charset=utf-8;"
                    }
                );

            const url =
                URL.createObjectURL(blob);

            const a =
                document.createElement("a");

            a.href = url;

            a.download =
                "thu-chi.csv";

            a.click();

            URL.revokeObjectURL(url);

            toast("📊 Đã xuất CSV");

        }


        /* =====================================================
           DELETE ALL
        ===================================================== */

        function deleteAll() {

            if (
                !confirm(
                    "Xóa toàn bộ giao dịch?"
                )
            )
                return;

            data = [];

            saveData();

            renderAll();

            toast("🗑️ Đã xóa toàn bộ giao dịch");

        }


        /* =====================================================
           RENDER ALL
        ===================================================== */

        function renderAll() {

            renderDashboard();

            renderMonthSelects();

            renderTransactions();

            renderStatistics();

            renderMenuAll();

            renderCODCategories();

        }


        /* =====================================================
           INIT
        ===================================================== */

        function init() {

            if (
                localStorage.getItem("thuChiDark") === "1"
            ) {

                document.body.classList.add("dark");

            }

            document.getElementById(
                "date"
            ).value = todayVN();

            renderAll();

            setType("thu");

        }


        /* =====================================================
           START
        ===================================================== */

        init();
