/* =========================================================
   RESTAURANT.JS
   BẾP NHÀ DUYÊN

   CATEGORY:
   - thu
   - chi

   DISH:
   - chỉ thuộc category thu
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


    if (
        !categorySelect ||
        !container
    ) {

        return;

    }


    /* =====================================================
       CATEGORY SELECT CHO THÊM MÓN

       CHỈ HIỆN CATEGORY THU
    ===================================================== */

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


    const incomeCategories =
        categories.filter(
            category =>
                String(
                    category.type ||
                    "thu"
                )
                .trim()
                .toLowerCase() ===
                "thu"
        );


    incomeCategories.forEach(
        category => {

            categorySelect.innerHTML += `

                <option
                    value="${category.id}">

                    ${escapeHTML(
                        category.name
                    )}

                </option>

            `;

        }
    );


    /* =====================================================
       RENDER MENU
    ===================================================== */

    container.innerHTML = "";


    categories.forEach(
        category => {

            const categoryType =
                String(
                    category.type ||
                    "thu"
                )
                .trim()
                .toLowerCase();


            const isIncome =
                categoryType ===
                "thu";


            const isExpense =
                categoryType ===
                "chi";


            /*
             * CHỈ LẤY MÓN NẾU LÀ THU
             */

            const dishes =
                isIncome
                    ? AppState.dishes.filter(
                        dish =>
                            Number(
                                dish.category_id
                            ) ===
                            Number(
                                category.id
                            )
                    )
                    : [];


            container.innerHTML += `

                <div
                    class="restaurant-category
                    ${
                        isExpense
                            ? "expense-category"
                            : "income-category"
                    }">

                    <div class="
                        restaurant-category-header
                    ">

                        <div>

                            <div class="
                                restaurant-category-name
                            ">

                                ${
                                    isIncome
                                        ? "🟢"
                                        : "🔴"
                                }

                                ${escapeHTML(
                                    category.name
                                )}

                            </div>


                            <div class="
                                restaurant-category-type
                            ">

                                ${
                                    isIncome
                                        ? "Danh mục thu"
                                        : "Danh mục chi"
                                }

                            </div>


                            <div class="
                                restaurant-category-count
                            ">

                                ${
                                    isIncome
                                        ? `${dishes.length} món`
                                        : "Dùng cho khoản chi"
                                }

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
                                ">

                                🗑️

                            </button>

                        </div>

                    </div>


                    ${
                        isIncome
                            ? `

                                <div
                                    class="restaurant-dishes">

                                    ${
                                        dishes.length
                                            ? dishes.map(
                                                dish => `

                                                <div
                                                    class="
                                                    restaurant-dish">

                                                    <span
                                                        class="
                                                        restaurant-dish-name">

                                                        🍜
                                                        ${escapeHTML(
                                                            dish.name
                                                        )}

                                                    </span>


                                                    <button
                                                        type="button"
                                                        class="
                                                        restaurant-dish-delete"
                                                        onclick="
                                                            deleteDish(
                                                                '${dish.id}'
                                                            )
                                                        ">

                                                        🗑️

                                                    </button>

                                                </div>

                                            `
                                            ).join("")
                                            : `

                                                <div
                                                    class="
                                                    history-empty">

                                                    Chưa có món.

                                                </div>

                                            `
                                    }

                                </div>

                            `
                            : `

                                <div
                                    class="
                                    restaurant-expense-info">

                                    🔴 Các khoản chi sẽ
                                    sử dụng danh mục này.

                                </div>

                            `
                    }

                </div>

            `;

        }
    );


    setText(
        "restaurantCount",
        `${AppState.dishes.length} món`
    );

}


/* =========================================================
   ADD CATEGORY
========================================================= */

