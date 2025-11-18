import "dotenv/config";

function requireEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

export const SUPABASE_URL = requireEnv("SUPABASE_URL");
export const SUPABASE_API_KEY = requireEnv("SUPABASE_API_KEY");