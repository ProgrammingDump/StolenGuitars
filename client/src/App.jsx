import { useState, useEffect } from "react";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { Routes, Route, useSearchParams } from "react-router-dom";
import { Home } from "./components/Home";
import { LoginModal } from "./components/LoginModal";
import { SignUpModal } from "./components/SignUpModal";

function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const verified = searchParams.get("verified");
    if (verified === "true") {
      setIsLoginOpen(true);
    }
  }, [searchParams]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header 
        onLoginClick={() => setIsLoginOpen(true)}
        onSignUpClick={() => setIsSignUpOpen(true)}
      />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </main>

      <Footer />

      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)}
      />

      <SignUpModal 
        isOpen={isSignUpOpen} 
        onClose={() => setIsSignUpOpen(false)}
        onSwitchToLogin={() => {
          setIsSignUpOpen(false);
          setIsLoginOpen(true);
        }}
      />
    </div>
  );
}

export default App;