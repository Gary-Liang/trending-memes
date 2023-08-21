import React, { useState, useEffect } from 'react'

export default function Logout({ setShowLogoutModal, setShowSavedMemes }) {

    const [statusMessage, setStatusMessage] = useState("");
    const [statusSuccess, setStatusSuccess] = useState(false);

    const handleSubmit = (event) => {
        // The preventDefault() method is called to prevent the default form submission behavior, which would cause the page to refresh.
        event.preventDefault();

        const token = localStorage.getItem('token');
        // Send data to the server
        fetch("/api/logout", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Connection": "keep-alive",
                "Authorization": token
            }
        })
            .then((response) => response.json())
            .then((data) => {
                // Handle server response
                setStatusMessage(data.message);
                // does not update until after due to the setstate being async
                setStatusSuccess(data.success);
                if (data.success) {
                    localStorage.clear();
                    setShowSavedMemes(false);
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
                setShowLogoutModal(false);
            }
        }

        document.addEventListener('keydown', handleKeyDown);

        // Don't forget to clean up
        return function cleanup() {
            document.removeEventListener('keydown', handleKeyDown);
        }
    }, [setShowLogoutModal]);

    const closeModal = () => {
        setTimeout(() => setShowLogoutModal(false), 100);
    }



    const logoutFormModalStyle = {
        background: 'rgba(0,0,0, 0.75)',
        width: "100%",
        height: "100%",
        position: "fixed",
        top: "0",
        zIndex: "5",
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

    const logoutTitleStyle = {
        position: 'fixed',
        top: '15%',
        left: '40%',

    }

    const yesButtonStyle = {
        backgroundColor: '#3F3D56',
        position: 'fixed',
        top: '45%',
        left: '55%',
        border: 'none',
        transform: 'scale(1.5)',
        color: 'white',
        cursor: 'pointer'

    }

    const noButtonStyle = {
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
            <div className='logoutFormModal' style={logoutFormModalStyle} onClick={() => setShowLogoutModal(false)}>
            </div>
            <form className='authForm' onSubmit={handleSubmit} style={authFormStyle}>
                <button className="closeButton" style={closeButton} type='button' onClick={() => setShowLogoutModal(false)}>x</button>
                <p className='logoutTitle' style={logoutTitleStyle}>Are you sure you want to Log out?</p>
                <button className='yesButton' style={yesButtonStyle} type='submit'>Yes</button>
                <button className='noButton' style={noButtonStyle} type='button' onClick={() => setShowLogoutModal(false)}>No</button>
                {statusMessage !== "" ? <p className='errorMessage' style={statusSuccess ? successMessageStyle : errorMessageStyle}>{statusMessage}</p> : null}
                {statusSuccess ? closeModal() : null}
            </form>

        </>
    )
}
