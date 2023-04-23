import React, {useState} from 'react'

export default function Registration({setShowRegistrationModal, setShowLoginModal}) {

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
        fetch("/api/register", {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            'Connection': 'keep-alive'
            },
            body: JSON.stringify(formData),
        })
            .then((response) => response.json())
            .then((data) => {
                // Handle server response
                console.log(data);
                console.log(data.success);
                console.log('status code: ' + data.statusCode);
                setStatusMessage(data.message);
                setStatusSuccess(data.success);

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

    const switchModal = (event) => {
        setShowRegistrationModal(false);
        setShowLoginModal(true);
    };


    const registrationFormModalStyle = {
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

    const loginButtonStyle = {
        backgroundColor: '#3F3D56',
        position: 'fixed',
        top: '55%',
        left: '55%',
        border: 'none',
        transform: 'scale(1.5)',
        color: 'white'

    }

    const errorMessageStyle = {
        position: 'fixed',
        color: 'red',
        top: '57.5%',
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
            <form className='registrationFormModal' style={registrationFormModalStyle} onSubmit={handleSubmit}>
                <div className='authForm' style={authFormStyle}>
                    <button className="closeButton" style={closeButton} onClick={() => setShowRegistrationModal(false)}>x</button>
                    <p className='registrationTitle' style={welcomeBackTitleStyle}>Registration</p>
                    <input className='username' placeholder='Enter Username' type='string' value={formData.username} style={usernameStyle} onChange={inputChange}></input>
                    <input className='password' placeholder='Enter Password' type='password' value={formData.password} style={passwordStyle} onChange={inputChange}></input>
                    <button className='submitButton' style={submitButtonStyle} type='submit'>Sign Up</button>
                    <button className='loginButton' style={loginButtonStyle} onClick={switchModal}>Existing Users</button>
                    {statusMessage !== "" ? <p className='errorMessage' style={statusSuccess ? successMessageStyle : errorMessageStyle}>{statusMessage}</p> : null}
                </div>
            </form>

        </>
    )
}