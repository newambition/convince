-- Enable RLS for all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE wins ENABLE ROW LEVEL SECURITY;
ALTER TABLE winning_chat_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE winning_chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for 'profiles'
CREATE POLICY "Users can read their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can delete their own profile" ON profiles FOR DELETE USING (auth.uid() = id);
CREATE POLICY "Profiles are public to authenticated users" ON profiles FOR SELECT TO authenticated USING (true);

-- RLS Policies for 'credit_packs'
CREATE POLICY "Credit packs are public to authenticated users" ON credit_packs FOR SELECT TO authenticated USING (true);

-- RLS Policies for 'purchases'
CREATE POLICY "Users can view their own purchases" ON purchases FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for 'game_state'
CREATE POLICY "Game state is public to authenticated users" ON game_state FOR SELECT TO authenticated USING (true);

-- RLS Policies for 'wins'
CREATE POLICY "Wins are public to authenticated users" ON wins FOR SELECT TO authenticated USING (true);

-- RLS Policies for 'winning_chat_logs'
CREATE POLICY "Winning chat logs are public" ON winning_chat_logs FOR SELECT USING (true);

-- RLS Policies for 'winning_chat_messages'
CREATE POLICY "Winning chat messages are public" ON winning_chat_messages FOR SELECT USING (true); 