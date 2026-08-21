/* =========================================================
   HOME.JS
   BẾP NHÀ DUYÊN
   FIX CATEGORY UUID -> BIGINT
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
   HELPER
========================================================= */

function getCategoriesByType(type) {

    const categories =
        Array.isArray(AppState.categories)
            ? AppState.categories
            : [];

    return categories.filter(
        category =>
            String(
                category.type || "thu"
            )
            .trim()
            .toLowerCase()
            ===
            String(type)
                .trim()
                .toLowerCase()
    );

}


/*
 * BIGINT ID
 *
 * Database:
 *
 * categories.id = bigint
 * dishes.id = bigint
 * transactions.category_id = bigint
 * transactions.dish_id = bigint
 *
 * Không được gửi UUID.
 */

function toBigIntId(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return null;

    }


    const text =
        String(value).trim();


    /*
     * UUID thì tuyệt đối không cho
     * đi vào cột bigint.
     */

    if (
        !/^\d+$/.test(text)
    ) {

        console.error(
            "ID KHÔNG PHẢI BIGINT:",
            value
        );

        return null;

    }


    const number =
        Number(text);


    if (
        !Number.isSafeInteger(
            number
        )
    ) {

        console.error(
            "BIGINT ID KHÔNG HỢP LỆ:",
            value
        );

        return null;

    }


    return number;

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


    /*
     * THU
     * chỉ hiện danh mục type = thu
     *
     * CHI
     * chỉ hiện danh mục type = chi
     */

    const type =
        AppState.transactionType === "chi"
            ? "chi"
            : "thu";


    let categories =
        getCategoriesByType(type);


    /*
     * Nếu dữ liệu cũ chưa có type,
     * coi là danh mục THU.
     *
     * Với CHI thì không lấy danh mục THU.
     */

    if (
        type === "thu"
    ) {

        const allCategories =
            Array.isArray(
                AppState.categories
            )
                ? AppState.categories
                : [];


        const hasTypedCategory =
            allCategories.some(
                category =>
                    category.type === "thu" ||
                    category.type === "chi"
            );


        if (!hasTypedCategory) {

            categories =
                allCategories;

        }

    }


    categories.forEach(
        category => {

            /*
             * QUAN TRỌNG:
             *
             * value phải là category.id
             *
             * Không dùng UUID.
             */

            const categoryId =
                toBigIntId(
                    category.id
                );


            if (
                categoryId === null
            ) {

                console.warn(
                    "Bỏ qua category ID không hợp lệ:",
                    category
                );

                return;

            }


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                String(
                    categoryId
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
     * Giữ lại danh mục đang chọn
     */

    const oldCategoryId =
        toBigIntId(
            oldValue
        );


    if (
        oldCategoryId !== null &&
        categories.some(
            category =>
                toBigIntId(
                    category.id
                ) ===
                oldCategoryId
        )
    ) {

        select.value =
            String(
                oldCategoryId
            );

    }


    /*
     * Đổi danh mục
     * -> đổi món
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


    const categoryId =
        toBigIntId(
            categorySelect.value
        );


    const oldDishValue =
        dishSelect.value;


    dishSelect.innerHTML = `
        <option value="">
            Chọn món
        </option>
    `;


    /*
     * CHI không có món
     */

    if (
        AppState.transactionType ===
        "chi"
    ) {

        dishSelect.style.display =
            "none";

        return;

    }


    dishSelect.style.display =
        "";


    /*
     * Chưa chọn danh mục
     */

    if (
        categoryId === null
    ) {

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
                toBigIntId(
                    dish.category_id
                ) ===
                categoryId
        );


    categoryDishes.forEach(
        dish => {

            const dishId =
                toBigIntId(
                    dish.id
                );


            if (
                dishId === null
            ) {

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
     * Giữ món cũ
     */

    const oldDishId =
        toBigIntId(
            oldDishValue
        );


    if (
        oldDishId !== null &&
        categoryDishes.some(
            dish =>
                toBigIntId(
                    dish.id
                ) ===
                oldDishId
        )
    ) {

        dishSelect.value =
            String(
                oldDishId
            );

    }

}


/* =========================================================
   TRANSACTION TYPE
========================================================= */

function setTransactionType(
    type
) {

    type =
        String(
            type || "thu"
        )
        .trim()
        .toLowerCase();


    if (
        type !== "thu" &&
        type !== "chi"
    ) {

        type = "thu";

    }


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


    const dishBox =
        document.getElementById(
            "transactionDish"
        );


    const nameBox =
        document.getElementById(
            "transactionName"
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
     * CHI không dùng món.
     */

    if (dishBox) {

        dishBox.style.display =
            isIncome
                ? ""
                : "none";

    }


    /*
     * Đổi THU / CHI
     * thì render lại danh mục.
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

    const type =
        AppState.transactionType === "chi"
            ? "chi"
            : "thu";


    /*
     * LẤY CATEGORY ID
     */

    const categoryRaw =
        document.getElementById(
            "transactionCategory"
        )?.value || "";


    const categoryId =
        toBigIntId(
            categoryRaw
        );


    /*
     * LẤY DISH ID
     */

    const dishRaw =
        document.getElementById(
            "transactionDish"
        )?.value || "";


    let dishId =
        toBigIntId(
            dishRaw
        );


    /*
     * CHI không dùng dish.
     */

    if (
        type === "chi"
    ) {

        dishId =
            null;

    }


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
     * =========================
     * KIỂM TRA TIỀN
     * =========================
     */

    if (
        amount <= 0
    ) {

        showToast(
            "Vui lòng nhập số tiền"
        );

        return;

    }


    /*
     * =========================
     * CHI BẮT BUỘC CÓ DANH MỤC
     * =========================
     */

    if (
        type === "chi" &&
        categoryId === null
    ) {

        showToast(
            "Vui lòng chọn danh mục chi"
        );

        return;

    }


    /*
     * =========================
     * TÌM MÓN
     * =========================
     */

    const dish =
        dishId === null
            ? null
            : AppState.dishes.find(
                item =>
                    toBigIntId(
                        item.id
                    ) ===
                    dishId
            );


    /*
     * =========================
     * TÌM DANH MỤC
     * =========================
     */

    const category =
        categoryId === null
            ? null
            : AppState.categories.find(
                item =>
                    toBigIntId(
                        item.id
                    ) ===
                    categoryId
            );


    /*
     * =========================
     * KIỂM TRA CATEGORY
     * =========================
     */

    if (
        categoryId !== null &&
        !category
    ) {

        console.error(
            "Không tìm thấy category:",
            {
                categoryId,
                categories:
                    AppState.categories
            }
        );


        showToast(
            "Danh mục không hợp lệ"
        );

        return;

    }


    /*
     * =========================
     * PAYLOAD
     * =========================
     *
     * TẤT CẢ ID Ở ĐÂY ĐỀU LÀ NUMBER.
     *
     * Tuyệt đối không UUID.
     */

    const payload = {

        type:
            type,

        category_id:
            categoryId,

        dish_id:
            dishId,

        category_name:
            category?.name ||
            "",

        dish_name:
            type === "chi"
                ? (
                    category?.name ||
                    customName ||
                    "Chi phí"
                )
                : (
                    dish?.name ||
                    customName ||
                    "Giao dịch"
                ),

        source:
            type === "thu"
                ? (
                    AppState.orderSource ||
                    null
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


    /*
     * =========================
     * DEBUG
     * =========================
     */

    console.log(
        "SAVE TRANSACTION PAYLOAD:",
        payload
    );


    /*
     * Chặn UUID lần cuối
     */

    if (
        payload.category_id !== null &&
        typeof payload.category_id !== "number"
    ) {

        console.error(
            "CATEGORY ID KHÔNG PHẢI NUMBER:",
            payload.category_id
        );

        showToast(
            "Lỗi ID danh mục"
        );

        return;

    }


    if (
        payload.dish_id !== null &&
        typeof payload.dish_id !== "number"
    ) {

        console.error(
            "DISH ID KHÔNG PHẢI NUMBER:",
            payload.dish_id
        );

        showToast(
            "Lỗi ID món"
        );

        return;

    }


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
         * LOAD LẠI
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
            "LỖI saveTransaction:",
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


            const dishId =
                toBigIntId(
                    transaction.dish_id
                );


            if (
                dishId === null
            ) {

                return;

            }


            const dish =
                AppState.dishes.find(
                    item =>
                        toBigIntId(
                            item.id
                        ) ===
                        dishId
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
