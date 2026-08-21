/* =========================================================
   HOME.JS
   BẾP NHÀ DUYÊN
   THU / CHI
========================================================= */


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


    select.innerHTML = `
        <option value="">
            Chọn danh mục
        </option>
    `;


    /*
     * =====================================================
     * THU
     * =====================================================
     */

    if (
        AppState.transactionType ===
        "thu"
    ) {

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


        /*
         * Giữ danh mục đang chọn
         */

        if (
            categories.some(
                category =>
                    String(
                        category.id
                    ) ===
                    String(
                        oldValue
                    )
            )
        ) {

            select.value =
                oldValue;

        }

    }


    /*
     * =====================================================
     * CHI
     * =====================================================
     */

    else {

        /*
         * Lấy danh mục Chi riêng
         */

        let expenseCategories =
            Array.isArray(
                AppState.expenseCategories
            )
                ? AppState.expenseCategories
                : [];


        /*
         * Nếu chưa load thì load từ Supabase
         */

        if (
            expenseCategories.length === 0
        ) {

            try {

                expenseCategories =
                    await dbGet(
                        "expense_categories",
                        {
                            order: {
                                column:
                                    "created_at",

                                ascending:
                                    true
                            }
                        }
                    );


                AppState.expenseCategories =
                    expenseCategories;

            }
            catch (error) {

                console.error(
                    "Không tải được danh mục Chi:",
                    error
                );

                expenseCategories =
                    [];

            }

        }


        expenseCategories.forEach(
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


        /*
         * Giữ danh mục đang chọn
         */

        if (
            expenseCategories.some(
                category =>
                    String(
                        category.id
                    ) ===
                    String(
                        oldValue
                    )
            )
        ) {

            select.value =
                oldValue;

        }

    }


    /*
     * =====================================================
     * Đổi danh mục
     * =====================================================
     */

    select.onchange =
        function () {

            renderTransactionDishes();

        };

}


/* =========================================================
   DISH SELECT
========================================================= */

function renderTransactionDishes() {

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


    /*
     * =====================================================
     * CHI KHÔNG CÓ MÓN
     * =====================================================
     */

    if (
        AppState.transactionType ===
        "chi"
    ) {

        dishSelect.innerHTML = `
            <option value="">
                Không áp dụng cho khoản chi
            </option>
        `;

        dishSelect.disabled =
            true;

        return;

    }


    /*
     * =====================================================
     * THU CÓ MÓN
     * =====================================================
     */

    dishSelect.disabled =
        false;


    const categoryId =
        categorySelect.value;


    const oldDishValue =
        dishSelect.value;


    dishSelect.innerHTML = `
        <option value="">
            Chọn món
        </option>
    `;


    /*
     * Chưa chọn danh mục
     */

    if (!categoryId) {

        return;

    }


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


    /*
     * Giữ món đang chọn
     */

    if (
        categoryDishes.some(
            dish =>
                String(
                    dish.id
                ) ===
                String(
                    oldDishValue
                )
        )
    ) {

        dishSelect.value =
            oldDishValue;

    }

}


/* =========================================================
   TRANSACTION TYPE
========================================================= */

