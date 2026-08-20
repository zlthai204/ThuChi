let statisticsPeriod = "day";

let statisticsDate = new Date();


function setStatisticsPeriod(period) {

    statisticsPeriod = period;

    document
        .querySelectorAll(".period-tab")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.period === period
            );

        });

    renderStatistics();

}


/* =========================
   DATE RANGE
========================= */

function getStatisticsRange() {

    const date =
        new Date(statisticsDate);

    let start;
    let end;


    if (statisticsPeriod === "day") {

        start =
            new Date(date);

        end =
            new Date(date);

    }


    if (statisticsPeriod === "week") {

        const day =
            date.getDay();

        const diff =
            day === 0
                ? -6
                : 1 - day;

        start =
            new Date(date);

        start.setDate(
            date.getDate() + diff
        );

        end =
            new Date(start);

        end.setDate(
            start.getDate() + 6
        );

    }


    if (statisticsPeriod === "month") {

        start =
            new Date(
                date.getFullYear(),
                date.getMonth(),
                1
            );

        end =
            new Date(
                date.getFullYear(),
                date.getMonth() + 1,
                0
            );

    }


    return {
        start: formatDate(start),
        end: formatDate(end)
    };

}


/* =========================
   RENDER
========================= */

function renderStatistics() {

    const range =
        getStatisticsRange();


    const transactions =
        AppState.transactions.filter(
            transaction => {

                return (
                    transaction.date >=
                        range.start &&
                    transaction.date <=
                        range.end
                );

            }
        );


    const income =
        transactions
            .filter(t => t.type === "thu");


    const expenses =
        transactions
            .filter(t => t.type === "chi");


    const revenue =
        income.reduce(
            (sum, t) =>
                sum + Number(t.amount || 0),
            0
        );


    const expense =
        expenses.reduce(
            (sum, t) =>
                sum + Number(t.amount || 0),
            0
        );


    const shopeeFee =
        income
            .filter(
                t => t.source === "ShopeeFood"
            )
            .reduce(
                (sum, t) =>
                    sum + Number(t.app_fee || 0),
                0
            );


    const grabFee =
        income
            .filter(
                t => t.source === "GrabFood"
            )
            .reduce(
                (sum, t) =>
                    sum + Number(t.app_fee || 0),
                0
            );


    /*
       COD sẽ được tính từ món bán.
    */

    const codCost =
        calculatePeriodCODCost(
            income
        );


    const profit =
        revenue -
        codCost -
        expense -
        shopeeFee -
        grabFee;


    setText(
        "statisticsRevenue",
        formatMoney(revenue)
    );

    setText(
        "statisticsCOD",
        formatMoney(codCost)
    );

    setText(
        "statisticsExpense",
        formatMoney(expense)
    );

    setText(
        "statisticsShopeeFee",
        formatMoney(shopeeFee)
    );

    setText(
        "statisticsGrabFee",
        formatMoney(grabFee)
    );

    setText(
        "statisticsProfit",
        formatMoney(profit)
    );


    renderStatisticsDishes(
        income
    );

    renderStatisticsSources(
        income
    );

    renderStatisticsChart(
        transactions
    );


    setText(
        "statisticsPeriodLabel",
        getPeriodLabel()
    );

}


/* =========================
   COD COST
========================= */

function calculatePeriodCODCost(
    transactions
) {

    let total = 0;


    transactions.forEach(
        transaction => {

            const dish =
                AppState.dishes.find(
                    d =>
                        d.id ==
                        transaction.dish_id
                );


            if (!dish) return;


            const parts =
                dish.cod_parts || [];


            const cost =
                parts.reduce(
                    (sum, part) =>
                        sum +
                        Number(
                            part.amount || 0
                        ),
                    0
                );


            total += cost;

        }
    );


    return total;

}


/* =========================
   DISH DETAIL
========================= */

