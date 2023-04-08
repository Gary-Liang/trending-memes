import React, {useState} from 'react'

export default function Login({setShowRegistrationModal, setShowLoginModal}) {

    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });

    const handleSubmit = (event) => {
        // The preventDefault() method is called to prevent the default form submission behavior, which would cause the page to refresh.
        event.preventDefault();
    }

    const inputChange = (event) => {

    };


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
        color: 'white'

    }

    return (
        <>
            <form className='loginFormModal' style={loginFormModalStyle} onSubmit={handleSubmit}>
                <div className='authForm' style={authFormStyle}>
                    <button className="closeButton" style={closeButton} onClick={() => setShowLoginModal(false)}>x</button>
                    <p className='welcomeBackTitle' style={welcomeBackTitleStyle}>Welcome back!</p>
                    <input className='usernameInput' placeholder='Enter Username' type='text' value={formData.username} style={usernameStyle} onChange={inputChange()}></input>
                    <input className='passwordInput' placeholder='Enter Password' type='text' value={formData.password} style={passwordStyle} onChange={inputChange()}></input>
                    <button className='submitButton' style={submitButtonStyle} type='submit'>Sign In</button>
                </div>
            </form>

        </>
    )
}