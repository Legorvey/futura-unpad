import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function main() {
    const res = await fetch(`${supabaseUrl}/rest/v1/`, {
        headers: {
            "Accept": "application/openapi+json",
            "apikey": supabaseKey!
        }
    });
    
    // Check if there is an rpc to execute SQL
    const spec = await res.json();
    console.log("RPC functions available:", Object.keys(spec.paths).filter(p => p.startsWith('/rpc/')));
}
main();
