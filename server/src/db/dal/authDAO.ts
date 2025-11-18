import { User } from "../../models/User.js";
import { supabase } from "../supabaseClient.js";

async function register(email: string, password: string): Promise<boolean> {
    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password
    });
    
    if (error) {
        console.error(`Error registering: ${error}`);
        return false;
    }

    return data.user != null;
}

async function login(email: string, password: string): Promise<boolean> {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        console.error(`Error signing in: ${error}`);
        return false;
    }

    return data.user != null;
}

async function logout(): Promise<boolean> {
    const { error } = await supabase.auth.signOut();

    if (error) {
        console.error(`Error signing out: ${error}`);
        return false;
    }

    return true;
}

async function insertProfile(user: User): Promise<boolean> {
    const { error } = await supabase
        .from('profile')
        .insert({
            user_id: user.userId!,
            first_name: user.firstName,
            last_name: user.lastName,
            display_name: user.displayName,
            timezone: user.timeZone,
            created_at: user.createdAt
        });

    if (error) {
        console.error(`Error inserting profile: ${error}`);
        return false;
    }

    return true;
}