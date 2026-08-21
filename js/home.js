/* =========================================================
   HOME.JS
   BẾP NHÀ DUYÊN

   THU:
   categories
   dishes

   CHI:
   expense_categories
   expense_items

   transactions:
   category_id / dish_id chỉ lưu nếu là BIGINT.
   UUID sẽ lưu null.
   Tên vẫn lưu vào category_name / dish_name.
========================================================= */


/* =========================================================
   EXPENSE DATA
========================================================= */

async function loadExpenseData() {

    try {

        AppState.expenseCategories =
            await dbGet(
                "expense_categories",
                {
                    order: {
                        column: "id",
                        ascending: true
                    }
                }
            );


        AppState.expenseItems =
            await dbGet(
                "expense_items",
                {
                    order: {
                        column: "id",
                        ascending: true
                    }
                }
            );


        return true;

    }
    catch (error) {

        console.error(
            "Lỗi load expense data:",
            error
        );


        AppState.expenseCategories =
            Array.isArray(
                AppState.expenseCategories
            )
                ? AppState.expenseCategories
                : [];


        AppState.expenseItems =
            Array.isArray(
                AppState.expenseItems
            )
                ? AppState.expenseItems
                : [];


        return false;

    }

}


/* =========================================================
   RENDER HOME
========================================================= */

function renderHome() {

    renderTransactionCategories();

    renderTransactionDishes();

    renderHomeSummary();

}


/* =========================================================
   CATEGORY SELECT
========================================================= */

async function renderTransactionCategories() {

    const select =
        document.getElementById(
            "transactionCategory"
        );


    if (!select) return;


    const oldValue =
        select.value;


    const transactionType =
        normalizeTransactionType(
            AppState.transactionType || "thu"
        );


    /* =====================================================
       NẾU LÀ CHI
    ===================================================== */

    if (
        transactionType === "chi"
    ) {

        /*
         * Nếu chưa load dữ liệu phần chi
         * thì load từ Supabase.
         */

        if (
            !Array.isArray(
                AppState.expenseCategories
            )
        ) {

            await loadExpenseData();

        }


        select.innerHTML = `
            <option value="">
                Chọn danh mục chi
            </option>
        `;


        const categories =
            Array.isArray(
                AppState.expenseCategories
            )
                ? AppState.expenseCategories
                : [];


        categories.forEach(
            category => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    category.id;


                option.textContent =
                    category.name ||
                    "Không tên";


                select.appendChild(
                    option
                );

            }
        );


        if (
            categories.some(
                category =>
                    String(category.id) ===
                    String(oldValue)
            )
        ) {

            select.value =
                oldValue;

        }


        select.onchange =
            function () {

                renderTransactionDishes();

            };


        return;

    }


    /* =====================================================
       NẾU LÀ THU
    ===================================================== */

    select.innerHTML = `
        <option value="">
            Chọn danh mục
        </option>
    `;


    const categories =
        Array.isArray(
            AppState.categories
        )
            ? AppState.categories
            : [];


    categories.forEach(
        category => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                category.id;


            option.textContent =
                category.name ||
                "Không tên";


            select.appendChild(
                option
            );

        }
    );


    if (
        categories.some(
            category =>
                String(category.id) ===
                String(oldValue)
        )
    ) {

        select.value =
            oldValue;

    }


    select.onchange =
        function () {

            renderTransactionDishes();

        };

}


/* =========================================================
   DISH / EXPENSE ITEM SELECT
========================================================= */

