import React from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle, FaCog, FaSignOutAlt } from "react-icons/fa";

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    //   // Logout Handler
    const handleLogout = () => {
        //     localStorage.removeItem("user");
        //     navigate("/login");
    };

    return (
        <div className="w-screen h-screen flex flex-col bg-gradient-to-br from-indigo-50 to-indigo-100">
            {/* Navigation Bar */}
            <nav className="w-full bg-white shadow-md py-4 px-6 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-indigo-600">Portal Dashboard</h1>
                    <div className="flex space-x-4 bg-white p-2 rounded-lg shadow-md border border-gray-100">
                        <button className="bg-white text-gray-700 hover:text-indigo-500 flex items-center space-x-1 px-4 py-2 rounded-lg transition-all duration-200 ease-in-out">
                            <FaUserCircle className="text-lg" />
                            <span>Profile</span>
                        </button>
                        <button className="bg-white text-gray-700 hover:text-indigo-500 flex items-center space-x-1">
                            <FaCog className="text-lg" />
                            <span>Settings</span>
                        </button>
                        <button onClick={handleLogout} className="bg-white text-red-500 hover:text-red-600 flex items-center space-x-1">
                            <FaSignOutAlt className="text-lg" />
                            <span>Logout</span>
                        </button>
                    </div>
            </nav>

            {/* Main Dashboard Content */}
            <div className="flex-grow flex flex-col justify-center items-center">
                <div className="w-full max-w-2xl bg-white p-8 rounded-3xl shadow-2xl border border-gray-200 transition-all duration-300 ease-in-out">
                    <h2 className="text-3xl font-extrabold text-center text-indigo-600">Welcome, {user?.username || "User"}!</h2>
                    <p className="text-center text-gray-500 mt-2">You are now logged in.</p>

                    {/* User Information Section */}
                    <div className="mt-6 space-y-4">
                        <DashboardCard title="User Role" value="Normal User" />
                        <DashboardCard title="Email" value={user?.email || "user@example.com"} />
                        <DashboardCard title="Last Login" value="Just now" />
                    </div>
                </div>
            </div>
        </div>
    );
};

// Reusable Dashboard Card
const DashboardCard = ({ title, value }: { title: string; value: string }) => (
    <div className="p-4 border border-gray-200 rounded-xl shadow-sm bg-gray-50 transition-all duration-200 ease-in-out hover:shadow-md">
        <h3 className="font-semibold text-gray-800">{title}</h3>
        <p className="text-gray-500 text-sm">{value}</p>
    </div>
);

export default Dashboard;
