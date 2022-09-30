import React from 'react'

export default function ViewMedia({data}) {
    return (
        <>
            <div className="popup" style={overlayDiv}>
                <div style={mediaPopupDisplay}>
                    
                </div>
            </div>
        </>
    )
}


const overlayDiv = {
    width: "100%",
    height: "100%",
    opacity: "0.6",

}

const mediaPopupDisplay = {
    width: "450px",
    height: "450px",

}