async function renderTransactionDishes() {

    const categorySelect =
        document.getElementById(
            "transactionCategory"
        );


    const dishSelect =
        document.getElementById(
            "transactionDish"
        );


    if (
        !categorySelect ||
        !dishSelect
    ) {

        return;

    }


    const categoryId =
        categorySelect.value;


    const oldDishValue =
        dishSelect.value;


    const transactionType =
        normalizeTransactionType(
            AppState.transactionType || "thu"
        );


    dishSelect.innerHTML = `
        <option value="">
            ${
                transactionType === "chi"
                    ? "Chọn khoản chi"
                    : "Chọn món"
            }
        </option>
    `;


    if (!categoryId) {

        return;

    }


    /* =====================================================
       CHI
    ===================================================== */

    if (
        transactionType === "chi"
    ) {

        if (
            !Array.isArray(
                AppState.expenseItems
            )
        ) {

            await loadExpenseData();

        }


        const items =
            Array.isArray(
                AppState.expenseItems
            )
                ? AppState.expenseItems
                : [];


        const categoryItems =
            items.filter(
                item =>
                    String(
                        item.category_id
                    ) ===
                    String(
                        categoryId
                    )
            );


        categoryItems.forEach(
            item => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    item.id;


                option.textContent =
                    item.name ||
                    "Không tên";


                dishSelect.appendChild(
                    option
                );

            }
        );


        if (
            categoryItems.some(
                item =>
                    String(item.id) ===
                    String(oldDishValue)
            )
        ) {

            dishSelect.value =
                oldDishValue;

        }


        return;

    }


    /* =====================================================
       THU
    ===================================================== */

    const dishes =
        Array.isArray(
            AppState.dishes
        )
            ? AppState.dishes
            : [];


    const categoryDishes =
        dishes.filter(
            dish =>
                String(
                    dish.category_id
                ) ===
                String(
                    categoryId
                )
        );


    categoryDishes.forEach(
        dish => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                dish.id;


            option.textContent =
                dish.name ||
                "Không tên";


            dishSelect.appendChild(
                option
            );

        }
    );


    if (
        categoryDishes.some(
            dish =>
                String(dish.id) ===
                String(oldDishValue)
        )
    ) {

        dishSelect.value =
            oldDishValue;

    }

}


/* =========================================================
   TRANSACTION TYPE
========================================================= */

function setTransactionType(
    type
) {

    AppState.transactionType =
        type;


    const incomeButton =
        document.getElementById(
            "incomeTypeButton"
        );


    const expenseButton =
        document.getElementById(
            "expenseTypeButton"
        );


    if (incomeButton) {

        incomeButton.classList.toggle(
            "active",
            type === "thu"
        );

    }


    if (expenseButton) {

        expenseButton.classList.toggle(
            "active",
            type === "chi"
        );

    }


    const sourceBox =
        document.getElementById(
            "orderSourceBox"
        );


    const feeBox =
        document.getElementById(
            "appFeeBox"
        );


    const isIncome =
        type === "thu";


    if (sourceBox) {

        sourceBox.style.display =
            isIncome
                ? "block"
                : "none";

    }


    if (feeBox) {

        feeBox.style.display =
            isIncome
                ? "block"
                : "none";

    }


    /*
     * Đổi Thu / Chi
     * thì đổi danh mục ngay.
     */

    renderTransactionCategories()
        .then(
            () => {

                renderTransactionDishes();

            }
        );

}


/* =========================================================
   ORDER SOURCE
========================================================= */

function setOrderSource(
    source
) {

    AppState.orderSource =
        source;


    document
        .querySelectorAll(
            ".source-button"
        )
        .forEach(
            button => {

                button.classList.remove(
                    "active"
                );

            }
        );


    const sourceMap = {

        ShopeeFood:
            "sourceShopee",

        GrabFood:
            "sourceGrab",

        "Ngoài sàn":
            "sourceOutside"

    };


    const button =
        document.getElementById(
            sourceMap[source]
        );


    if (button) {

        button.classList.add(
            "active"
        );

    }

}


/* =========================================================
   SAVE TRANSACTION
========================================================= */

