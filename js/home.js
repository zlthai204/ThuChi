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
     * CHỈ HIỂN THỊ ĐÚNG LOẠI
     * =====================================================
     */

    const currentType =
        normalizeTransactionType(
            AppState.transactionType
        );


    const filteredCategories =
        categories.filter(
            category => {

                /*
                 * Nếu category có type
                 * thì lọc theo THU / CHI
                 */

                if (
                    category.type !==
                    undefined &&
                    category.type !==
                    null &&
                    String(
                        category.type
                    ).trim() !== ""
                ) {

                    return (
                        normalizeTransactionType(
                            category.type
                        ) ===
                        currentType
                    );

                }


                /*
                 * Danh mục cũ chưa có type
                 *
                 * Cho THU sử dụng
                 * để không làm mất dữ liệu cũ.
                 */

                return currentType === "thu";

            }
        );


    filteredCategories.forEach(
        category => {

            const option =
                document.createElement(
                    "option"
                );


            /*
             * categories.id là BIGINT
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
     * Giữ danh mục đang chọn
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


    /*
     * Đổi danh mục
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
     * CHI không có món
     */

    if (
        normalizeTransactionType(
            AppState.transactionType
        ) !== "thu"
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
   TRANSACTION AMOUNT
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
   TRANSACTION FEE
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
            "transactionDishBox"
        );


    const nameBox =
        document.getElementById(
            "transactionNameBox"
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
     * THU có món
     * CHI không có món
     */

    if (dishBox) {

        dishBox.style.display =
            isIncome
                ? "block"
                : "none";

    }


    if (nameBox) {

        nameBox.style.display =
            isIncome
                ? "none"
                : "block";

    }


    /*
     * Quan trọng:
     * đổi THU / CHI thì render lại danh mục
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
        ) || "thu";


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
     * Kiểm tra tiền
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
     * QUAN TRỌNG
     * =====================================================
     *
     * categories.id và dishes.id là BIGINT.
     *
     * Không được gửi UUID.
     */

    let categoryIdBigInt =
        null;


    let dishIdBigInt =
        null;


    if (categoryId) {

        const numberValue =
            Number(
                categoryId
            );


        if (
            !Number.isSafeInteger(
                numberValue
            )
        ) {

            console.error(
                "CATEGORY ID KHÔNG PHẢI BIGINT:",
                categoryId
            );


            showToast(
                "ID danh mục không hợp lệ"
            );

            return;

        }


        categoryIdBigInt =
            numberValue;

    }


    /*
     * CHỈ THU mới có dish_id
     */

    if (
        type === "thu" &&
        dishId
    ) {

        const numberValue =
            Number(
                dishId
            );


        if (
            !Number.isSafeInteger(
                numberValue
            )
        ) {

            console.error(
                "DISH ID KHÔNG PHẢI BIGINT:",
                dishId
            );


            showToast(
                "ID món không hợp lệ"
            );

            return;

        }


        dishIdBigInt =
            numberValue;

    }


    /*
     * Tìm món
     */

    const dish =
        dishIdBigInt !== null
            ? AppState.dishes.find(
                item =>
                    Number(
                        item.id
                    ) ===
                    dishIdBigInt
            )
            : null;


    /*
     * Tìm danh mục
     */

    const category =
        categoryIdBigInt !== null
            ? AppState.categories.find(
                item =>
                    Number(
                        item.id
                    ) ===
                    categoryIdBigInt
            )
            : null;


    /*
     * =====================================================
     * PAYLOAD
     * =====================================================
     */

    const payload = {

        type:
            type,


        category_id:
            categoryIdBigInt,


        dish_id:
            type === "thu"
                ? dishIdBigInt
                : null,


        category_name:
            category?.name ||
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
                    category?.name ||
                    "Chi phí"
                ),


        source:
            type === "thu"
                ? AppState.orderSource
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
        "SAVE TRANSACTION PAYLOAD:",
        payload
    );


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
         * LOAD LẠI
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
