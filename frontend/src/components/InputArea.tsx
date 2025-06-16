import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Coins, CreditCard, Send } from "lucide-react";
import { useAuth } from "../auth/auth-context";

interface InputAreaProps {
  onSendMessage: (message: string) => void;
}

const InputArea = ({ onSendMessage }: InputAreaProps) => {
  const [inputValue, setInputValue] = useState("");
  const { session } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleSend = () => {
    if (inputValue.trim() && session) {
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

  const isInputDisabled = !session;

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
            <span>Credits: 5</span>
            <div className="relative mt-1" ref={menuRef}>
              <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
                <CreditCard className="w-4 h-4 text-primary" />
              </button>

              {isMenuOpen && (
                <div className="absolute bottom-full left-1/2 mb-2 w-56 -translate-x-1/2 rounded-lg border border-border bg-popover py-2 text-popover-foreground shadow-lg z-50">
                  <div className="px-4 py-2">
                    <span className="block border-b border-border pb-2 text-center text-lg font-semibold text-popover-foreground">
                      Purchase Credits
                    </span>
                    <div className="mt-4 flex flex-col space-y-2">
                      <button className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-popover-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
                        <div className="flex items-center">
                          <Coins className="mr-3 h-4 w-4" />
                          <span>5 Credits</span>
                        </div>
                        <span>£3.75</span>
                      </button>
                      <button className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-popover-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
                        <div className="flex items-center">
                          <Coins className="mr-3 h-4 w-4" />
                          <span>10 Credits</span>
                        </div>
                        <span>£5.00</span>
                      </button>
                      <button className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-popover-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
                        <div className="flex items-center">
                          <Coins className="mr-3 h-4 w-4" />
                          <span>20 Credits</span>
                        </div>
                        <span>£9.00</span>
                      </button>
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
