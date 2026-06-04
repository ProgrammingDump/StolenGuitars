import React from 'react'
import Link from "react-router-dom/Link";

export const ProfileButton = () => {
    return (
        <div>
            <Link to="/profile">
                <button>Profile</button>
            </Link>
        </div>
    )
}

