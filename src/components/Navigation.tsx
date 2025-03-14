import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { FaBell, FaSignOutAlt } from "react-icons/fa";
import getLocalStorageData from "../common/get-local-storage";
import { VITE_NOTIFICATION_API_URL } from "../common";
import { roleEnum } from "../api-call";

const Navigation = () => {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false); // State to track admin role
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Get user role from localStorage
        const userData = getLocalStorageData;
        if (userData?.role === roleEnum.ADMIN) {
            setIsAdmin(true);
        }
    }, []);

    const handleNotificationClick = async () => {
        setIsOpen(!isOpen);

        if (!isOpen) {
            try {
                const response = await axios.get(`${VITE_NOTIFICATION_API_URL}/get-notifications`,
                    {
                        headers: {
                            Authorization: `Bearer ${getLocalStorageData?.id}`,
                            'Content-Type': 'application/json',
                        }
                    }
                );
                if (response.status === 200) {
                    setNotifications(response.data?.data);
                }
            } catch (error) {
                console.error("Error fetching notifications:", error);
            }
        }
    };

    // Close the dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <nav className="w-full bg-white shadow-md py-4 px-6 flex justify-between items-center relative">
            <h1 className="text-2xl font-bold text-indigo-600">Portal Dashboard</h1>
            <div className="flex items-center space-x-4 bg-white p-2 rounded-lg shadow-md border border-gray-100 relative">

                {/* Show Bell Icon Only for Admin */}
                {isAdmin && (
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={handleNotificationClick}
                            className="relative bg-white text-gray-700 hover:text-indigo-500 p-2 rounded-lg transition-all duration-200 ease-in-out"
                        >
                            <FaBell className="text-xl" />
                            {notifications.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1 animate-bounce">
                                    {notifications.length}
                                </span>
                            )}
                        </button>

                        {/* Notification Dropdown with Animation */}
                        {isOpen && (
                            <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 shadow-lg rounded-lg p-2 z-50 animate-fadeIn">
                                <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
                                    Notifications
                                </h3>
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
                            </div>
                        )}
                    </div>
                )}

                {/* Logout Button */}
                <button
                    className="bg-white text-red-500 hover:text-red-600 flex items-center space-x-1 px-4 py-2 rounded-lg transition-all duration-200 ease-in-out"
                >
                    <FaSignOutAlt className="text-lg" />
                    <span>Logout</span>
                </button>
            </div>
        </nav>
    );
};

export default Navigation;
