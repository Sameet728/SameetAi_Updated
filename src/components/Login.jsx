import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Please fill in both email and password.");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post("https://sameetai-backend.onrender.com/api/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      toast.success("Login successful!");
      console.log("Login Response:", response.data);
      let user=response.data.user;

      // Example: Store token in localStorage or perform other actions
      localStorage.setItem("user", JSON.stringify(user));
      window.location.reload();
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className='flex flex-col  gap-8 px-8 p-4 justify-center'>
        <div className='flex flex-col gap-2'>
          <h2 className='text-2xl text-center font-bold'>Login</h2>
          <h2 className='font-semibold text-center text-xs'>Let's Login to your Account</h2>
        </div>

        <form onSubmit={handleSubmit} className='flex flex-col gap-7'>
        <label className="input input-bordered flex items-center gap-2">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 16 16"
    fill="currentColor"
    className="h-4 w-4 opacity-70">
    <path
      d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" />
    <path
      d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" />
  </svg>
  <input type="text" name='email' value={formData.email}
              onChange={handleInputChange}
              className="grow"
              placeholder="Email"
              required />
</label>
         
          <label className="input input-bordered flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="h-4 w-4 opacity-70"
            >
              <path
                fillRule="evenodd"
                d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
                clipRule="evenodd"
              />
            </svg>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="grow"
              placeholder="Password"
              required
            />
          </label>

          <button type="submit" className='btn btn-neutral'>
            {loading ? (
              <span className="loading loading-dots loading-md"></span>
            ) : (
              "Login"
            )}
          </button>
        </form>
      </div>
      <ToastContainer />
    </>
  );
}

export default Login;
