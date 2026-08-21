/* =========================================================
   RESTAURANT.JS
   BẾP NHÀ DUYÊN

   QUẢN LÝ:
   1. Danh mục món THU
   2. Món ăn
   3. Danh mục riêng cho CHI
========================================================= */


/* =========================================================
   LOAD EXPENSE CATEGORIES
========================================================= */

async function loadExpenseCategories() {

    try {

        AppState.expenseCategories =
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


        return (
            AppState.expenseCategories
        );

    }
    catch (error) {

        console.error(
            "Lỗi load danh mục Chi:",
            error
        );


        AppState.expenseCategories =
            [];


        return [];

    }

}


/* =========================================================
   RENDER RESTAURANT
========================================================= */

async function renderRestaurant() {

    const categorySelect =
        document.getElementById(
            "dishCategorySelect"
        );


    const container =
        document.getElementById(
            "restaurantMenuList"
        );


    if (
        !categorySelect ||
        !container
    ) {

        return;

    }


    /*
     * =====================================================
     * SELECT DANH MỤC MÓN
     * =====================================================
     */

    categorySelect.innerHTML = `
        <option value="">
            Chọn danh mục món
        </option>
    `;


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


            categorySelect.appendChild(
                option
            );

        }
    );


    /*
     * =====================================================
     * MENU MÓN
     * =====================================================
     */

    container.innerHTML =
        "";


    categories.forEach(
        category => {

            const dishes =
                Array.isArray(
                    AppState.dishes
                )
                    ? AppState.dishes.filter(
                        dish =>
                            String(
                                dish.category_id
                            ) ===
                            String(
                                category.id
                            )
                    )
                    : [];


            const categoryDiv =
                document.createElement(
                    "div"
                );


            categoryDiv.className =
                "restaurant-category";


            /*
             * Header
             */

            const header =
                document.createElement(
                    "div"
                );


            header.className =
                "restaurant-category-header";


            const info =
                document.createElement(
                    "div"
                );


            const name =
                document.createElement(
                    "div"
                );


            name.className =
                "restaurant-category-name";


            name.textContent =
                `📁 ${category.name || "Không tên"}`;


            const count =
                document.createElement(
                    "div"
                );


            count.className =
                "restaurant-category-count";


            count.textContent =
                `${dishes.length} món`;


            info.appendChild(
                name
            );


            info.appendChild(
                count
            );


            /*
             * Actions
             */

            const actions =
                document.createElement(
                    "div"
                );


            actions.className =
                "restaurant-category-actions";


            const deleteButton =
                document.createElement(
                    "button"
                );


            deleteButton.type =
                "button";


            deleteButton.textContent =
                "🗑️";


            deleteButton.title =
                "Xóa danh mục";


            deleteButton.onclick =
                function () {

                    deleteCategory(
                        category.id
                    );

                };


            actions.appendChild(
                deleteButton
            );


            header.appendChild(
                info
            );


            header.appendChild(
                actions
            );


            categoryDiv.appendChild(
                header
            );


            /*
             * =================================================
             * DISH LIST
             * =================================================
             */

            const dishContainer =
                document.createElement(
                    "div"
                );


            dishContainer.className =
                "restaurant-dishes";


            if (
                dishes.length === 0
            ) {

                const empty =
                    document.createElement(
                        "div"
                    );


                empty.className =
                    "history-empty";


                empty.textContent =
                    "Chưa có món.";


                dishContainer.appendChild(
                    empty
                );

            }
            else {

                dishes.forEach(
                    dish => {

                        const row =
                            document.createElement(
                                "div"
                            );


                        row.className =
                            "restaurant-dish";


                        const dishName =
                            document.createElement(
                                "span"
                            );


                        dishName.className =
                            "restaurant-dish-name";


                        dishName.textContent =
                            `🍜 ${dish.name || "Không tên"}`;


                        const deleteDishButton =
                            document.createElement(
                                "button"
                            );


                        deleteDishButton.type =
                            "button";


                        deleteDishButton.className =
                            "restaurant-dish-delete";


                        deleteDishButton.textContent =
                            "🗑️";


                        deleteDishButton.title =
                            "Xóa món";


                        deleteDishButton.onclick =
                            function () {

                                deleteDish(
                                    dish.id
                                );

                            };


                        row.appendChild(
                            dishName
                        );


                        row.appendChild(
                            deleteDishButton
                        );


                        dishContainer.appendChild(
                            row
                        );

                    }
                );

            }


            categoryDiv.appendChild(
                dishContainer
            );


            container.appendChild(
                categoryDiv
            );

        }
    );


    setText(
        "restaurantCount",
        `${AppState.dishes.length} món`
    );


    /*
     * =====================================================
     * DANH MỤC CHI
     * =====================================================
     */

    await loadExpenseCategories();

    renderExpenseCategories();

}


