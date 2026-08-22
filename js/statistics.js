function statisticsInjectDatePickerCSS() {
    if (document.getElementById("statisticsDatePickerCSS")) {
        return;
    }

    const style = document.createElement("style");

    style.id = "statisticsDatePickerCSS";

    style.textContent = `

        /* =====================================================
           BODY
        ===================================================== */

        body.statistics-picker-open {
            overflow: hidden !important;
            touch-action: none;
        }


        /* =====================================================
           OVERLAY
        ===================================================== */

        .statistics-date-picker {
            position: fixed !important;
            inset: 0 !important;
            z-index: 999999 !important;

            display: none;
            align-items: center;
            justify-content: center;

            width: 100vw;
            height: 100dvh;

            padding: 12px;

            box-sizing: border-box;
        }

        .statistics-date-picker.open {
            display: flex !important;
        }

        .statistics-date-picker-backdrop {
            position: absolute !important;
            inset: 0 !important;

            width: 100%;
            height: 100%;

            background: rgba(8, 15, 30, .62);

            backdrop-filter: blur(7px);
            -webkit-backdrop-filter: blur(7px);

            cursor: pointer;
        }


        /* =====================================================
           PANEL
        ===================================================== */

        .statistics-date-picker-panel {
            position: relative;
            z-index: 2;

            width: min(480px, 100%);
            max-width: 100%;

            height: auto;
            max-height: calc(100dvh - 24px);

            overflow: hidden;

            display: flex;
            flex-direction: column;

            box-sizing: border-box;

            border-radius: 24px;

            background: var(--card-bg, #ffffff);
            color: var(--text-color, #111827);

            box-shadow:
                0 30px 90px rgba(0,0,0,.30);

            animation:
                statisticsPickerIn
                .22s
                ease;
        }


        @keyframes statisticsPickerIn {
            from {
                opacity: 0;
                transform:
                    translateY(18px)
                    scale(.97);
            }

            to {
                opacity: 1;
                transform:
                    translateY(0)
                    scale(1);
            }
        }


        /* =====================================================
           HEADER
        ===================================================== */

        .statistics-date-picker-header {
            flex: 0 0 auto;

            display: flex;
            align-items: center;
            justify-content: space-between;

            gap: 12px;

            padding: 18px 20px 12px;

            box-sizing: border-box;
        }

        .statistics-date-picker-header > div {
            min-width: 0;

            display: flex;
            flex-direction: column;

            gap: 4px;
        }

        .statistics-date-picker-header small {
            font-size: 10px;
            line-height: 1.2;

            font-weight: 800;

            letter-spacing: .12em;

            opacity: .55;
        }

        .statistics-date-picker-header strong {
            display: block;

            font-size: 23px;
            line-height: 1.2;

            white-space: nowrap;
        }


        .statistics-picker-close {
            width: 38px;
            height: 38px;

            min-width: 38px;
            min-height: 38px;

            flex: 0 0 38px;

            display: flex;
            align-items: center;
            justify-content: center;

            border: 0;
            border-radius: 50%;

            background:
                rgba(127,127,127,.12);

            color: inherit;

            font-size: 25px;
            line-height: 1;

            cursor: pointer;

            -webkit-tap-highlight-color: transparent;
        }


        /* =====================================================
           PERIOD
        ===================================================== */

        .statistics-picker-periods {
            flex: 0 0 auto;

            display: grid;
            grid-template-columns:
                repeat(3, minmax(0, 1fr));

            gap: 6px;

            margin: 0 20px 10px;
            padding: 5px;

            box-sizing: border-box;

            border-radius: 14px;

            background:
                rgba(127,127,127,.10);
        }

        .statistics-picker-periods button {
            min-width: 0;

            border: 0;
            border-radius: 10px;

            padding: 10px 6px;

            background: transparent;
            color: inherit;

            font-size: 14px;
            font-weight: 700;

            cursor: pointer;

            -webkit-tap-highlight-color: transparent;
        }

        .statistics-picker-periods button.active {
            background: #2563eb;
            color: #fff;

            box-shadow:
                0 5px 14px
                rgba(37,99,235,.28);
        }


        /* =====================================================
           CONTENT
        ===================================================== */

        .statistics-picker-content {
            min-height: 0;
            overflow: hidden;

            flex: 1 1 auto;
        }

        .statistics-picker-scroll {
            width: 100%;

            max-height: 60dvh;

            overflow-y: auto;
            overflow-x: hidden;

            padding:
                0 20px 12px;

            box-sizing: border-box;

            -webkit-overflow-scrolling: touch;
            overscroll-behavior: contain;
        }


        /* =====================================================
           SECTION TITLE
        ===================================================== */

        .statistics-picker-section-title {
            margin:
                10px 0 8px;

            font-size: 11px;
            line-height: 1.3;

            font-weight: 800;

            text-transform: uppercase;
            letter-spacing: .06em;

            opacity: .58;
        }


        /* =====================================================
           YEAR
        ===================================================== */

        .statistics-year-grid {
            display: grid;

            grid-template-columns:
                repeat(5, minmax(0, 1fr));

            gap: 6px;

            width: 100%;
        }

        .statistics-year-item {
            min-width: 0;
            min-height: 40px;

            padding: 5px 2px;

            border:
                1px solid
                rgba(127,127,127,.15);

            border-radius: 11px;

            background:
                rgba(127,127,127,.055);

            color: inherit;

            font-size: 13px;
            font-weight: 700;

            cursor: pointer;

            -webkit-tap-highlight-color: transparent;
        }


        /* =====================================================
           MONTH
        ===================================================== */

        .statistics-month-grid {
            display: grid;

            grid-template-columns:
                repeat(4, minmax(0, 1fr));

            gap: 7px;

            width: 100%;
        }

        .statistics-month-item {
            min-width: 0;
            min-height: 40px;

            padding: 5px 2px;

            border:
                1px solid
                rgba(127,127,127,.15);

            border-radius: 11px;

            background:
                rgba(127,127,127,.055);

            color: inherit;

            font-size: 13px;
            font-weight: 700;

            cursor: pointer;

            -webkit-tap-highlight-color: transparent;
        }


        /* =====================================================
           HOVER / ACTIVE
        ===================================================== */

        .statistics-year-item:hover,
        .statistics-month-item:hover,
        .statistics-calendar-day:hover {
            border-color: #2563eb;
            color: #2563eb;
        }

        .statistics-year-item.active,
        .statistics-month-item.active {
            background: #2563eb;
            color: #fff;

            border-color: #2563eb;

            box-shadow:
                0 5px 13px
                rgba(37,99,235,.25);
        }


        /* =====================================================
           CALENDAR HEADER
        ===================================================== */

        .statistics-picker-calendar-header {
            display: grid;

            grid-template-columns:
                38px minmax(0, 1fr) 38px;

            align-items: center;

            gap: 6px;

            margin-bottom: 7px;
        }

        .statistics-picker-calendar-header strong {
            min-width: 0;

            text-align: center;

            font-size: 14px;
            line-height: 1.2;

            white-space: nowrap;
        }

        .statistics-picker-calendar-header button {
            width: 38px;
            height: 38px;

            min-width: 38px;
            min-height: 38px;

            border: 0;
            border-radius: 10px;

            background:
                rgba(127,127,127,.08);

            color: inherit;

            font-size: 24px;
            line-height: 1;

            cursor: pointer;

            -webkit-tap-highlight-color: transparent;
        }


        /* =====================================================
           WEEK DAYS
        ===================================================== */

        .statistics-calendar-weekdays {
            display: grid;

            grid-template-columns:
                repeat(7, minmax(0, 1fr));

            gap: 4px;

            margin-bottom: 3px;
        }

        .statistics-calendar-weekdays span {
            min-width: 0;

            text-align: center;

            padding: 5px 0;

            font-size: 10px;
            line-height: 1;

            font-weight: 800;

            opacity: .5;
        }


        /* =====================================================
           CALENDAR
        ===================================================== */

        .statistics-calendar-grid {
            display: grid;

            grid-template-columns:
                repeat(7, minmax(0, 1fr));

            gap: 5px;

            width: 100%;
        }

        .statistics-calendar-day,
        .statistics-calendar-empty {
            width: 100%;

            min-width: 0;
            min-height: 0;

            aspect-ratio: 1 / 1;

            box-sizing: border-box;
        }

        .statistics-calendar-day {
            padding: 0;

            border:
                1px solid
                rgba(127,127,127,.12);

            border-radius: 11px;

            background:
                rgba(127,127,127,.045);

            color: inherit;

            font-size: 13px;
            font-weight: 700;

            cursor: pointer;

            -webkit-tap-highlight-color: transparent;
        }

        .statistics-calendar-day.today {
            box-shadow:
                inset 0 0 0 2px
                rgba(37,99,235,.32);
        }

        .statistics-calendar-day.active {
            background: #2563eb;
            border-color: #2563eb;

            color: #fff;

            box-shadow:
                0 5px 13px
                rgba(37,99,235,.28);
        }


        /* =====================================================
           FOOTER
        ===================================================== */

        .statistics-picker-footer {
            flex: 0 0 auto;

            display: flex;
            align-items: center;
            justify-content: space-between;

            gap: 10px;

            padding:
                12px 20px 16px;

            border-top:
                1px solid
                rgba(127,127,127,.12);

            box-sizing: border-box;
        }

        .statistics-picker-footer button {
            min-width: 100px;

            border: 0;
            border-radius: 12px;

            padding: 11px 16px;

            background:
                rgba(127,127,127,.10);

            color: inherit;

            font-size: 14px;
            font-weight: 800;

            cursor: pointer;

            -webkit-tap-highlight-color: transparent;
        }

        .statistics-picker-footer button.primary {
            background: #2563eb;
            color: #fff;

            box-shadow:
                0 6px 16px
                rgba(37,99,235,.25);
        }


        /* =====================================================
           TABLET
        ===================================================== */

        @media (max-width: 768px) {

            .statistics-date-picker {
                padding: 10px;
            }

            .statistics-date-picker-panel {
                width: min(500px, 100%);
                max-height:
                    calc(100dvh - 20px);
            }

            .statistics-picker-scroll {
                max-height: 62dvh;
            }
        }


        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 520px) {

            .statistics-date-picker {
                align-items: flex-end;

                padding: 0;
            }

            .statistics-date-picker-panel {
                width: 100%;
                max-width: 100%;

                max-height: 94dvh;

                border-radius:
                    22px 22px 0 0;

                margin: 0;

                animation:
                    statisticsPickerMobileIn
                    .22s
                    ease;
            }


            @keyframes statisticsPickerMobileIn {

                from {
                    opacity: 0;
                    transform:
                        translateY(100%);
                }

                to {
                    opacity: 1;
                    transform:
                        translateY(0);
                }
            }


            .statistics-date-picker-header {
                padding:
                    16px 14px 10px;
            }

            .statistics-date-picker-header strong {
                font-size: 21px;
            }


            .statistics-picker-periods {
                margin:
                    0 14px 9px;
            }

            .statistics-picker-periods button {
                padding:
                    9px 5px;

                font-size: 13px;
            }


            .statistics-picker-scroll {
                max-height: 64dvh;

                padding:
                    0 14px 10px;
            }


            .statistics-picker-section-title {
                margin-top: 9px;
                margin-bottom: 7px;
            }


            .statistics-year-grid {
                grid-template-columns:
                    repeat(4, minmax(0, 1fr));

                gap: 6px;
            }

            .statistics-year-item {
                min-height: 38px;
                font-size: 12px;
            }


            .statistics-month-grid {
                grid-template-columns:
                    repeat(3, minmax(0, 1fr));

                gap: 6px;
            }

            .statistics-month-item {
                min-height: 39px;
                font-size: 12px;
            }


            .statistics-picker-calendar-header {
                grid-template-columns:
                    36px minmax(0, 1fr) 36px;

                gap: 5px;
            }

            .statistics-picker-calendar-header button {
                width: 36px;
                height: 36px;

                min-width: 36px;
                min-height: 36px;
            }

            .statistics-picker-calendar-header strong {
                font-size: 13px;
            }


            .statistics-calendar-weekdays {
                gap: 3px;
            }

            .statistics-calendar-weekdays span {
                font-size: 9px;
                padding: 5px 0;
            }


            .statistics-calendar-grid {
                gap: 4px;
            }

            .statistics-calendar-day,
            .statistics-calendar-empty {
                min-height: 34px;
            }

            .statistics-calendar-day {
                border-radius: 9px;
                font-size: 12px;
            }


            .statistics-picker-footer {
                padding:
                    11px 14px
                    calc(12px + env(safe-area-inset-bottom));

                gap: 8px;
            }

            .statistics-picker-footer button {
                flex: 1;

                min-width: 0;

                padding:
                    11px 10px;

                font-size: 13px;
            }
        }


        /* =====================================================
           VERY SMALL PHONE
           320px - 360px
        ===================================================== */

        @media (max-width: 360px) {

            .statistics-date-picker-panel {
                max-height: 96dvh;
            }

            .statistics-date-picker-header {
                padding:
                    13px 11px 8px;
            }

            .statistics-date-picker-header strong {
                font-size: 19px;
            }

            .statistics-picker-close {
                width: 34px;
                height: 34px;

                min-width: 34px;
                min-height: 34px;
            }


            .statistics-picker-periods {
                margin:
                    0 11px 8px;

                padding: 4px;
            }

            .statistics-picker-periods button {
                padding:
                    8px 3px;

                font-size: 12px;
            }


            .statistics-picker-scroll {
                max-height: 67dvh;

                padding:
                    0 11px 8px;
            }


            .statistics-year-grid {
                gap: 5px;
            }

            .statistics-year-item {
                min-height: 36px;

                font-size: 11px;

                border-radius: 9px;
            }


            .statistics-month-grid {
                gap: 5px;
            }

            .statistics-month-item {
                min-height: 37px;

                font-size: 11px;

                border-radius: 9px;
            }


            .statistics-calendar-grid {
                gap: 3px;
            }

            .statistics-calendar-day,
            .statistics-calendar-empty {
                min-height: 31px;
            }

            .statistics-calendar-day {
                border-radius: 8px;
                font-size: 11px;
            }


            .statistics-picker-footer {
                padding:
                    9px 11px
                    calc(10px + env(safe-area-inset-bottom));
            }

            .statistics-picker-footer button {
                padding:
                    10px 7px;

                font-size: 12px;
            }
        }


        /* =====================================================
           DARK MODE
        ===================================================== */

        @media (prefers-color-scheme: dark) {

            .statistics-date-picker-panel {
                background: #111827;
                color: #f3f4f6;
            }

            .statistics-date-picker-backdrop {
                background:
                    rgba(0,0,0,.72);
            }
        }

    `;

    document.head.appendChild(style);
}
