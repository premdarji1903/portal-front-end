import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { FaBell, FaSignOutAlt } from "react-icons/fa";
import getLocalStorageData from "../common/get-local-storage";
import { VITE_NOTIFICATION_API_URL } from "../common";
import { callAPI, roleEnum } from "../api-call";
import Spinner from "../components/Spinner"; // Importing Spinner Component

const Navigation = () => {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [showLogoutPopup, setShowLogoutPopup] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [logoutSuccess, setLogoutSuccess] = useState(false); // New state for logout success message
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const userData = getLocalStorageData;
        if (userData?.role === roleEnum.ADMIN) {
            setIsAdmin(true);
        }
    }, []);
    const handleNotificationClick = async () => {
        setIsOpen(!isOpen);

        if (!isOpen) {
            setIsLoading(true);
            try {
                const response = await axios.get(`${VITE_NOTIFICATION_API_URL}/get-notifications`, {
                    headers: {
                        Authorization: `Bearer ${getLocalStorageData?.id}`,
                        "Content-Type": "application/json",
                    },
                });
                if (response.status === 200) {
                    setNotifications(response.data?.data);
                }
            } catch (error) {
                console.error("Error fetching notifications:", error);
            }
            setIsLoading(false);
        }
    };

    // Logout function
    const handleLogout = async () => {
        setIsLoading(true);

        try {
            const query: string = `
                        mutation MyMutation {
                            AUTH_SVC_AUTH_SVC_logout(input: { id: "${getLocalStorageData?.id}" }) {
                                error
                                message
                                status
                            }
                        }
                    `;
            const headers = {
                "Content-Type": "application/json",
                Authorization: `${getLocalStorageData?.id}`,
            };
            const response = await callAPI(query, headers);
            const data = response.data?.data?.AUTH_SVC_AUTH_SVC_logout;

            if (data?.status === 200) {
                setLogoutSuccess(true); // Show logout success message

                setTimeout(() => {
                    localStorage.clear();
                    window.location.href = "/"; // Redirect to the landing page
                }, 2000);
            } else {
                alert(`Error: ${data?.message}`);
            }
        } catch (error) {
            console.error("Logout failed", error);
            alert("Logout failed. Please try again.");
        }

        setIsLoading(false);
    };

    return (
        <nav className="w-full bg-white shadow-md py-4 px-6 flex justify-between items-center relative">
            <h1 className="text-2xl font-bold text-indigo-600">Portal Dashboard</h1>
            <div className="flex items-center space-x-4 bg-white p-2 rounded-lg shadow-md border border-gray-100 relative">

                {/* Show Bell Icon Only for Admin */}
                {isAdmin && (
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={handleNotificationClick}
                            className={`relative bg-white text-gray-700 hover:text-indigo-500 p-2 rounded-lg transition-all duration-200 ease-in-out ${isLoading ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                            disabled={isLoading}
                        >
                            <FaBell className="text-xl" />
                            {notifications.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1 animate-bounce">
                                    {notifications.length}
                                </span>
                            )}
                        </button>

                        {/* Notification Dropdown */}
                        {isOpen && (
                            <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 shadow-lg rounded-lg p-2 z-50 animate-fadeIn">
                                <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
                                    Notifications
                                </h3>
                                {isLoading ? (
                                    <div className="flex justify-center py-4">
                                        <Spinner />
                                    </div>
                                ) : (
                                    <div className="max-h-60 overflow-y-auto">
                                        {notifications.length > 0 ? (
                                            notifications.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="p-2 bg-white hover:bg-gray-100 rounded-md transition-all duration-200"
                                                >
                                                    <h4 className="text-sm font-semibold text-blue-600">
                                                        {item.notification.title}
                                                    </h4>
                                                    <p className="text-xs text-gray-600">
                                                        {item.notification.body}
                                                    </p>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-xs text-gray-500 text-center p-2">
                                                No new notifications
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Logout Button */}
                <button
                    className={`bg-white text-red-500 hover:text-red-600 flex items-center space-x-1 px-4 py-2 rounded-lg transition-all duration-200 ease-in-out ${isLoading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                    onClick={() => setShowLogoutPopup(true)}
                    disabled={isLoading}
                >
                    <FaSignOutAlt className="text-lg" />
                    <span>Logout</span>
                </button>
            </div>

            {/* Logout Confirmation Popup */}
            {showLogoutPopup && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-80">
                        {logoutSuccess ? (
                            <div className="flex flex-col items-center">
                                <h2 className="text-lg font-bold text-green-600">Logout Successful</h2>
                                <p className="text-sm text-gray-600 mt-2 text-center">
                                    You have been logged out successfully. Redirecting to the homepage...
                                </p>
                                <Spinner />
                            </div>
                        ) : (
                            <>
                                <h2 className="text-lg font-bold text-gray-700">Confirm Logout</h2>
                                <p className="text-sm text-gray-600 mt-2">
                                    Are you sure you want to log out?
                                </p>
                                {isLoading ? (
                                    <div className="flex justify-center py-4">
                                        <Spinner />
                                    </div>
                                ) : (
                                    <div className="flex justify-end space-x-2 mt-4">
                                        <button
                                            onClick={() => setShowLogoutPopup(false)}
                                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                                            disabled={isLoading}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleLogout}
                                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                                            disabled={isLoading}
                                        >
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navigation;
