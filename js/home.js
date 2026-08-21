/* =========================================================
   HOME.JS
   BẾP NHÀ DUYÊN
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
   THU -> CHỈ DANH MỤC THU
   CHI -> CHỈ DANH MỤC CHI
========================================================= */

function renderTransactionCategories() {

    const select =
        document.getElementById(
            "transactionCategory"
        );


    if (!select) {

        return;

    }


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


    /*
     * Lấy loại giao dịch hiện tại
     */

    const transactionType =
        String(
            AppState.transactionType ||
            "thu"
        )
        .trim()
        .toLowerCase();


    /*
     * CHỈ LẤY ĐÚNG TYPE
     */

    const filteredCategories =
        categories.filter(
            category => {

                const categoryType =
                    String(
                        category.type ||
                        "thu"
                    )
                    .trim()
                    .toLowerCase();


                return (
                    categoryType ===
                    transactionType
                );

            }
        );


    filteredCategories.forEach(
        category => {

            const option =
                document.createElement(
                    "option"
                );


            /*
             * QUAN TRỌNG:
             *
             * categories.id là BIGINT
             *
             * nên giữ ID dạng số.
             */

            option.value =
                String(
                    category.id
                );


            option.textContent =
                category.name ||
                "Không tên";


            select.appendChild(
                option
            );

        }
    );


    /*
     * Giữ lại danh mục cũ nếu
     * vẫn thuộc đúng loại.
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
    else {

        select.value =
            "";

    }


    /*
     * Đổi danh mục -> đổi món
     */

    select.onchange =
        function () {

            renderTransactionDishes();

        };

}


/* =========================================================
   DISH SELECT
   CHỈ HIỂN THỊ MÓN THU
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
     * Nếu CHI:
     *
     * không hiển thị món.
     */

    const transactionType =
        String(
            AppState.transactionType ||
            "thu"
        )
        .trim()
        .toLowerCase();


    if (
        transactionType ===
        "chi"
    ) {

        return;

    }


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


            /*
             * dishes.id cũng là BIGINT
             */

            option.value =
                String(
                    dish.id
                );


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
   TYPE
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


    return (
        `${now.getFullYear()}-` +
        `${String(
            now.getMonth() + 1
        ).padStart(2, "0")}-` +
        `${String(
            now.getDate()
        ).padStart(2, "0")}`
    );

}


/* =========================================================
   TRANSACTION TYPE
========================================================= */

function setTransactionType(
    type
) {

    AppState.transactionType =
        type === "chi"
            ? "chi"
            : "thu";


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
     * QUAN TRỌNG:
     *
     * Khi đổi Thu <-> Chi,
     * render lại danh mục.
     *
     * Vì vậy:
     *
     * THU -> chỉ danh mục thu
     * CHI -> chỉ danh mục chi
     */

    renderTransactionCategories();


    renderTransactionDishes();


    /*
     * Khi CHI:
     * xóa món đang chọn.
     */

    if (
        AppState.transactionType ===
        "chi"
    ) {

        const dish =
            document.getElementById(
                "transactionDish"
            );


        if (dish) {

            dish.value = "";

        }

    }

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


    const transactionType =
        normalizeTransactionType(
            AppState.transactionType
        ) || "thu";


    if (amount <= 0) {

        showToast(
            "Vui lòng nhập số tiền"
        );

        return;

    }


    /*
     * =========================
     * TÌM CATEGORY
     * =========================
     */

    const category =
        AppState.categories.find(
            item =>
                String(
                    item.id
                ) ===
                String(
                    categoryId
                )
        );


    /*
     * =========================
     * KIỂM TRA CATEGORY TYPE
     * =========================
     */

    if (category) {

        const categoryType =
            String(
                category.type ||
                "thu"
            )
            .trim()
            .toLowerCase();


        if (
            categoryType !==
            transactionType
        ) {

            showToast(
                "Danh mục không đúng loại giao dịch"
            );

            return;

        }

    }


    /*
     * =========================
     * TÌM DISH
     * =========================
     */

    let dish = null;


    if (
        transactionType ===
        "thu" &&
        dishId
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

    }


    /*
     * =========================
     * BIGINT
     *
     * categories.id = bigint
     * dishes.id     = bigint
     *
     * => Number()
     *
     * Không được UUID.
     * =========================
     */

    const numericCategoryId =
        categoryId
            ? Number(categoryId)
            : null;


    const numericDishId =
        transactionType === "thu" &&
        dishId
            ? Number(dishId)
            : null;


    /*
     * Kiểm tra ID có phải số
     */

    if (
        categoryId &&
        !Number.isInteger(
            numericCategoryId
        )
    ) {

        showToast(
            "ID danh mục không hợp lệ"
        );

        console.error(
            "categoryId không phải bigint:",
            categoryId
        );

        return;

    }


    if (
        dishId &&
        !Number.isInteger(
            numericDishId
        )
    ) {

        showToast(
            "ID món không hợp lệ"
        );

        console.error(
            "dishId không phải bigint:",
            dishId
        );

        return;

    }


    /*
     * =========================
     * PAYLOAD
     * =========================
     */

    const payload = {

        type:
            transactionType,

        category_id:
            numericCategoryId,

        dish_id:
            numericDishId,

        category_name:
            category?.name ||
            "",

        dish_name:
            dish?.name ||
            customName ||
            "Giao dịch",

        source:
            transactionType ===
            "thu"
                ? (
                    AppState.orderSource ||
                    "Ngoài sàn"
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


    console.log(
        "TRANSACTION PAYLOAD:",
        payload
    );


    try {

        /*
         * =========================
         * EDIT
         * =========================
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
         * =========================
         * INSERT
         * =========================
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
         * =========================
         * LOAD
         * =========================
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


        clearTransactionForm();


        renderAll();

    }
    catch (error) {

        console.error(
            "Lỗi saveTransaction:",
            error
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
