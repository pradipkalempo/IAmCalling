-- Create god_beliefs table for storing God Belief Analyzer results
CREATE TABLE IF NOT EXISTS god_beliefs (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    user_email VARCHAR(255),
    responses JSONB NOT NULL,
    beneficiary_scores JSONB NOT NULL,
    top_beneficiary VARCHAR(255) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_god_beliefs_session_id ON god_beliefs(session_id);
CREATE INDEX IF NOT EXISTS idx_god_beliefs_user_email ON god_beliefs(user_email);
CREATE INDEX IF NOT EXISTS idx_god_beliefs_top_beneficiary ON god_beliefs(top_beneficiary);
CREATE INDEX IF NOT EXISTS idx_god_beliefs_completed_at ON god_beliefs(completed_at);

-- Create function to create the table (for API compatibility)
CREATE OR REPLACE FUNCTION create_god_beliefs_table()
RETURNS void AS $$
BEGIN
    -- Table creation is handled above, this function is for API compatibility
    RAISE NOTICE 'God beliefs table already exists or has been created';
END;
$$ LANGUAGE plpgsql;