async function addCategory() {

    const input =
        document.getElementById(
            "newCategoryName"
        );


    const typeSelect =
        document.getElementById(
            "newCategoryType"
        );


    if (!input) {

        return;

    }


    const name =
        input.value.trim();


    const type =
        typeSelect?.value === "chi"
            ? "chi"
            : "thu";


    if (!name) {

        showToast(
            "Nhập tên danh mục"
        );

        return;

    }


    /*
     * Kiểm tra trùng tên cùng loại
     */

    const exists =
        AppState.categories.some(
            category =>
                String(
                    category.name || ""
                )
                .trim()
                .toLowerCase() ===
                name.toLowerCase()
                &&
                String(
                    category.type ||
                    "thu"
                )
                .trim()
                .toLowerCase() ===
                type
        );


    if (exists) {

        showToast(
            "Danh mục này đã tồn tại"
        );

        return;

    }


    try {

        await dbInsert(
            "categories",
            {
                name:
                    name,

                type:
                    type
            }
        );


        input.value =
            "";


        if (typeSelect) {

            typeSelect.value =
                "thu";

        }


        AppState.categories =
            await dbGet(
                "categories"
            );


        renderRestaurant();


        /*
         * Cập nhật luôn Home
         */

        renderTransactionCategories();

        renderTransactionDishes();


        showToast(
            type === "thu"
                ? "Đã thêm danh mục Thu"
                : "Đã thêm danh mục Chi"
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


    if (!input) {

        return;

    }


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


    /*
     * Kiểm tra category
     */

    const category =
        AppState.categories.find(
            item =>
                Number(
                    item.id
                ) ===
                Number(
                    categoryId
                )
        );


    if (!category) {

        showToast(
            "Không tìm thấy danh mục"
        );

        return;

    }


    /*
     * KHÔNG CHO THÊM MÓN VÀO CATEGORY CHI
     */

    const categoryType =
        String(
            category.type ||
            "thu"
        )
        .trim()
        .toLowerCase();


    if (
        categoryType !==
        "thu"
    ) {

        showToast(
            "Danh mục Chi không thêm món"
        );

        return;

    }


    /*
     * Kiểm tra trùng món trong category
     */

    const exists =
        AppState.dishes.some(
            dish =>
                Number(
                    dish.category_id
                ) ===
                Number(
                    categoryId
                )
                &&
                String(
                    dish.name || ""
                )
                .trim()
                .toLowerCase() ===
                name.toLowerCase()
        );


    if (exists) {

        showToast(
            "Món này đã tồn tại"
        );

        return;

    }


    try {

        await dbInsert(
            "dishes",
            {
                category_id:
                    Number(
                        categoryId
                    ),

                name:
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


        /*
         * Cập nhật Home
         */

        renderTransactionDishes();


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
   DELETE CATEGORY
========================================================= */

async function deleteCategory(
    id
) {

    /*
     * BIGINT
     */

    const categoryId =
        Number(id);


    /*
     * Kiểm tra món
     */

    const hasDish =
        AppState.dishes.some(
            dish =>
                Number(
                    dish.category_id
                ) ===
                categoryId
        );


    if (hasDish) {

        showToast(
            "Danh mục còn món, không thể xóa"
        );

        return;

    }


    /*
     * Kiểm tra giao dịch
     *
     * Nếu category đang được dùng,
     * vẫn có thể xóa vì FK SET NULL.
     */

    if (
        !confirm(
            "Xóa danh mục này?"
        )
    ) {

        return;

    }


    try {

        await dbDelete(
            "categories",
            categoryId
        );


        AppState.categories =
            AppState.categories.filter(
                category =>
                    Number(
                        category.id
                    ) !==
                    categoryId
            );


        renderRestaurant();


        renderTransactionCategories();

        renderTransactionDishes();


        showToast(
            "Đã xóa danh mục"
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

    const dishId =
        Number(id);


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
            dishId
        );


        AppState.dishes =
            AppState.dishes.filter(
                dish =>
                    Number(
                        dish.id
                    ) !==
                    dishId
            );


        renderRestaurant();


        renderTransactionDishes();


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
