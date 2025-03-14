import React, { useState } from "react";
import DataTable from "react-data-table-component";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    avatar: string;
}

const initialUsers: User[] = [
    {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        role: "Admin",
        avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    },
    {
        id: 2,
        name: "Jane Smith",
        email: "jane@example.com",
        role: "Editor",
        avatar: "https://randomuser.me/api/portraits/women/2.jpg",
    },
    {
        id: 3,
        name: "Alice Johnson",
        email: "alice@example.com",
        role: "User",
        avatar: "https://randomuser.me/api/portraits/women/3.jpg",
    },
    {
        id: 3,
        name: "Alice Johnson",
        email: "alice@example.com",
        role: "User",
        avatar: "https://randomuser.me/api/portraits/women/3.jpg",
    },
    {
        id: 3,
        name: "Alice Johnson",
        email: "alice@example.com",
        role: "User",
        avatar: "https://randomuser.me/api/portraits/women/3.jpg",
    },    {
        id: 3,
        name: "Alice Johnson",
        email: "alice@example.com",
        role: "User",
        avatar: "https://randomuser.me/api/portraits/women/3.jpg",
    },
];

const UserList: React.FC = () => {
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [filterText, setFilterText] = useState("");

    const handleDelete = (id: number) => {
        setUsers(users.filter((user) => user.id !== id));
    };

    const handleEdit = (id: number) => {
        alert(`Edit user with ID: ${id}`);
    };

    const filteredUsers = users.filter(
        (user) =>
            user.name.toLowerCase().includes(filterText.toLowerCase()) ||
            user.email.toLowerCase().includes(filterText.toLowerCase()) ||
            user.role.toLowerCase().includes(filterText.toLowerCase())
    );

    const columns = [
        {
            name: "User",
            selector: (row: User) => row.name,
            sortable: true,
            cell: (row: User) => (
                <div className="flex items-center gap-4 p-2">
                    <img
                        src={row.avatar}
                        alt={row.name}
                        className="w-12 h-12 rounded-full border border-gray-300"
                    />
                    <span className="font-medium text-gray-800">{row.name}</span>
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
                        className="text-blue-500 hover:text-blue-700 transition-transform transform hover:scale-110 bg-white p-2 rounded-md"
                        onClick={() => handleEdit(row.id)}
                    >
                        <PencilSquareIcon className="w-5 h-5" />
                    </button>
                    <button
                        className="text-red-500 hover:text-red-700 transition-transform transform hover:scale-110 bg-white p-2 rounded-md"
                        onClick={() => handleDelete(row.id)}
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="container w-full h-full flex flex-col bg-white p-6 rounded-lg shadow-md">
            <input
                type="text"
                placeholder="Search users..."
                className="p-3 mb-6 rounded-md border border-gray-300 bg-white text-gray-800 w-1/2 mx-auto focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
            />

            <div className="w-full h-full">
                <DataTable
                    columns={columns}
                    data={filteredUsers}
                    pagination
                    highlightOnHover
                    responsive
                    customStyles={{
                        headCells: {
                            style: {
                                color: "#333333",
                                fontSize: "16px",
                                fontWeight: "bold",
                            },
                        },
                        cells: {
                            style: {
                                color: "#333333",
                                fontSize: "16px",
                                padding: "2px", 
                            },
                        },
                        rows: {
                            style: {
                                borderBottom: "1px solid #dee2e6",
                                "&:hover": {
                                    backgroundColor: "transparent",
                                },
                            },
                        },
                    }}
                />
            </div>
        </div>
    );
};

export default UserList;