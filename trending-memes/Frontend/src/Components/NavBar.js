import React from 'react'

export default function MenuBar({setShowRegistrationModal, setShowLoginModal}) {

  const menuBarStyle = {
    listStyle: 'none',
    display: 'flex',
    justifyContent: 'center', // We can use justify content after display property
    gap: '3%'
  }

  return (
    <nav className='menuBar' style={menuBarStyle}>
      <li className='signUpLink'>Sign Up</li>
      <li className='logInLink'>Log In</li>
      <li className='aboutLink'>About</li>
    </nav>
  )
}
