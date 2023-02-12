import React from 'react'

export default function LoadingIcon() {

    const loadingstyle = {
        background: 'rgba(0,0,0, 0.75)',
        width: "100%",
        height: "100%",
        position: "fixed",
        zIndex: "5",
        overflow: "hidden",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "white"
    }


    return(
        <>
            <div className='loadingIcon' style={loadingstyle}>
                Loading . . . 
            </div>
        </>
    )


}