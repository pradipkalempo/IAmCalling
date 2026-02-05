import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../IAmCalling.env') });

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

async function testPost100() {
    try {
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .eq('id', 100)
            .single();
            
        if (error) {
            console.error('Error:', error);
            return;
        }
        
        console.log('Post 100 content:');
        console.log('Title:', data.title);
        console.log('Content length:', data.content.length);
        console.log('Content preview:', data.content.substring(0, 200));
        
        const codeBlocks = data.content.match(/<div\s+class=["']admin-code-executable["'][^>]*>([\s\S]*?)<\/div>/gi);
        console.log('Code blocks found:', codeBlocks ? codeBlocks.length : 0);
        
        if (codeBlocks) {
            const mainBlock = codeBlocks[0].match(/<div\s+class=["']admin-code-executable["'][^>]*>([\s\S]*?)<\/div>/i);
            if (mainBlock && mainBlock[1]) {
                console.log('Extracted content length:', mainBlock[1].length);
                console.log('Extracted content preview:', mainBlock[1].substring(0, 200));
            }
        }
        
    } catch (error) {
        console.error('Test error:', error);
    }
}

testPost100();