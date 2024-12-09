import React, { useState, useEffect } from "react";
import Cookies from "js-cookie";

const OTPTimer = ({ timeLimitInSecs = 120, OTPState }) => {
    const [timeLeft, setTimeLeft] = useState(() => {
        const savedTime = Cookies.get("otp-expiry");
        const remainingTime = savedTime ? parseInt(savedTime, 10) - Date.now() : timeLimitInSecs * 1000;
        return remainingTime > 0 ? Math.floor(remainingTime / 1000) : 0;
    });

    useEffect(() => {
        // Reset timer when OTPState changes
        Cookies.remove("otp-expiry");
        setTimeLeft(timeLimitInSecs);

        // Re-enable inputs when timer resets
        const inputs = document.querySelectorAll("input");
        inputs.forEach((input) => {
            input.disabled = false;
        });
    }, [OTPState, timeLimitInSecs]);

    useEffect(() => {
        if (timeLeft === 0) {
            Cookies.remove("otp-expiry");

            // Disable all inputs when timer expires
            const inputs = document.querySelectorAll("input");
            inputs.forEach((input) => {
                input.disabled = true;
            });

            return;
        }

        // Save expiry time in the cookie if not already saved
        if (!Cookies.get("otp-expiry")) {
            const expiryTime = Date.now() + timeLeft * 1000;
            Cookies.set("otp-expiry", expiryTime, { expires: (1 / 24 / 60) * (timeLeft / 60) });
        }

        const intervalId = setInterval(() => {
            setTimeLeft((prevTime) => prevTime - 1);
        }, 1000);

        return () => clearInterval(intervalId);
    }, [timeLeft]);

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <div>
            {timeLeft > 0 ? (
                <h5 className="text-center">Time Left: {formatTime(timeLeft)}</h5>
            ) : (
                <h5 className="text-center">OTP Expired</h5>
            )}
        </div>
    );
};

export default OTPTimer;
