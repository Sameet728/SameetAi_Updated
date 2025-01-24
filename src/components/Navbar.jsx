import React, { useEffect, useState } from "react";
import { FaBars } from "react-icons/fa";
import Signup from "./Signup";
import Login from "./Login";
import axios from "axios";
import { toast } from "react-toastify";

const Navbar = () => {
  const [storedUser, setstoredUser] = useState(0);
  const [backready, SetBackready] = useState(1);
  const isUserExists = () => {
    if (localStorage.getItem("user")) {
      setstoredUser(1);
    }
    else {
      setstoredUser(0);
    }

  };
  useEffect(() => {
    isUserExists();
    backendChecker();
    console.log(storedUser)
  }, [])
  const logoutHandler = async () => {
    try {
      // Call the API to handle server-side logout (optional)
      await axios.post("https://sameetai-backend.onrender.com/api/auth/logout");

      // Clear user data from localStorage
      localStorage.removeItem("user");
      localStorage.removeItem("chats");

      // Show success toast notification
      toast.success("Logged out successfully!");

      // Redirect to login page
      setTimeout(() => {
        window.location.href = "/";
      }, 1000); // Delay to allow the toast to display before redirecting

      console.log("User has been logged out.");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to log out. Please try again.");
    }
  };
  const backendChecker = async () => {
    try {
      let response = await axios.get("https://sameetai-backend.onrender.com");
      let msg = response.data;
      console.log(msg);
      SetBackready(!backready);
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Backend Failed . Please try again.");
    }
  };


  return (
    <nav className="navbar fixed top-0 z-10 bg-base-100 shadow-md px-4 md:px-8">
      {/* Logo */}
      <div className="flex-1">
        <a className="btn btn-ghost normal-case text-xl" href="/">
          SameetAi
        </a>
      </div>

      {/* Menu for larger screens */}
      <div className="hidden md:flex space-x-4">


        <a className="btn btn-ghost" href="/home">Home</a>
        <a className="btn btn-ghost" href="/about">About</a>
        <a className="btn btn-ghost" href="/services">Services</a>
        <a className="btn btn-ghost" href="/contact">Contact</a>
      </div>

      {/* Profile Picture */}
      <div className="flex items-center space-x-4">
        <span className={` cursor-pointer loading loading-ring loading-lg ${backready ? "bg-red-500" : "bg-green-400"
          }`}
        ></span>
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
            <div className="w-10 rounded-full">

              <img
                src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                alt="Profile"
              />
            </div>
          </label>
          <ul
            tabIndex={0}
            className="menu dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52"
          >
            {storedUser ? (<li><a href="/profile">Profile</a></li>) : ("")}
            {!storedUser ? (<li><a onClick={() => document.getElementById('my_modal_22').showModal()}>Login</a></li>) : ("")}

            <dialog id="my_modal_22" className="modal">
              <div className="modal-box">
                <Login />

              </div>
            </dialog>
            {!storedUser ? (<li><a onClick={() => document.getElementById('my_modal_2').showModal()}>Signup</a></li>) : ("")}

            {/* Open the modal using document.getElementById('ID').showModal() method */}

            <dialog id="my_modal_2" className="modal">
              <div className="modal-box">
                <Signup />

              </div>
            </dialog>
            {storedUser ? (<li><a href="/settings">Settings</a></li>) : ("")}
            {storedUser ? (<li><a onClick={logoutHandler}>Logout</a></li>) : ("")}


          </ul>
        </div>

        {/* Hamburger Menu for smaller screens */}
        <div className="dropdown dropdown-end md:hidden">

          <label tabIndex={0} className="btn btn-ghost">
            <FaBars size={20} />
          </label>
          <ul
            tabIndex={0}
            className="menu dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52"
          >
            <li><a href="/home">Home</a></li>
            <li><a href="/about">About</a></li>
            <li><a href="/services">Services</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
