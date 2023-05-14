import React from 'react'

export default function NavBar({setShowRegistrationModal, setShowLoginModal, setShowAboutModal, setShowLogoutModal, showSavedMemes, setShowSavedMemes}) {


  const menuBarStyle = {
    listStyle: 'none',
    display: 'flex',
    justifyContent: 'center', // We can use justify content after display property
    gap: '3%',
    padding: '15px'
  }

  const token = sessionStorage.getItem('token');

  return (
    <>
      {!token ? 
        <nav className='menuBar' style={menuBarStyle}>
          <li className='signUpLink' onClick={() => setShowRegistrationModal(true)}>Sign Up</li>
          <li className='logInLink' onClick={() => setShowLoginModal(true)}>Log In</li>
          <li className='aboutLink' onClick={() => setShowAboutModal(true)}>About</li>
        </nav> :
        <nav className='menuBar' style={menuBarStyle}>
          {!showSavedMemes ? <li className='savedMemesLink' onClick={() => setShowSavedMemes(true)}>Saved Memes</li>
                           : <li className='homeLink' onClick={() => setShowSavedMemes(false)}>Home</li>}
          <li className='logOutLink' onClick={() => setShowLogoutModal(true)}>Log Out</li>
          <li className='aboutLink' onClick={() => setShowAboutModal(true)}>About</li>
        </nav>
      }
    </>
    
  )
}
