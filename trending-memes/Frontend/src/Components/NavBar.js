import React from 'react'

export default function NavBar({setShowRegistrationModal, setShowLoginModal}) {


  const menuBarStyle = {
    listStyle: 'none',
    display: 'flex',
    justifyContent: 'center', // We can use justify content after display property
    gap: '3%',
    padding: '15px'
  }

  return (
    <nav className='menuBar' style={menuBarStyle}>
      <li className='signUpLink' onClick={() => setShowRegistrationModal(true)}>Sign Up</li>
      <li className='logInLink' onClick={() => setShowLoginModal(true)}>Log In</li>
      <li className='aboutLink'>About</li>
    </nav>
  )
}
