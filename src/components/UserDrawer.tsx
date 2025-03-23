import { XMarkIcon } from "@heroicons/react/24/outline";
import React, { useEffect, useState } from "react";
import { User } from "./UserList";
import getLocalStorageData from "../common/get-local-storage";
import { callAPI } from "../api-call";
import Spinner from "./Spinner"; // Import Spinner

const UserDrawer: React.FC<{ userId: string; onClose: () => void }> = ({ userId, onClose }) => {
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<string>("User"); // Default to "User"
    const [gender, setGender] = useState<string>("Male"); // Default to "Male"
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const fetchUserDetails = async (attempt = 1) => {
            try {
                if (!isMounted) return;
                setLoading(true);

                const query = `
                    query {
                        AUTH_SVC_AUTH_SVC_getUserDetailsById(input: {id: "${userId}"}) {
                            error
                            message
                            status
                            user {
                                contactNumber
                                email
                                firstName
                                gender
                                id
                                userId
                                role
                                lastName
                            }
                        }
                    }
                `;
                const token: string = getLocalStorageData?.id;
                const headers = {
                    "Content-Type": "application/json",
                    "authorization": token,
                };
                const response = await callAPI(query, headers);
                console.log(`Attempt ${attempt}:`, response);

                const userData = response?.data?.data?.AUTH_SVC_AUTH_SVC_getUserDetailsById?.user;

                if (userData) {
                    if (isMounted) {
                        setUser(userData);
                        setRole(userData.role || "User"); // Set role from API or default to "User"
                        setGender(userData.gender || "Male"); // Set gender from API or default to "Male"
                        setError(null);
                        setLoading(false);
                    }
                } else {
                    throw new Error("User not found.");
                }
            } catch (err) {
                if (attempt < 3) {
                    console.log(`Retrying... Attempt ${attempt + 1}`);
                    setTimeout(() => fetchUserDetails(attempt + 1), 1000);
                } else {
                    console.log("All attempts failed.");
                    if (isMounted) {
                        setError("Failed to fetch user details.");
                        setTimeout(() => onClose(), 2000);
                    }
                }
            }
        };

        fetchUserDetails();

        return () => {
            isMounted = false;
        };
    }, [userId, onClose]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === "role") {
            setRole(value);
        } else if (name === "gender") {
            setGender(value);
        } else if (user) {
            setUser({ ...user, [name]: value });
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
                    <Spinner />
                    <p className="text-gray-700 mt-2">Loading user details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
                    <p className="text-red-500">{error}</p>
                    <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-300 rounded-md">
                        Close
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 flex justify-end bg-black bg-opacity-50 z-50">
            <div className="w-96 bg-white h-full shadow-lg p-6 flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center border-b pb-4">
                    <h2 className="text-xl font-semibold text-gray-800">User Details</h2>
                    <button
                        onClick={onClose}
                        className="bg-white w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-200 transition"
                    >
                        <XMarkIcon className="w-6 h-6 text-black" />
                    </button>
                </div>

                {/* Form Inputs */}
                <div className="mt-6 space-y-4">
                    <InputField label="First Name" name="firstName" value={user?.firstName} onChange={handleChange} />
                    <InputField label="Last Name" name="lastName" value={user?.lastName} onChange={handleChange} />
                    <InputField label="Email" name="email" value={user?.email} onChange={handleChange} />
                    <InputField label="Role" name="role" value={role} type="select" options={["ADMIN", "USER"]} onChange={handleChange} />
                    <InputField label="Contact" name="contactNumber" value={user?.contactNumber} onChange={handleChange} />
                    <InputField label="Gender" name="gender" value={gender} type="select" options={["Male", "Female", "Other"]} onChange={handleChange} />
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex gap-3">
                    <button className="w-1/2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition">
                        Save
                    </button>
                    <button onClick={onClose} className="w-1/2 bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition">
                        Exit Edit Mode
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserDrawer;

const InputField = ({ label, name, value, onChange, type = "text", options = [], readOnly = false }: any) => (
    <div>
        <label className="text-gray-700 font-medium">{label}</label>
        {type === "select" ? (
            <select
                name={name}
                value={value} // Set correctly from state
                onChange={onChange}
                disabled={readOnly}
                className={`w-full p-2 mt-1 border rounded-md ${readOnly ? "bg-gray-200 text-gray-600 cursor-not-allowed border-gray-300" : "bg-gray-100 text-gray-800 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    }`}
            >
                {options.map((option: string) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        ) : (
            <input
                type={type}
                name={name}
                value={value || ""}
                readOnly={readOnly}
                onChange={onChange}
                className={`w-full p-2 mt-1 border rounded-md ${readOnly ? "bg-gray-200 text-gray-600 cursor-not-allowed border-gray-300" : "bg-gray-100 text-gray-800 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    }`}
            />
        )}
    </div>
);
