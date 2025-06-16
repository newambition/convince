import { useState, useEffect, useRef } from "react";
import { Info, User, LogOut } from "lucide-react";
import { useAuth } from "../auth/auth-context";
import supabase from "../config/supabaseClient";
import type { GameStateResponse, ProfileResponse } from "../types";

interface HeaderProps {
  theme: string;
  setTheme: (theme: string) => void;
  profile: ProfileResponse | null;
  gameState: GameStateResponse | null;
  isProfileLoading?: boolean;
  isGameStateLoading?: boolean;
}

const Header = ({
  theme,
  setTheme,
  profile,
  gameState,
  isProfileLoading = false,
  isGameStateLoading = false,
}: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMenu2Open, setIsMenu2Open] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menu2Ref = useRef<HTMLDivElement>(null);
  const { session, user } = useAuth();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        menu2Ref.current &&
        !menu2Ref.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
        setIsMenu2Open(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Use profile avatar_url if available, fallback to user metadata
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;

  // Format prize pool amount
  const formatPrizePool = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return "£0";
    return `£${amount.toLocaleString("en-GB", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="flex items-center mb-2 sm:mb-4">
      <div className="flex items-center space-x-2 bg-card/50 rounded-full py-2 px-3 -ml-2 border border-border/50">
        <span className="font-bold text-sm md:text-lg animated-gradient-text">
          {isGameStateLoading ? (
            <span className="animate-pulse">Prize Pool: Loading...</span>
          ) : (
            `Prize Pool: ${formatPrizePool(gameState?.prizepool_amount)}`
          )}
        </span>
      </div>
      <div className="flex items-center ml-auto space-x-2">
        <div className="relative" ref={menu2Ref}>
          <button
            onClick={() => {
              setIsMenu2Open(!isMenu2Open);
              if (!isMenu2Open) setIsMenuOpen(false);
            }}
          >
            <Info className="text-foreground size-5 sm:size-6 hover:text-primary hover:cursor-pointer mr-2" />
          </button>
          {isMenu2Open && (
            <div className="absolute right-2 mt-2 w-48 bg-popover text-popover-foreground rounded-lg shadow-lg border border-border py-1 z-50">
              <div className="px-4 py-2 flex flex-col justify-between items-center">
                <button className="text-sm font-medium text-popover-foreground hover:bg-accent hover:text-popover-foreground rounded-lg px-4 py-2">
                  About
                </button>
                <button className="text-sm font-medium text-popover-foreground hover:bg-accent hover:text-popover-foreground rounded-lg px-4 py-2">
                  Terms of Service
                </button>
                <button className="text-sm font-medium text-popover-foreground hover:bg-accent hover:text-popover-foreground rounded-lg px-4 py-2">
                  Privacy Policy
                </button>
                <button className="text-sm font-medium text-popover-foreground hover:bg-accent hover:text-popover-foreground rounded-lg px-4 py-2">
                  Contact Us
                </button>
              </div>
            </div>
          )}
        </div>
        {session && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => {
                setIsMenuOpen(!isMenuOpen);
                if (!isMenuOpen) setIsMenu2Open(false);
              }}
            >
              <div className="bg-primary rounded-full w-8 h-8 flex items-center justify-center sm:w-10 sm:h-10 overflow-hidden">
                {isProfileLoading ? (
                  <div className="animate-pulse bg-gray-300 w-full h-full rounded-full"></div>
                ) : avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="User Avatar"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to User icon if image fails to load
                      (e.target as HTMLImageElement).style.display = "none";
                      (
                        e.target as HTMLImageElement
                      ).nextElementSibling?.classList.remove("hidden");
                    }}
                  />
                ) : null}
                <User
                  className={`text-white ${
                    avatarUrl && !isProfileLoading ? "hidden" : ""
                  }`}
                />
              </div>
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-popover text-popover-foreground rounded-lg shadow-lg border border-border py-1 z-50">
                <div className="px-4 py-2 flex justify-between items-center">
                  <span className="text-sm font-medium text-popover-foreground">
                    Theme
                  </span>
                  <button
                    onClick={toggleTheme}
                    className="relative inline-flex items-center h-6 rounded-full w-10 focus:outline-none"
                  >
                    <span
                      className={`${
                        theme === "dark" ? "bg-primary" : "bg-gray-200"
                      } absolute w-full h-full rounded-full`}
                    ></span>
                    <span
                      className={`${
                        theme === "dark"
                          ? "translate-x-5 bg-white"
                          : "translate-x-0 bg-primary"
                      } inline-block w-6 h-6 transform rounded-full transition-transform duration-200`}
                    />
                  </button>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-popover-foreground hover:bg-accent flex items-center"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
