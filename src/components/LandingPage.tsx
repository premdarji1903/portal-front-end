import React from "react";
import { useNavigate } from "react-router-dom";
import { FaLock, FaUserShield, FaRocket } from "react-icons/fa";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-gradient-to-br from-indigo-50 to-indigo-100">
      <div className="w-full max-w-lg bg-white p-10 rounded-3xl shadow-2xl border border-gray-200 transition-all duration-300 ease-in-out">
        <h1 className="text-4xl font-extrabold text-center text-indigo-600">Welcome to Portal App</h1>
        <p className="text-center text-gray-500 mt-3 text-lg">Secure. Fast. Reliable.</p>
        <div className="mt-6 space-y-4">
          <FeatureItem icon={<FaLock className="text-indigo-500" />} title="Secure Authentication" description="Your data is encrypted and protected with industry standards." />
          <FeatureItem icon={<FaUserShield className="text-indigo-500" />} title="User-Friendly" description="Simple and seamless authentication for a hassle-free experience." />
          <FeatureItem icon={<FaRocket className="text-indigo-500" />} title="Lightning Fast" description="Optimized for speed and efficiency for an effortless login." />
        </div>
        <div className="mt-8 space-y-5">
          <button
            onClick={() => navigate("/login")}
            className="w-full text-white bg-indigo-500 hover:bg-indigo-600 focus:ring-4 
                       focus:outline-none focus:ring-indigo-300 font-semibold rounded-xl text-lg px-6 py-3 
                       border border-gray-300 transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            Login
          </button>
          
          <button
            onClick={() => navigate("/signup")}
            className="w-full text-white bg-indigo-500 hover:bg-indigo-600 focus:ring-4 
                       focus:outline-none focus:ring-indigo-300 font-semibold rounded-xl text-lg px-6 py-3 
                       border border-gray-300 transition-all duration-300 ease-in-out transform hover:scale-105"
          >
            Sign Up
          </button>
        </div>

        {/* Footer Section */}
        <p className="text-center text-gray-400 mt-6 text-sm">
          By signing in, you agree to our <span className="text-indigo-500 cursor-pointer hover:underline">Terms of Service</span> and <span className="text-indigo-500 cursor-pointer hover:underline">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
};

const FeatureItem = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="flex items-center space-x-4 p-3 border border-gray-200 rounded-xl shadow-sm bg-gray-50 transition-all duration-200 ease-in-out hover:shadow-md">
    <div className="text-2xl">{icon}</div>
    <div>
      <h3 className="font-semibold text-gray-800">{title}</h3>
      <p className="text-gray-500 text-sm">{description}</p>
    </div>
  </div>
);

export default LandingPage;
