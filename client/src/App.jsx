import { useState, useEffect } from "react";
import axios from "axios";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { Routes, Route, useSearchParams } from "react-router-dom";
import { Home } from "./components/Home";
import { LoginModal } from "./components/LoginModal";
import { SignUpModal } from "./components/SignUpModal";
import { setUser, clearUser, setLoading } from "./store/userStore";

function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [searchParams] = useSearchParams();

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:5050/api/auth/me", {
          withCredentials: true,
        });
        if (res.data.user) {
          setUser(res.data.user);
        } else {
          clearUser();
        }
      } catch (err) {
        clearUser();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

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