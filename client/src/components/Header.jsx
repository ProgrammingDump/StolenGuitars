import { IoSearchSharp } from "react-icons/io5";
import { Link } from "react-router-dom";

export const Header = () => {
  return (
    <>
      <div className="flex p-4 justify-between max-h-14 items-center bg-linear-to-b from-violet-500/60 via-violet-500/40 to-black">
        <div className="text-2xl font-bold">
          <Link to="/">stolen guitars</Link>
        </div>
        <div className="flex">
          <div className="buttons items-center mx-2">
            <Link to="/login">
              <button className="p-1 rounded-md text-white mr-2">
                log in
              </button>
            </Link>
            <Link to="/signup">
              <button className="p-1 rounded-md text-white">
                sign up
              </button>
            </Link>
          </div>
          <div className="searchbar flex items-center">
            <div className="text-xl flex items-center">
              <IoSearchSharp />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
