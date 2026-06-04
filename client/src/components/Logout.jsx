import { userStore } from "../store/userStore";
import { useNavigate } from "react-router-dom";

export const Logout = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        userStore.setState({
            user: null,
            isLoggedIn: false,
            loading: false,
        });

        navigate("/login");
    };

    return (
        <button
            onClick={handleLogout}
            className="p-1 rounded-md text-white"
        >
            log out
        </button>
    );
};