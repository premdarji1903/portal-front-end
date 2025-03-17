import React, { useState, useEffect, useRef, useCallback } from "react";
import DataTable from "react-data-table-component";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import Navigation from "./Navigation";
import UserDrawer from "./UserDrawer";

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    contactNumber: string;
    gender: string;
}

// 🔹 Static User Data
const STATIC_USERS: User[] = Array.from({ length: 50 }, (_, i) => ({
    id: (i + 1).toString(),
    firstName: `User ${i + 1}`,
    lastName: `Last ${i + 1}`,
    email: `user${i + 1}@example.com`,
    role: ["Admin", "Editor", "User"][Math.floor(Math.random() * 3)],
    contactNumber: `123-456-${9000 + i}`,
    gender: ["Male", "Female"][Math.floor(Math.random() * 2)],
}));

const UserList: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [filterText, setFilterText] = useState("");
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const limit = 10; // Number of users to load per batch
    const observer = useRef<IntersectionObserver | null>(null);
    const lastUserRef = useRef<HTMLDivElement | null>(null);

    // 🔹 Fetch initial 10 users
    useEffect(() => {
        loadMoreUsers();
    }, []);

    // 🔹 Function to load more users
    const loadMoreUsers = async () => {
        if (!hasMore || loading) return;
        setLoading(true);
        setTimeout(() => {
            const newUsers = STATIC_USERS.slice(users.length, users.length + limit);
            setUsers((prev) => [...prev, ...newUsers]);
            setHasMore(users.length + limit < STATIC_USERS.length);
            setLoading(false);
        }, 1000); // Simulated loading delay
    };

    // 🔹 Intersection Observer to trigger loading when reaching the bottom
    const observerCallback = useCallback((entries: IntersectionObserverEntry[]) => {
        if (entries[0].isIntersecting) {
            loadMoreUsers();
        }
    }, []);

    useEffect(() => {
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(observerCallback, {
            root: null,
            rootMargin: "100px",
            threshold: 0.1,
        });
        if (lastUserRef.current) observer.current.observe(lastUserRef.current);
    }, [users]);

    const handleDelete = (id: string) => {
        setUsers(users.filter((user) => user.id !== id));
    };

    const handleEdit = (userId: string) => {
        setSelectedUser(userId);
    };

    const closeDrawer = () => {
        setSelectedUser(null);
    };

    const filteredUsers = users.filter(
        (user) =>
            user.firstName.toLowerCase().includes(filterText.toLowerCase()) ||
            user.lastName.toLowerCase().includes(filterText.toLowerCase()) ||
            user.email.toLowerCase().includes(filterText.toLowerCase()) ||
            user.role.toLowerCase().includes(filterText.toLowerCase()) ||
            user.contactNumber.includes(filterText) ||
            user.gender.toLowerCase().includes(filterText.toLowerCase())
    );

    const columns = [
        {
            name: "User",
            selector: (row: User) => row.firstName,
            sortable: true,
            cell: (row: User) => (
                <div className="flex items-center gap-4 p-2">
                    <span className="font-medium text-gray-800">
                        {row.firstName} {row.lastName}
                    </span>
                </div>
            ),
        },
        {
            name: "Email",
            selector: (row: User) => row.email,
            sortable: true,
            cell: (row: User) => <span className="text-gray-600 p-2">{row.email}</span>,
        },
        {
            name: "Role",
            selector: (row: User) => row.role,
            sortable: true,
            cell: (row: User) => <span className="text-gray-600 p-2">{row.role}</span>,
        },
        {
            name: "Actions",
            cell: (row: User) => (
                <div className="flex gap-2 p-2">
                    <button
                        className="bg-white text-blue-500 border border-blue-500 hover:bg-blue-500 hover:text-white p-2 rounded-md transition"
                        onClick={() => handleEdit(row.id)}
                    >
                        <PencilSquareIcon className="w-5 h-5" />
                    </button>
                    <button
                        className="bg-white text-red-500 border border-red-500 hover:bg-red-500 hover:text-white p-2 rounded-md transition"
                        onClick={() => handleDelete(row.id)}
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <>
            <div className="container w-full h-full flex flex-col bg-white p-6 rounded-lg shadow-md">
                <Navigation />
                <div className="mt-6"></div>
                <input
                    type="text"
                    placeholder="Search users..."
                    className="p-3 mb-6 rounded-md border border-gray-300 bg-white text-gray-800 w-1/2 mx-auto focus:outline-none focus:ring-2 focus:ring-blue-400"
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                />

                <div className="w-full h-[500px] overflow-auto custom-scrollbar">
                    <DataTable
                        columns={columns}
                        data={filteredUsers}
                        highlightOnHover
                        responsive
                        className={selectedUser ? "pagination-hidden" : ""}
                    />
                </div>

                {/* Loading Spinner */}
                {loading && (
                    <div className="flex justify-center py-4">
                        <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}

                {/* Observer target for lazy loading */}
                <div ref={lastUserRef} className="h-10" />
            </div>

            {/* Drawer Component */}
            {selectedUser && <UserDrawer userId={selectedUser} onClose={closeDrawer} />}
        </>
    );
};

export default UserList;
