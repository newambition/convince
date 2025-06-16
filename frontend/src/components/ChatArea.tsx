import { useAuth } from "../auth/auth-context";
import { useEffect } from "react";
import type { Message, ChatMessage } from "../types";
import { Bot, User, Trophy } from "lucide-react";

interface ChatAreaProps {
  messages: Message[];
  onLoginClick: () => void;
  isAuthenticated: boolean;
  onWinSubmission: (chatLog: ChatMessage[]) => Promise<any>;
  isSubmissionLoading: boolean;
  submissionError: string | null;
}

const ChatArea = ({
  messages,
  onLoginClick,
  isAuthenticated,
  onWinSubmission,
  isSubmissionLoading,
  submissionError,
}: ChatAreaProps) => {
  const { session } = useAuth();

  // Convert Message[] to ChatMessage[] format for backend
  const convertToChatMessages = (messages: Message[]): ChatMessage[] => {
    const chatMessages: ChatMessage[] = [];

    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];

      if (message.sender === "user") {
        // Find the next AI response
        const nextAiMessage = messages.find(
          (m, index) => index > i && m.sender === "ai"
        );

        if (nextAiMessage) {
          chatMessages.push({
            prompt: message.text,
            response: nextAiMessage.text,
          });
        }
      }
    }

    return chatMessages;
  };

  // Auto-detect winning message and trigger win submission
  useEffect(() => {
    const hasWinningMessage = messages.some((message) => message.isWinning);

    if (hasWinningMessage && isAuthenticated && !isSubmissionLoading) {
      const chatLog = convertToChatMessages(messages);
      console.log("Winning message detected! Submitting chat log:", chatLog);
      onWinSubmission(chatLog);
    }
  }, [messages, isAuthenticated, isSubmissionLoading, onWinSubmission]);

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
      {/* Win submission status */}
      {isSubmissionLoading && (
        <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-3 mb-4">
          <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">
            🎉 Processing your win...
          </p>
        </div>
      )}

      {submissionError && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4">
          <p className="text-red-600 dark:text-red-400 text-sm font-medium">
            ❌ Win submission failed: {submissionError}
          </p>
        </div>
      )}

      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex items-start gap-4 ${
            message.sender === "user" ? "justify-end" : ""
          }`}
        >
          {message.sender === "ai" && (
            <div
              className={`rounded-full p-2 w-8 h-8 flex items-center justify-center shrink-0 ${
                message.isWinning ? "bg-yellow-500 animate-pulse" : "bg-primary"
              }`}
            >
              {message.isWinning ? (
                <Trophy className="text-white h-4 w-4" />
              ) : (
                <Bot className="text-primary-foreground" />
              )}
            </div>
          )}
          <div
            className={`rounded-lg px-4 py-2 max-w-md ${
              message.sender === "user"
                ? "bg-primary text-primary-foreground"
                : message.isWinning
                ? "bg-yellow-500/20 border border-yellow-500/50 text-yellow-800 dark:text-yellow-200"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {message.isWinning && (
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <span className="text-xs font-bold text-yellow-600 dark:text-yellow-400 uppercase tracking-wide">
                  Winning Message
                </span>
              </div>
            )}
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
