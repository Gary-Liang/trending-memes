import React, {useState} from 'react'
import Cookies from 'js-cookie'

export default function Login({setShowRegistrationModal, setShowLoginModal}) {

    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });
    const [errorMessage, setErrorMessage] = useState("");
    const expirationTime = new Date(new Date().getTime() + 60 * 60 + 1000); // 1 hour from now

    const handleSubmit = (event) => {
        // The preventDefault() method is called to prevent the default form submission behavior, which would cause the page to refresh.
        event.preventDefault();
        // Send data to the server
        fetch("/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'Connection': 'keep-alive',
                'Access-Control-Allow-Origin': 'https://tmback.xyz',
            },
            body: JSON.stringify(formData),
        })
            .then((response) => response.json())
            .then((data) => {
            // Handle server response
                console.log(data);
                console.log(data.success);
                if (data.success === false) {
                    setErrorMessage(data.message);
                } else if (data.success === true) {
                    setErrorMessage("");
                    Cookies.set('token', data.token, {expires: expirationTime});
                }

            })
            .catch((error) => {
                console.error("Error:", error);
            });
    }

    const inputChange = (event) => {
        const {className, value} = event.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [className]: value,
        }));
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

    const errorMessageStyle = {
        position: 'fixed',
        color: 'red',
        top: '55%',
        left: '40%'
    }

    return (
        <>
            <form className='loginFormModal' style={loginFormModalStyle} onSubmit={handleSubmit}>
                <div className='authForm' style={authFormStyle}>
                    <button className="closeButton" style={closeButton} onClick={() => setShowLoginModal(false)}>x</button>
                    <p className='welcomeBackTitle' style={welcomeBackTitleStyle}>Welcome back!</p>
                    <input className='username' placeholder='Enter Username' type='string' value={formData.username} style={usernameStyle} onChange={inputChange}></input>
                    <input className='password' placeholder='Enter Password' type='password' value={formData.password} style={passwordStyle} onChange={inputChange}></input>
                    <button className='submitButton' style={submitButtonStyle} type='submit'>Sign In</button>
                    {errorMessage !== "" ? <p className='errorMessage' style={errorMessageStyle}>{errorMessage}</p> : null}
                </div>
            </form>

        </>
    )
}
