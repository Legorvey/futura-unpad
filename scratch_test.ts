import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl!, supabaseKey!);

async function main() {
    const { data: row, error: rowError } = await supabase.from('mechatura_registrations').select('*').limit(1).single();
    
    console.log("Updating team:", row.id);
    const { data, error } = await supabase
        .from('mechatura_registrations')
        .update({ registration_status: 'verified' })
        .eq('id', row.id)
        .select();
        
    console.log("Update Error:", error);
    console.log("Update Data:", data);
}

main();
