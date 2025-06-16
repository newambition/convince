import { useState } from "react";
import supabase from "../config/supabaseClient";
import { signInWithGoogle } from "./oauth";

const SignUpForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else if (data.user && !data.user.email_confirmed_at) {
      setMessage("Success! Please check your email to confirm your account.");
    } else {
      setMessage("Signed up successfully!");
    }

    setLoading(false);
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSignUp} className="w-full flex flex-col gap-4">
        <div className="w-full flex flex-col gap-2">
          <label className="font-semibold text-xs text-muted-foreground">
            Email
          </label>
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm w-full outline-none bg-input border-border focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="w-full flex flex-col gap-2">
          <label className="font-semibold text-xs text-muted-foreground">
            Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            required
            minLength={6} // Supabase has a minimum password length requirement
            onChange={(e) => setPassword(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm w-full outline-none bg-input border-border focus:ring-1 focus:ring-primary"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="py-2 px-8 bg-primary hover:bg-primary/90 text-primary-foreground w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg cursor-pointer select-none disabled:opacity-50"
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>
        {message && !loading && (
          <p className="text-sm text-center text-red-500 mt-2">{message}</p>
        )}
      </form>

      <div className="relative flex py-4 items-center">
        <div className="flex-grow border-t border-border"></div>
        <span className="flex-shrink mx-4 text-xs text-muted-foreground">
          OR
        </span>
        <div className="flex-grow border-t border-border"></div>
      </div>

      <button
        type="button"
        onClick={signInWithGoogle}
        className="py-2 px-8 bg-card hover:bg-accent border border-border w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg cursor-pointer select-none"
      >
        Sign Up with Google
      </button>
    </div>
  );
};

export default SignUpForm;
