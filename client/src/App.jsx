import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import axios from "axios";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { Home } from "./components/Home";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import { Logout } from "./components/Logout";
import { setUser, clearUser, setLoading } from "./store/userStore";

function App() {
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
      } catch {
        clearUser();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/logout" element={<Logout />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;