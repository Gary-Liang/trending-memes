import React from 'react'

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
    
    const aboutTitleStyle = {
        position: 'auto',
        padding: '35px'

    }

    const aboutBodyTextStyle = {
        position: 'auto',
        padding: '4%'

    }


    

    return(
        <>
            <div className="aboutModal" style={aboutModalStyle}>
                <div className="aboutText" style={authFormStyle}>
                    <button className="closeButton" style={closeButton} onClick={() => setShowAboutModal(false)}>x</button>
                    <header className='aboutHeader'>
                        <h2 className='aboutTitle' style={aboutTitleStyle}>About</h2>
                        <div className='aboutBodyText' style={aboutBodyTextStyle}>
                            <p>This web application pulls from Imgur API to pull trending 'memes'. This is a personal project started by Gary Liang</p>
                            <p>to demonstrate a fullstack project using the following technologies: Node.js, React frontend, Flask backend, redis and mongoDB databases.</p>
                            <p>The frontend is hosted by Netlify and the backend is hosted by railway app. https://github.com/Gary-Liang/trending-memes </p>
                            <p> © GARY LIANG 2023</p>
                        </div>
                    </header>    
                </div>
            </div>
        </>
    )
}