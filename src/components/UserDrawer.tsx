import { XMarkIcon } from "@heroicons/react/24/outline";
import React, { useEffect, useState } from "react";
import { User } from "./UserList";
import getLocalStorageData from "../common/get-local-storage";
import { callAPI } from "../api-call";
import Spinner from "./Spinner";
import Modal from "./Model";
import { VITE_USER_SVC_API_URL } from "../common";

const UserDrawer: React.FC<{ userId: string; onClose: () => void; onUpdate: () => void }> = ({ userId, onClose, onUpdate }) => {
    const [originalUser, setOriginalUser] = useState<User | null>(null);
    const [editedUser, setEditedUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false); // New state for update loading
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [token, setToken] = useState("")

    useEffect(() => {
        let userData: any = localStorage.getItem("userData");
        userData = JSON.parse(userData)?.id;
        const sessionToken: string = userData ?? getLocalStorageData?.id;
        setToken(sessionToken);
    }, []);

    useEffect(() => {
        if (!token) return;
        let isMounted = true;
        const fetchUserDetails = async (attempt = 1) => {
            try {
                if (!isMounted) return;
                setLoading(true);

                const query = `
                    query {
                         USER_SVC_userService_getUserById(input: {id: "${userId}"}) {
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
                const headers = {
                    "Content-Type": "application/json",
                    "authorization": token, // Ensure token is available
                };
                const response = await callAPI(query, headers, VITE_USER_SVC_API_URL);
                const userData = response?.data?.data?.USER_SVC_userService_getUserById?.user;

                if (userData && isMounted) {
                    setOriginalUser(userData);
                    setEditedUser(userData);
                    setError(null);
                    setLoading(false);
                } else {
                    throw new Error("User not found.");
                }
            } catch (err) {
                if (attempt < 3) {
                    setTimeout(() => fetchUserDetails(attempt + 1), 1000);
                } else {
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
    }, [token, userId, onClose]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setEditedUser((prevUser) => ({
            ...prevUser!,
            [name]: value,
        }));
    };

    const handleSave = async () => {
        if (!originalUser || !editedUser) return;

        const updatedFields: any = {};
        Object.keys(originalUser).forEach((key) => {
            if ((originalUser as any)[key] !== (editedUser as any)[key]) {
                updatedFields[key] = (editedUser as any)[key];
            }
        });

        if (Object.keys(updatedFields).length === 0) {
            return;
        }

        try {
            setIsUpdating(true); // Start update loading

            const mutation = `
                mutation {
                    AUTH_SVC_AUTH_SVC_updateUser(
                        input: {
                            id: "${userId}",
                            ${Object.entries(updatedFields)
                    .map(([key, value]) => `${key}: "${value}"`)
                    .join(",\n")}
                        }
                    ) {
                        error
                        message
                        status
                    }
                }
            `;
            const headers = {
                "Content-Type": "application/json",
                "authorization": token,
            };

            const response = await callAPI(mutation, headers);
            if (response?.data?.data?.AUTH_SVC_AUTH_SVC_updateUser?.status === 201) {
                setModalMessage("User Updated");
                setShowModal(true);
                setOriginalUser(editedUser);

                setTimeout(() => {
                    setShowModal(false);
                    onClose();
                    onUpdate();
                }, 1500);

            } else {
                setModalMessage("Update failed");
                setShowModal(true);
                console.error("Failed to update user:", response?.data?.data?.AUTH_SVC_AUTH_SVC_updateUser?.message);
            }
        } catch (err) {
            console.error("Error updating user:", err);
        } finally {
            setIsUpdating(false); // Stop update loading
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
            <div className="w-96 bg-white h-full shadow-lg flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center border-b p-4">
                    <h2 className="text-xl font-semibold text-gray-800">User Details</h2>
                    <button
                        onClick={onClose}
                        className="bg-white w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-200 transition"
                    >
                        <XMarkIcon className="w-6 h-6 text-black" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    <InputField label="First Name" name="firstName" value={editedUser?.firstName} onChange={handleChange} />
                    <InputField label="Last Name" name="lastName" value={editedUser?.lastName} onChange={handleChange} />
                    <InputField label="Email" name="email" value={editedUser?.email} onChange={handleChange} />
                    <InputField label="Role" name="role" value={editedUser?.role} type="select" options={["ADMIN", "USER"]} onChange={handleChange} />
                    <InputField label="Contact" name="contactNumber" value={editedUser?.contactNumber} onChange={handleChange} />
                    <InputField label="Gender" name="gender" value={editedUser?.gender} type="select" options={["Male", "Female", "Other"]} onChange={handleChange} />
                </div>

                {/* Sticky Footer Buttons */}
                <div className="p-4 border-t flex gap-3 bg-white sticky bottom-0">
                    <button
                        onClick={handleSave}
                        disabled={isUpdating}
                        className={`w-1/2 px-4 py-2 rounded-lg transition flex items-center justify-center ${isUpdating ? "bg-blue-300 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
                            } text-white`}
                    >
                        Save
                    </button>

                    <button onClick={onClose} className="w-1/2 bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition">
                        Exit Edit Mode
                    </button>
                </div>
            </div>

            <Modal isOpen={showModal} message={modalMessage} onClose={() => setShowModal(false)} />
            {isUpdating && (
                <div className="fixed inset-0 flex justify-center items-center bg-gray-500 bg-opacity-50">
                    <Spinner />
                </div>)}
        </div>

    );
};

export default UserDrawer;

const InputField = ({ label, name, value, onChange, type = "text", options = [], readOnly = false }: any) => (
    <div>
        <label className="text-gray-700 font-medium">{label}</label>
        {type === "select" ? (
            <select name={name} value={value} onChange={onChange} disabled={readOnly} className="w-full p-2 mt-1 border rounded-md bg-gray-100 text-gray-800">
                {options.map((option: string) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        ) : (
            <input type={type} name={name} value={value || ""} onChange={onChange} readOnly={readOnly} className="w-full p-2 mt-1 border rounded-md bg-gray-100 text-gray-800" />
        )}
    </div>
);
