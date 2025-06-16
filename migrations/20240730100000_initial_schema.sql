-- Create the 'profiles' table
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    avatar_url TEXT,
    credits INT NOT NULL DEFAULT 0
);

-- Create the 'credit_packs' table
CREATE TABLE credit_packs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    credits_amount INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL
);

-- Create the 'purchases' table
CREATE TABLE purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    credit_pack_id UUID NOT NULL REFERENCES credit_packs(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create the 'game_state' table (singleton)
CREATE TABLE game_state (
    id INT PRIMARY KEY CHECK (id = 1),
    prizepool_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    global_attempts BIGINT NOT NULL DEFAULT 0,
    game_attempts BIGINT NOT NULL DEFAULT 0,
    payout_phase_threshold BIGINT NOT NULL,
    is_payout_phase_active BOOLEAN NOT NULL DEFAULT false
);

-- Insert the single row into game_state, setting an initial random threshold
INSERT INTO game_state (id, payout_phase_threshold)
VALUES (1, floor(random() * (1000 - 500 + 1) + 500)); -- Example: random threshold between 500 and 1000

-- Create the 'winning_chat_logs' table
CREATE TABLE winning_chat_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create the 'wins' table
CREATE TABLE wins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    win_time TIMESTAMPTZ NOT NULL DEFAULT now(),
    global_attempt_at_win BIGINT NOT NULL,
    winning_chat_log_id UUID UNIQUE NOT NULL REFERENCES winning_chat_logs(id)
);

-- Create the 'winning_chat_messages' table
CREATE TABLE winning_chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    log_id UUID NOT NULL REFERENCES winning_chat_logs(id) ON DELETE CASCADE,
    prompt TEXT NOT NULL,
    response TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
); 