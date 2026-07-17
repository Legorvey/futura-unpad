import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl!, supabaseKey!);

async function main() {
    const { data: row } = await supabase.from('mechatura_registrations').select('*').limit(1).single();
    
    const statusesToTest = ['verified', 'complete', 'completed', 'active', 'accepted', 'valid'];
    for (const status of statusesToTest) {
        console.log("Testing status:", status);
        const { error } = await supabase
            .from('mechatura_registrations')
            .update({ registration_status: status })
            .eq('id', row.id);
        if (!error) {
            console.log("SUCCESS with status:", status);
            return;
        } else {
            console.log("Failed:", error.code);
        }
    }
}
main();
