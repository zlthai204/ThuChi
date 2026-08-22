/* =========================================================
   SUPABASE
========================================================= */

const SUPABASE_URL =
    "https://fwamplkwgsxotcykqxhd.supabase.co";


const SUPABASE_ANON_KEY =
    "sb_publishable_l7M95el4HZhbXCj4rzq9pg_-1MoyZoQ";


const db =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );


/* =========================================================
   GET
========================================================= */

async function dbGet(
    table,
    options = {}
) {

    try {

        let query =
            db
                .from(table)
                .select(
                    options.select || "*"
                );


        /*
         * FILTER
         */

        if (options.eq) {

            for (
                const [
                    key,
                    value
                ]
                of Object.entries(
                    options.eq
                )
            ) {

                if (
                    value === null ||
                    value === undefined
                ) {

                    query =
                        query.is(
                            key,
                            null
                        );

                } else {

                    query =
                        query.eq(
                            key,
                            value
                        );

                }

            }

        }


        /*
         * ORDER
         *
         * Chỉ order nếu caller
         * yêu cầu.
         */

        if (options.order) {

            query =
                query.order(
                    options.order.column,
                    {
                        ascending:
                            options.order.ascending ??
                            false
                    }
                );

        }


        const {
            data,
            error
        } =
            await query;


        if (error) {

            console.error(
                `DB GET ERROR [${table}]`,
                {
                    code:
                        error.code,

                    message:
                        error.message,

                    details:
                        error.details,

                    hint:
                        error.hint
                }
            );


            showToast(
                `Lỗi ${table}: ${error.message}`
            );


            throw error;

        }


        console.log(
            `DB GET OK [${table}]`,
            data
        );


        return data || [];

    } catch (error) {

        console.error(
            `DB GET EXCEPTION [${table}]`,
            error
        );

        throw error;

    }

}


/* =========================================================
   INSERT
========================================================= */

async function dbInsert(
    table,
    payload
) {

    try {

        console.log(
            `DB INSERT [${table}]`,
            payload
        );


        const {
            data,
            error
        } =
            await db
                .from(table)
                .insert(payload)
                .select();


        if (error) {

            console.error(
                `DB INSERT ERROR [${table}]`,
                {
                    code:
                        error.code,

                    message:
                        error.message,

                    details:
                        error.details,

                    hint:
                        error.hint,

                    payload
                }
            );


            showToast(
                `Lỗi ${table}: ${error.message}`
            );


            throw error;

        }


        console.log(
            `DB INSERT OK [${table}]`,
            data
        );


        return data || [];

    } catch (error) {

        console.error(
            `DB INSERT EXCEPTION [${table}]`,
            error
        );

        throw error;

    }

}


/* =========================================================
   UPDATE
========================================================= */

async function dbUpdate(
    table,
    id,
    payload
) {

    try {

        const {
            data,
            error
        } =
            await db
                .from(table)
                .update(payload)
                .eq(
                    "id",
                    id
                )
                .select();


        if (error) {

            console.error(
                `DB UPDATE ERROR [${table}]`,
                {
                    code:
                        error.code,

                    message:
                        error.message,

                    details:
                        error.details,

                    hint:
                        error.hint
                }
            );


            showToast(
                `Lỗi ${table}: ${error.message}`
            );


            throw error;

        }


        return data || [];

    } catch (error) {

        console.error(
            `DB UPDATE EXCEPTION [${table}]`,
            error
        );

        throw error;

    }

}


/* =========================================================
   DELETE
========================================================= */

async function dbDelete(
    table,
    id
) {

    try {

        const {
            error
        } =
            await db
                .from(table)
                .delete()
                .eq(
                    "id",
                    id
                );


        if (error) {

            console.error(
                `DB DELETE ERROR [${table}]`,
                {
                    code:
                        error.code,

                    message:
                        error.message,

                    details:
                        error.details,

                    hint:
                        error.hint
                }
            );


            showToast(
                `Lỗi ${table}: ${error.message}`
            );


            throw error;

        }


        return true;

    } catch (error) {

        console.error(
            `DB DELETE EXCEPTION [${table}]`,
            error
        );

        throw error;

    }

}
