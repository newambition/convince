import { useAuth } from "../auth/auth-context";
import type { Message } from "../types";
import { Bot, User } from "lucide-react";

interface ChatAreaProps {
  messages: Message[];
  onLoginClick: () => void;
}

const ChatArea = ({ messages, onLoginClick }: ChatAreaProps) => {
  const { session } = useAuth();

  const formatTimestamp = (date: Date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  if (!session) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center text-center overflow-y-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-primary tracking-tight">
          I'm the
          <br />
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent tracking-tighter">
            Gatekeeper
          </span>
        </h1>
        <p className="text-muted-foreground mt-4 text-sm md:text-lg tracking-tight">
          Want the money?
          <br />
          Convince me
          <br />
          You'll get all of it
        </p>
        <div className="mt-6">
          <button
            className="px-4 py-2 md:text-lg md:px-10 md:py-3 rounded-lg transition-all duration-200 bg-card text-foreground shadow-[6px_6px_12px_hsl(var(--shadow-dark)),-4px_-4px_12px_hsl(var(--shadow-light))] active:shadow-[inset_4px_4px_12px_hsl(var(--shadow-dark)),inset_-4px_-4px_12px_hsl(var(--shadow-light))]"
            onClick={onLoginClick}
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center text-center overflow-y-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-primary tracking-tight">
          I'm the
          <br />
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent tracking-tighter">
            Gatekeeper
          </span>
        </h1>
        <p className="text-muted-foreground mt-4 text-sm md:text-lg tracking-tight">
          Start the conversation...
        </p>
      </div>
    );
  }

  return (
    <div className="flex-grow overflow-y-auto space-y-4 p-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex items-start gap-4 ${
            message.sender === "user" ? "justify-end" : ""
          }`}
        >
          {message.sender === "ai" && (
            <div className="bg-primary rounded-full p-2 w-8 h-8 flex items-center justify-center shrink-0">
              <Bot className="text-primary-foreground" />
            </div>
          )}
          <div
            className={`rounded-lg px-4 py-2 max-w-md ${
              message.sender === "user"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            <p className="text-sm">{message.text}</p>
            <p className="text-xs text-right opacity-70 mt-1">
              {formatTimestamp(message.timestamp)}
            </p>
          </div>
          {message.sender === "user" && (
            <div className="bg-secondary rounded-full p-2 w-8 h-8 flex items-center justify-center shrink-0">
              <User className="text-secondary-foreground" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ChatArea;