async function saveTransaction() {

    const categoryId =
        document.getElementById(
            "transactionCategory"
        )?.value || "";


    const dishId =
        document.getElementById(
            "transactionDish"
        )?.value || "";


    const customName =
        document.getElementById(
            "transactionName"
        )?.value
        ?.trim() || "";


    const amount =
        Number(
            document.getElementById(
                "transactionAmount"
            )?.value
        ) || 0;


    const appFee =
        Number(
            document.getElementById(
                "appFee"
            )?.value
        ) || 0;


    const date =
        document.getElementById(
            "transactionDate"
        )?.value ||
        getLocalDateString();


    const note =
        document.getElementById(
            "transactionNote"
        )?.value
        ?.trim() || "";


    if (amount <= 0) {

        showToast(
            "Vui lòng nhập số tiền"
        );

        return;

    }


    const transactionType =
        normalizeTransactionType(
            AppState.transactionType || "thu"
        );


    let categoryName =
        "";


    let dishName =
        "";


    /* =====================================================
       THU
    ===================================================== */

    if (
        transactionType === "thu"
    ) {

        const category =
            AppState.categories.find(
                item =>
                    String(item.id) ===
                    String(categoryId)
            );


        const dish =
            AppState.dishes.find(
                item =>
                    String(item.id) ===
                    String(dishId)
            );


        categoryName =
            category?.name ||
            "";


        dishName =
            dish?.name ||
            customName ||
            "Giao dịch";

    }


    /* =====================================================
       CHI
    ===================================================== */

    else {

        if (
            !Array.isArray(
                AppState.expenseCategories
            ) ||
            !Array.isArray(
                AppState.expenseItems
            )
        ) {

            await loadExpenseData();

        }


        const category =
            (
                AppState.expenseCategories ||
                []
            )
            .find(
                item =>
                    String(item.id) ===
                    String(categoryId)
            );


        const item =
            (
                AppState.expenseItems ||
                []
            )
            .find(
                expense =>
                    String(expense.id) ===
                    String(dishId)
            );


        categoryName =
            category?.name ||
            "";


        dishName =
            item?.name ||
            customName ||
            "Khoản chi";

    }


    /* =====================================================
       BIGINT FIX
    ===================================================== */

    function bigintIdOrNull(
        id
    ) {

        if (
            id === null ||
            id === undefined ||
            id === ""
        ) {

            return null;

        }


        const value =
            String(id).trim();


        /*
         * UUID không được đưa vào bigint.
         */

        if (
            !/^\d+$/.test(value)
        ) {

            return null;

        }


        return value;

    }


    /*
     * Thu:
     * category/dish hiện tại có thể UUID
     * => null nếu không phải số.
     *
     * Chi:
     * expense category/item là bigint
     * => giữ lại ID.
     *
     * Tuy nhiên nếu transactions có FK sang
     * categories/dishes thì chi không nên ghi
     * expense ID vào đó.
     *
     * Vì vậy phần chi luôn để null.
     */

    const databaseCategoryId =
        transactionType === "thu"
            ? bigintIdOrNull(
                categoryId
            )
            : null;


    const databaseDishId =
        transactionType === "thu"
            ? bigintIdOrNull(
                dishId
            )
            : null;


    const payload = {

        type:
            transactionType,


        category_id:
            databaseCategoryId,


        dish_id:
            databaseDishId,


        category_name:
            categoryName,


        dish_name:
            dishName,


        source:
            transactionType === "thu"
                ? (
                    AppState.orderSource ||
                    "ShopeeFood"
                )
                : null,


        amount:
            amount,


        app_fee:
            transactionType === "thu"
                ? appFee
                : 0,


        date:
            date,


        note:
            note

    };


    console.log(
        "TRANSACTION PAYLOAD:",
        payload
    );


    try {

        if (
            AppState.editingTransactionId
        ) {

            await dbUpdate(
                "transactions",
                AppState.editingTransactionId,
                payload
            );


            showToast(
                "Đã cập nhật giao dịch"
            );

        }
        else {

            await dbInsert(
                "transactions",
                payload
            );


            showToast(
                "Đã lưu giao dịch"
            );

        }


        AppState.transactions =
            await dbGet(
                "transactions",
                {
                    order: {
                        column:
                            "date",

                        ascending:
                            false
                    }
                }
            );


        clearTransactionForm();


        if (
            typeof renderAll ===
            "function"
        ) {

            renderAll();

        }

    }
    catch (error) {

        console.error(
            "Lỗi saveTransaction:",
            error
        );


        showToast(
            "Không thể lưu giao dịch"
        );

    }

}


