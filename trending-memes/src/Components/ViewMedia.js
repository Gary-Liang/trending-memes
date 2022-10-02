import React from 'react'

export default function ViewMedia(data) {
    return (
        <>
            <div className="popup" style={overlayDiv}>
                <div style={mediaPopupDisplay}>
                    <img src={data.link} alt={""}></img>
                </div>
            </div>
        </>
    )
}


const overlayDiv = {
    opacity: "0.6",
    background: 'black',
    width: "100vw",
    position: "relative",
    marginLeft: "-50vw",
    left: "50%",
}

const mediaPopupDisplay = {
    width: "450px",
    height: "450px",

}