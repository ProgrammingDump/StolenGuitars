import axios from "axios";
import { clearUser } from "../store/userStore";

export const Logout = () => {
    const handleLogout = async () => {
        try {
            await axios.post(
                "http://localhost:5050/api/auth/logout",
                {},
                { withCredentials: true }
            );
            clearUser();
            window.location.href = "/";
        } catch (err) {
            console.error("Logout failed:", err);
            clearUser();
            window.location.href = "/";
        }
    };

    return (
        <button
            onClick={handleLogout}
            className="p-1 rounded-md text-white hover:opacity-80 transition-opacity cursor-pointer"
        >
            log out
        </button>
    );
};