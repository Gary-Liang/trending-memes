import React from 'react'

export default function NavBar({ setShowRegistrationModal, setShowLoginModal, setShowAboutModal, setShowLogoutModal, showSavedMemes, setShowSavedMemes }) {

  const token = sessionStorage.getItem('token') || '';

  const menuBarStyle = {
    listStyle: 'none',
    display: 'flex',
    justifyContent: 'center', // We can use justify content after display property
    gap: '3%',
    padding: '15px',
    backgroundColor: 'silver'
  }

  const buttonStyle = {
    cursor: 'pointer',
    color: '#3F3D56',
    transform: 'scale(1.25)',
  }

  const checkSession = () => {
    fetch("/api/check_session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Connection": "keep-alive",
        "Authorization": sessionStorage.getItem('token')
      },
    })
      .then((response) => {
        if (response.status === 401) {
          sessionStorage.clear();
          setShowLoginModal(true);
          setShowSavedMemes(false);
          throw new Error('401 Unauthorized'); // Stops the promise 
        }
        else if (response.status === 200) {
          setShowSavedMemes(true);
        }
        return response.json();
      })
      .catch((error) => {
        console.error("Error:", error);
      });

  }

  return (
    <>
      {!token ?
        <nav className='menuBar' style={menuBarStyle}>
          <li className='signUpLink' style={buttonStyle} onClick={() => setShowRegistrationModal(true)}>Sign Up</li>
          <li className='logInLink' style={buttonStyle} onClick={() => setShowLoginModal(true)}>Log In</li>
          <li className='aboutLink' style={buttonStyle} onClick={() => setShowAboutModal(true)}>About</li>
        </nav> :
        <nav className='menuBar' style={menuBarStyle}>
          {!showSavedMemes ? <li className='savedMemesLink' style={buttonStyle} onClick={checkSession}>Saved Memes</li>
            : <li className='homeLink' style={buttonStyle} onClick={() => setShowSavedMemes(false)}>Home</li>}
          <li className='logOutLink' style={buttonStyle} onClick={() => setShowLogoutModal(true)}>Log Out</li>
          <li className='aboutLink' style={buttonStyle} onClick={() => setShowAboutModal(true)}>About</li>
        </nav>
      }
    </>

  )
}
