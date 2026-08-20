/* =========================
   HOME
========================= */


/* =========================
   RENDER HOME
========================= */

function renderHome() {

    renderTransactionCategories();
    renderTransactionDishes();
    renderHomeSummary();
}


/* =========================
   CATEGORY SELECT
========================= */

function renderTransactionCategories() {

    const select =
        document.getElementById(
            "transactionCategory"
        );

    if (!select) return;


    const currentValue =
        select.value;


    select.innerHTML = `
        <option value="">
            Chọn danh mục
        </option>
    `;


    const categories =
        Array.isArray(AppState.categories)
            ? AppState.categories
            : [];


    categories.forEach(category => {

        const option =
            document.createElement("option");

        option.value =
            category.id;

        option.textContent =
            category.name || "Không tên";


        select.appendChild(option);

    });


    /*
     * Giữ lại danh mục đang chọn
     * nếu danh mục đó vẫn tồn tại.
     */

    if (
        categories.some(
            category =>
                String(category.id) ===
                String(currentValue)
        )
    ) {

        select.value =
            currentValue;

    }


    /*
     * Khi đổi danh mục,
     * cập nhật danh sách món.
     */

    select.onchange =
        renderTransactionDishes;
}


/* =========================
   DISH SELECT
========================= */

function renderTransactionDishes() {

    const categorySelect =
        document.getElementById(
            "transactionCategory"
        );

    const dishSelect =
        document.getElementById(
            "transactionDish"
        );


    if (!categorySelect ||
        !dishSelect) return;


    const categoryId =
        categorySelect.value;


    const currentDishValue =
        dishSelect.value;


    dishSelect.innerHTML = `
        <option value="">
            Chọn món
        </option>
    `;


    if (!categoryId) {
        return;
    }


    const dishes =
        Array.isArray(AppState.dishes)
            ? AppState.dishes
            : [];


    const categoryDishes =
        dishes.filter(
            dish =>
                String(
                    dish.category_id
                ) ===
                String(categoryId)
        );


    categoryDishes.forEach(dish => {

        const option =
            document.createElement("option");

        option.value =
            dish.id;

        option.textContent =
            dish.name || "Không tên";


        dishSelect.appendChild(option);

    });


    /*
     * Giữ lại món cũ nếu còn tồn tại.
     */

    if (
        categoryDishes.some(
            dish =>
                String(dish.id) ===
                String(currentDishValue)
        )
    ) {

        dishSelect.value =
            currentDishValue;

    }

}


/* =========================
   HOME SUMMARY
========================= */

function renderHomeSummary() {

    const transactions =
        Array.isArray(AppState.transactions)
            ? AppState.transactions
            : [];


    /*
     * TỔNG DOANH THU
     */

    const income =
        transactions
            .filter(
                transaction =>
                    transaction.type === "thu"
            )
            .reduce(
                (sum, transaction) =>
                    sum +
                    Number(
                        transaction.amount || 0
                    ),
                0
            );


    /*
     * TỔNG CHI PHÍ
     */

    const expense =
        transactions
            .filter(
                transaction =>
                    transaction.type === "chi"
            )
            .reduce(
                (sum, transaction) =>
                    sum +
                    Number(
                        transaction.amount || 0
                    ),
                0
            );


    /*
     * PHÍ APP
     */

    const appFee =
        transactions
            .filter(
                transaction =>
                    transaction.type === "thu"
            )
            .reduce(
                (sum, transaction) =>
                    sum +
                    Number(
                        transaction.app_fee || 0
                    ),
                0
            );


    /*
     * GIÁ VỐN COD
     */

    const cost =
        calculateHomeCODCost(
            transactions
        );


    /*
     * LỢI NHUẬN THỰC
     */

    const profit =
        income -
        expense -
        appFee -
        cost;


    setText(
        "homeRevenue",
        formatMoney(income)
    );


    setText(
        "homeExpense",
        formatMoney(expense)
    );


    setText(
        "homeOrders",
        transactions.filter(
            transaction =>
                transaction.type === "thu"
        ).length
    );


    setText(
        "homeProfit",
        formatMoney(profit)
    );


    /*
     * HÔM NAY
     */

    const today =
        getLocalDateString();


    const todayTransactions =
        transactions.filter(
            transaction =>
                transaction.date === today
        );


    const todayIncome =
        todayTransactions
            .filter(
                transaction =>
                    transaction.type === "thu"
            )
            .reduce(
                (sum, transaction) =>
                    sum +
                    Number(
                        transaction.amount || 0
                    ),
                0
            );


    const todayExpense =
        todayTransactions
            .filter(
                transaction =>
                    transaction.type === "chi"
            )
            .reduce(
                (sum, transaction) =>
                    sum +
                    Number(
                        transaction.amount || 0
                    ),
                0
            );


    const todayFee =
        todayTransactions
            .reduce(
                (sum, transaction) =>
                    sum +
                    Number(
                        transaction.app_fee || 0
                    ),
                0
            );


    const todayCost =
        calculateHomeCODCost(
            todayTransactions
        );


    setText(
        "todayRevenue",
        formatMoney(todayIncome)
    );


    setText(
        "todayExpense",
        formatMoney(todayExpense)
    );


    setText(
        "todayAppFee",
        formatMoney(todayFee)
    );


    setText(
        "todayCost",
        formatMoney(todayCost)
    );

}