/* =========================================================
   ADD CATEGORY MÓN
========================================================= */

async function addCategory() {

    const input =
        document.getElementById(
            "newCategoryName"
        );


    if (!input) return;


    const name =
        input.value.trim();


    if (!name) {

        showToast(
            "Nhập tên danh mục món"
        );

        return;

    }


    try {

        await dbInsert(
            "categories",
            {
                name
            }
        );


        input.value =
            "";


        AppState.categories =
            await dbGet(
                "categories"
            );


        renderRestaurant();


        showToast(
            "Đã thêm danh mục món"
        );

    }
    catch (error) {

        console.error(
            "Lỗi addCategory:",
            error
        );

    }

}


/* =========================================================
   ADD DISH
========================================================= */

async function addDish() {

    const categoryId =
        document.getElementById(
            "dishCategorySelect"
        )?.value || "";


    const input =
        document.getElementById(
            "newDishName"
        );


    if (!input) return;


    const name =
        input.value.trim();


    if (!categoryId) {

        showToast(
            "Chọn danh mục món"
        );

        return;

    }


    if (!name) {

        showToast(
            "Nhập tên món"
        );

        return;

    }


    try {

        await dbInsert(
            "dishes",
            {
                category_id:
                    categoryId,

                name
            }
        );


        input.value =
            "";


        AppState.dishes =
            await dbGet(
                "dishes"
            );


        renderRestaurant();


        showToast(
            "Đã thêm món"
        );

    }
    catch (error) {

        console.error(
            "Lỗi addDish:",
            error
        );

    }

}


/* =========================================================
   DELETE CATEGORY MÓN
========================================================= */

async function deleteCategory(
    id
) {

    const hasDish =
        Array.isArray(
            AppState.dishes
        ) &&
        AppState.dishes.some(
            dish =>
                String(
                    dish.category_id
                ) ===
                String(
                    id
                )
        );


    if (hasDish) {

        showToast(
            "Danh mục còn món, không thể xóa"
        );

        return;

    }


    if (
        !confirm(
            "Xóa danh mục món này?"
        )
    ) {

        return;

    }


    try {

        await dbDelete(
            "categories",
            id
        );


        AppState.categories =
            AppState.categories.filter(
                category =>
                    String(
                        category.id
                    ) !==
                    String(
                        id
                    )
            );


        renderRestaurant();


        showToast(
            "Đã xóa danh mục món"
        );

    }
    catch (error) {

        console.error(
            "Lỗi deleteCategory:",
            error
        );

    }

}


/* =========================================================
   DELETE DISH
========================================================= */

async function deleteDish(
    id
) {

    if (
        !confirm(
            "Xóa món này?"
        )
    ) {

        return;

    }


    try {

        await dbDelete(
            "dishes",
            id
        );


        AppState.dishes =
            AppState.dishes.filter(
                dish =>
                    String(
                        dish.id
                    ) !==
                    String(
                        id
                    )
            );


        renderRestaurant();


        showToast(
            "Đã xóa món"
        );

    }
    catch (error) {

        console.error(
            "Lỗi deleteDish:",
            error
        );

    }

}


