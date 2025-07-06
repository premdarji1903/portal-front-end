import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "./Model"; // Import the modal component
import { roleEnum } from "../api-call";

const ProtectedRoute = ({ element }: any) => {
    const [isSessionExpired, setIsSessionExpired] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();
    useEffect(() => {
        const checkSession = () => {
            const userData = localStorage.getItem("userData");

            if (!userData) {
                setIsSessionExpired(true);
                setShowModal(true);

                // Redirect after 3 seconds
                setTimeout(() => {
                    setShowModal(false);
                    navigate("/login");
                }, 3000);
            } else {
                // Parse user data to check the role
                try {
                    const user = JSON.parse(userData);
                    if (user.role === roleEnum.ADMIN) {
                        navigate("/user-list");
                    } else {
                        navigate("/dashboard");
                    }
                } catch (err) {
                    console.error("Invalid userData in localStorage", err);
                    navigate("/login");
                }
            }
        };

        // Delay check to allow time for localStorage to be populated
        const delay = 2000; // milliseconds
        const timer = setTimeout(checkSession, delay);

        return () => clearTimeout(timer); // cleanup
    }, [navigate]);

    return (
        <div className="w-screen h-screen flex justify-center items-center bg-white">
            {isSessionExpired ? (
                <Modal isOpen={showModal} message="Your session has expired. Redirecting to login..." onClose={() => { }} />
            ) : (
                element
            )}
        </div>
    );
};

export default ProtectedRoute;
