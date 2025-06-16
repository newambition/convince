import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Coins, CreditCard, Send } from "lucide-react";
import { useAuth } from "../auth/auth-context";
import type { ProfileResponse, CreditPackResponse } from "../types";

interface InputAreaProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  profile: ProfileResponse | null;
  creditPacks: CreditPackResponse[];
  isProfileLoading?: boolean;
  isCreditPacksLoading?: boolean;
  onPurchaseCreditPack?: (packId: string) => Promise<any>;
}

const InputArea = ({
  onSendMessage,
  disabled = false,
  profile,
  creditPacks,
  isProfileLoading = false,
  isCreditPacksLoading = false,
  onPurchaseCreditPack,
}: InputAreaProps) => {
  const [inputValue, setInputValue] = useState("");
  const { session } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [purchasingPackId, setPurchasingPackId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleSend = () => {
    if (inputValue.trim() && session && !disabled) {
      onSendMessage(inputValue);
      setInputValue("");
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handlePurchase = async (packId: string) => {
    if (!onPurchaseCreditPack) return;

    setPurchasingPackId(packId);
    try {
      await onPurchaseCreditPack(packId);
      setIsMenuOpen(false); // Close menu on successful purchase
    } catch (error) {
      console.error("Purchase failed:", error);
      // TODO: Show error message to user
    } finally {
      setPurchasingPackId(null);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const isInputDisabled = !session || disabled;
  const userCredits = profile?.credits ?? 0;

  // Format currency
  const formatPrice = (price: number) => {
    return `£${price.toFixed(2)}`;
  };

  return (
    <div className="mt-auto mb-1 md:w-1/2 md:mx-auto">
      <div
        className={`bg-card rounded-2xl p-4 border border-border transition-all ${
          isInputDisabled ? "opacity-50" : "focus-within:border-primary"
        }`}
      >
        <textarea
          className="w-full mb-4 bg-transparent text-foreground placeholder-muted-foreground focus:outline-none resize-none text-xs md:text-sm"
          placeholder={
            isInputDisabled
              ? "Please log in to chat"
              : "Type your message here..."
          }
          rows={1}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isInputDisabled}
        ></textarea>
        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center space-x-4 text-muted-foreground text-sm md:text-sm">
            <span>
              Credits:{" "}
              {isProfileLoading ? (
                <span className="animate-pulse">...</span>
              ) : (
                userCredits
              )}
            </span>
            <div className="relative mt-1" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                disabled={!session}
                className="disabled:opacity-50"
              >
                <CreditCard className="w-4 h-4 text-primary" />
              </button>

              {isMenuOpen && (
                <div className="absolute bottom-full left-1/2 mb-2 w-56 -translate-x-1/2 rounded-lg border border-border bg-popover py-2 text-popover-foreground shadow-lg z-50">
                  <div className="px-4 py-2">
                    <span className="block border-b border-border pb-2 text-center text-lg font-semibold text-popover-foreground">
                      Purchase Credits
                    </span>
                    <div className="mt-4 flex flex-col space-y-2">
                      {isCreditPacksLoading ? (
                        <div className="text-center py-4">
                          <span className="animate-pulse">
                            Loading credit packs...
                          </span>
                        </div>
                      ) : creditPacks.length > 0 ? (
                        creditPacks.map((pack) => (
                          <button
                            key={pack.id}
                            onClick={() => handlePurchase(pack.id)}
                            disabled={
                              purchasingPackId === pack.id ||
                              !onPurchaseCreditPack
                            }
                            className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-popover-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <div className="flex items-center">
                              <Coins className="mr-3 h-4 w-4" />
                              <span>
                                {purchasingPackId === pack.id
                                  ? "Purchasing..."
                                  : `${pack.credits_amount} Credits`}
                              </span>
                            </div>
                            <span>{formatPrice(pack.price)}</span>
                          </button>
                        ))
                      ) : (
                        <div className="text-center py-4 text-muted-foreground">
                          No credit packs available
                        </div>
                      )}
                      {!onPurchaseCreditPack && creditPacks.length > 0 && (
                        <div className="text-xs text-muted-foreground text-center mt-2">
                          Payment processing coming soon
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={handleSend}
            className="rounded-full bg-accent p-2 disabled:opacity-70"
            disabled={isInputDisabled || !inputValue.trim()}
          >
            <Send className="w-3 h-3 text-primary" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default InputArea;
