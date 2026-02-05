// Debug script to test content extraction and rendering issues
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../IAmCalling.env') });

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

// Test function to debug content extraction
async function debugContentExtraction() {
    try {
        console.log('🔍 Debugging content extraction issue...\n');
        
        // Get a recent post to test with
        const { data: posts, error: postsError } = await supabase
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(3);
            
        if (postsError) {
            console.error('❌ Error fetching posts:', postsError);
            return;
        }
        
        if (!posts || posts.length === 0) {
            console.log('❌ No posts found in database');
            return;
        }
        
        console.log(`✅ Found ${posts.length} posts. Testing content extraction...\n`);
        
        // Test each post
        for (let i = 0; i < posts.length; i++) {
            const post = posts[i];
            console.log(`📝 Post ${i + 1} (ID: ${post.id})`);
            console.log(`   Title: ${post.title}`);
            console.log(`   Author: ${post.author_name || post.author || 'Unknown'}`);
            console.log(`   Created: ${new Date(post.created_at).toLocaleString()}`);
            
            // Check content
            if (!post.content) {
                console.log('   ❌ No content found!');
                continue;
            }
            
            console.log(`   Content length: ${post.content.length} characters`);
            
            // Test the regex pattern used in article detail page
            const codeBlocks = post.content.match(/<div\s+class=["']admin-code-executable["'][^>]*>([\s\S]*?)<\/div>/gi);
            
            if (codeBlocks && codeBlocks.length > 0) {
                console.log(`   ✅ Found ${codeBlocks.length} code block(s)`);
                
                // Test the extraction logic
                const mainCodeBlock = codeBlocks[0].match(/<div\s+class=["']admin-code-executable["'][^>]*>([\s\S]*?)<\/div>/i);
                if (mainCodeBlock && mainCodeBlock[1]) {
                    console.log('   ✅ Successfully extracted code content');
                    console.log(`   Extracted content length: ${mainCodeBlock[1].length} characters`);
                    
                    // Show first 200 characters of extracted content
                    const preview = mainCodeBlock[1].substring(0, 200);
                    console.log(`   Content preview: ${preview}${mainCodeBlock[1].length > 200 ? '...' : ''}`);
                } else {
                    console.log('   ❌ Failed to extract code content properly');
                }
            } else {
                console.log('   ℹ️  No code blocks found - regular content');
                
                // Show content preview for regular posts
                const preview = post.content.substring(0, 200);
                console.log(`   Content preview: ${preview}${post.content.length > 200 ? '...' : ''}`);
            }
            
            console.log(''); // Empty line for readability
        }
        
        // Test the specific post that was mentioned (ID: 1769926008972)
        console.log('🔍 Testing specific post ID: 1769926008972');
        const { data: specificPost, error: specificError } = await supabase
            .from('posts')
            .select('*')
            .eq('id', 1769926008972)
            .single();
            
        if (specificError) {
            console.log('   ❌ Post not found or error:', specificError.message);
        } else if (specificPost) {
            console.log('   ✅ Post found!');
            console.log(`   Title: ${specificPost.title}`);
            console.log(`   Content length: ${specificPost.content.length}`);
            
            // Test the exact regex from article detail page
            const codeBlocks = specificPost.content.match(/<div\s+class=["']admin-code-executable["'][^>]*>([\s\S]*?)<\/div>/gi);
            console.log(`   Code blocks found: ${codeBlocks ? codeBlocks.length : 0}`);
            
            if (codeBlocks) {
                const mainCodeBlock = codeBlocks[0].match(/<div\s+class=["']admin-code-executable["'][^>]*>([\s\S]*?)<\/div>/i);
                if (mainCodeBlock && mainCodeBlock[1]) {
                    console.log('   ✅ Content extraction would work');
                } else {
                    console.log('   ❌ Content extraction would fail');
                }
            }
        }
        
    } catch (error) {
        console.error('❌ Debug script error:', error);
    }
}

// Run the debug function
debugContentExtraction();