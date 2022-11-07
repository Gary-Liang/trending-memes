import React, {useEffect, useLayoutEffect, useState} from 'react'

let currentMediaLink = "";
let breakpoint = 400;

export default function ViewMedia({mediaInfo, setMediaInfo, albumInfo}) {

  const [imageAlbumCount, setImageAlbumCount] = useState(0);

  const [imageAlbumData, setImageAlbumData] = useState(null);

  // Use useLayoutEffect for modifying the DOM
  useLayoutEffect(() => {
      if (mediaInfo.isClicked) {
        document.body.style.overflow = "hidden";
        //document.body.style.minHeight = "100%"
        document.body.style.height = "100%"
      }
      if (!mediaInfo.isClicked) { 
        document.body.style.overflow = "auto";
        document.body.style.height = "auto";
        //document.body.style.minHeight = "auto";
      }
  }, [mediaInfo]);

  // Escape key to close view media component
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        console.log("Pressed escape key");
        console.log('image count' + imageAlbumCount);
        closeViewMediaAndReset(); 
      }// }else 
      
      if (albumInfo.albumLength > 1) {
        // Left arrow key
        if (imageAlbumCount > 0) {
          if (e.key === 'ArrowLeft') {
            console.log("pressed left arrowkey");
            console.log('image count' + imageAlbumCount);
            loadPrevMediaInAlbum();
          } 
        }

        // Right arrow key
        if (imageAlbumCount + 1 < albumInfo.albumLength) {
          if (e.key === 'ArrowRight') {
            console.log("pressed right arrowkey");
            loadNextMediaInAlbum();
          }  
        }
      }
    }
      document.addEventListener('keydown', handleKeyDown);

      // Don't forget to clean up
      return function cleanup() {
        document.removeEventListener('keydown', handleKeyDown);
      } 
  }, [albumInfo, imageAlbumCount]);


  async function loadNextMediaInAlbum() {
    let updateImageIncrement = imageAlbumCount + 1;
    setImageAlbumCount(imageAlbumCount + 1);

    // make a promise and pull imgur album based on album hash 
    if (!imageAlbumData) { 
      await fetch('/all_album_image_links/' + albumInfo.album).then(
          // Promise
          res => res.json()
        ).then(
          albumInfoData => {
            setImageAlbumData(JSON.parse(JSON.stringify(albumInfoData)));
            setMediaInfo({dataInfo: JSON.parse(JSON.stringify(albumInfoData)).data[updateImageIncrement], 
                          isClicked: true,
                          height: JSON.parse(JSON.stringify(albumInfoData)).data[updateImageIncrement].height,
                          width: JSON.parse(JSON.stringify(albumInfoData)).data[updateImageIncrement].width});
            console.log("I was here first");
          }
      )
    } else {
      await fetch(imageAlbumData.data[updateImageIncrement].link).then(() => {
        setMediaInfo({dataInfo: imageAlbumData.data[updateImageIncrement], 
                      isClicked: true,
                      height: imageAlbumData.data[updateImageIncrement].height,
                      width: imageAlbumData.data[updateImageIncrement].width})
        console.log("rendered here second: " + imageAlbumData.data[updateImageIncrement].link);
      })  
    }
  
  }

  function loadPrevMediaInAlbum() {
    let updateImageIncrement = imageAlbumCount - 1;
    setImageAlbumCount(imageAlbumCount - 1);

    // make a promise and pull imgur album based on album hash 
    if (!imageAlbumData) { 
      fetch('/all_album_image_links/' + albumInfo.album).then(
          // Promise
          res => res.json()
        ).then(
          albumInfoData => {
            setImageAlbumData(JSON.parse(JSON.stringify(albumInfoData)));
            setMediaInfo({dataInfo: JSON.parse(JSON.stringify(albumInfoData)).data[updateImageIncrement], 
                          isClicked: true,
                          height: imageAlbumData.data[updateImageIncrement].height,
                          width: imageAlbumData.data[updateImageIncrement].width});
            console.log("I was here first");
          }
      )
    } else {
      setMediaInfo({dataInfo: imageAlbumData.data[updateImageIncrement], 
                   isClicked: true,
                   height: imageAlbumData.data[updateImageIncrement].height,
                   width: imageAlbumData.data[updateImageIncrement].width});
      console.log("rendered here second");
    }
  }

  function closeViewMediaAndReset() {
    setMediaInfo({dataInfo: "", isClicked: false});
    setImageAlbumCount(0);
    setImageAlbumData(null);
  }

  function copyMediaToClipboard() {
    navigator.clipboard.writeText(currentMediaLink)
  }

    return (
        <>
            {(mediaInfo.isClicked) ? 
              <div className="popup" style={overlayDiv}>
                <div className="popupMedia" style={mediaPopupDisplay}>
                    {(mediaInfo.dataInfo) ? renderFullMedia(mediaInfo.dataInfo): null}
                </div>
                <button className="closeButton" style={closeButton} onClick={closeViewMediaAndReset}>X</button>
                <button className="copyToClipBoardButton" style={copyToClipboardButton} onClick={copyMediaToClipboard}>Δ</button>
                { (albumInfo && albumInfo.albumLength > 1) ? 
                  <div>
                    <div className="imageNumInAlbum" style={imageNumber}>{imageAlbumCount + 1}</div>
                    <button className="viewNextInAlbum" style={arrowRightButton} onClick={loadNextMediaInAlbum}>
                      {(imageAlbumCount + 1 < albumInfo.albumLength) ? "▶" : null}
                    </button>
                    <button className="viewPrevInAlbum" style={arrowLeftButton} onClick={loadPrevMediaInAlbum}>
                    {(imageAlbumCount > 0) ? "◀" : null}
                    </button>
                  </div> : null
                }
              </div>: null}
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
    overflow: "hidden"
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

const copyToClipboardButton = {
  color: "black",
  position: "fixed",
  background: "none",
  fontSize: "24px",
  zIndex: "5",
  top: "60px",
  left: "30px",
  border: "none",
  fontWeight: "bold",
  WebkitTextStroke: "0.10px white",
}

const arrowLeftButton = {
  color: "white",
  position: "fixed",
  background: "none",
  fontSize: "24px",
  zIndex: "5",
  top: "50%",
  left: "10px",
  fontWeight: "bold",
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
  right: "10px",
  fontWeight: "bold",
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
  left: "15px",
  border: "none",
  WebkitTextStroke: "0.10px black",
}

const mediaPopupDisplay = {
    zIndex: "5",
    background: "rgba(0,0,0, 1)",
    height: "0"
}


function renderFullMedia(data) {
    if (data.link) {
      if (data.link.includes(".mp4")) {
        currentMediaLink = data.link
        return (
          <video key={data.link} style={videoResize} preload="auto" controls autoPlay loop>
            {console.log(data.link)}
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
          currentMediaLink = mediaURL
          return (
            <video key={mediaURL} style={videoResize} preload="auto" controls autoPlay loop>
              <source src={mediaURL} type="video/mp4"/>
            </video>
          )
        } else {
          mediaURL += data.images[0].type.split("/")[1];
          currentMediaLink = mediaURL
          return (
            <>
              <img key={mediaURL} style={imageResize} src={mediaURL}  alt=""/>
            </>
          )
        }
      } else {
        // if link is just a normal image or a gifv, render it normally. 
        currentMediaLink = data.link
        return (
          <>
            <img key={data.link} style={imageResize} src={data.link} alt=""/>
          </>
        )
      }
    }
  }

  const imageResize = {
    //TODO: add min and max dimensions here? 
    height: "100%",
    width: "auto",
    top: "0",
    left: "0",
    right: "0",
    bottom: "0",
    margin: "0 auto",
    position: "absolute",
  }

  const videoResize = {
    //TODO: add min and max dimensions here? 
    height: "100%",
    width: "100%",
    left: "0",
    top: "0",
    position: "absolute",
  }

  // const spinnerStyle = {
  //   zIndex: "5"
  // }


function checkMediaSize() {

  }

// function loadingSpinner() {
//   return (
//     <>
//       <div style={spinnerStyle}>
//         <p>Please wait while media is loading...</p>
//       </div>
//     </>
//   )
// }
