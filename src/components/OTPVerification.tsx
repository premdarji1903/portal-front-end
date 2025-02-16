import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Modal from './Model';
import { useNavigate } from 'react-router-dom';

interface OTPVerificationProps {
    userId?: string;
}

const OTPVerification: React.FC<OTPVerificationProps> = () => {
    const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
    const [focusedIndex, setFocusedIndex] = useState<number>(0);
    const [modalMessage, setModalMessage] = useState<string>('');
    const [showModal, setShowModal] = useState<boolean>(false);
    const [timeLeft, setTimeLeft] = useState<number>(600); // Timer in seconds (10 minutes)
    const [resendVisible, setResendVisible] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    const navigate = useNavigate();
    const inputRefs: any = useRef<HTMLInputElement[]>([]);

    const userId = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') || '{}').userId : '';

    // Timer logic
    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft((prevTime) => prevTime - 1);
            }, 1000);
            return () => clearInterval(timer); // Cleanup on unmount
        } else {
            setResendVisible(true); // Show "Resend" button when timer ends
        }
    }, [timeLeft]);

    const formatTime = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    };

    const handleResend = async () => {
        setTimeLeft(600); // Reset timer
        setResendVisible(false); // Hide Resend button during countdown

        try {
            await axios.post(
                'http://127.0.0.1:4000/api/resend-otp',
                { userId },
                { headers: { 'Content-Type': 'application/json' } }
            );

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
                inputRefs.current[index + 1]?.focus(); // Move focus to the next input
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number): void => {
        if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
            inputRefs.current[index - 1]?.focus(); // Move focus to the previous input if backspace
        }
    };

    const handleFocus = (index: number): void => {
        setFocusedIndex(index);
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>): void => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text');
        if (/^\d{4}$/.test(pastedData)) {
            setOtp(pastedData.split(''));
            inputRefs.current[3]?.focus();
        }
    };

    const closeModal = (): void => {
        setShowModal(false); // Close modal
    };

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        const otpCode = otp.join('');
        if (!otpCode || otpCode.length < 4 || !userId) {
            setModalMessage('Please enter the complete OTP.');
            setShowModal(true);
            return;
        }

        const query = `
      mutation MyMutation {
        AUTH_SVC_AUTH_SVC_otpVerify(input: {id: "${userId}", otp: ${parseInt(otpCode, 10)}}) {
          error
          message
          status
        }
      }
    `;

        setLoading(true);
        try {
            const response = await axios.post(
                'http://127.0.0.1:4000/api',
                { query },
                { headers: { 'Content-Type': 'application/json' } }
            );

            const data = response.data.data.AUTH_SVC_AUTH_SVC_otpVerify;

            if (response.data.errors?.length) {
                const errorMessages = response.data.errors.map((error: any) => error.message);
                setModalMessage(`Verification failed:\n${errorMessages.join('\n')}`);
                setShowModal(true);
                return;
            }

            if (data.status === 200) {
                setModalMessage('OTP verified successfully!');
                setShowModal(true);
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
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
        <div className="max-w-md mx-auto text-center bg-white px-4 sm:px-8 py-10 rounded-xl shadow">
            <header className="mb-8">
                <h1 className="text-2xl font-bold mb-2 text-black">Registration OTP Verification</h1>
                <p className="text-[15px] text-black">
                    Please enter the 4-digit verification code sent to your email address to complete the registration process.
                </p>
                <p className="text-[15px] text-black mt-2">
                    Note: The verification code is valid for only 10 minutes. Please complete the verification promptly.
                </p>
                <p className="text-indigo-500 font-bold mt-4">Time Remaining: {formatTime(timeLeft)}</p>
            </header>

            <form id="otp-form" onSubmit={handleSubmit}>
                <div className="flex items-center justify-center gap-3">
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            ref={(el) => (inputRefs.current[index] = el)}
                            type="text"
                            value={digit}
                            onChange={(e) => handleInput(e, index)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            onFocus={() => handleFocus(index)}
                            onPaste={handlePaste}
                            maxLength={1}
                            className="w-14 h-14 text-center text-2xl font-extrabold text-slate-900 bg-slate-100 border border-transparent hover:border-slate-200 appearance-none rounded p-4 outline-none focus:bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                            autoFocus={index === focusedIndex}
                        />
                    ))}
                </div>
                <div className="max-w-[260px] mx-auto mt-4">
                    <button
                        type="submit"
                        className="w-full inline-flex justify-center whitespace-nowrap rounded-lg bg-indigo-500 px-3.5 py-2.5 text-sm font-medium text-white shadow-sm shadow-indigo-950/10 hover:bg-indigo-600 focus:outline-none focus:ring focus:ring-indigo-300 focus-visible:outline-none focus-visible:ring focus-visible:ring-indigo-300 transition-colors duration-150"
                    >
                        Verify Account
                    </button>
                </div>
            </form>

            <div className="text-sm text-slate-500 mt-4">
                {resendVisible ? (
                    <button
                        onClick={handleResend}
                        className="font-medium text-indigo-500 hover:text-indigo-600"
                    >
                        Resend OTP
                    </button>
                ) : (
                    "Didn't receive code? Wait for the timer to complete."
                )}
            </div>

            <Modal isOpen={showModal} message={modalMessage} onClose={closeModal} />

            {loading && (
                <div className="fixed inset-0 flex justify-center items-center bg-gray-500 bg-opacity-50">
                    <div className="spinner"></div>
                </div>
            )}
        </div>
    );
};

export default OTPVerification;