function renderStatisticsDishes(
    transactions
) {

    const container =
        document.getElementById(
            "statisticsDishList"
        );

    if (!container) return;


    const map = {};


    transactions.forEach(
        transaction => {

            const name =
                transaction.dish_name ||
                "Không tên";


            if (!map[name]) {

                map[name] = {

                    quantity: 0,

                    revenue: 0,

                    fee: 0,

                    cost: 0

                };

            }


            map[name].quantity++;

            map[name].revenue +=
                Number(
                    transaction.amount || 0
                );

            map[name].fee +=
                Number(
                    transaction.app_fee || 0
                );


            const dish =
                AppState.dishes.find(
                    d =>
                        d.id ==
                        transaction.dish_id
                );


            if (dish) {

                map[name].cost +=
                    (dish.cod_parts || [])
                        .reduce(
                            (sum, part) =>
                                sum +
                                Number(
                                    part.amount || 0
                                ),
                            0
                        );

            }

        }
    );


    container.innerHTML = "";


    Object.entries(map)
        .forEach(
            ([name, item]) => {

                const profit =
                    item.revenue -
                    item.fee -
                    item.cost;


                container.innerHTML += `

                    <div class="statistics-dish-row">

                        <div class="statistics-dish-top">

                            <span class="statistics-dish-name">
                                ${escapeHTML(name)}
                            </span>

                            <strong class="statistics-dish-profit">
                                ${formatMoney(profit)}
                            </strong>

                        </div>

                        <div class="statistics-dish-detail">

                            <span>
                                ${item.quantity} đơn
                            </span>

                            <span>
                                Doanh thu:
                                ${formatMoney(item.revenue)}
                            </span>

                            <span>
                                Vốn:
                                ${formatMoney(item.cost)}
                            </span>

                            <span>
                                App:
                                ${formatMoney(item.fee)}
                            </span>

                        </div>

                    </div>

                `;

            }
        );

}


/* =========================
   SOURCE
========================= */

function renderStatisticsSources(
    transactions
) {

    const container =
        document.getElementById(
            "statisticsSourceList"
        );

    if (!container) return;


    const sources = [
        "ShopeeFood",
        "GrabFood",
        "Ngoài sàn"
    ];


    container.innerHTML = "";


    sources.forEach(source => {

        const items =
            transactions.filter(
                t =>
                    t.source === source
            );


        const revenue =
            items.reduce(
                (s, t) =>
                    s +
                    Number(t.amount || 0),
                0
            );


        const fee =
            items.reduce(
                (s, t) =>
                    s +
                    Number(t.app_fee || 0),
                0
            );


        container.innerHTML += `

            <div class="statistics-source-row">

                <strong>
                    ${source}
                </strong>

                <div class="statistics-source-money">

                    Doanh thu:
                    ${formatMoney(revenue)}

                    <br>

                    Khấu trừ:
                    ${formatMoney(fee)}

                </div>

            </div>

        `;

    });

}


/* =========================
   PERIOD NAV
========================= */

function statisticsPrevious() {

    if (statisticsPeriod === "day") {

        statisticsDate.setDate(
            statisticsDate.getDate() - 1
        );

    }

    if (statisticsPeriod === "week") {

        statisticsDate.setDate(
            statisticsDate.getDate() - 7
        );

    }

    if (statisticsPeriod === "month") {

        statisticsDate.setMonth(
            statisticsDate.getMonth() - 1
        );

    }

    renderStatistics();

}


function statisticsNext() {

    if (statisticsPeriod === "day") {

        statisticsDate.setDate(
            statisticsDate.getDate() + 1
        );

    }

    if (statisticsPeriod === "week") {

        statisticsDate.setDate(
            statisticsDate.getDate() + 7
        );

    }

    if (statisticsPeriod === "month") {

        statisticsDate.setMonth(
            statisticsDate.getMonth() + 1
        );

    }

    renderStatistics();

}


function getPeriodLabel() {

    const range =
        getStatisticsRange();

    if (statisticsPeriod === "day") {

        return formatVietnameseDate(
            range.start
        );

    }

    return `${formatVietnameseDate(
        range.start
    )} - ${formatVietnameseDate(
        range.end
    )}`;

}
