import axios from "axios";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { clearUser } from "../store/userStore";

export const Logout = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const handleLogout = async () => {
        try {
            await axios.post(
                "http://localhost:5050/api/auth/logout",
                {},
                { withCredentials: true }
            );
            clearUser();
            navigate("/");
        } catch (err) {
            console.error("Logout failed:", err);
            clearUser();
            navigate("/");
        }
        };

        handleLogout();
    }, [navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center text-white">
            Logging out...
        </div>
    );
};