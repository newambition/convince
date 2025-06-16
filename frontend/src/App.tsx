import { useState, useEffect } from "react";
import type { Message } from "./types";
import Header from "./components/header";
import ChatArea from "./components/ChatArea";
import InputArea from "./components/InputArea";
import LoginModal from "./auth/login-modal";
import { useAuth } from "./auth/auth-context";

const App = () => {
  const [theme, setTheme] = useState("dark");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loginModalState, setLoginModalState] = useState(false);
  const { session, loading } = useAuth();

  useEffect(() => {
    if (theme === "dark") {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [theme]);

  // Close modal on successful login
  useEffect(() => {
    if (session) {
      setLoginModalState(false);
    }
  }, [session]);

  const handleSendMessage = (text: string) => {
    const newMessage: Message = {
      id: messages.length + 1,
      text,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: messages.length + 2,
        text: "I understand your request. Let me help you with that. This is a demo response showing how the AI chat component works with smooth animations and a professional interface.",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, aiResponse]);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="bg-background flex items-center justify-center min-h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-background flex items-center justify-center min-h-screen">
        <div className="w-full h-screen sm:w-[70%] sm:h-[85vh] sm:rounded-2xl mx-auto bg-background  overflow-hidden">
          <div className="bg-background text-foreground p-4 flex flex-col h-full ">
            <Header theme={theme} setTheme={setTheme} />
            <ChatArea
              messages={messages}
              onLoginClick={() => setLoginModalState(true)}
            />
            <InputArea onSendMessage={handleSendMessage} />
          </div>
        </div>
      </div>
      {loginModalState && !session && (
        <LoginModal closeModal={() => setLoginModalState(false)} />
      )}
    </>
  );
};

export default App;
