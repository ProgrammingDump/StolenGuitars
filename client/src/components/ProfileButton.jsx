import { Link } from "react-router-dom";

export const ProfileButton = () => {
    return (
        <div>
            <Link to="/profile">
                <button>Profile</button>
            </Link>
        </div>
    )
}
