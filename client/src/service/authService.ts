import { supabase } from "./supabaseClient";

export type RegisterPayload = {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    displayName: string;
};

export async function register(payload: RegisterPayload) {
    const { email, password, firstName, lastName, displayName } = payload;

    const { data, error } = await supabase.auth.signUp({
        email,
        password
    });

    if (error) {
        console.error(`Error registering user: ${error.message}`);
        throw error;
    }

    const userId = data.user?.id;

    if (userId) {
        const profileError = await insertProfile(userId, firstName, lastName, displayName);

        if (profileError) {
            console.error(`Error inserting user profile: ${profileError.message}`);
            throw profileError;
        }
    }

    return data;
}

export async function login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        console.error(`Error logging in user: ${error}`);
        throw error;
    }

    return data;
}

export async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error(`Error logging out user: ${error}`);
    }
}

async function insertProfile(
    userId: string,
    firstName: string,
    lastName: string,
    displayName: string
) {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC";

    const { error } = await supabase
        .from("profile")
        .insert({
            user_id: userId,
            first_name: firstName,
            last_name: lastName,
            display_name: displayName,
            timezone
        });

    return error;
}

export async function getProfile() {
    const { data, error } = await supabase
        .from("profile")
        .select();
    
    if (error) {
        console.error(`Error fetching user profile: ${error}`);
    }

    return data;
}