async function setTransactionType(
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


    const dishSelect =
        document.getElementById(
            "transactionDish"
        );


    const dishLabel =
        document.querySelector(
            'label[for="transactionDish"]'
        );


    const isIncome =
        type === "thu";


    /*
     * =====================================================
     * SOURCE
     * =====================================================
     */

    if (sourceBox) {

        sourceBox.style.display =
            isIncome
                ? "block"
                : "none";

    }


    /*
     * =====================================================
     * APP FEE
     * =====================================================
     */

    if (feeBox) {

        feeBox.style.display =
            isIncome
                ? "block"
                : "none";

    }


    /*
     * =====================================================
     * MÓN
     * =====================================================
     */

    if (dishSelect) {

        dishSelect.style.display =
            isIncome
                ? ""
                : "none";

    }


    if (dishLabel) {

        dishLabel.style.display =
            isIncome
                ? ""
                : "none";

    }


    /*
     * =====================================================
     * ĐỔI DANH MỤC
     * =====================================================
     */

    await renderTransactionCategories();

    renderTransactionDishes();

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
   GET EXPENSE CATEGORY
========================================================= */

function getExpenseCategoryById(
    id
) {

    const categories =
        Array.isArray(
            AppState.expenseCategories
        )
            ? AppState.expenseCategories
            : [];


    return categories.find(
        category =>
            String(
                category.id
            ) ===
            String(
                id
            )
    );

}


/* =========================================================
   SAVE TRANSACTION
========================================================= */

async function saveTransaction() {

    const type =
        normalizeTransactionType(
            AppState.transactionType
        );


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


    /*
     * =====================================================
     * KIỂM TRA
     * =====================================================
     */

    if (!type) {

        showToast(
            "Vui lòng chọn Thu hoặc Chi"
        );

        return;

    }


    if (
        amount <= 0
    ) {

        showToast(
            "Vui lòng nhập số tiền"
        );

        return;

    }


    if (!categoryId) {

        showToast(
            type === "thu"
                ? "Vui lòng chọn danh mục món"
                : "Vui lòng chọn danh mục khoản chi"
        );

        return;

    }


    /*
     * =====================================================
     * THU
     * =====================================================
     */

    let dish =
        null;


    let category =
        null;


    if (
        type === "thu"
    ) {

        dish =
            AppState.dishes.find(
                item =>
                    String(
                        item.id
                    ) ===
                    String(
                        dishId
                    )
            );


        category =
            AppState.categories.find(
                item =>
                    String(
                        item.id
                    ) ===
                    String(
                        categoryId
                    )
            );

    }


    /*
     * =====================================================
     * CHI
     * =====================================================
     */

    else {

        category =
            getExpenseCategoryById(
                categoryId
            );

    }


    /*
     * Nếu Chi mà không tìm thấy
     * danh mục
     */

    if (
        !category
    ) {

        showToast(
            "Không tìm thấy danh mục"
        );

        return;

    }


    /*
     * =====================================================
     * PAYLOAD
     * =====================================================
     */

    const payload = {

        type:
            type,


        category_id:
            categoryId
                ? categoryId
                : null,


        dish_id:
            type === "thu" &&
            dishId
                ? dishId
                : null,


        category_name:
            category.name ||
            "",


        dish_name:
            type === "thu"
                ? (
                    dish?.name ||
                    customName ||
                    "Giao dịch"
                )
                : (
                    customName ||
                    category.name ||
                    "Khoản chi"
                ),


        source:
            type === "thu"
                ? (
                    AppState.orderSource ||
                    "Ngoài sàn"
                )
                : null,


        amount:
            amount,


        app_fee:
            type === "thu"
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

        /*
         * =================================================
         * EDIT
         * =================================================
         */

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


        /*
         * =================================================
         * INSERT
         * =================================================
         */

        else {

            await dbInsert(
                "transactions",
                payload
            );


            showToast(
                "Đã lưu giao dịch"
            );

        }


        /*
         * =================================================
         * LOAD TRANSACTIONS
         * =================================================
         */

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


        /*
         * =================================================
         * CLEAR
         * =================================================
         */

        clearTransactionForm();


        /*
         * =================================================
         * RENDER
         * =================================================
         */

        if (
            typeof renderAll ===
            "function"
        ) {

            renderAll();

        }
        else {

            renderHome();

        }

    }
    catch (error) {

        console.error(
            "Lỗi saveTransaction:",
            error
        );

        showToast(
            error?.message ||
            "Không thể lưu giao dịch"
        );

    }

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

        category.value =
            "";

    }


    if (dish) {

        dish.innerHTML = `
            <option value="">
                Chọn món
            </option>
        `;

        dish.disabled =
            false;

    }


    if (name) {

        name.value =
            "";

    }


    if (fee) {

        fee.value =
            "";

    }


    if (amount) {

        amount.value =
            "";

    }


    if (note) {

        note.value =
            "";

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


    let total =
        0;


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
                transaction.dish_id ===
                    ""
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
                            part.amount ||
                            0
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
   END HOME.JS
========================================================= */
