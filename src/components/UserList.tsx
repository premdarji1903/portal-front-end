import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import Navigation from "./Navigation";
import { callAPI } from "../api-call";
import UserDrawer from "./UserDrawer";
import Spinner from "./Spinner";
import { onMessage } from "firebase/messaging";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { messaging } from "../common";
import getLocalStorageData from "../common/get-local-storage";

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
    const [showConfirm, setShowConfirm] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [deleteSuccess, setDeleteSuccess] = useState(false);
    const [token, setToken] = useState("")
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

    useEffect(() => {
        let userData: any = localStorage.getItem("userData");
        userData = JSON.parse(userData)?.id;
        const sessionToken: string = userData ?? getLocalStorageData?.id;
        setToken(sessionToken);
    }, []);

    useEffect(() => {
        if (token) {
            fetchUsers(page, limit);
        }
    }, [token, page, limit])

    useEffect(() => {
        setSearchTerm("");
    }, []);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);

        return () => clearTimeout(handler);
    }, [searchTerm]);

    useEffect(() => {
        if (debouncedSearchTerm) {
            fetchUsers(1, 10, 3, debouncedSearchTerm);
        }
    }, [debouncedSearchTerm]);

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event?.target?.value?.trim() ?? "";
        setSearchTerm(value);
    }

    const listenForMessages = () => {
        onMessage(messaging, (payload) => {
            console.log("messaging", messaging)
            console.log("payload", payload)
            toast.info(`📢 ${payload.notification?.title}\n${payload.notification?.body}`);
            setTimeout(() => {
                window.location.reload();
            }, 3000); // Give toast some time before reloading
        });
    };
    useEffect(() => {
        listenForMessages();
        return () => {
            console.log("Cleaning up Firebase listener...");
        };
    }, [listenForMessages]);

    const fetchUsers = async (pageNumber = 1, pageSize = limit, retries = 3, search = searchTerm) => {
        setLoading(true);

        const query = `
        mutation {
            AUTH_SVC_AUTH_SVC_userList(input: { page: ${pageNumber}, perPage: ${pageSize},search:"${search}" }) {
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
            const response = await callAPI(query, { "Content-Type": "application/json", "authorization": token });

            if (response.data?.data?.AUTH_SVC_AUTH_SVC_userList?.status === 200) {
                const userData = response?.data?.data?.AUTH_SVC_AUTH_SVC_userList?.userData;
                const newUsers = userData?.userData ?? []
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

    const confirmDelete = (id: any) => {
        setSelectedUserId(id);
        setShowConfirm(true);
    };

    const deleteUser = () => {
        setIsLoading(true);
        setTimeout(() => {
            if (selectedUserId !== null) {
                setUsers(users.filter((u) => u.id !== selectedUserId)); // Optimistic UI update
                handleDeleteUser(selectedUserId); // Call the actual delete function
                setDeleteSuccess(true);
                setTimeout(() => {
                    setShowConfirm(false);
                    setDeleteSuccess(false);
                    setSelectedUserId(null);
                }, 2000);
            }
            setIsLoading(false);
        }, 1500);
    };

    const handleDeleteUser = async (userId: string) => {
        if (!userId) return;

        setLoading(true);
        const query = `
            mutation {
                AUTH_SVC_AUTH_SVC_deleteUser(input: { id: "${userId}" }) {
                    error
                    message
                    status
                }
            }
        `;

        const token: string | null = getLocalStorageData?.id;

        if (!token) {
            setLoading(false);
            return;
        }

        const headers = {
            "Content-Type": "application/json",
            "authorization": token,
        };

        try {
            const response = await callAPI(query, headers);
            if (response.data?.data?.AUTH_SVC_AUTH_SVC_deleteUser?.status === 200) {
                setUsers(users.filter((u) => u.id !== userId));
            }
        } catch (error) {
            console.error("Error deleting user:", error);

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
    ;
    return (
        <>
            <ToastContainer position="top-right" autoClose={3000} />

            {loading && (
                <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
                    <Spinner size="w-16 h-16 border-[6px]" />
                </div>
            )}

            <div className="min-h-screen flex flex-col bg-gray-100">
                <div className="sticky top-0 z-50 bg-white shadow-md">
                    <Navigation />
                </div>
                <div className="container mx-auto p-4 sm:p-6 bg-white shadow-md rounded-lg mt-4 sm:mt-6 flex-grow flex flex-col items-start">
                    <div className="mb-4 flex items-center gap-4 bg-white p-4 rounded-lg shadow-md w-full sm:w-auto">
                        <label className="text-black font-semibold">Search Users:</label>
                        <input
                            type="text"
                            placeholder="Type to search..."
                            onChange={handleSearchChange}
                            className="w-full sm:w-1/2 lg:w-96 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white text-black"
                        />
                    </div>
                    {/* Data Table */}
                    <div className="w-full overflow-x-auto">
                        <DataTable
                            columns={[
                                {
                                    name: "User",
                                    selector: (row: User) => row.firstName,
                                    sortable: true,
                                    cell: (row: User) => (
                                        <span className="font-medium text-gray-800 whitespace-nowrap">
                                            {row.firstName} {row.lastName}
                                        </span>
                                    ),
                                },
                                {
                                    name: "Email",
                                    selector: (row: User) => row.email,
                                    sortable: true,
                                    cell: (row: User) => (
                                        <span className="text-gray-600 truncate">{row.email}</span>
                                    ),
                                },
                                {
                                    name: "Gender",
                                    selector: (row: User) => row.gender,
                                    sortable: true,
                                    cell: (row: User) => (
                                        <span className="text-gray-600">{row.gender}</span>
                                    ),
                                },
                                {
                                    name: "Contact No.",
                                    selector: (row: User) => row.contactNumber,
                                    sortable: true,
                                    cell: (row: User) => (
                                        <span className="text-gray-600 whitespace-nowrap">{row.contactNumber}</span>
                                    ),
                                },
                                {
                                    name: "Role",
                                    selector: (row: User) => row.role,
                                    sortable: true,
                                    cell: (row: User) => (
                                        <span className="text-gray-600">{row.role}</span>
                                    ),
                                },
                                {
                                    name: "Actions",
                                    cell: (row: User) => (
                                        <div className="flex gap-1 sm:gap-2 p-2">
                                            <button
                                                className="p-2 border border-white bg-white text-blue-500 hover:bg-blue-100 hover:text-blue-700 rounded-md transition"
                                                onClick={() => {
                                                    setSelectedUser(row.id);
                                                    setIsDrawerOpen(true);
                                                }}
                                            >
                                                <PencilSquareIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                            </button>
                                            <button
                                                className="p-2 border border-white bg-white text-red-500 hover:bg-red-100 hover:text-red-700 rounded-md transition"
                                                onClick={() => confirmDelete(row.id)}
                                            >
                                                <TrashIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                            </button>
                                        </div>
                                    ),
                                },
                            ]}
                            data={users}
                            highlightOnHover
                            responsive
                            noDataComponent={<p className="text-center text-gray-500 py-4">No Data Found</p>} // Handle empty state
                            customStyles={{
                                headCells: {
                                    style: { textAlign: "left", fontSize: "14px", fontWeight: "bold", whiteSpace: "nowrap" },
                                },
                                cells: {
                                    style: { textAlign: "left", fontSize: "14px", wordBreak: "break-word" },
                                },
                            }}
                        />
                    </div>


                    {/* Pagination */}
                    <div className="sticky bottom-0 bg-white shadow-md p-4 pb-20 flex flex-wrap justify-center items-center gap-3 sm:gap-4">
                        <button
                            className={`w-full sm:w-24 h-10 rounded-md border flex items-center justify-center transition ${page === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-black hover:text-white"
                                }`}
                            disabled={page === 1}
                            onClick={() => handlePageChange(page - 1)}
                        >
                            Previous
                        </button>

                        <select
                            className="w-full sm:w-20 h-10 bg-white border border-gray-400 rounded-md text-black px-2 focus:outline-none hover:text-blue-500"
                            value={limit}
                            onChange={(e) => handleLimitChange(Number(e.target.value))}
                        >
                            <option value={8}>8</option>
                            <option value={10}>10</option>
                            <option value={15}>15</option>
                            <option value={20}>20</option>
                        </select>

                        <span className="w-full sm:w-24 h-10 flex items-center justify-center rounded-md bg-gray-100 text-gray-800">
                            Page {page} of {totalPages}
                        </span>

                        <button
                            className={`w-full sm:w-24 h-10 rounded-md border flex items-center justify-center transition ${page === totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-black hover:text-white"
                                }`}
                            disabled={page === totalPages}
                            onClick={() => handlePageChange(page + 1)}
                        >
                            Next
                        </button>
                    </div>

                </div>
            </div >

            {/* User Drawer */}
            {
                isDrawerOpen && selectedUser && (
                    <UserDrawer userId={selectedUser} onClose={() => setIsDrawerOpen(false)} onUpdate={fetchUsers} />
                )
            }

            {/* Confirmation Modal */}
            {
                showConfirm && (
                    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50 px-4">
                        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                            {deleteSuccess ? (
                                <div className="flex flex-col items-center">
                                    <h2 className="text-lg font-bold text-green-600">User Deleted</h2>
                                    <p className="text-sm text-gray-600 mt-2 text-center">
                                        The user has been deleted successfully.
                                    </p>
                                    <Spinner />
                                </div>
                            ) : (
                                <>
                                    <h2 className="text-lg font-bold text-gray-700">Confirm Deletion</h2>
                                    <p className="text-sm text-gray-600 mt-2">
                                        Are you sure you want to delete this user?
                                    </p>
                                    {isLoading ? (
                                        <div className="flex justify-center py-4">
                                            <Spinner />
                                        </div>
                                    ) : (
                                        <div className="flex justify-end space-x-2 mt-4">
                                            <button
                                                onClick={() => setShowConfirm(false)}
                                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                                                disabled={isLoading}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={deleteUser}
                                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                                                disabled={isLoading}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )
            }
        </>
    );
};

export default UserList;
