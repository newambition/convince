-- Function to create a profile for a new user
CREATE OR REPLACE FUNCTION public.create_public_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'user_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_public_profile();


-- Function to log a user's attempt
CREATE OR REPLACE FUNCTION public.log_attempt(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_is_payout_phase_active BOOLEAN;
BEGIN
  -- Decrement user's credits
  UPDATE public.profiles
  SET credits = credits - 1
  WHERE id = p_user_id;

  -- Increment game state attempts and check for payout phase activation
  UPDATE public.game_state
  SET
    global_attempts = global_attempts + 1,
    game_attempts = game_attempts + 1,
    is_payout_phase_active = CASE
      WHEN game_attempts + 1 >= payout_phase_threshold THEN true
      ELSE is_payout_phase_active
    END
  WHERE id = 1
  RETURNING is_payout_phase_active INTO v_is_payout_phase_active;

  RETURN v_is_payout_phase_active;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Function to handle a win and reset the game state
CREATE OR REPLACE FUNCTION public.handle_win()
RETURNS VOID AS $$
BEGIN
  UPDATE public.game_state
  SET
    game_attempts = 0,
    is_payout_phase_active = false,
    payout_phase_threshold = floor(random() * (1000 - 500 + 1) + 500) -- Example: new random threshold
  WHERE id = 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 