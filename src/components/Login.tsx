import React, { useState } from 'react';
import axios from 'axios';
import Modal from './Model';
import Spinner from './Spinner';
import { useNavigate } from 'react-router-dom';
import { callAPI, roleEnum } from '../api-call';

const Login: React.FC = () => {
  const [formData, setFormData] = useState({ userName: '', passWord: '' });
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const fetchSessionData = async (maxRetries = 3, delay = 2000, token: string) => {
    let retries = 0;
    const sessionQuery = `
      query {
        AUTH_SVC_AUTH_SVC_getSessionById(input: {id: "${token}"}) {
          userData {
            contactNumber
            email
            firstName
            gender
            id
            lastName
            role
            userId
          }
          status
          message
          error
        }
      }
    `;

    while (retries < maxRetries) {
      try {
        const headers = { 'Content-Type': 'application/json' };
        let response = await callAPI(sessionQuery, headers);

        let getSessionData = response.data?.data?.AUTH_SVC_AUTH_SVC_getSessionById;

        if (getSessionData?.userData) {
          localStorage.setItem("userData", JSON.stringify(getSessionData?.userData));
          return getSessionData?.userData;
        }

        throw new Error("Invalid session data");
      } catch (error) {
        console.error(`Retry ${retries + 1} failed:`, error);
        retries++;
        if (retries < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          console.error("Max retries reached. Failed to fetch session data.");
        }
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const query = `
      mutation {
        AUTH_SVC_AUTH_SVC_login(input: {
          userName: "${formData.userName}",
          passWord: "${formData.passWord}"
        }) {
          error
          token
          message
          status
        }
      }
    `;

    try {
      const headers = { 'Content-Type': 'application/json' };
      const response = await callAPI(query, headers);
      const data = response.data?.data?.AUTH_SVC_AUTH_SVC_login;

      if (response.data.errors) {
        setModalMessage(`Login failed: ${response.data.errors.map((err: any) => err.message).join(', ')}`);
        setShowModal(true);
        return;
      }

      if (data?.token) {
        setModalMessage('Login successful');
        setShowModal(true);

        const userData = await fetchSessionData(3, 2000, data?.token);

        if (!userData) {
          setModalMessage('Failed to retrieve user data after login.');
          setShowModal(true);
          return;
        }

        setTimeout(() => {
          navigate(userData.role === roleEnum.ADMIN ? '/user-list' : '/dashboard');
        }, 2000);
      } else {
        setModalMessage(data?.message || 'Login failed');
        setShowModal(true);
      }
    } catch (error: any) {
      setModalMessage(`An error occurred, please try again.\n${error.message}`);
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-white">
      <div className="w-full max-w-md bg-white p-6 rounded-2xl shadow-xl border border-gray-300 transition-all duration-200 ease-in-out">
        <h2 className="text-xl font-bold text-center text-black">Login to your account</h2>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <InputField label="Username" name="userName" value={formData.userName} onChange={handleInputChange} />
          <InputField label="Password" name="passWord" type="password" value={formData.passWord} onChange={handleInputChange} />
          <button
            type="submit"
            className="w-full flex items-center justify-center text-white bg-indigo-500 hover:bg-indigo-600 focus:ring-4 
                     focus:outline-none focus:ring-indigo-300 font-medium rounded-xl text-sm px-5 py-2.5 
                     border border-gray-300 transition-all duration-200 ease-in-out"
            disabled={loading}
          >
            Login
          </button>
        </form>
      </div>
      <Modal isOpen={showModal} message={modalMessage} onClose={() => setShowModal(false)} />
      {loading && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-500 bg-opacity-50">
          <Spinner />
        </div>
      )}
    </div>
  );
};

export default Login;

const InputField = ({ label, name, type = "text", value, onChange }: any) => (
  <div>
    <label htmlFor={name} className="block mb-2 text-sm font-medium text-black">
      {label}
    </label>
    <input
      type={type}
      name={name}
      id={name}
      className="w-full px-3 py-2 border border-gray-300 bg-white text-black placeholder-gray-500 
                 rounded-2xl shadow-sm focus:outline-none focus:ring-2 
                 focus:ring-indigo-400 focus:border-indigo-400 transition-all duration-200 ease-in-out"
      placeholder={label}
      value={value}
      onChange={onChange}
      required
    />
  </div>
);