/* =========================
   COD COST
========================= */

function calculateHomeCODCost(
    transactions
) {

    let total = 0;


    if (!Array.isArray(transactions)) {
        return 0;
    }


    transactions.forEach(
        transaction => {

            if (
                transaction.type !== "thu"
            ) {
                return;
            }


            const dish =
                AppState.dishes.find(
                    item =>
                        String(item.id) ===
                        String(
                            transaction.dish_id
                        )
                );


            if (!dish) return;


            const parts =
                Array.isArray(
                    dish.cod_parts
                )
                    ? dish.cod_parts
                    : [];


            parts.forEach(part => {

                total +=
                    Number(
                        part.amount || 0
                    );

            });

        }
    );


    return total;
}


/* =========================
   LOCAL DATE
========================= */

function getLocalDateString() {

    const now =
        new Date();


    const year =
        now.getFullYear();


    const month =
        String(
            now.getMonth() + 1
        ).padStart(2, "0");


    const day =
        String(
            now.getDate()
        ).padStart(2, "0");


    return `${year}-${month}-${day}`;
}


/* =========================
   TRANSACTION TYPE
========================= */

function setTransactionType(
    type
) {

    AppState.transactionType =
        type;


    const thu =
        document.getElementById(
            "incomeTypeButton"
        );


    const chi =
        document.getElementById(
            "expenseTypeButton"
        );


    if (thu) {

        thu.classList.toggle(
            "active",
            type === "thu"
        );

    }


    if (chi) {

        chi.classList.toggle(
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

}


/* =========================
   ORDER SOURCE
========================= */

function setOrderSource(
    source
) {

    AppState.orderSource =
        source;


    document
        .querySelectorAll(
            ".source-button"
        )
        .forEach(button => {

            button.classList.remove(
                "active"
            );

        });


    const sourceMap = {

        "ShopeeFood":
            "sourceShopee",

        "GrabFood":
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


/* =========================
   SAVE TRANSACTION
========================= */

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
        .trim() || "";


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
        .trim() || "";


    if (amount <= 0) {

        showToast(
            "Vui lòng nhập số tiền"
        );

        return;
    }


    const dish =
        AppState.dishes.find(
            item =>
                String(item.id) ===
                String(dishId)
        );


    const category =
        AppState.categories.find(
            item =>
                String(item.id) ===
                String(categoryId)
        );


    const payload = {

        type:
            AppState.transactionType,

        category_id:
            categoryId || null,

        dish_id:
            dishId || null,

        category_name:
            category?.name || "",

        dish_name:
            dish?.name ||
            customName ||
            "Giao dịch",

        source:
            AppState.transactionType === "thu"
                ? AppState.orderSource
                : null,

        amount,

        app_fee:
            AppState.transactionType === "thu"
                ? appFee
                : 0,

        date,

        note

    };


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

        } else {

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
                        column: "date",
                        ascending: false
                    }
                }
            );


        clearTransactionForm();

        renderAll();


    } catch (error) {

        console.error(
            "Lỗi saveTransaction:",
            error
        );

    }

}


/* =========================
   CLEAR FORM
========================= */

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

    setTransactionType("thu");

    setOrderSource(
        "ShopeeFood"
    );

}


/* =========================
   CANCEL EDIT
========================= */

function cancelEdit() {

    clearTransactionForm();

    showToast(
        "Đã hủy sửa"
    );

}
