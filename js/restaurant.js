/* =========================================================
   RESTAURANT.JS
   BẾP NHÀ DUYÊN
   QUẢN LÝ DANH MỤC THU + DANH MỤC CHI
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


    if (!categorySelect || !container) {

        return;

    }


    /*
     * =========================
     * SELECT DANH MỤC MÓN
     * CHỈ HIỂN THỊ DANH MỤC THU
     * =========================
     */

    categorySelect.innerHTML = `
        <option value="">
            Chọn danh mục
        </option>
    `;


    const categories =
        Array.isArray(AppState.categories)
            ? AppState.categories
            : [];


    const incomeCategories =
        categories.filter(
            category =>
                String(
                    category.type || "thu"
                ).toLowerCase() === "thu"
        );


    incomeCategories.forEach(
        category => {

            const option =
                document.createElement("option");

            option.value =
                String(category.id);

            option.textContent =
                category.name || "Không tên";

            categorySelect.appendChild(
                option
            );

        }
    );


    /*
     * =========================
     * RENDER MENU
     * =========================
     */

    container.innerHTML = "";


    categories.forEach(
        category => {

            const categoryType =
                String(
                    category.type || "thu"
                )
                .trim()
                .toLowerCase();


            const dishes =
                Array.isArray(AppState.dishes)
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


            const typeLabel =
                categoryType === "chi"
                    ? "🔴 PHẦN CHI"
                    : "🟢 PHẦN THU";


            const typeClass =
                categoryType === "chi"
                    ? "expense"
                    : "income";


            container.innerHTML += `

                <div
                    class="restaurant-category
                           restaurant-category-${typeClass}">

                    <div class="
                        restaurant-category-header
                    ">

                        <div>

                            <div class="
                                restaurant-category-name
                            ">

                                📁
                                ${escapeHTML(
                                    category.name || "Không tên"
                                )}

                            </div>


                            <div class="
                                restaurant-category-type
                            ">

                                ${typeLabel}

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
                                aria-label="Xóa danh mục">

                                🗑️

                            </button>

                        </div>

                    </div>


                    <div class="restaurant-dishes">

                        ${
                            dishes.length

                                ? dishes.map(
                                    dish => `

                                    <div class="
                                        restaurant-dish
                                    ">

                                        <span class="
                                            restaurant-dish-name
                                        ">

                                            🍜
                                            ${escapeHTML(
                                                dish.name || "Không tên"
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
                                            aria-label="Xóa món">

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


    /*
     * =========================
     * COUNT
     * =========================
     */

    setText(
        "restaurantCount",
        `${AppState.dishes.length} món`
    );

}


/* =========================================================
   ADD CATEGORY
========================================================= */

async function addCategory(
    type = "thu"
) {

    const input =
        document.getElementById(
            "newCategoryName"
        );


    if (!input) {

        return;

    }


    const name =
        input.value.trim();


    if (!name) {

        showToast(
            "Nhập tên danh mục"
        );

        return;

    }


    const normalizedType =
        type === "chi"
            ? "chi"
            : "thu";


    try {

        await dbInsert(
            "categories",
            {
                name,
                type: normalizedType
            }
        );


        input.value = "";


        AppState.categories =
            await dbGet(
                "categories",
                {
                    order: {
                        column: "created_at",
                        ascending: true
                    }
                }
            );


        renderRestaurant();


        /*
         * Cập nhật Home luôn
         */

        if (
            typeof renderHome ===
            "function"
        ) {

            renderHome();

        }


        showToast(
            normalizedType === "chi"
                ? "Đã thêm danh mục chi"
                : "Đã thêm danh mục thu"
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
   ADD INCOME CATEGORY
========================================================= */

async function addIncomeCategory() {

    await addCategory(
        "thu"
    );

}


/* =========================================================
   ADD EXPENSE CATEGORY
========================================================= */

async function addExpenseCategory() {

    await addCategory(
        "chi"
    );

}


/* =========================================================
   ADD DISH
   CHỈ CHO PHÉP THÊM MÓN VÀO DANH MỤC THU
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


    const name =
        input?.value.trim() || "";


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
     * category_id phải là BIGINT
     */

    const category =
        AppState.categories.find(
            item =>
                String(item.id) ===
                String(categoryId)
        );


    if (!category) {

        showToast(
            "Không tìm thấy danh mục"
        );

        return;

    }


    /*
     * Không cho thêm món vào danh mục chi
     */

    if (
        String(
            category.type || "thu"
        ).toLowerCase() ===
        "chi"
    ) {

        showToast(
            "Danh mục chi không thêm món"
        );

        return;

    }


    try {

        await dbInsert(
            "dishes",
            {
                category_id:
                    Number(categoryId),

                name
            }
        );


        input.value = "";


        AppState.dishes =
            await dbGet(
                "dishes",
                {
                    order: {
                        column: "created_at",
                        ascending: true
                    }
                }
            );


        renderRestaurant();


        if (
            typeof renderHome ===
            "function"
        ) {

            renderHome();

        }


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
            "Xóa danh mục này?"
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
                    String(category.id) !==
                    String(id)
            );


        renderRestaurant();


        if (
            typeof renderHome ===
            "function"
        ) {

            renderHome();

        }


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
                    String(dish.id) !==
                    String(id)
            );


        renderRestaurant();


        if (
            typeof renderHome ===
            "function"
        ) {

            renderHome();

        }


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
   HELPER
========================================================= */

function getCategoryType(
    category
) {

    if (!category) {

        return "thu";

    }


    return String(
        category.type || "thu"
    )
    .trim()
    .toLowerCase();

}
