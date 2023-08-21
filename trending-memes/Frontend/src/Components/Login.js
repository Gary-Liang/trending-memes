import React, { useState, useEffect } from 'react'

export default function Login({ setShowRegistrationModal, setShowLoginModal }) {

    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });
    const [statusMessage, setStatusMessage] = useState("");
    const [statusSuccess, setStatusSuccess] = useState(false);

    const handleSubmit = (event) => {
        // The preventDefault() method is called to prevent the default form submission behavior, which would cause the page to refresh.
        event.preventDefault();
        // Send data to the server
        fetch("/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'Connection': 'keep-alive',
            },
            body: JSON.stringify(formData),
        })
            .then((response) => response.json())
            .then((data) => {
                // Handle server response
                setStatusMessage(data.message);
                setStatusSuccess(data.success);
                if (data.token !== undefined && data.token !== null) {
                    localStorage.setItem('token', data.token);
                }
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    }

    useEffect(() => {
        function handleKeyDown(event) {
            if (event.key === 'Escape') {
                event.preventDefault();
                setShowLoginModal(false);
            }
        }

        document.addEventListener('keydown', handleKeyDown);

        // Don't forget to clean up
        return function cleanup() {
            document.removeEventListener('keydown', handleKeyDown);
        }
    }, [setShowLoginModal]);

    const inputChange = (event) => {
        const { className, value } = event.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [className]: value,
        }));
    };

    const switchModal = (event) => {
        setShowLoginModal(false);
        setShowRegistrationModal(true);
    };

    const closeModal = () => {
        setTimeout(() => setShowLoginModal(false), 1500);
    }

    const loginFormModalStyle = {
        background: 'rgba(0,0,0, 0.75)',
        width: "100%",
        height: "100%",
        position: "fixed",
        top: "0",
        zIndex: "3",
        overflow: "hidden"
    }

    const closeButton = {
        color: "black",
        position: "fixed",
        background: "none",
        fontSize: "24px",
        zIndex: "5",
        top: "10px",
        left: "10px",
        border: "none",
        fontWeight: "bold",
        WebkitTextStroke: "0.10px white",
        cursor: 'pointer'
    }

    const authFormStyle = {
        backgroundColor: 'white',
        width: '40%',
        height: '50%',
        border: 'black ridge 1px',
        borderRadius: '10px',
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: '5'
    }

    const welcomeBackTitleStyle = {
        position: 'fixed',
        top: '15%',
        left: '40%',

    }

    const usernameStyle = {
        position: 'fixed',
        top: '30%',
        left: '40%',
        transform: 'scale(1.1)'
    }

    const passwordStyle = {
        position: 'fixed',
        top: '37.5%',
        left: '40%',
        transform: 'scale(1.1)'
    }

    const submitButtonStyle = {
        backgroundColor: '#3F3D56',
        position: 'fixed',
        top: '45%',
        left: '55%',
        border: 'none',
        transform: 'scale(1.5)',
        color: 'white',
        cursor: 'pointer'

    }

    const registrationButtonStyle = {
        backgroundColor: '#3F3D56',
        position: 'fixed',
        top: '55%',
        left: '55%',
        border: 'none',
        transform: 'scale(1.5)',
        color: 'white',
        cursor: 'pointer'

    }

    const errorMessageStyle = {
        position: 'fixed',
        color: 'red',
        top: '55%',
        left: '40%'
    }

    const successMessageStyle = {
        position: 'fixed',
        color: 'green',
        top: '57.5%',
        left: '40%'
    }

    return (
        <>
            <div className='loginFormModal' style={loginFormModalStyle} onClick={() => setShowLoginModal(false)}>
            </div>
            <form className='authForm' style={authFormStyle} onSubmit={handleSubmit}>
                <button className="closeButton" style={closeButton} type='button' onClick={() => setShowLoginModal(false)}>x</button>
                <p className='welcomeBackTitle' style={welcomeBackTitleStyle}>Welcome back!</p>
                <input className='username' placeholder='Enter Username' type='text' value={formData.username} style={usernameStyle} onChange={inputChange} disabled={statusSuccess}></input>
                <input className='password' placeholder='Enter Password' type='password' value={formData.password} style={passwordStyle} onChange={inputChange} disabled={statusSuccess}></input>
                <button className='submitButton' style={submitButtonStyle} type='submit' >Sign In</button>
                <button className='registrationButton' style={registrationButtonStyle} type='button' onClick={switchModal}>No Account?</button>
                {statusMessage !== "" ? <p className='errorMessage' style={statusSuccess ? successMessageStyle : errorMessageStyle}>{statusMessage}</p> : null}
                {statusSuccess ? closeModal() : null}
            </form>

        </>
    )
}
