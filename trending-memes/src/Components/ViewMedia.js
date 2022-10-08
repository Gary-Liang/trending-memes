import React, {useState} from 'react'

export default function ViewMedia({mediaInfo, setMediaInfo}) {

  const [imageAlbumCount, setImageAlbumCount] = useState(0);


    return (
        <>
            {(mediaInfo.isClicked) ? 
            <div className="popup" style={overlayDiv}>
                <div className="popupMedia" style={mediaPopupDisplay}>
                    {(mediaInfo.dataInfo) ? renderFullMedia(mediaInfo.dataInfo): null}
                </div>
                <button className="closeButton" style={closeButton} onClick={() => closeViewMediaAndReset(setMediaInfo, setImageAlbumCount)}>X</button>
                { (mediaInfo.dataInfo && mediaInfo.albumLength > 1) ? 
                  <div>
                    <div className="imageNumInAlbum" style={imageNumber}>{imageAlbumCount}</div>
                    <button className="viewNextInAlbum" style={arrowRightButton} onClick={() => setMediaInfo({dataInfo: loadNextMediaInAlbum(mediaInfo, imageAlbumCount, setImageAlbumCount), isClicked: true})}>R</button>
                    <button className="viewPrevInAlbum" style={arrowLeftButton} onClick={() => setMediaInfo({dataInfo: loadNextMediaInAlbum(mediaInfo, imageAlbumCount, setImageAlbumCount), isClicked: true})}>L</button>
                  </div> : null
                }
            </div> : null}
        </>
    )
}


const overlayDiv = {
    background: 'rgba(0,0,0, 0.75)',
    width: "100%",
    height: "100%",
    position: "fixed",
    top: "0",
    zIndex: "5",
    // overflow: "hidden"
}

const closeButton = {
    color: "black",
    position: "fixed",
    background: "none",
    fontSize: "24px",
    zIndex: "5",
    top: "0",
    border: "none",
    WebkitTextStroke: "0.10px white",
}

const arrowLeftButton = {
  color: "white",
  position: "fixed",
  background: "none",
  fontSize: "24px",
  zIndex: "5",
  top: "50%",
  left: "0",
  border: "none",
  WebkitTextStroke: "0.10px black",
}

const arrowRightButton = {
  color: "white",
  position: "fixed",
  background: "none",
  fontSize: "24px",
  zIndex: "5",
  top: "50%",
  right: "0",
  border: "none",
  WebkitTextStroke: "0.10px black",
}

const imageNumber = {
  color: "white",
  position: "fixed",
  background: "none",
  fontSize: "24px",
  zIndex: "5",
  top: "15%",
  left: "0",
  border: "none",
  WebkitTextStroke: "0.10px black",
}

const mediaPopupDisplay = {
    zIndex: "5",
    background: "rgba(0,0,0, 1)",
}


function renderFullMedia(data) {
    console.log('Rendering.');
    if (data.link) {
      if (data.link.includes(".mp4")) {
        return (
          <video style={videoResize} preload="auto" controls autoPlay loop>
            <source src={data.link} type="video/mp4"/>
          </video>
        )
      } else if (data.link.includes("/a/")) {
        let mediaURL = "http://i.imgur.com/" + data.cover + ".";
        let previewHeaderText = "";
        if (data.images_count > 1)
          previewHeaderText = "(Meme Album)";
        if (data.images[0].type.includes("mp4")) {
          mediaURL += "mp4";
          return (
            <>
            <video style={videoResize} preload="auto" controls autoPlay loop>
              <source src={mediaURL} type="video/mp4"/>
            </video>
            </>
          )
        } else {
          mediaURL += data.images[0].type.split("/")[1];
          return (
            <>
            <img style={imageResize} src={mediaURL}  alt=""/>
            </>
          )
        }
      } else {
        // if link is just a normal image or a gifv, render it normally. 
        return (
          <img style={imageResize} src={data.link}  alt=""/>
        )
      }
    }
  }

  function loadNextMediaInAlbum(mediaInfo, imageAlbumCount, setImageAlbumCount) {
    let updatedImageAlbumCount = imageAlbumCount + 1;
    setImageAlbumCount(updatedImageAlbumCount);
    
    let mediaLinkFromAlbum;

    // make a promise and pull imgur album based on album hash 
    fetch('/all_album_image_links/' + mediaInfo.album).then(
        // Promise
        res => res.json()
    ).then(
        albumInfo => {
          mediaLinkFromAlbum = JSON.parse(JSON.stringify(albumInfo)).data[updatedImageAlbumCount].link;
          console.log("Media Link from Album" + mediaLinkFromAlbum);
        }
    )

    console.log("Media Link from Album 2" + mediaLinkFromAlbum);
    return mediaLinkFromAlbum;
  }

  function closeViewMediaAndReset(setMediaInfo, setImageAlbumCount) {
    setMediaInfo({dataInfo: "", album: "", albumLength: 0, isClicked: false});
    setImageAlbumCount(0);
  }

  const imageResize = {
    height: "100%",
    width: "auto",
    top: "0",
    left: "0",
    right: "0",
    bottom: "0",
    margin: "auto",
    position: "absolute",
  }

  const videoResize = {
    height: "100%",
    width: "100%",
    left: "0",
    top: "0",
    position: "absolute",
  }
