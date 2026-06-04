import { useState, useEffect } from "react";
import { Logout } from "./Logout";
import { Link } from "react-router-dom";
import { IoSearchSharp } from "react-icons/io5";
import { useStore } from "@tanstack/react-store";
import { userStore } from "../store/userStore";
import { setLoading } from "../store/userStore";

export const Header = () => {
  const [isSearchOpen] = useState(false);

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

  console.log("Header render", { isLoggedIn, user, loading });

  return (
    <div className="flex p-4 justify-between max-h-14 items-center bg-linear-to-b from-violet-500/60 via-violet-500/40 to-black">
      <div className="text-2xl font-bold">
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
              <Link to="/login">
                <button className="px-3 py-1 rounded-md text-white hover:opacity-80">
                  log in
                </button>
              </Link>

              <Link to="/signup">
                <button className="px-3 py-1 rounded-md text-white hover:opacity-80">
                  sign up
                </button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};