-- Function to handle a credit purchase atomically
CREATE OR REPLACE FUNCTION public.purchase_credits(p_user_id UUID, p_pack_id UUID)
RETURNS TABLE (
    purchase_id UUID,
    new_credits_balance INT
) AS $$
DECLARE
    v_credits_to_add INT;
    v_new_balance INT;
    v_purchase_id UUID;
BEGIN
    -- Get the number of credits to add from the credit pack
    SELECT credits_amount INTO v_credits_to_add
    FROM public.credit_packs
    WHERE id = p_pack_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Credit pack not found';
    END IF;

    -- Update the user's credits and return the new balance
    UPDATE public.profiles
    SET credits = credits + v_credits_to_add
    WHERE id = p_user_id
    RETURNING credits INTO v_new_balance;

    -- Log the purchase
    INSERT INTO public.purchases (user_id, credit_pack_id)
    VALUES (p_user_id, p_pack_id)
    RETURNING id INTO v_purchase_id;

    -- Return the results
    RETURN QUERY SELECT v_purchase_id, v_new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 