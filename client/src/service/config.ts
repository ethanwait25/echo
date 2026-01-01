type EnvKey = "VITE_SUPABASE_URL" | "VITE_SUPABASE_API_KEY";

function requireEnv(name: EnvKey): string {
    const value = import.meta.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

export const SUPABASE_URL = requireEnv("VITE_SUPABASE_URL");
export const SUPABASE_API_KEY = requireEnv("VITE_SUPABASE_API_KEY");