/* =========================================================
   HOME.JS
   BẾP NHÀ DUYÊN
   THU / CHI + DANH MỤC RIÊNG
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
     * Chỉ lấy danh mục theo loại giao dịch
     *
     * THU -> type = thu
     * CHI -> type = chi
     */

    const transactionType =
        normalizeTransactionType(
            AppState.transactionType
        ) || "thu";


    const filteredCategories =
        categories.filter(
            category => {

                /*
                 * Nếu category chưa có type
                 * thì coi là danh mục THU để
                 * không làm mất dữ liệu cũ.
                 */

                const categoryType =
                    normalizeTransactionType(
                        category.type
                    );


                if (!categoryType) {

                    return (
                        transactionType ===
                        "thu"
                    );

                }


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
             * categories.id là BIGINT
             *
             * Ép thành String để dùng
             * làm value HTML.
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
     * Giữ lại danh mục đang chọn
     * nếu nó vẫn thuộc đúng loại.
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
     * Đổi danh mục -> đổi món
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


    dishSelect.innerHTML = `
        <option value="">
            Chọn món
        </option>
    `;


    /*
     * CHI không dùng món.
     */

    const transactionType =
        normalizeTransactionType(
            AppState.transactionType
        );


    if (
        transactionType !==
        "thu"
    ) {

        return;

    }


    /*
     * Chưa chọn danh mục.
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
             * dishes.id cũng là BIGINT.
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
   SET TRANSACTION TYPE
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
     * Thu mới có nguồn đơn.
     */

    if (sourceBox) {

        sourceBox.style.display =
            isIncome
                ? "block"
                : "none";

    }


    /*
     * Thu mới có phí app.
     */

    if (feeBox) {

        feeBox.style.display =
            isIncome
                ? "block"
                : "none";

    }


    /*
     * Chi không cần chọn món.
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
     * Khi chuyển THU / CHI,
     * render lại danh mục.
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

    const transactionType =
        normalizeTransactionType(
            AppState.transactionType
        ) || "thu";


    const categoryElement =
        document.getElementById(
            "transactionCategory"
        );


    const dishElement =
        document.getElementById(
            "transactionDish"
        );


    const categoryIdRaw =
        categoryElement?.value ||
        "";


    const dishIdRaw =
        dishElement?.value ||
        "";


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
     * KIỂM TRA TIỀN
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

    let categoryId =
        null;


    let category =
        null;


    if (categoryIdRaw) {

        category =
            AppState.categories.find(
                item =>
                    String(
                        item.id
                    ) ===
                    String(
                        categoryIdRaw
                    )
            );


        if (!category) {

            showToast(
                "Danh mục không tồn tại"
            );

            return;

        }


        /*
         * categories.id là BIGINT.
         *
         * Number() giúp tránh gửi UUID
         * hoặc chuỗi không hợp lệ.
         */

        categoryId =
            Number(
                category.id
            );


        if (
            !Number.isSafeInteger(
                categoryId
            )
        ) {

            console.error(
                "CATEGORY ID KHÔNG PHẢI BIGINT:",
                category
            );


            showToast(
                "ID danh mục không hợp lệ"
            );

            return;

        }

    }


    /*
     * =====================================================
     * KIỂM TRA CATEGORY ĐÚNG LOẠI
     * =====================================================
     */

    if (category) {

        const categoryType =
            normalizeTransactionType(
                category.type
            );


        /*
         * Danh mục cũ không có type
         * được xem là THU.
         */

        if (
            categoryType &&
            categoryType !==
                transactionType
        ) {

            showToast(
                "Danh mục không thuộc loại giao dịch này"
            );

            return;

        }

    }


    /*
     * =====================================================
     * TÌM DISH
     * =====================================================
     */

    let dishId =
        null;


    let dish =
        null;


    /*
     * CHỈ THU mới được có dish.
     */

    if (
        transactionType ===
        "thu" &&
        dishIdRaw
    ) {

        dish =
            AppState.dishes.find(
                item =>
                    String(
                        item.id
                    ) ===
                    String(
                        dishIdRaw
                    )
            );


        if (!dish) {

            showToast(
                "Món không tồn tại"
            );

            return;

        }


        /*
         * dishes.id là BIGINT.
         */

        dishId =
            Number(
                dish.id
            );


        if (
            !Number.isSafeInteger(
                dishId
            )
        ) {

            console.error(
                "DISH ID KHÔNG PHẢI BIGINT:",
                dish
            );


            showToast(
                "ID món không hợp lệ"
            );

            return;

        }

    }


    /*
     * =====================================================
     * CHI KHÔNG ĐƯỢC GỬI dish_id
     * =====================================================
     */

    if (
        transactionType ===
        "chi"
    ) {

        dishId =
            null;

        dish =
            null;

    }


    /*
     * =====================================================
     * TÊN GIAO DỊCH
     * =====================================================
     */

    let dishName =
        "Giao dịch";


    if (dish) {

        dishName =
            dish.name ||
            customName ||
            "Giao dịch";

    }
    else if (customName) {

        dishName =
            customName;

    }


    /*
     * =====================================================
     * PAYLOAD
     * =====================================================
     */

    const payload = {

        type:
            transactionType,

        /*
         * BIGINT
         */

        category_id:
            categoryId,

        /*
         * BIGINT
         */

        dish_id:
            dishId,

        category_name:
            category?.name ||
            "",

        dish_name:
            dishName,

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


    /*
     * =====================================================
     * DEBUG
     * =====================================================
     */

    console.log(
        "SAVE TRANSACTION PAYLOAD:",
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
         * LOAD LẠI
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
