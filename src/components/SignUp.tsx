import React, { useState } from "react";
import axios from "axios";
import Modal from "./Model";
import { useNavigate } from "react-router-dom";
import Spinner from "./Spinner";
import { VITE_APP_URL } from "../common";

const SignUp: React.FC = () => {
  const [formData, setFormData] = useState({
    email: "",
    passWord: "",
    confirmPassword: "",
    termsAccepted: false,
    firstName: "",
    lastName: "",
    contactNumber: "",
    userName: "",
    gender: "",
  });

  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | any>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const query = `
    mutation {
      AUTH_SVC_AUTH_SVC_registration(input: {
        confirmPassword: "${formData.confirmPassword}",
        contactNumber: "${formData.contactNumber}",
        email: "${formData.email}",
        firstName: "${formData.firstName}",
        gender: "${formData.gender}",
        lastName: "${formData.lastName}",
        passWord: "${formData.passWord}",
        userName: "${formData.userName}"
      }) {
        error
        id
        message
        status
      }
    }
  `;

    try {
      const response = await axios.post(VITE_APP_URL, { query }, {
        headers: { "Content-Type": "application/json" },
      });

      const data = response.data?.data?.AUTH_SVC_AUTH_SVC_registration;

      if (response.data.errors?.length) {
        setModalMessage(`Registration failed: ${response.data.errors.map((err: any) => err.message).join(", ")}`);
        setShowModal(true);
        return;
      }

      if (data?.status === 201) {
        setModalMessage("Registration successful!");
        setShowModal(true);
        setTimeout(() => navigate("/otp"), 2000);
      } else if (data?.status === 409) {
        setModalMessage(data?.message);
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
      <div className="signup w-full max-w-2xl bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg border dark:border-gray-600">
        <section>
          <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto w-full">
            <div className="w-full bg-white rounded-lg shadow dark:border sm:max-w-lg lg:max-w-2xl xl:max-w-3xl xl:p-0 dark:bg-gray-800 dark:border-gray-700">
              <div className="w-full space-y-4 md:space-y-6 sm:p-8">
                <h2 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                  Create an account
                </h2>
                <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
                  {/* First & Last Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField label="First Name" name="firstName" value={formData.firstName} onChange={handleInputChange} />
                    <InputField label="Last Name" name="lastName" value={formData.lastName} onChange={handleInputChange} />
                  </div>

                  {/* Email & Contact Number */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField label="Email" name="email" type="email" value={formData.email} onChange={handleInputChange} />
                    <InputField label="Contact Number" name="contactNumber" value={formData.contactNumber} onChange={handleInputChange} />
                  </div>

                  {/* Username & Gender */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField label="Username" name="userName" value={formData.userName} onChange={handleInputChange} />
                    <SelectField label="Gender" name="gender" value={formData.gender} onChange={handleInputChange} />
                  </div>

                  {/* Password & Confirm Password */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InputField label="Password" name="passWord" type="password" value={formData.passWord} onChange={handleInputChange} />
                    <InputField label="Confirm Password" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleInputChange} />
                  </div>

                  <button
                    type="submit"
                    className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                  >
                    Create an account
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* Modal */}
        <Modal isOpen={showModal} message={modalMessage} onClose={() => setShowModal(false)} />

        {/* Loading Spinner Overlay */}
        {loading && (
          <div className="fixed inset-0 flex justify-center items-center bg-gray-500 bg-opacity-50">
            <Spinner />
          </div>
        )}
      </div>
    </div>
  );
};

export default SignUp;

/* === Reusable InputField Component === */
const InputField = ({ label, name, type = "text", value, onChange }: any) => (
  <div>
    <label htmlFor={name} className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{label}</label>
    <input
      type={type}
      name={name}
      id={name}
      className="input-field"
      placeholder={label}
      value={value}
      onChange={onChange}
      required
    />
  </div>
);

/* === Reusable SelectField Component === */
const SelectField = ({ label, name, value, onChange }: any) => (
  <div>
    <label htmlFor={name} className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{label}</label>
    <select name={name} id={name} className="input-field" value={value} onChange={onChange} required>
      <option value="">Select {label}</option>
      <option value="Male">Male</option>
      <option value="Female">Female</option>
      <option value="Other">Other</option>
    </select>
  </div>
);