/* =========================================================
   HOME SUMMARY
========================================================= */

function renderHomeSummary() {

    const transactions =
        Array.isArray(
            AppState.transactions
        )
            ? AppState.transactions
            : [];


    const totalIncome =
        transactions
            .filter(
                transaction =>
                    normalizeTransactionType(
                        transaction.type
                    ) === "thu"
            )
            .reduce(
                (sum, transaction) =>
                    sum +
                    getTransactionAmount(
                        transaction
                    ),
                0
            );


    const totalExpense =
        transactions
            .filter(
                transaction =>
                    normalizeTransactionType(
                        transaction.type
                    ) === "chi"
            )
            .reduce(
                (sum, transaction) =>
                    sum +
                    getTransactionAmount(
                        transaction
                    ),
                0
            );


    const totalAppFee =
        transactions
            .filter(
                transaction =>
                    normalizeTransactionType(
                        transaction.type
                    ) === "thu"
            )
            .reduce(
                (sum, transaction) =>
                    sum +
                    getTransactionFee(
                        transaction
                    ),
                0
            );


    const totalCost =
        calculateHomeCODCost(
            transactions
        );


    const totalProfit =
        totalIncome -
        totalExpense -
        totalAppFee -
        totalCost;


    setText(
        "homeRevenue",
        formatMoney(
            totalIncome
        )
    );


    setText(
        "homeExpense",
        formatMoney(
            totalExpense
        )
    );


    setText(
        "homeOrders",
        transactions.filter(
            transaction =>
                normalizeTransactionType(
                    transaction.type
                ) === "thu"
        ).length
    );


    setText(
        "homeProfit",
        formatMoney(
            totalProfit
        )
    );


    renderTodaySummary(
        transactions
    );

}


/* =========================================================
   TODAY SUMMARY
========================================================= */

function renderTodaySummary(
    transactions
) {

    const today =
        getLocalDateString();


    const todayTransactions =
        transactions.filter(
            transaction => {

                if (
                    !transaction ||
                    !transaction.date
                ) {

                    return false;

                }


                const transactionDate =
                    String(
                        transaction.date
                    )
                    .substring(
                        0,
                        10
                    );


                return (
                    transactionDate ===
                    today
                );

            }
        );


    const todayIncome =
        todayTransactions
            .filter(
                transaction =>
                    normalizeTransactionType(
                        transaction.type
                    ) === "thu"
            )
            .reduce(
                (sum, transaction) =>
                    sum +
                    getTransactionAmount(
                        transaction
                    ),
                0
            );


    const todayExpense =
        todayTransactions
            .filter(
                transaction =>
                    normalizeTransactionType(
                        transaction.type
                    ) === "chi"
            )
            .reduce(
                (sum, transaction) =>
                    sum +
                    getTransactionAmount(
                        transaction
                    ),
                0
            );


    const todayAppFee =
        todayTransactions
            .filter(
                transaction =>
                    normalizeTransactionType(
                        transaction.type
                    ) === "thu"
            )
            .reduce(
                (sum, transaction) =>
                    sum +
                    getTransactionFee(
                        transaction
                    ),
                0
            );


    const todayCost =
        calculateHomeCODCost(
            todayTransactions
        );


    setText(
        "todayRevenue",
        formatMoney(
            todayIncome
        )
    );


    setText(
        "todayExpense",
        formatMoney(
            todayExpense
        )
    );


    setText(
        "todayAppFee",
        formatMoney(
            todayAppFee
        )
    );


    setText(
        "todayCost",
        formatMoney(
            todayCost
        )
    );


    const todayLabel =
        document.getElementById(
            "todayLabel"
        );


    if (todayLabel) {

        todayLabel.textContent =
            formatVietnameseDate(
                today
            );

    }

}


/* =========================================================
   CALCULATE COD COST
========================================================= */

