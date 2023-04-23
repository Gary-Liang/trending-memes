import React, {useState} from 'react'

export default function About({setShowAboutModal}) {


    const aboutModalStyle = {
        background: 'rgba(0,0,0, 0.75)',
        width: "100%",
        height: "100%",
        position: "fixed",
        top: "0",
        zIndex: "5",
        overflow: "hidden"
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
    
    const welcomeBackTitleStyle = {
        position: 'fixed',
        top: '15%',
        left: '40%',

    }

    

    return(
        <>
            <div className="aboutModal" style={aboutModalStyle}>
                <div className="aboutText" style={authFormStyle}>
                    <button className="closeButton" style={closeButton} onClick={() => setShowAboutModal(false)}>x</button>
                    <p className='aboutTitle' style={welcomeBackTitleStyle}>About</p>
                </div>
            </div>
        </>
    )
}