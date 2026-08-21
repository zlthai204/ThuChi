/* =========================================================
   HOME.JS
   BẾP NHÀ DUYÊN
   BIGINT VERSION
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

function renderTransactionCategories() {

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


    const categories =
        Array.isArray(
            AppState.categories
        )
            ? AppState.categories
            : [];


    const currentType =
        normalizeTransactionType(
            AppState.transactionType
        ) || "thu";


    /*
     * THU:
     * chỉ lấy category.type = thu
     *
     * CHI:
     * chỉ lấy category.type = chi
     *
     * Danh mục cũ chưa có type:
     * mặc định xem là THU.
     */

    const filteredCategories =
        categories.filter(
            category => {

                const categoryType =
                    normalizeTransactionType(
                        category.type
                    );


                if (!categoryType) {

                    return (
                        currentType ===
                        "thu"
                    );

                }


                return (
                    categoryType ===
                    currentType
                );

            }
        );


    filteredCategories.forEach(
        category => {

            const id =
                Number(
                    category.id
                );


            /*
             * Database là BIGINT.
             */

            if (
                !Number.isSafeInteger(
                    id
                )
            ) {

                console.warn(
                    "Category ID không hợp lệ:",
                    category
                );

                return;

            }


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                String(id);


            option.textContent =
                category.name ||
                "Không tên";


            select.appendChild(
                option
            );

        }
    );


    /*
     * Giữ danh mục cũ
     */

    if (
        filteredCategories.some(
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


    const categoryValue =
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

    if (!categoryValue) {

        return;

    }


    const categoryId =
        Number(
            categoryValue
        );


    if (
        !Number.isSafeInteger(
            categoryId
        )
    ) {

        console.error(
            "category_id không phải BIGINT:",
            categoryValue
        );

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
                Number(
                    dish.category_id
                ) ===
                categoryId
        );


    categoryDishes.forEach(
        dish => {

            const dishId =
                Number(
                    dish.id
                );


            if (
                !Number.isSafeInteger(
                    dishId
                )
            ) {

                console.warn(
                    "Dish ID không hợp lệ:",
                    dish
                );

                return;

            }


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                String(
                    dishId
                );


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
                    ).substring(
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
   COD COST
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
                transaction.dish_id ===
                    ""
            ) {

                return;

            }


            const dish =
                AppState.dishes.find(
                    item =>
                        Number(
                            item.id
                        ) ===
                        Number(
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
   TRANSACTION TYPE
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
   TRANSACTION TYPE BUTTON
========================================================= */

function setTransactionType(
    type
) {

    AppState.transactionType =
        normalizeTransactionType(
            type
        ) || "thu";


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
            AppState.transactionType ===
            "thu"
        );

    }


    if (expenseButton) {

        expenseButton.classList.toggle(
            "active",
            AppState.transactionType ===
            "chi"
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
        AppState.transactionType ===
        "thu";


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
     * RẤT QUAN TRỌNG:
     *
     * Đổi THU / CHI phải đổi
     * danh mục ngay.
     */

    renderTransactionCategories();

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
   SAVE TRANSACTION
========================================================= */

async function saveTransaction() {

    const categorySelect =
        document.getElementById(
            "transactionCategory"
        );


    const dishSelect =
        document.getElementById(
            "transactionDish"
        );


    const nameInput =
        document.getElementById(
            "transactionName"
        );


    const amountInput =
        document.getElementById(
            "transactionAmount"
        );


    const appFeeInput =
        document.getElementById(
            "appFee"
        );


    const dateInput =
        document.getElementById(
            "transactionDate"
        );


    const noteInput =
        document.getElementById(
            "transactionNote"
        );


    /*
     * TYPE
     */

    const transactionType =
        normalizeTransactionType(
            AppState.transactionType
        ) || "thu";


    /*
     * CATEGORY
     */

    const categoryValue =
        categorySelect?.value || "";


    let categoryId =
        null;


    if (categoryValue) {

        const numericCategoryId =
            Number(
                categoryValue
            );


        if (
            !Number.isSafeInteger(
                numericCategoryId
            )
        ) {

            console.error(
                "CATEGORY ID LỖI:",
                categoryValue
            );


            showToast(
                "Danh mục không hợp lệ"
            );


            return;

        }


        categoryId =
            numericCategoryId;

    }


    /*
     * DISH
     *
     * CHỈ THU mới có dish.
     */

    const dishValue =
        dishSelect?.value || "";


    let dishId =
        null;


    if (
        transactionType ===
        "thu" &&
        dishValue
    ) {

        const numericDishId =
            Number(
                dishValue
            );


        if (
            !Number.isSafeInteger(
                numericDishId
            )
        ) {

            console.error(
                "DISH ID LỖI:",
                dishValue
            );


            showToast(
                "Món không hợp lệ"
            );


            return;

        }


        dishId =
            numericDishId;

    }


    /*
     * NAME
     */

    const customName =
        nameInput?.value
            ?.trim() || "";


    /*
     * AMOUNT
     */

    const amount =
        Number(
            amountInput?.value
        ) || 0;


    if (
        amount <= 0
    ) {

        showToast(
            "Vui lòng nhập số tiền"
        );

        return;

    }


    /*
     * FEE
     */

    const appFee =
        transactionType ===
        "thu"
            ? (
                Number(
                    appFeeInput?.value
                ) || 0
            )
            : 0;


    /*
     * DATE
     */

    const date =
        dateInput?.value ||
        getLocalDateString();


    /*
     * NOTE
     */

    const note =
        noteInput?.value
            ?.trim() || "";


    /*
     * TÌM CATEGORY
     */

    let category =
        null;


    if (
        categoryId !== null
    ) {

        category =
            AppState.categories.find(
                item =>
                    Number(
                        item.id
                    ) ===
                    categoryId
            );

    }


    /*
     * TÌM DISH
     */

    let dish =
        null;


    if (
        dishId !== null
    ) {

        dish =
            AppState.dishes.find(
                item =>
                    Number(
                        item.id
                    ) ===
                    dishId
            );

    }


    /*
     * CATEGORY KHÔNG TỒN TẠI
     */

    if (
        categoryId !== null &&
        !category
    ) {

        console.error(
            "Không tìm thấy category:",
            categoryId,
            AppState.categories
        );


        showToast(
            "Không tìm thấy danh mục"
        );


        return;

    }


    /*
     * DISH KHÔNG TỒN TẠI
     */

    if (
        dishId !== null &&
        !dish
    ) {

        console.error(
            "Không tìm thấy dish:",
            dishId,
            AppState.dishes
        );


        showToast(
            "Không tìm thấy món"
        );


        return;

    }


    /*
     * PAYLOAD
     *
     * BIGINT:
     *
     * category_id -> number
     * dish_id     -> number
     */

    const payload = {

        type:
            transactionType,


        category_id:
            categoryId,


        dish_id:
            transactionType ===
            "thu"
                ? dishId
                : null,


        category_name:
            category?.name ||
            "",


        dish_name:
            dish?.name ||
            customName ||
            (
                transactionType ===
                "chi"
                    ? "Chi phí"
                    : "Giao dịch"
            ),


        source:
            transactionType ===
            "thu"
                ? (
                    AppState.orderSource ||
                    null
                )
                : null,


        amount:
            amount,


        app_fee:
            transactionType ===
            "thu"
                ? appFee
                : 0,


        date:
            date,


        note:
            note

    };


    /*
     * DEBUG
     */

    console.log(
        "========== TRANSACTION PAYLOAD =========="
    );

    console.log(
        payload
    );

    console.log(
        "category_id:",
        payload.category_id,
        typeof payload.category_id
    );

    console.log(
        "dish_id:",
        payload.dish_id,
        typeof payload.dish_id
    );

    console.log(
        "=========================================="
    );


    /*
     * CHẶN UUID
     *
     * Nếu somehow UUID lọt vào
     * thì không gửi database.
     */

    if (
        payload.category_id !== null &&
        typeof payload.category_id !==
            "number"
    ) {

        showToast(
            "category_id không phải BIGINT"
        );

        console.error(
            "BLOCK UUID category_id:",
            payload.category_id
        );

        return;

    }


    if (
        payload.dish_id !== null &&
        typeof payload.dish_id !==
            "number"
    ) {

        showToast(
            "dish_id không phải BIGINT"
        );

        console.error(
            "BLOCK UUID dish_id:",
            payload.dish_id
        );

        return;

    }


    try {

        /*
         * EDIT
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
         * INSERT
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
         * LOAD
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
         * CLEAR
         */

        clearTransactionForm();


        /*
         * RENDER
         */

        renderAll();

    }
    catch (error) {

        console.error(
            "LỖI saveTransaction:",
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
        ).substring(
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


