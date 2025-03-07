import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Modal from './Model';
import Spinner from './Spinner';
import { useNavigate } from 'react-router-dom';

interface OTPVerificationProps {
    userId?: string;
}

const OTPVerification: React.FC<OTPVerificationProps> = () => {
    const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
    const [modalMessage, setModalMessage] = useState<string>('');
    const [showModal, setShowModal] = useState<boolean>(false);
    const [timeLeft, setTimeLeft] = useState<number>(600);
    const [resendVisible, setResendVisible] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    const navigate = useNavigate();
    const inputRefs: any = useRef<HTMLInputElement[]>([]);
    const userId = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '{}').userId : '';

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft((prevTime) => prevTime - 1);
            }, 1000);
            return () => clearInterval(timer);
        } else {
            setResendVisible(true);
        }
    }, [timeLeft]);

    const formatTime = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };

    const handleResend = async () => {
        setTimeLeft(600);
        setResendVisible(false);
        try {
            await axios.post('http://127.0.0.1:4000/api/resend-otp', { userId }, { headers: { 'Content-Type': 'application/json' } });
            setModalMessage('A new OTP has been sent to your email.');
            setShowModal(true);
        } catch (error: any) {
            setModalMessage(`Failed to resend OTP. Please try again.\n${error.message || error}`);
            setShowModal(true);
        }
    };

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>, index: number): void => {
        const value = e.target.value;
        if (/^[0-9]{1}$/.test(value) || value === '') {
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);
            if (value && index < otp.length - 1) {
                inputRefs.current[index + 1]?.focus();
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        const otpCode = otp.join('');
        if (!otpCode || otpCode.length < 4 || !userId) {
            setModalMessage('Please enter the complete OTP.');
            setShowModal(true);
            return;
        }
        const query = `mutation { AUTH_SVC_AUTH_SVC_otpVerify(input: {id: "${userId}", otp: ${parseInt(otpCode, 10)}}) { error message status }}`;
        setLoading(true);
        try {
            const response = await axios.post('http://127.0.0.1:4001/api', { query }, { headers: { 'Content-Type': 'application/json' } });
            const data = response.data.data.AUTH_SVC_AUTH_SVC_otpVerify;
            if (response.data.errors?.length) {
                setModalMessage(`Verification failed:\n${response.data.errors.map((error: any) => error.message).join('\n')}`);
                setShowModal(true);
                return;
            }
            if (data.status === 200) {
                setModalMessage('OTP verified successfully!');
                setShowModal(true);
                setTimeout(() => navigate('/login'), 2000);
            } else {
                setModalMessage(`${data.message}`);
                setShowModal(true);
            }
        } catch (error: any) {
            setModalMessage(`An error occurred, please try again.\n${error.message || error}`);
            setShowModal(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-screen h-screen flex justify-center items-center bg-white">
            <div className="w-full max-w-md bg-white text-black p-6 rounded-lg shadow-lg border border-gray-300">
                <header className="text-center mb-6">
                    <h1 className="text-2xl font-bold">OTP Verification</h1>
                    <p className="text-sm text-gray-600">Enter the 4-digit code sent to your email.</p>
                    <p className="text-indigo-500 font-bold mt-2">Time Remaining: {formatTime(timeLeft)}</p>
                </header>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="flex justify-center gap-2">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => (inputRefs.current[index] = el)}
                                type="text"
                                value={digit}
                                onChange={(e) => handleInput(e, index)}
                                maxLength={1}
                                className="w-12 h-12 text-center text-xl font-bold border border-gray-400 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            />
                        ))}
                    </div>
                    <button
                        type="submit"
                        className="w-full flex items-center justify-center bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 focus:ring-2 focus:ring-indigo-300 border border-gray-400"
                        disabled={loading}
                    >
                       Verify OTP
                    </button>
                </form>
                <div className="text-sm text-gray-600 mt-4 text-center">
                    {resendVisible ? (
                        <button onClick={handleResend} className="text-indigo-500 hover:underline">Resend OTP</button>
                    ) : (
                        "Didn't receive the code? Wait for the timer to complete."
                    )}
                </div>
                <Modal isOpen={showModal} message={modalMessage} onClose={() => setShowModal(false)} />
                {loading && (
                    <div className="fixed inset-0 flex justify-center items-center bg-gray-500 bg-opacity-50">
                        <Spinner />
                    </div>
                )}
            </div>
        </div>
    );
};

export default OTPVerification;
