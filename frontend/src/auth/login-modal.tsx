import { useState } from "react";
import supabase from "../config/supabaseClient";
import SignUpForm from "./sign-up-form";
import { signInWithGoogle } from "./oauth";

interface LoginModalProps {
  closeModal: () => void;
}

const LoginModal = ({ closeModal }: LoginModalProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage("Logged in successfully!");
      // You might want to close the modal on success
      // closeModal();
    }

    setLoading(false);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex justify-center items-center p-4"
      onClick={closeModal}
    >
      <div
        className="relative sm:max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-popover text-popover-foreground p-8 rounded-xl shadow-lg flex flex-col items-center">
          {isSignUp ? (
            <>
              <div className="text-center mb-8">
                <p className="m-0 text-lg font-semibold">Create an Account</p>
              </div>
              <SignUpForm />
              <div className="text-center mt-4">
                <button
                  onClick={() => setIsSignUp(false)}
                  className="text-sm text-primary hover:underline"
                  type="button"
                >
                  Already have an account? Log in
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="text-center mb-8">
                <p className="m-0 text-lg font-semibold">
                  Login to your Account
                </p>
              </div>
              <form
                onSubmit={handleLogin}
                className="w-full flex flex-col gap-4"
              >
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
                    onChange={(e) => setPassword(e.target.value)}
                    className="border rounded-lg px-3 py-2 text-sm w-full outline-none bg-input border-border focus:ring-1 focus:ring-primary"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="py-2 mt-2 px-8 bg-primary hover:bg-primary/90 text-primary-foreground w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg cursor-pointer select-none disabled:opacity-50"
                >
                  {loading ? "Logging in..." : "Login"}
                </button>
                {message && !loading && (
                  <p className="text-sm text-center text-red-500 mt-2">
                    {message}
                  </p>
                )}
              </form>
              <div className="relative flex py-4 items-center w-full">
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
                Login with Google
              </button>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => setIsSignUp(true)}
                  className="text-sm text-primary hover:underline"
                >
                  Not a user? Sign up here
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
