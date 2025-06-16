import { useState, useEffect } from "react";
import type { Message } from "./types";
import Header from "./components/header";
import ChatArea from "./components/ChatArea";
import InputArea from "./components/InputArea";
import LoginModal from "./auth/login-modal";
import { useAuth } from "./auth/auth-context";
import { useAppData } from "./hooks/useAppData";

const App = () => {
  // UI State
  const [theme, setTheme] = useState("dark");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loginModalState, setLoginModalState] = useState(false);

  // Auth
  const { session, loading: authLoading } = useAuth();

  // Backend Data Management
  const { appData, loadingStates, errorStates, actions } = useAppData(session);

  // Theme effect
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

  const handleSendMessage = async (text: string) => {
    const newMessage: Message = {
      id: messages.length + 1,
      text,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);

    // Log attempt if user is authenticated
    await actions.logAttempt();

    // Simulate AI response (you'll replace this with actual AI integration)
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

  // Show loading screen while auth is loading
  if (authLoading) {
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
            <Header
              theme={theme}
              setTheme={setTheme}
              profile={appData.profile}
              gameState={appData.gameState}
              isProfileLoading={loadingStates.profile}
              isGameStateLoading={loadingStates.gameState}
            />
            <ChatArea
              messages={messages}
              onLoginClick={() => setLoginModalState(true)}
              isAuthenticated={!!session}
              onWinSubmission={actions.handleWinSubmission}
              isSubmissionLoading={loadingStates.chatSubmission}
              submissionError={errorStates.chatSubmission}
            />
            <InputArea
              onSendMessage={handleSendMessage}
              disabled={loadingStates.chatSubmission}
              profile={appData.profile}
              creditPacks={appData.creditPacks}
              isProfileLoading={loadingStates.profile}
              isCreditPacksLoading={loadingStates.creditPacks}
              onPurchaseCreditPack={actions.purchaseCreditPack}
            />
          </div>
        </div>
      </div>
      {loginModalState && !session && (
        <LoginModal closeModal={() => setLoginModalState(false)} />
      )}

      {/* Debug info - remove in production */}
      {/*{process.env.NODE_ENV === "development" && (
        <div className="fixed top-20 left-0 bg-black bg-opacity-75 text-white p-2 text-xs max-w-sm rounded-r-lg z-40">
          <div>
            Game State:{" "}
            {loadingStates.gameState
              ? "Loading..."
              : appData.gameState
              ? "Loaded"
              : "Error"}
          </div>
          <div>
            Profile:{" "}
            {loadingStates.profile
              ? "Loading..."
              : appData.profile
              ? "Loaded"
              : "Not loaded"}
          </div>
          <div>
            Credit Packs:{" "}
            {loadingStates.creditPacks
              ? "Loading..."
              : `${appData.creditPacks.length} loaded`}
          </div>
          <div>Credits: {appData.profile?.credits ?? "N/A"}</div>
          <div>Prizepool: ${appData.gameState?.prizepool_amount ?? "N/A"}</div>
          {errorStates.gameState && (
            <div className="text-red-300">
              Game Error: {errorStates.gameState}
            </div>
          )}
          {errorStates.profile && (
            <div className="text-red-300">
              Profile Error: {errorStates.profile}
            </div>
          )}
          {errorStates.creditPacks && (
            <div className="text-red-300">
              Credits Error: {errorStates.creditPacks}
            </div> 
          )}
        </div>
      )} */}
    </>
  );
};

export default App;
