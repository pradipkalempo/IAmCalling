// Database verification and test post creation
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyDatabase() {
    console.log('🔍 Verifying database connection and content...');
    
    try {
        // Check posts table
        const { data: posts, error: postsError } = await supabase
            .from('posts')
            .select('id,title,author_name,published')
            .limit(10);
        
        if (postsError) {
            console.error('❌ Posts table error:', postsError);
        } else {
            console.log(`✅ Posts table accessible - Found ${posts.length} posts`);
            posts.forEach(post => {
                console.log(`  📄 Post ${post.id}: "${post.title}" by ${post.author_name} (published: ${post.published})`);
            });
        }
        
        // Check if we have published posts
        const { data: publishedPosts, error: publishedError } = await supabase
            .from('posts')
            .select('id,title')
            .eq('published', true);
        
        if (publishedError) {
            console.error('❌ Published posts query error:', publishedError);
        } else {
            console.log(`✅ Published posts: ${publishedPosts.length}`);
            
            if (publishedPosts.length === 0) {
                console.log('⚠️ No published posts found. Creating test posts...');
                await createTestPosts();
            }
        }
        
    } catch (error) {
        console.error('❌ Database verification failed:', error);
    }
}

async function createTestPosts() {
    const testPosts = [
        {
            title: 'Welcome to IAMCALLING - Critical Thinking Platform',
            content: `
                <div style="text-align: center; padding: 2rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 12px; margin: 20px 0;">
                    <h2>🧠 Welcome to IAMCALLING</h2>
                    <p>Your journey to enhanced critical thinking starts here!</p>
                    <p>Explore interactive scenarios, analyze evidence, and develop your analytical skills.</p>
                </div>
            `,
            author_name: 'IAMCALLING Team',
            published: true,
            is_official: true,
            thumbnail_url: 'https://picsum.photos/seed/welcome/400/250'
        },
        {
            title: 'How to Develop Critical Thinking Skills',
            content: `
                <div style="padding: 1.5rem;">
                    <h3>🎯 Key Steps to Critical Thinking</h3>
                    <ol>
                        <li><strong>Question Everything</strong> - Don't accept information at face value</li>
                        <li><strong>Gather Evidence</strong> - Look for reliable sources and data</li>
                        <li><strong>Analyze Bias</strong> - Identify potential biases in information</li>
                        <li><strong>Consider Alternatives</strong> - Explore different perspectives</li>
                        <li><strong>Draw Conclusions</strong> - Make informed decisions based on evidence</li>
                    </ol>
                    <p>Practice these skills daily to become a better analytical thinker!</p>
                </div>
            `,
            author_name: 'Pradip Kale',
            published: true,
            is_official: true,
            thumbnail_url: 'https://picsum.photos/seed/thinking/400/250'
        },
        {
            title: 'Interactive Challenge: Analyze This Scenario',
            content: `
                <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #007bff;">
                    <h3>🎮 Challenge Scenario</h3>
                    <p><strong>Situation:</strong> A news article claims that "90% of experts agree on this topic" but doesn't specify which experts or their qualifications.</p>
                    <p><strong>Your Task:</strong> What questions would you ask to verify this claim?</p>
                    <div style="margin-top: 1rem; padding: 1rem; background: white; border-radius: 4px;">
                        <p><strong>Think about:</strong></p>
                        <ul>
                            <li>Who are these "experts"?</li>
                            <li>What are their qualifications?</li>
                            <li>How was the survey conducted?</li>
                            <li>What was the sample size?</li>
                        </ul>
                    </div>
                </div>
            `,
            author_name: 'Challenge System',
            published: true,
            is_official: true,
            challenge_post_id: 'THINK001',
            thumbnail_url: 'https://picsum.photos/seed/challenge/400/250'
        }
    ];
    
    try {
        for (const post of testPosts) {
            const { data, error } = await supabase
                .from('posts')
                .insert([post])
                .select();
            
            if (error) {
                console.error(`❌ Failed to create post "${post.title}":`, error);
            } else {
                console.log(`✅ Created test post: "${post.title}" (ID: ${data[0].id})`);
            }
        }
    } catch (error) {
        console.error('❌ Test post creation failed:', error);
    }
}

// Run verification
verifyDatabase().then(() => {
    console.log('🏁 Database verification complete');
    process.exit(0);
}).catch(error => {
    console.error('💥 Verification failed:', error);
    process.exit(1);
});