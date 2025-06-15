import React, { useEffect, useState } from "react";
import Navigation from "./Navigation";
import { callAPI } from "../api-call";
import Spinner from "./Spinner";
import { VITE_USER_SVC_API_URL } from "../common";
const Dashboard: React.FC = () => {
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const sessionToken: any = localStorage.getItem("userData");
    const token = JSON.parse(sessionToken)?.id;
    const userId = JSON.parse(sessionToken)?.userId;

    useEffect(() => {
        const fetchData = async () => {
            if (!token) {
                setError("Unauthorized: No session token found");
                setLoading(false);
                return;
            }
            const query = `
                query MyQuery {
                    USER_SVC_userService_getUserById(input: { id: "${userId}" }) {
                        error
                        message
                        status
                        user {
                            contactNumber
                            email
                            gender
                            id
                            firstName
                            lastName
                            role
                            userId
                        }
                    }
                }
            `;

            const headers = {
                "Content-Type": "application/json",
                "authorization": token,
            };

            try {
                const response = await callAPI(query, headers, VITE_USER_SVC_API_URL);
                if (response.data.errors) {
                    setError(response.data.errors[0].message);
                } else {
                    setUserData(response.data.data.USER_SVC_userService_getUserById.user);
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);

            }
        };

        fetchData();
    }, [sessionToken]);

    return (
        <div className="w-screen h-screen flex flex-col bg-gradient-to-br from-indigo-50 to-indigo-100">
            <Navigation />
            {loading && (
                <div className="fixed inset-0 flex flex-col justify-center items-center bg-gray-500 bg-opacity-50">
                    <p className="text-black text-lg font-semibold mb-2">Loading user data, please wait...</p>
                    <Spinner />
                </div>
            )}


            {!loading && !error && (
                <div className="flex-grow flex flex-col justify-center items-center">
                    <div className="w-full max-w-2xl bg-white p-8 rounded-3xl shadow-2xl border border-gray-200 transition-all duration-300 ease-in-out">
                        <h2 className="text-3xl font-extrabold text-center text-indigo-600">
                            Welcome, {`${userData?.firstName} ${userData?.lastName}` || "User"}!
                        </h2>
                        {error && <p className="text-center text-red-500 mt-2">{error}</p>}
                        <div className="mt-6 space-y-4">
                            <DashboardCard title="User Name" value={`${userData?.firstName} ${userData?.lastName}` || "N/A"} />
                            <DashboardCard title="User Role" value={userData?.role || "N/A"} />
                            <DashboardCard title="Email" value={userData?.email || "N/A"} />
                            <DashboardCard title="Gender" value={userData?.gender || "N/A"} />
                        </div>
                    </div>
                </div>
            )}
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
