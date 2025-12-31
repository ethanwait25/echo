import { supabase } from "./supabaseClient";

async function register(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password
    });

    if (error) {
        console.error(`Error registering user: ${error}`);
    }

    return data;
}

async function login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        console.error(`Error logging in user: ${error}`);
    }

    return data;
}

async function logout() {
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
    const { error } = await supabase
        .from("profile")
        .insert({
            user_id: userId,
            first_name: firstName,
            last_name: lastName,
            display_name: displayName,
            timezone: "ABC123"
        });

    if (error) {
        console.error(`Error inserting user profile: ${error}`);
    }
}

async function getProfile() {
    const { data, error } = await supabase
        .from("profile")
        .select();
    
    if (error) {
        console.error(`Error fetching user profile: ${error}`)
    }

    return data;
}