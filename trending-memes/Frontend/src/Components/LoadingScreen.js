import React, {useLayoutEffect} from 'react'

export default function LoadingScreen(loadingScreen) {

    // Use useLayoutEffect for modifying the DOM prior to page rendering
    useLayoutEffect(() => {
        if (loadingScreen) {
            document.body.style.overflow = "hidden";
            document.body.style.height = "100%";
        } else {
            document.body.style.overflow = "auto";
            document.body.style.height = "auto";
        }
    }, [loadingScreen]);


    const loadingStyle = {
        background: 'rgba(0,0,0, 0.75)',
        width: "100%",
        height: "100%",
        position: "fixed",
        zIndex: "4",
        overflow: "hidden",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "white"
    }


    return(
        <>
            <div className='loadingScreen' style={loadingStyle}>
                Loading . . . 
            </div>
        </>
    )


}