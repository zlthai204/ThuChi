function setTransactionType(type) {

    AppState.transactionType = type;

    const thu =
        document.getElementById(
            "incomeTypeButton"
        );

    const chi =
        document.getElementById(
            "expenseTypeButton"
        );


    thu.classList.toggle(
        "active",
        type === "thu"
    );

    chi.classList.toggle(
        "active",
        type === "chi"
    );


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

    sourceBox.style.display =
        isIncome
            ? "block"
            : "none";

    feeBox.style.display =
        isIncome
            ? "block"
            : "none";

}


/* SOURCE */

function setOrderSource(source) {

    AppState.orderSource = source;

    document
        .querySelectorAll(".source-button")
        .forEach(button => {

            button.classList.remove(
                "active"
            );

        });


    if (source === "ShopeeFood") {

        document
            .getElementById(
                "sourceShopee"
            )
            .classList.add("active");

    }

    if (source === "GrabFood") {

        document
            .getElementById(
                "sourceGrab"
            )
            .classList.add("active");

    }

    if (source === "Ngoài sàn") {

        document
            .getElementById(
                "sourceOutside"
            )
            .classList.add("active");

    }

}


/* SAVE */

async function saveTransaction() {

    const categoryId =
        document.getElementById(
            "transactionCategory"
        ).value;

    const dishId =
        document.getElementById(
            "transactionDish"
        ).value;

    const customName =
        document.getElementById(
            "transactionName"
        ).value.trim();

    const amount =
        Number(
            document.getElementById(
                "transactionAmount"
            ).value
        );

    const appFee =
        Number(
            document.getElementById(
                "appFee"
            ).value
        ) || 0;

    const date =
        document.getElementById(
            "transactionDate"
        ).value;

    const note =
        document.getElementById(
            "transactionNote"
        ).value.trim();


    if (!amount || amount <= 0) {

        showToast(
            "Vui lòng nhập số tiền"
        );

        return;
    }


    const dish =
        AppState.dishes.find(
            d => d.id == dishId
        );

    const category =
        AppState.categories.find(
            c => c.id == categoryId
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

        console.error(error);

    }

}


/* CLEAR */

function clearTransactionForm() {

    document.getElementById(
        "transactionCategory"
    ).value = "";

    document.getElementById(
        "transactionDish"
    ).innerHTML =
        `<option value="">Chọn món</option>`;

    document.getElementById(
        "transactionName"
    ).value = "";

    document.getElementById(
        "appFee"
    ).value = "";

    document.getElementById(
        "transactionAmount"
    ).value = "";

    document.getElementById(
        "transactionNote"
    ).value = "";

    AppState.editingTransactionId =
        null;

    document.getElementById(
        "cancelEditButton"
    ).style.display = "none";

    setTransactionType("thu");

}


/* HOME */

function renderHome() {

    const income =
        AppState.transactions
            .filter(t => t.type === "thu")
            .reduce(
                (sum, t) =>
                    sum + Number(t.amount || 0),
                0
            );


    const expense =
        AppState.transactions
            .filter(t => t.type === "chi")
            .reduce(
                (sum, t) =>
                    sum + Number(t.amount || 0),
                0
            );


    const appFee =
        AppState.transactions
            .filter(t => t.type === "thu")
            .reduce(
                (sum, t) =>
                    sum + Number(t.app_fee || 0),
                0
            );


    const profit =
        income -
        expense -
        appFee;


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
        AppState.transactions
            .filter(t => t.type === "thu")
            .length
    );

    setText(
        "homeProfit",
        formatMoney(profit)
    );


    const today =
        new Date()
            .toISOString()
            .split("T")[0];


    const todayTransactions =
        AppState.transactions
            .filter(
                t => t.date === today
            );


    const todayIncome =
        todayTransactions
            .filter(t => t.type === "thu")
            .reduce(
                (s, t) =>
                    s + Number(t.amount || 0),
                0
            );


    const todayExpense =
        todayTransactions
            .filter(t => t.type === "chi")
            .reduce(
                (s, t) =>
                    s + Number(t.amount || 0),
                0
            );


    const todayFee =
        todayTransactions
            .reduce(
                (s, t) =>
                    s + Number(t.app_fee || 0),
                0
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

}