/* =========================================================
   RENDER EXPENSE CATEGORIES
========================================================= */

function renderExpenseCategories() {

    const container =
        document.getElementById(
            "expenseCategoryList"
        );


    if (!container) {

        return;

    }


    container.innerHTML =
        "";


    const categories =
        Array.isArray(
            AppState.expenseCategories
        )
            ? AppState.expenseCategories
            : [];


    if (
        categories.length === 0
    ) {

        container.innerHTML = `
            <div class="history-empty">
                Chưa có danh mục chi.
            </div>
        `;

        return;

    }


    categories.forEach(
        category => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "expense-category-row";


            const info =
                document.createElement(
                    "div"
                );


            info.className =
                "expense-category-info";


            const name =
                document.createElement(
                    "strong"
                );


            name.textContent =
                `📁 ${category.name || "Không tên"}`;


            info.appendChild(
                name
            );


            const deleteButton =
                document.createElement(
                    "button"
                );


            deleteButton.type =
                "button";


            deleteButton.className =
                "expense-category-delete";


            deleteButton.textContent =
                "🗑️";


            deleteButton.title =
                "Xóa danh mục chi";


            deleteButton.onclick =
                function () {

                    deleteExpenseCategory(
                        category.id
                    );

                };


            row.appendChild(
                info
            );


            row.appendChild(
                deleteButton
            );


            container.appendChild(
                row
            );

        }
    );

}


/* =========================================================
   ADD EXPENSE CATEGORY
========================================================= */

async function addExpenseCategory() {

    const input =
        document.getElementById(
            "newExpenseCategoryName"
        );


    if (!input) {

        return;

    }


    const name =
        input.value.trim();


    if (!name) {

        showToast(
            "Nhập tên danh mục chi"
        );

        return;

    }


    try {

        await dbInsert(
            "expense_categories",
            {
                name
            }
        );


        input.value =
            "";


        await loadExpenseCategories();


        renderExpenseCategories();


        /*
         * Nếu đang ở form Chi
         * thì cập nhật lại danh mục.
         */

        if (
            AppState.transactionType ===
            "chi"
        ) {

            renderTransactionCategories();

        }


        showToast(
            "Đã thêm danh mục chi"
        );

    }
    catch (error) {

        console.error(
            "Lỗi addExpenseCategory:",
            error
        );

    }

}


/* =========================================================
   DELETE EXPENSE CATEGORY
========================================================= */

async function deleteExpenseCategory(
    id
) {

    /*
     * Kiểm tra giao dịch đã sử dụng
     * danh mục này chưa.
     */

    const transactions =
        Array.isArray(
            AppState.transactions
        )
            ? AppState.transactions
            : [];


    const used =
        transactions.some(
            transaction =>
                normalizeTransactionType(
                    transaction.type
                ) === "chi" &&
                String(
                    transaction.category_id
                ) ===
                String(
                    id
                )
        );


    if (used) {

        showToast(
            "Danh mục đã có giao dịch, không thể xóa"
        );

        return;

    }


    if (
        !confirm(
            "Xóa danh mục chi này?"
        )
    ) {

        return;

    }


    try {

        await dbDelete(
            "expense_categories",
            id
        );


        AppState.expenseCategories =
            AppState.expenseCategories.filter(
                category =>
                    String(
                        category.id
                    ) !==
                    String(
                        id
                    )
            );


        renderExpenseCategories();


        if (
            AppState.transactionType ===
            "chi"
        ) {

            renderTransactionCategories();

        }


        showToast(
            "Đã xóa danh mục chi"
        );

    }
    catch (error) {

        console.error(
            "Lỗi deleteExpenseCategory:",
            error
        );

    }

}


/* =========================================================
   END RESTAURANT.JS
========================================================= */
