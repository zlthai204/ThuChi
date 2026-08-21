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


    /*
     * =====================================================
     * XÁC ĐỊNH THU / CHI
     * =====================================================
     */

    const type =
        normalizeTransactionType(
            AppState.transactionType
        );


    /*
     * THU
     *
     * Chỉ lấy category không phải chi.
     *
     * CHI
     *
     * Chỉ lấy category có type = chi.
     */

    const filteredCategories =
        categories.filter(
            category => {

                const categoryType =
                    normalizeTransactionType(
                        category.type
                    );


                if (type === "chi") {

                    return (
                        categoryType ===
                        "chi"
                    );

                }


                /*
                 * THU
                 *
                 * Cho phép:
                 *
                 * type = thu
                 * type = rỗng / cũ
                 */

                return (
                    categoryType !==
                    "chi"
                );

            }
        );


    filteredCategories.forEach(
        category => {

            /*
             * CHỈ DÙNG ID DATABASE
             *
             * categories.id phải là bigint.
             */

            const id =
                category.id;


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
     * Giữ category cũ nếu còn tồn tại
     */

    if (
        filteredCategories.some(
            category =>
                String(category.id) ===
                String(oldValue)
        )
    ) {

        select.value =
            oldValue;

    }


    /*
     * Đổi category
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
        categorySelect.value;


    const oldDishValue =
        dishSelect.value;


    dishSelect.innerHTML = `
        <option value="">
            Chọn món
        </option>
    `;


    /*
     * =====================================================
     * CHI KHÔNG CÓ MÓN
     * =====================================================
     */

    if (
        normalizeTransactionType(
            AppState.transactionType
        ) === "chi"
    ) {

        dishSelect.innerHTML = `
            <option value="">
                Không áp dụng
            </option>
        `;

        dishSelect.value = "";

        return;

    }


    /*
     * Chưa chọn category
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


    /*
     * Lọc món theo category
     */

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
             * dishes.id phải là bigint
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


    /*
     * Giữ món đang chọn
     */

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

    type =
        normalizeTransactionType(
            type
        );


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


    /*
     * THU mới có nguồn đơn
     */

    const sourceBox =
        document.getElementById(
            "orderSourceBox"
        );


    /*
     * THU mới có phí app
     */

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
     * QUAN TRỌNG
     *
     * Đổi THU / CHI phải render lại
     * danh mục.
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
        normalizeTransactionType(
            AppState.transactionType
        );


    /*
     * =====================================================
     * LẤY FORM
     * =====================================================
     */

    const categoryElement =
        document.getElementById(
            "transactionCategory"
        );


    const dishElement =
        document.getElementById(
            "transactionDish"
        );


    const customNameElement =
        document.getElementById(
            "transactionName"
        );


    const amountElement =
        document.getElementById(
            "transactionAmount"
        );


    const appFeeElement =
        document.getElementById(
            "appFee"
        );


    const dateElement =
        document.getElementById(
            "transactionDate"
        );


    const noteElement =
        document.getElementById(
            "transactionNote"
        );


    const categoryValue =
        categoryElement?.value || "";


    const dishValue =
        dishElement?.value || "";


    const customName =
        customNameElement?.value
            ?.trim() || "";


    const amount =
        Number(
            amountElement?.value
        ) || 0;


    const appFee =
        Number(
            appFeeElement?.value
        ) || 0;


    const date =
        dateElement?.value ||
        getLocalDateString();


    const note =
        noteElement?.value
            ?.trim() || "";


    /*
     * =====================================================
     * KIỂM TRA SỐ TIỀN
     * =====================================================
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
     * =====================================================
     * TÌM CATEGORY
     * =====================================================
     */

    let category =
        null;


    if (categoryValue) {

        category =
            AppState.categories.find(
                item =>
                    String(
                        item.id
                    ) ===
                    String(
                        categoryValue
                    )
            );

    }


    /*
     * =====================================================
     * CHI BẮT BUỘC CÓ CATEGORY
     * =====================================================
     */

    if (
        type === "chi" &&
        !category
    ) {

        showToast(
            "Vui lòng chọn danh mục phần chi"
        );

        return;

    }


    /*
     * =====================================================
     * KIỂM TRA CATEGORY ID
     *
     * categories.id = bigint
     *
     * Không được phép UUID.
     * =====================================================
     */

    let categoryId =
        null;


    if (category) {

        const parsedCategoryId =
            Number(
                category.id
            );


        if (
            !Number.isInteger(
                parsedCategoryId
            ) ||
            parsedCategoryId <= 0
        ) {

            console.error(
                "CATEGORY ID KHÔNG PHẢI BIGINT:",
                category
            );


            showToast(
                "Lỗi ID danh mục. Hãy tải lại trang."
            );

            return;

        }


        categoryId =
            parsedCategoryId;

    }


    /*
     * =====================================================
     * TÌM DISH
     *
     * CHI KHÔNG DÙNG DISH
     * =====================================================
     */

    let dish =
        null;


    let dishId =
        null;


    if (
        type === "thu" &&
        dishValue
    ) {

        dish =
            AppState.dishes.find(
                item =>
                    String(
                        item.id
                    ) ===
                    String(
                        dishValue
                    )
            );


        if (dish) {

            const parsedDishId =
                Number(
                    dish.id
                );


            if (
                !Number.isInteger(
                    parsedDishId
                ) ||
                parsedDishId <= 0
            ) {

                console.error(
                    "DISH ID KHÔNG PHẢI BIGINT:",
                    dish
                );


                showToast(
                    "Lỗi ID món. Hãy tải lại trang."
                );

                return;

            }


            dishId =
                parsedDishId;

        }

    }


    /*
     * =====================================================
     * KIỂM TRA CATEGORY TYPE
     *
     * =====================================================
     */

    if (category) {

        const categoryType =
            normalizeTransactionType(
                category.type
            );


        if (
            type === "chi" &&
            categoryType !== "chi"
        ) {

            showToast(
                "Danh mục này không phải danh mục phần chi"
            );

            return;

        }


        if (
            type === "thu" &&
            categoryType === "chi"
        ) {

            showToast(
                "Danh mục phần chi không dùng cho phần thu"
            );

            return;

        }

    }


    /*
     * =====================================================
     * TÊN GIAO DỊCH
     * =====================================================
     */

    let transactionDishName =
        "Giao dịch";


    if (
        type === "chi"
    ) {

        transactionDishName =
            category?.name ||
            customName ||
            "Chi phí";

    } else {

        transactionDishName =
            dish?.name ||
            customName ||
            "Giao dịch";

    }


    /*
     * =====================================================
     * PAYLOAD
     *
     * QUAN TRỌNG:
     *
     * category_id = BIGINT
     * dish_id     = BIGINT
     *
     * CHI:
     * dish_id = null
     * =====================================================
     */

    const payload = {

        type:
            type,


        category_id:
            categoryId,


        dish_id:
            type === "thu"
                ? dishId
                : null,


        category_name:
            category?.name ||
            "",


        dish_name:
            transactionDishName,


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
     * =====================================================
     * DEBUG
     * =====================================================
     */

    console.log(
        "SAVE TRANSACTION PAYLOAD:",
        payload
    );


    /*
     * =====================================================
     * CHỐT LẦN CUỐI
     *
     * Nếu UUID lọt vào đây thì dừng.
     * =====================================================
     */

    if (
        payload.category_id !== null &&
        !Number.isInteger(
            Number(
                payload.category_id
            )
        )
    ) {

        console.error(
            "BLOCK UUID CATEGORY:",
            payload.category_id
        );


        showToast(
            "ID danh mục không hợp lệ"
        );

        return;

    }


    if (
        payload.dish_id !== null &&
        !Number.isInteger(
            Number(
                payload.dish_id
            )
        )
    ) {

        console.error(
            "BLOCK UUID DISH:",
            payload.dish_id
        );


        showToast(
            "ID món không hợp lệ"
        );

        return;

    }


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


    /*
     * Mặc định về THU
     */

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


    /*
     * TỔNG THU
     */

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


    /*
     * TỔNG CHI
     */

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


    /*
     * TỔNG PHÍ APP
     */

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


    /*
     * TỔNG GIÁ VỐN
     */

    const totalCost =
        calculateHomeCODCost(
            transactions
        );


    /*
     * LỢI NHUẬN
     */

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
                transaction.dish_id === null ||
                transaction.dish_id === undefined ||
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
   GET AMOUNT
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
   GET FEE
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
