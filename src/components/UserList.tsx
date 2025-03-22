import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import Navigation from "./Navigation";
import { callAPI } from "../api-call";
import UserDrawer from "./UserDrawer";
import Spinner from "./Spinner";
// import { messaging } from "../firebase-config"; // Import Firebase messaging
import { onMessage } from "firebase/messaging"; // Import onMessage function
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { messaging } from "../common";

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    contactNumber: string;
    gender: string;
}

const UserList: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit, setLimit] = useState(8); // Page size

    useEffect(() => {
        fetchUsers(page, limit);
        listenForMessages(); // Listen for foreground notifications
    }, [page, limit]);

    // Listen for foreground push notifications
    const listenForMessages = () => {
        onMessage(messaging, (payload) => {
            console.log("Foreground Notification Received:", payload);
            toast.info(`📢 ${payload.notification?.title}\n${payload.notification?.body}`);
        });
    };

    const fetchUsers = async (pageNumber = 1, pageSize = limit, retries = 3) => {
        setLoading(true);

        const query = `
        mutation {
            AUTH_SVC_AUTH_SVC_userList(input: { page: ${pageNumber}, perPage: ${pageSize} }) {
                status
                message
                userData {
                    count
                    userData {
                        id
                        firstName
                        lastName
                        email
                        role
                        contactNumber
                        gender
                    }
                }
            }
        }
    `;

        try {
            const response = await callAPI(query, { "Content-Type": "application/json" });

            if (response.data?.data?.AUTH_SVC_AUTH_SVC_userList?.status === 200) {
                const newUsers = response.data.data.AUTH_SVC_AUTH_SVC_userList.userData.userData;
                const totalUsersCount = response.data.data.AUTH_SVC_AUTH_SVC_userList.userData.count;
                setUsers(newUsers);
                setTotalPages(Math.ceil(totalUsersCount / pageSize));
            } else {
                throw new Error("Invalid API response");
            }
        } catch (error) {
            console.error(`Error fetching users. Retries left: ${retries}`, error);

            if (retries > 0) {
                setTimeout(() => {
                    fetchUsers(pageNumber, pageSize, retries - 1); // Retry API call
                }, 2000 * (4 - retries)); // Exponential backoff (2s, 4s, 6s)
            } else {
                console.error("Failed after multiple attempts.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage: number) => {
        if (!loading && newPage !== page) {
            setLoading(true);
            setPage(newPage);
        }
    };

    const handleLimitChange = (newLimit: number) => {
        setPage(1);
        setLimit(newLimit);
        fetchUsers(1, newLimit);
    };

    return (
        <>
            <ToastContainer position="top-right" autoClose={3000} />

            {loading && (
                <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
                    <Spinner size="w-24 h-24 border-4" />
                </div>
            )}

            <div className="min-h-screen flex flex-col bg-gray-100">
                <div className="sticky top-0 z-50 bg-white shadow-md">
                    <Navigation />
                </div>

                <div className="container mx-auto p-6 bg-white shadow-md rounded-lg mt-6 flex-grow flex flex-col">
                    <div className="flex-grow overflow-y-auto max-h-[500px]">
                        <DataTable
                            columns={[
                                {
                                    name: "User",
                                    selector: (row: User) => row.firstName,
                                    sortable: true,
                                    cell: (row: User) => (
                                        <span className="font-medium text-gray-800 text-left w-full">
                                            {row.firstName} {row.lastName}
                                        </span>
                                    ),
                                },
                                {
                                    name: "Email",
                                    selector: (row: User) => row.email,
                                    sortable: true,
                                    cell: (row: User) => (
                                        <span className="text-gray-600 p-2 text-left w-full">{row.email}</span>
                                    ),
                                },
                                {
                                    name: "Role",
                                    selector: (row: User) => row.role,
                                    sortable: true,
                                    cell: (row: User) => (
                                        <span className="text-gray-600 p-2 text-left w-full">{row.role}</span>
                                    ),
                                },
                                {
                                    name: "Actions",
                                    cell: (row: User) => (
                                        <div className="flex gap-2 p-2">
                                            <button
                                                className="bg-white text-blue-500 border border-blue-500 hover:bg-blue-500 hover:text-white p-2 rounded-md transition"
                                                onClick={() => {
                                                    setSelectedUser(row.id);
                                                    setIsDrawerOpen(true);
                                                }}
                                            >
                                                <PencilSquareIcon className="w-5 h-5" />
                                            </button>
                                            <button
                                                className="bg-white text-red-500 border border-red-500 hover:bg-red-500 hover:text-white p-2 rounded-md transition"
                                                onClick={() => setUsers(users.filter((u) => u.id !== row.id))}
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ),
                                },
                            ]}
                            data={users}
                            highlightOnHover
                            responsive
                            customStyles={{
                                headCells: { style: { textAlign: "left" } },
                                cells: { style: { textAlign: "left" } },
                            }}
                        />
                    </div>

                    <div className="sticky bottom-0 bg-white shadow-md p-4 flex justify-center items-center space-x-4">
                        <button
                            className={`w-24 h-10 rounded-md border flex items-center justify-center transition ${page === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-black hover:text-white"
                                }`}
                            disabled={page === 1}
                            onClick={() => handlePageChange(page - 1)}
                        >
                            Previous
                        </button>

                        <select
                            className="w-20 h-10 bg-white border border-gray-400 rounded-md text-black px-2 focus:outline-none hover:text-blue-500"
                            value={limit}
                            onChange={(e) => handleLimitChange(Number(e.target.value))}
                        >
                            <option value={8}>8</option>
                            <option value={10}>10</option>
                            <option value={15}>15</option>
                            <option value={20}>20</option>
                        </select>

                        <span className="w-24 h-10 flex items-center justify-center rounded-md bg-gray-100 text-gray-800">
                            Page {page} of {totalPages}
                        </span>

                        <button
                            className={`w-24 h-10 rounded-md border flex items-center justify-center transition ${page === totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-black hover:text-white"
                                }`}
                            disabled={page === totalPages}
                            onClick={() => handlePageChange(page + 1)}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
            {/* User Drawer */}
            {isDrawerOpen && selectedUser && (
                <UserDrawer userId={selectedUser} onClose={() => setIsDrawerOpen(false)} />
            )}
        </>
    );
};

export default UserList;