function calculateHomeCODCost(
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

            if (
                normalizeTransactionType(
                    transaction.type
                ) !== "thu"
            ) {

                return;

            }


            if (
                transaction.dish_id ===
                    null ||
                transaction.dish_id ===
                    undefined ||
                transaction.dish_id === ""
            ) {

                return;

            }


            const dish =
                AppState.dishes.find(
                    item =>
                        String(
                            item.id
                        ) ===
                        String(
                            transaction.dish_id
                        )
                );


            if (!dish) {

                return;

            }


            const parts =
                Array.isArray(
                    dish.cod_parts
                )
                    ? dish.cod_parts
                    : [];


            parts.forEach(
                part => {

                    total +=
                        Number(
                            part.amount || 0
                        );

                }
            );

        }
    );


    return total;

}


/* =========================================================
   NORMALIZE TYPE
========================================================= */

function normalizeTransactionType(
    type
) {

    return String(
        type || ""
    )
        .trim()
        .toLowerCase();

}


/* =========================================================
   AMOUNT
========================================================= */

function getTransactionAmount(
    transaction
) {

    if (!transaction) {

        return 0;

    }


    return Number(
        transaction.amount ??
        transaction.money ??
        transaction.total ??
        0
    ) || 0;

}


/* =========================================================
   FEE
========================================================= */

function getTransactionFee(
    transaction
) {

    if (!transaction) {

        return 0;

    }


    return Number(
        transaction.app_fee ||
        0
    ) || 0;

}


/* =========================================================
   LOCAL DATE
========================================================= */

function getLocalDateString() {

    const now =
        new Date();


    const year =
        now.getFullYear();


    const month =
        String(
            now.getMonth() + 1
        )
        .padStart(
            2,
            "0"
        );


    const day =
        String(
            now.getDate()
        )
        .padStart(
            2,
            "0"
        );


    return (
        `${year}-${month}-${day}`
    );

}


/* =========================================================
   CLEAR FORM
========================================================= */

function clearTransactionForm() {

    const category =
        document.getElementById(
            "transactionCategory"
        );


    const dish =
        document.getElementById(
            "transactionDish"
        );


    const name =
        document.getElementById(
            "transactionName"
        );


    const fee =
        document.getElementById(
            "appFee"
        );


    const amount =
        document.getElementById(
            "transactionAmount"
        );


    const note =
        document.getElementById(
            "transactionNote"
        );


    if (category) {

        category.value = "";

    }


    if (dish) {

        dish.innerHTML = `
            <option value="">
                Chọn món
            </option>
        `;

    }


    if (name) {

        name.value = "";

    }


    if (fee) {

        fee.value = "";

    }


    if (amount) {

        amount.value = "";

    }


    if (note) {

        note.value = "";

    }


    AppState.editingTransactionId =
        null;


    const cancelButton =
        document.getElementById(
            "cancelEditButton"
        );


    if (cancelButton) {

        cancelButton.style.display =
            "none";

    }


    setToday();


    setTransactionType(
        "thu"
    );


    setOrderSource(
        "ShopeeFood"
    );

}


/* =========================================================
   CANCEL EDIT
========================================================= */

function cancelEdit() {

    clearTransactionForm();


    showToast(
        "Đã hủy sửa"
    );

}


/* =========================================================
   FORMAT MONEY
========================================================= */

function formatMoney(
    value
) {

    return (
        Number(
            value || 0
        )
        .toLocaleString(
            "vi-VN"
        ) +
        " ₫"
    );

}


/* =========================================================
   FORMAT DATE
========================================================= */

function formatVietnameseDate(
    dateString
) {

    if (!dateString) {

        return "";

    }


    const value =
        String(
            dateString
        )
        .substring(
            0,
            10
        );


    const parts =
        value.split("-");


    if (
        parts.length !== 3
    ) {

        return value;

    }


    return (
        `${parts[2]}/${parts[1]}/${parts[0]}`
    );

}


/* =========================================================
   LOAD EXPENSE DATA WHEN HOME STARTS
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        await loadExpenseData();


        /*
         * Nếu trang hiện tại là home,
         * render lại danh mục.
         */

        if (
            typeof AppState !==
            "undefined"
        ) {

            renderTransactionCategories()
                .then(
                    () => {

                        renderTransactionDishes();

                    }
                );

        }

    }
);
