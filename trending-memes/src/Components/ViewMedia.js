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
    width: "100%",
    height: "100%",
    opacity: "0.6",
    background: 'black',

}

const mediaPopupDisplay = {
    width: "450px",
    height: "450px",

}