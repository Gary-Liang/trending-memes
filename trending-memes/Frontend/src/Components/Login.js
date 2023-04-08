import React, {useState} from 'react'

export default function Login({setShowRegistrationModal, setShowLoginModal}) {

    const inputChange = (event) => {

    };

    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });
    const loginFormModalStyle = {
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
        transform: 'translate(-50%, -50%)'
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
    }

    const passwordStyle = {
        position: 'fixed',
        top: '37.5%',
        left: '40%',
    }

    const submitButtonStyle = {
        background: 'cyan',
        position: 'fixed',
        top: '45%',
        left: '55%',

    }



    return (
        <>
            <div className='loginFormModal' style={loginFormModalStyle}>
                <div className='authForm' style={authFormStyle}>
                    <button className="closeButton" style={closeButton} onClick={() => setShowLoginModal(false)}>x</button>
                    <p className='welcomeBackTitle' style={welcomeBackTitleStyle}>Welcome back!</p>
                    <input className='usernameInput' placeholder='Enter username' type='text' value={formData.username} style={usernameStyle} onChange={inputChange()}></input>
                    <input className='passwordInput' placeholder='Enter password' type='text' value={formData.password} style={passwordStyle} onChange={inputChange()}></input>
                    <button className='submitButton' style={submitButtonStyle}>Submit</button>
                </div>
            </div>

        </>
    )
}