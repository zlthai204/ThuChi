const SUPABASE_URL = "YOUR_SUPABASE_URL";

const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";

const db = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);


/* =========================
   GENERIC HELPERS
========================= */

async function dbGet(table, options = {}) {

    let query = db
        .from(table)
        .select(options.select || "*");

    if (options.eq) {

        for (const [key, value] of Object.entries(options.eq)) {

            query = query.eq(key, value);

        }
    }

    if (options.order) {

        query = query.order(
            options.order.column,
            {
                ascending:
                    options.order.ascending ?? false
            }
        );
    }

    const { data, error } = await query;

    if (error) {

        console.error(error);

        showToast(error.message);

        throw error;
    }

    return data || [];
}


async function dbInsert(table, payload) {

    const { data, error } =
        await db
            .from(table)
            .insert(payload)
            .select();

    if (error) {

        console.error(error);

        showToast(error.message);

        throw error;
    }

    return data;
}


async function dbUpdate(
    table,
    id,
    payload
) {

    const { data, error } =
        await db
            .from(table)
            .update(payload)
            .eq("id", id)
            .select();

    if (error) {

        console.error(error);

        showToast(error.message);

        throw error;
    }

    return data;
}


async function dbDelete(
    table,
    id
) {

    const { error } =
        await db
            .from(table)
            .delete()
            .eq("id", id);

    if (error) {

        console.error(error);

        showToast(error.message);

        throw error;
    }

    return true;
}
