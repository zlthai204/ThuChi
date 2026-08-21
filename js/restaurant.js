javascript
/* =========================================================
   RESTAURANT.JS
   BẾP NHÀ DUYÊN
========================================================= */


/* =========================================================
   RENDER RESTAURANT
========================================================= */

function renderRestaurant() {

    const categorySelect =
        document.getElementById(
            "dishCategorySelect"
        );


    const container =
        document.getElementById(
            "restaurantMenuList"
        );


    /*
     * DROPDOWN DANH MỤC MÓN
     */

    if (categorySelect) {

        categorySelect.innerHTML = `
            <option value="">
                Chọn danh mục
            </option>
        `;


        const incomeCategories =
            Array.isArray(
                AppState.categories
            )
                ? AppState.categories.filter(
                    category =>
                        String(
                            category.type ||
                            "thu"
                        )
                        .toLowerCase() ===
                        "thu"
                )
                : [];


        incomeCategories.forEach(
            category => {

                categorySelect.innerHTML += `

                    <option
                        value="${category.id}"
                    >
                        ${escapeHTML(
                            category.name
                        )}
                    </option>

                `;

            }
        );

    }


    /*
     * DANH SÁCH MÓN
     */

    if (container) {

        container.innerHTML = "";


        const incomeCategories =
            Array.isArray(
                AppState.categories
            )
                ? AppState.categories.filter(
                    category =>
                        String(
                            category.type ||
                            "thu"
                        )
                        .toLowerCase() ===
                        "thu"
                )
                : [];


        incomeCategories.forEach(
            category => {

                const dishes =
                    AppState.dishes.filter(
                        dish =>
                            String(
                                dish.category_id
                            ) ===
                            String(
                                category.id
                            )
                    );


                container.innerHTML += `

                    <div class="restaurant-category">

                        <div class="
                            restaurant-category-header
                        ">

                            <div>

                                <div class="
                                    restaurant-category-name
                                ">
                                    📁
                                    ${escapeHTML(
                                        category.name
                                    )}
                                </div>

                                <div class="
                                    restaurant-category-count
                                ">
                                    ${dishes.length} món
                                </div>

                            </div>


                            <div class="
                                restaurant-category-actions
                            ">

                                <button
                                    type="button"
                                    onclick="
                                        deleteCategory(
                                            '${category.id}'
                                        )
                                    "
                                    title="Xóa danh mục">

                                    🗑️

                                </button>

                            </div>

                        </div>


                        <div class="restaurant-dishes">

                            ${
                                dishes.length
                                    ? dishes.map(
                                        dish => `

                                        <div class="restaurant-dish">

                                            <span class="
                                                restaurant-dish-name
                                            ">
                                                🍜
                                                ${escapeHTML(
                                                    dish.name
                                                )}
                                            </span>


                                            <button
                                                type="button"
                                                class="
                                                    restaurant-dish-delete
                                                "
                                                onclick="
                                                    deleteDish(
                                                        '${dish.id}'
                                                    )
                                                "
                                                title="Xóa món">

                                                🗑️

                                            </button>

                                        </div>

                                    `
                                    ).join("")
                                    : `
                                        <div class="
                                            history-empty
                                        ">
                                            Chưa có món.
                                        </div>
                                    `
                            }

                        </div>

                    </div>

                `;

            }
        );

    }


    /*
     * Tổng món
     */

    setText(
        "restaurantCount",
        `${AppState.dishes.length} món`
    );


    /*
     * Render danh mục CHI
     */

    renderExpenseCategories();

}


/* =========================================================
   RENDER EXPENSE CATEGORIES
========================================================= */

function renderExpenseCategories() {

    const container =
        document.getElementById(
            "expenseCategoryList"
        );


    if (!container) return;


    const categories =
        Array.isArray(
            AppState.categories
        )
            ? AppState.categories
            : [];


    const expenseCategories =
        categories.filter(
            category =>
                String(
                    category.type ||
                    "thu"
                )
                .trim()
                .toLowerCase() ===
                "chi"
        );


    container.innerHTML = "";


    if (
        expenseCategories.length ===
        0
    ) {

        container.innerHTML = `

            <div class="history-empty">

                Chưa có danh mục khoản chi.

            </div>

        `;

    }


    expenseCategories.forEach(
        category => {

            container.innerHTML += `

                <div class="restaurant-category">

                    <div class="
                        restaurant-category-header
                    ">

                        <div>

                            <div class="
                                restaurant-category-name
                            ">
                                💸
                                ${escapeHTML(
                                    category.name
                                )}
                            </div>

                            <div class="
                                restaurant-category-count
                            ">
                                Danh mục chi
                            </div>

                        </div>


                        <div class="
                            restaurant-category-actions
                        ">

                            <button
                                type="button"
                                onclick="
                                    deleteExpenseCategory(
                                        '${category.id}'
                                    )
                                "
                                title="Xóa danh mục chi">

                                🗑️

                            </button>

                        </div>

                    </div>

                </div>

            `;

        }
    );


    setText(
        "expenseCategoryCount",
        `${expenseCategories.length} danh mục`
    );

}


/* =========================================================
   ADD CATEGORY - THU
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
            "Nhập tên danh mục"
        );

        return;

    }


    try {

        await dbInsert(
            "categories",
            {
                name,
                type: "thu"
            }
        );


        input.value = "";


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
   ADD CATEGORY - CHI
========================================================= */

async function addExpenseCategory() {

    const input =
        document.getElementById(
            "newExpenseCategoryName"
        );


    if (!input) return;


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
            "categories",
            {
                name,
                type: "chi"
            }
        );


        input.value = "";


        AppState.categories =
            await dbGet(
                "categories"
            );


        renderRestaurant();


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
            "Chọn danh mục"
        );

        return;

    }


    if (!name) {

        showToast(
            "Nhập tên món"
        );

        return;

    }


    /*
     * Kiểm tra category phải là THU
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


    if (
        !category ||
        String(
            category.type ||
            "thu"
        ).toLowerCase() !==
        "thu"
    ) {

        showToast(
            "Chỉ có thể thêm món vào danh mục Thu"
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


        input.value = "";


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
   DELETE CATEGORY - THU
========================================================= */

async function deleteCategory(
    id
) {

    const hasDish =
        AppState.dishes.some(
            dish =>
                String(
                    dish.category_id
                ) ===
                String(id)
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
                    String(id)
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
   DELETE CATEGORY - CHI
========================================================= */

async function deleteExpenseCategory(
    id
) {

    /*
     * Không cho xóa nếu đã có giao dịch
     * thuộc danh mục này.
     */

    const hasTransaction =
        Array.isArray(
            AppState.transactions
        )
            ? AppState.transactions.some(
                transaction =>
                    String(
                        transaction.category_id
                    ) ===
                    String(id)
            )
            : false;


    if (hasTransaction) {

        showToast(
            "Danh mục đã có giao dịch, không thể xóa"
        );

        return;

    }


    if (
        !confirm(
            "Xóa danh mục khoản chi này?"
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
                    String(id)
            );


        renderRestaurant();


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
                    String(id)
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
