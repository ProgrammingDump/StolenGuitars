import { useEffect } from "react";
import { Logout } from "./Logout";
import { Link } from "react-router-dom";
import { IoSearchSharp } from "react-icons/io5";
import { useStore } from "@tanstack/react-store";
import { userStore } from "../store/userStore";
import { setLoading } from "../store/userStore";

export const Header = ({ onLoginClick, onSignUpClick }) => {
  useEffect(() => {
    setLoading(false);
  }, []);

  const { isLoggedIn, user, loading } = useStore(
    userStore,
    (s) => s
  );

  const getUsername = () => {
    if (!user?.username) return "";
    return user.username.split(" ")[0];
  };

  return (
    <div className="flex py-2 px-4 justify-between max-h-14 items-center bg-linear-to-b from-violet-500/60 via-violet-500/40 to-black">
      <div className="text-xl font-bold">
        <Link to="/">stolen guitars</Link>
      </div>

      <div className="flex items-center">
        <div className="searchbar flex items-center mr-4">
          <IoSearchSharp />
        </div>

        <div className="buttons flex items-center gap-3">
          {loading ? (
            <div className="text-white text-sm">Loading...</div>
          ) : isLoggedIn && user ? (
            <>
              <span className="text-white font-medium">
                {getUsername()}
              </span>

              <Logout />
            </>
          ) : (
            <>
              <button 
                onClick={onLoginClick}
                className="px-3 py-1 rounded-md text-white hover:opacity-80 transition-opacity cursor-pointer"
              >
                log in
              </button>

              <button 
                onClick={onSignUpClick}
                className="px-3 py-1 rounded-md text-white hover:opacity-80 transition-opacity cursor-pointer"
              >
                sign up
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};