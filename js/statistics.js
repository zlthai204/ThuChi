/* =========================================================
   STATISTICS — PREMIUM INTERACTION
   DATE PICKER / PERIOD NAVIGATION
========================================================= */

(function () {
    "use strict";

    const root =
        document.querySelector("#statisticsPage") ||
        document.querySelector(".statistics-page");

    if (!root) return;

    /* =====================================================
       STATE
    ===================================================== */

    const state = {
        period: "day",
        date: new Date(),

        pickerOpen: false,
        pickerView: "calendar"
    };

    /* =====================================================
       HELPERS
    ===================================================== */

    const pad = (n) =>
        String(n).padStart(2, "0");

    const cloneDate = (date) =>
        new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate()
        );

    const isSameDate = (a, b) =>
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();

    const monthNames = [
        "Tháng 1",
        "Tháng 2",
        "Tháng 3",
        "Tháng 4",
        "Tháng 5",
        "Tháng 6",
        "Tháng 7",
        "Tháng 8",
        "Tháng 9",
        "Tháng 10",
        "Tháng 11",
        "Tháng 12"
    ];

    const weekNames = [
        "T2",
        "T3",
        "T4",
        "T5",
        "T6",
        "T7",
        "CN"
    ];

    /* =====================================================
       FIND ELEMENTS
    ===================================================== */

    const dateRow =
        root.querySelector(".statistics-date-row");

    if (!dateRow) return;

    const dateButtons =
        dateRow.querySelectorAll("button");

    const prevButton = dateButtons[0];
    const nextButton = dateButtons[1];

    let dateLabel =
        dateRow.querySelector("strong");

    if (!dateLabel) {
        dateLabel = document.createElement("strong");
        dateRow.insertBefore(
            dateLabel,
            nextButton
        );
    }

    /* =====================================================
       PERIOD TABS
    ===================================================== */

    const tabs =
        root.querySelectorAll(".period-tab");

    function detectPeriod() {

        const active =
            root.querySelector(
                ".period-tab.active"
            );

        if (!active) return;

        const text =
            active.textContent
                .trim()
                .toLowerCase();

        if (
            text.includes("ngày") ||
            text.includes("day")
        ) {
            state.period = "day";
        } else if (
            text.includes("tháng") ||
            text.includes("month")
        ) {
            state.period = "month";
        } else if (
            text.includes("năm") ||
            text.includes("year")
        ) {
            state.period = "year";
        }
    }

    detectPeriod();

    tabs.forEach((tab) => {

        tab.addEventListener(
            "click",
            function () {

                tabs.forEach((item) =>
                    item.classList.remove(
                        "active"
                    )
                );

                tab.classList.add("active");

                detectPeriod();

                state.pickerView =
                    state.period === "day"
                        ? "calendar"
                        : state.period === "month"
                            ? "month"
                            : "year";

                updateDateLabel();

                closePicker();

                /*
                 * Cho phép JS cũ của app xử lý
                 * phần render dữ liệu.
                 */
                setTimeout(() => {
                    notifyStatisticsChanged();
                }, 0);
            }
        );

    });

    /* =====================================================
       DATE LABEL
    ===================================================== */

    function updateDateLabel() {

        const d = state.date;

        let text = "";

        if (state.period === "day") {

            text =
                `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;

        } else if (state.period === "month") {

            text =
                `${monthNames[d.getMonth()]} ${d.getFullYear()}`;

        } else {

            text =
                `Năm ${d.getFullYear()}`;

        }

        dateLabel.textContent = text;
    }

    /* =====================================================
       PERIOD NAVIGATION
    ===================================================== */

    function movePeriod(direction) {

        const d = cloneDate(state.date);

        if (state.period === "day") {

            d.setDate(
                d.getDate() + direction
            );

        } else if (state.period === "month") {

            d.setMonth(
                d.getMonth() + direction
            );

        } else {

            d.setFullYear(
                d.getFullYear() + direction
            );
        }

        state.date = d;

        updateDateLabel();

        renderPicker();

        notifyStatisticsChanged();
    }

    if (prevButton) {

        prevButton.addEventListener(
            "click",
            function () {
                movePeriod(-1);
            }
        );

    }

    if (nextButton) {

        nextButton.addEventListener(
            "click",
            function () {
                movePeriod(1);
            }
        );

    }

    /* =====================================================
       DATE PICKER ROOT
    ===================================================== */

    let picker =
        root.querySelector(".stats-date-picker");

    if (!picker) {

        picker =
            document.createElement("div");

        picker.className =
            "stats-date-picker";

        dateRow.appendChild(picker);
    }

    /* =====================================================
       OPEN / CLOSE
    ===================================================== */

    function openPicker() {

        state.pickerOpen = true;

        if (
            state.period === "day"
        ) {
            state.pickerView =
                "calendar";
        }

        if (
            state.period === "month"
        ) {
            state.pickerView =
                "month";
        }

        if (
            state.period === "year"
        ) {
            state.pickerView =
                "year";
        }

        renderPicker();

        requestAnimationFrame(() => {
            picker.classList.add("open");
        });
    }

    function closePicker() {

        state.pickerOpen = false;

        picker.classList.remove("open");
    }

    dateLabel.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();

            if (state.pickerOpen) {
                closePicker();
            } else {
                openPicker();
            }

        }
    );

    document.addEventListener(
        "click",
        function (event) {

            if (!state.pickerOpen) return;

            if (
                picker.contains(event.target) ||
                dateLabel.contains(event.target)
            ) {
                return;
            }

            closePicker();
        }
    );

    /* =====================================================
       PICKER HEADER
    ===================================================== */

    function pickerHeader() {

        const wrapper =
            document.createElement("div");

        wrapper.className =
            "stats-date-picker-header";

        const prev =
            document.createElement("button");

        prev.type = "button";

        prev.className =
            "stats-date-picker-nav";

        prev.innerHTML = "‹";

        const title =
            document.createElement("div");

        title.className =
            "stats-date-picker-title";

        const next =
            document.createElement("button");

        next.type = "button";

        next.className =
            "stats-date-picker-nav";

        next.innerHTML = "›";

        wrapper.append(
            prev,
            title,
            next
        );

        return {
            wrapper,
            prev,
            title,
            next
        };
    }

    /* =====================================================
       SWITCH
    ===================================================== */

    function createSwitch() {

        const wrap =
            document.createElement("div");

        wrap.className =
            "stats-date-picker-switch";

        const monthBtn =
            document.createElement("button");

        monthBtn.type = "button";

        monthBtn.textContent =
            "Tháng";

        const yearBtn =
            document.createElement("button");

        yearBtn.type = "button";

        yearBtn.textContent =
            "Năm";

        monthBtn.classList.toggle(
            "active",
            state.pickerView !== "year"
        );

        yearBtn.classList.toggle(
            "active",
            state.pickerView === "year"
        );

        monthBtn.addEventListener(
            "click",
            () => {

                state.pickerView =
                    state.period === "day"
                        ? "calendar"
                        : "month";

                renderPicker();
            }
        );

        yearBtn.addEventListener(
            "click",
            () => {

                state.pickerView = "year";

                renderPicker();
            }
        );

        wrap.append(
            monthBtn,
            yearBtn
        );

        return wrap;
    }

    /* =====================================================
       CALENDAR
    ===================================================== */

    function renderCalendar(container) {

        const header =
            pickerHeader();

        header.title.textContent =
            `${monthNames[state.date.getMonth()]} ${state.date.getFullYear()}`;

        header.prev.addEventListener(
            "click",
            () => {

                state.date.setMonth(
                    state.date.getMonth() - 1
                );

                renderPicker();
                updateDateLabel();
            }
        );

        header.next.addEventListener(
            "click",
            () => {

                state.date.setMonth(
                    state.date.getMonth() + 1
                );

                renderPicker();
                updateDateLabel();
            }
        );

        container.append(
            header.wrapper
        );

        container.append(
            createSwitch()
        );

        const week =
            document.createElement("div");

        week.className =
            "stats-calendar-week";

        weekNames.forEach((name) => {

            const el =
                document.createElement("span");

            el.textContent = name;

            week.appendChild(el);

        });

        container.appendChild(week);

        const grid =
            document.createElement("div");

        grid.className =
            "stats-calendar-grid";

        const year =
            state.date.getFullYear();

        const month =
            state.date.getMonth();

        /*
         * JS Date:
         * Sunday = 0
         *
         * Chuyển về:
         * Monday = 0
         */
        const firstDay =
            new Date(
                year,
                month,
                1
            ).getDay();

        const startOffset =
            firstDay === 0
                ? 6
                : firstDay - 1;

        const daysInMonth =
            new Date(
                year,
                month + 1,
                0
            ).getDate();

        const daysPrevMonth =
            new Date(
                year,
                month,
                0
            ).getDate();

        const today =
            new Date();

        for (
            let i = 0;
            i < 42;
            i++
        ) {

            let day;
            let cellMonth = month;
            let cellYear = year;

            if (i < startOffset) {

                day =
                    daysPrevMonth -
                    startOffset +
                    i +
                    1;

                cellMonth--;

                if (cellMonth < 0) {
                    cellMonth = 11;
                    cellYear--;
                }

            } else if (
                i >=
                startOffset +
                daysInMonth
            ) {

                day =
                    i -
                    startOffset -
                    daysInMonth +
                    1;

                cellMonth++;

                if (cellMonth > 11) {
                    cellMonth = 0;
                    cellYear++;
                }

            } else {

                day =
                    i -
                    startOffset +
                    1;
            }

            const cellDate =
                new Date(
                    cellYear,
                    cellMonth,
                    day
                );

            const button =
                document.createElement(
                    "button"
                );

            button.type = "button";

            button.className =
                "stats-calendar-day";

            button.textContent = day;

            if (
                cellMonth !== month
            ) {
                button.classList.add(
                    "muted"
                );
            }

            if (
                isSameDate(
                    cellDate,
                    today
                )
            ) {
                button.classList.add(
                    "today"
                );
            }

            if (
                isSameDate(
                    cellDate,
                    state.date
                )
            ) {
                button.classList.add(
                    "selected"
                );
            }

            button.addEventListener(
                "click",
                () => {

                    state.date =
                        cloneDate(cellDate);

                    updateDateLabel();

                    closePicker();

                    notifyStatisticsChanged();
                }
            );

            grid.appendChild(button);
        }

        container.appendChild(grid);
    }

    /* =====================================================
       MONTH
    ===================================================== */

    function renderMonths(container) {

        const header =
            pickerHeader();

        header.title.textContent =
            `Năm ${state.date.getFullYear()}`;

        header.prev.addEventListener(
            "click",
            () => {

                state.date.setFullYear(
                    state.date.getFullYear() - 1
                );

                renderPicker();
                updateDateLabel();
            }
        );

        header.next.addEventListener(
            "click",
            () => {

                state.date.setFullYear(
                    state.date.getFullYear() + 1
                );

                renderPicker();
                updateDateLabel();
            }
        );

        container.append(
            header.wrapper
        );

        const grid =
            document.createElement("div");

        grid.className =
            "stats-month-grid";

        monthNames.forEach(
            (name, index) => {

                const button =
                    document.createElement(
                        "button"
                    );

                button.type = "button";

                button.textContent =
                    name;

                if (
                    index ===
                    state.date.getMonth()
                ) {
                    button.classList.add(
                        "active"
                    );
                }

                button.addEventListener(
                    "click",
                    () => {

                        state.date.setMonth(
                            index
                        );

                        updateDateLabel();

                        if (
                            state.period ===
                            "month"
                        ) {
                            closePicker();
                            notifyStatisticsChanged();
                        } else {
                            state.pickerView =
                                "calendar";

                            renderPicker();
                        }
                    }
                );

                grid.appendChild(button);
            }
        );

        container.appendChild(grid);
    }

    /* =====================================================
       YEAR
    ===================================================== */

    function renderYears(container) {

        const currentYear =
            state.date.getFullYear();

        const start =
            currentYear - 5;

        const end =
            currentYear + 6;

        const header =
            pickerHeader();

        header.title.textContent =
            `${start} – ${end}`;

        header.prev.addEventListener(
            "click",
            () => {

                state.date.setFullYear(
                    state.date.getFullYear() - 12
                );

                renderPicker();
            }
        );

        header.next.addEventListener(
            "click",
            () => {

                state.date.setFullYear(
                    state.date.getFullYear() + 12
                );

                renderPicker();
            }
        );

        container.append(
            header.wrapper
        );

        const grid =
            document.createElement("div");

        grid.className =
            "stats-year-grid";

        for (
            let year = start;
            year <= end;
            year++
        ) {

            const button =
                document.createElement(
                    "button"
                );

            button.type = "button";

            button.textContent =
                year;

            if (
                year === currentYear
            ) {
                button.classList.add(
                    "active"
                );
            }

            button.addEventListener(
                "click",
                () => {

                    state.date.setFullYear(
                        year
                    );

                    updateDateLabel();

                    if (
                        state.period ===
                        "year"
                    ) {
                        closePicker();
                        notifyStatisticsChanged();
                    } else {
                        state.pickerView =
                            state.period ===
                            "month"
                                ? "month"
                                : "calendar";

                        renderPicker();
                    }
                }
            );

            grid.appendChild(button);
        }

        container.appendChild(grid);
    }

    /* =====================================================
       FOOTER
    ===================================================== */

    function createFooter() {

        const footer =
            document.createElement("div");

        footer.className =
            "stats-date-picker-footer";

        const today =
            document.createElement("button");

        today.type = "button";

        today.className =
            "stats-date-today";

        today.textContent =
            "Hôm nay";

        today.addEventListener(
            "click",
            () => {

                state.date =
                    cloneDate(new Date());

                updateDateLabel();

                closePicker();

                notifyStatisticsChanged();
            }
        );

        const close =
            document.createElement("button");

        close.type = "button";

        close.className =
            "stats-date-close";

        close.textContent =
            "Xong";

        close.addEventListener(
            "click",
            closePicker
        );

        footer.append(
            today,
            close
        );

        return footer;
    }

    /* =====================================================
       RENDER PICKER
    ===================================================== */

    function renderPicker() {

        picker.innerHTML = "";

        if (
            state.period === "day"
        ) {

            renderCalendar(picker);

        } else if (
            state.period === "month"
        ) {

            if (
                state.pickerView ===
                "year"
            ) {
                renderYears(picker);
            } else {
                renderMonths(picker);
            }

        } else {

            renderYears(picker);
        }

        picker.appendChild(
            createFooter()
        );
    }

    /* =====================================================
       NOTIFY APP
    ===================================================== */

    function notifyStatisticsChanged() {

        /*
         * Các app khác nhau thường dùng
         * những function khác nhau.
         *
         * Vì vậy kiểm tra các function
         * phổ biến trước.
         */

        const payload = {
            date: cloneDate(state.date),
            period: state.period,

            day:
                state.date.getDate(),

            month:
                state.date.getMonth() + 1,

            year:
                state.date.getFullYear()
        };

        const functions = [
            "renderStatistics",
            "updateStatistics",
            "loadStatistics",
            "refreshStatistics",
            "calculateStatistics"
        ];

        for (
            const name of functions
        ) {

            if (
                typeof window[name] ===
                "function"
            ) {

                try {
                    window[name](payload);
                } catch (error) {
                    /*
                     * Không làm app crash
                     * nếu function cũ không
                     * nhận payload.
                     */
                    try {
                        window[name]();
                    } catch (_) {}
                }

                break;
            }
        }

        /*
         * Phát custom event để JS hiện tại
         * có thể bắt nếu cần.
         */
        document.dispatchEvent(
            new CustomEvent(
                "statisticsDateChanged",
                {
                    detail: payload
                }
            )
        );
    }

    /* =====================================================
       PUBLIC API
    ===================================================== */

    window.statisticsDatePicker = {

        getDate() {
            return cloneDate(
                state.date
            );
        },

        getPeriod() {
            return state.period;
        },

        setDate(date) {

            if (!(date instanceof Date)) {
                return;
            }

            state.date =
                cloneDate(date);

            updateDateLabel();
            renderPicker();
        },

        setPeriod(period) {

            if (
                ![
                    "day",
                    "month",
                    "year"
                ].includes(period)
            ) {
                return;
            }

            state.period =
                period;

            state.pickerView =
                period === "day"
                    ? "calendar"
                    : period === "month"
                        ? "month"
                        : "year";

            updateDateLabel();
            renderPicker();
        },

        open() {
            openPicker();
        },

        close() {
            closePicker();
        }
    };

    /* =====================================================
       INIT
    ===================================================== */

    updateDateLabel();

    /*
     * Nếu date row đã tồn tại nhưng strong
     * đang có text cũ, thay bằng state.
     */
    renderPicker();

})();
