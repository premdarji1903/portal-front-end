import React, { useState } from 'react';
import axios from 'axios';
import Modal from './Model';
import { useNavigate } from 'react-router-dom';

const Login: React.FC<any> = () => {
    const [formData, setFormData] = useState({
        userName: '',
        passWord: '',
    });
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleInputChange = (e: { target: { name: any; value: any; }; }) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        setLoading(true);

        const query = `
      mutation LoginMutation {
        AUTH_SVC_AUTH_SVC_login(
          input: {
            userName: "${formData.userName}",
            passWord: "${formData.passWord}"
          }
        ) {
          error
          token
          message
          status
        }
      }
    `;

        try {
            const response = await axios.post(
                "http://127.0.0.1:4000/api",
                { query },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            const data = response.data.data.AUTH_SVC_AUTH_SVC_login;
            if (response.data.errors && response.data.errors.length > 0) {
                const errorMessages = response.data.errors.map((error: any) => error.message);
                setModalMessage(`Login failed:\n${errorMessages}`);
                setShowModal(true);
                return;
            }

            if (data.status === 200) {
                setModalMessage('Login successful');
                setShowModal(true);
                setLocalStorage(data);
                setTimeout(() => {
                    navigate('/'); 
                }, 2000);
            } else {
                setModalMessage(`${data?.message}`);
                setShowModal(true);
            }
        } catch (error) {
            setModalMessage(`An error occurred, please try again\n${error}`);
            setShowModal(true);
        } finally {
            setLoading(false);
        }
    };

    const closeModal = () => {
        setShowModal(false);
    };

    const setLocalStorage = (data: any) => {
        localStorage.setItem("user", JSON.stringify({
            userId: data?.id,
            token: data?.token
        }));
    }

    return (
        <>
            <div className="text-center mb-4">
                <h1 className="text-2xl font-extrabold text-black dark:text-white">
                    Welcome to Portal App
                </h1>
                <p className="text-black dark:text-gray-300 mt-2">
                    Please sign in to access your account
                </p>
            </div>
            <div className="w-[400px] h-[400px] bg-white rounded-lg shadow-md dark:bg-gray-800 p-6">
                <div className="w-full space-y-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Login to your account</h2>
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="userName" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
                            <input
                                type="text"
                                name="userName"
                                id="userName"
                                className="border rounded-lg block w-full p-2.5 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                                placeholder="Enter your username"
                                value={formData.userName}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="passWord" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                            <input
                                type="password"
                                name="passWord"
                                id="passWord"
                                className="border rounded-lg block w-full p-2.5 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                                placeholder="••••••••"
                                value={formData.passWord}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg px-5 py-2.5"
                        >
                            Login
                        </button>
                    </form>
                    <p className="text-sm font-light text-gray-700 dark:text-gray-300">
                        Don't have an account? <a href="#" className="text-indigo-600 hover:underline dark:text-indigo-400">Sign up here</a>
                    </p>
                </div>
            </div>
            <Modal isOpen={showModal} message={modalMessage} onClose={closeModal} />
            {loading && (
                <div className="fixed inset-0 flex justify-center items-center bg-gray-500 bg-opacity-50">
                    <div className="spinner"></div>
                </div>
            )}
        </>
    );
};

export default Login;