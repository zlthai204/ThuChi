/* =========================================================
   HOME.JS
   BẾP NHÀ DUYÊN
   THU / CHI CATEGORY
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
   THU  -> category.type = thu
   CHI  -> category.type = chi
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


    const transactionType =
        AppState.transactionType === "chi"
            ? "chi"
            : "thu";


    /*
     * CHỈ LẤY DANH MỤC ĐÚNG LOẠI
     */

    const filteredCategories =
        categories.filter(
            category => {

                /*
                 * Nếu category chưa có type
                 * thì mặc định là thu.
                 */

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
             * ID database là BIGINT
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
     * GIỮ DANH MỤC CŨ
     * nếu vẫn thuộc đúng loại.
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
     * ĐỔI DANH MỤC -> ĐỔI MÓN
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
     * Không chọn danh mục
     */

    if (!categoryId) {

        return;

    }


    /*
     * Chỉ danh mục THU mới có món.
     *
     * Danh mục CHI:
     * không hiện món.
     */

    const transactionType =
        AppState.transactionType === "chi"
            ? "chi"
            : "thu";


    if (
        transactionType === "chi"
    ) {

        return;

    }


    const dishes =
        Array.isArray(
            AppState.dishes
        )
            ? AppState.dishes
            : [];


    /*
     * LỌC MÓN THEO CATEGORY ID
     *
     * ID hiện tại là BIGINT.
     */

    const categoryDishes =
        dishes.filter(
            dish =>
                Number(
                    dish.category_id
                ) ===
                Number(
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
     * GIỮ MÓN CŨ
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


    /*
     * TỔNG DOANH THU
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
                (
                    sum,
                    transaction
                ) =>
                    sum +
                    getTransactionAmount(
                        transaction
                    ),
                0
            );


    /*
     * TỔNG CHI PHÍ
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
                (
                    sum,
                    transaction
                ) =>
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
                (
                    sum,
                    transaction
                ) =>
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


    /*
     * DOANH THU HÔM NAY
     */

    const todayIncome =
        todayTransactions
            .filter(
                transaction =>
                    normalizeTransactionType(
                        transaction.type
                    ) === "thu"
            )
            .reduce(
                (
                    sum,
                    transaction
                ) =>
                    sum +
                    getTransactionAmount(
                        transaction
                    ),
                0
            );


    /*
     * CHI PHÍ HÔM NAY
     */

    const todayExpense =
        todayTransactions
            .filter(
                transaction =>
                    normalizeTransactionType(
                        transaction.type
                    ) === "chi"
            )
            .reduce(
                (
                    sum,
                    transaction
                ) =>
                    sum +
                    getTransactionAmount(
                        transaction
                    ),
                0
            );


    /*
     * PHÍ APP HÔM NAY
     */

    const todayAppFee =
        todayTransactions
            .filter(
                transaction =>
                    normalizeTransactionType(
                        transaction.type
                    ) === "thu"
            )
            .reduce(
                (
                    sum,
                    transaction
                ) =>
                    sum +
                    getTransactionFee(
                        transaction
                    ),
                0
            );


    /*
     * GIÁ VỐN HÔM NAY
     */

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

            /*
             * Chỉ THU mới tính giá vốn.
             */

            if (
                normalizeTransactionType(
                    transaction.type
                ) !== "thu"
            ) {

                return;

            }


            /*
             * Không có món
             */

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


    const dishSelect =
        document.getElementById(
            "transactionDish"
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
     * CHI KHÔNG CÓ MÓN
     */

    if (
        dishSelect &&
        !isIncome
    ) {

        dishSelect.innerHTML = `
            <option value="">
                Không chọn món
            </option>
        `;

    }


    /*
     * ĐỔI THU/CHI
     * -> đổi danh mục
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

    try {

        const type =
            AppState.transactionType ===
            "chi"
                ? "chi"
                : "thu";


        const categoryId =
            document.getElementById(
                "transactionCategory"
            )?.value || "";


        /*
         * CHI không có món
         */

        const dishId =
            type === "thu"
                ? (
                    document.getElementById(
                        "transactionDish"
                    )?.value || ""
                )
                : "";


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
            type === "thu"
                ? Number(
                    document.getElementById(
                        "appFee"
                    )?.value
                ) || 0
                : 0;


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


        if (
            amount <= 0
        ) {

            showToast(
                "Vui lòng nhập số tiền"
            );

            return;

        }


        /*
         * BIGINT
         */

        const categoryIdNumber =
            categoryId
                ? Number(
                    categoryId
                )
                : null;


        const dishIdNumber =
            dishId
                ? Number(
                    dishId
                )
                : null;


        /*
         * KIỂM TRA ID
         */

        if (
            categoryId &&
            !Number.isInteger(
                categoryIdNumber
            )
        ) {

            console.error(
                "category_id không hợp lệ:",
                categoryId
            );

            showToast(
                "ID danh mục không hợp lệ"
            );

            return;

        }


        if (
            dishId &&
            !Number.isInteger(
                dishIdNumber
            )
        ) {

            console.error(
                "dish_id không hợp lệ:",
                dishId
            );

            showToast(
                "ID món không hợp lệ"
            );

            return;

        }


        /*
         * TÌM CATEGORY
         */

        const category =
            AppState.categories.find(
                item =>
                    Number(
                        item.id
                    ) ===
                    categoryIdNumber
            );


        /*
         * TÌM DISH
         */

        const dish =
            dishIdNumber !== null
                ? AppState.dishes.find(
                    item =>
                        Number(
                            item.id
                        ) ===
                        dishIdNumber
                )
                : null;


        /*
         * PAYLOAD
         */

        const payload = {

            type:
                type,


            category_id:
                categoryIdNumber,


            dish_id:
                dishIdNumber,


            category_name:
                category?.name ||
                "",


            dish_name:
                dish?.name ||
                customName ||
                "Giao dịch",


            source:
                type === "thu"
                    ? (
                        AppState.orderSource ||
                        "ShopeeFood"
                    )
                    : null,


            amount:
                amount,


            app_fee:
                appFee,


            date:
                date,


            note:
                note

        };


        console.log(
            "TRANSACTION PAYLOAD:",
            payload
        );


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
   FORMAT VIETNAMESE DATE
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
