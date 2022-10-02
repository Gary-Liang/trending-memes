import React from 'react'

export default function ViewMedia({mediaInfo, setMediaInfo}) {
    return (
        <>
            {mediaInfo.isClicked === true ? 
            <div class="popup" style={overlayDiv}>
                <div class="popupMedia" style={mediaPopupDisplay}>
                    {(mediaInfo.dataInfo !== null) ? renderMediaPreview(mediaInfo.dataInfo): null}
                </div>
                <button className="closeButton" style={closeButton}>X</button>
            </div> : null}
        </>
    )
}


const overlayDiv = {
    background: 'rgba(0,0,0, 0.75)',
    width: "100%",
    height: "100%",
    position: "fixed",
    // padding: "10px",
    //marginLeft: "-50vw",
    top: "0",
    zIndex: "5",
    overflow: "hidden"
    // display: "none"
}

const closeButton = {
    color: "black",
    position: "fixed",
    background: "none",
    fontSize: "24px",
    zIndex: "5",
    top: "0",
    border: "none",
    webkitTextStroke: "0.15px white",
}

const mediaPopupDisplay = {
    zIndex: "5",
    background: "rgba(0,0,0, 1);",
    // width: "100%",
    // height: "100%",
    // marginLeft: "200px",
    // marginRight: "200px",
    // marginTop: "200px",
    // marginBottom: "200px"
}


function renderMediaPreview(data) {
    console.log('Rendering.');
    if (data.link) {
      if (data.link.includes(".mp4")) {
        return (
          <video style={videoResize} preload="auto" controls autoPlay muted loop>
            <source src={data.link} type="video/mp4"/>
          </video>
        )
      } else if (data.link.includes("/a/")) {
        var mediaURL = "http://i.imgur.com/" + data.cover + ".";
        var previewHeaderText = "";
        if (data.images_count > 1)
          previewHeaderText = "(Meme Album)";
        if (data.images[0].type.includes("mp4")) {
          mediaURL += "mp4";
          return (
            <>
            <video style={videoResize} preload="auto" controls autoPlay muted loop>
              <source src={mediaURL} type="video/mp4"/>
            </video>
            </>
          )
        } else {
          mediaURL += data.images[0].type.split("/")[1];
          return (
            <>
            <img style={imageReSize} src={mediaURL}  alt=""/>
            </>
          )
        }
      } else {
        // if link is just a normal image or a gifv, render it normally. 
        return (
          <img style={imageReSize} src={data.link}  alt=""/>
        )
      }
    }
  }

  const imageReSize = {
    height: "100%",
    width: "50%",
    left: "0",
    top: "0",
    position: "fixed"
  }

  const videoResize = {
    height: "100%",
    width: "100%",
    left: "0",
    top: "0",
    position: "fixed",
    zIndex: "-1"
  }
