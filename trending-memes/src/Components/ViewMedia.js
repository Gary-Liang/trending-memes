import React, {useEffect, useState} from 'react'

export default function ViewMedia({mediaInfo, setMediaInfo, albumInfo}) {

  const [imageAlbumCount, setImageAlbumCount] = useState(0);

  const [imageAlbumData, setImageAlbumData] = useState(null);


  // Escape key to close view media component
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        closeViewMediaAndReset();
      }  
      // // Left arrow key
      // } else if (e.key === 37) {
      //   loadPrevMediaInAlbum();
      // // Right arrow key
      // } else if (e.key === 39) {
      //   loadNextMediaInAlbum();
      // }
    }  
      document.addEventListener('keydown', handleKeyDown);

      // Don't forget to clean up
      return function cleanup() {
        document.removeEventListener('keydown', handleKeyDown);
      } 
  }, []);


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
                          isClicked: true});
            console.log("I was here first");
          }
      )
    } else {
      await fetch(imageAlbumData.data[updateImageIncrement].link).then(() => {
        setMediaInfo({dataInfo: imageAlbumData.data[updateImageIncrement], 
                      isClicked: true})
        console.log("rendered here second: " + imageAlbumData.data[updateImageIncrement].link);
      })  
      // setMediaInfo({dataInfo: imageAlbumData.data[updateImageIncrement], 
      //              isClicked: true});
      // console.log("rendered here second: " + imageAlbumData.data[updateImageIncrement].link);
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
                          isClicked: true});
            console.log("I was here first");
          }
      )
    } else {
      setMediaInfo({dataInfo: imageAlbumData.data[updateImageIncrement], 
                   isClicked: true});
      console.log("rendered here second");
    }
  
  }

  function closeViewMediaAndReset() {
    setMediaInfo({dataInfo: "", isClicked: false});
    setImageAlbumCount(0);
    setImageAlbumData(null);
  }

    return (
        <>
            {(mediaInfo.isClicked) ? 
            <div className="popup" style={overlayDiv}>
                <div className="popupMedia" style={mediaPopupDisplay}>
                    {(mediaInfo.dataInfo) ? renderFullMedia(mediaInfo.dataInfo): null}
                </div>
                <button className="closeButton" style={closeButton} onClick={closeViewMediaAndReset}>X</button>
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
    top: "10px",
    left: "10px",
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
}


function renderFullMedia(data) {
    if (data.link) {
      if (data.link.includes(".mp4")) {
        return (
          <video style={videoResize} preload="auto" controls autoPlay loop>
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
          <img style={imageResize} src={data.link} alt=""/>
        )
      }
    }
  }

  // function loadNextMediaInAlbum(mediaInfo, setMediaInfo, albumInfo, imageAlbumCount, setImageAlbumCount) {
  //   let updatedImageAlbumCount = imageAlbumCount + 1;
  //   setImageAlbumCount(updatedImageAlbumCount);


  //   // make a promise and pull imgur album based on album hash 
  //   if (!imageAlbumData) { 
  //     fetch('/all_album_image_links/' + albumInfo.album).then(
  //         // Promise
  //         res => res.json()
  //       ).then(
  //         albumInfo => {
  //           setMediaInfo({dataInfo: JSON.parse(JSON.stringify(albumInfo)).data[updatedImageAlbumCount], 
  //                         isClicked: true});
  //         }
  //     )
  //   } else {
  //     setMediaInfo({dataInfo: JSON.parse(JSON.stringify(albumInfo)).data[updatedImageAlbumCount], 
  //       isClicked: true});
  //   }
  
  // }

  // function loadPrevMediaInAlbum(mediaInfo, setMediaInfo, albumInfo, imageAlbumCount, setImageAlbumCount) {
  //   let updatedImageAlbumCount = imageAlbumCount - 1;
  //   setImageAlbumCount(updatedImageAlbumCount);


  //   // make a promise and pull imgur album based on album hash 
  //   fetch('/all_album_image_links/' + albumInfo.album).then(
  //       // Promise
  //       res => res.json()
  //     ).then(
  //       albumInfo => {
  //         setMediaInfo({dataInfo: JSON.parse(JSON.stringify(albumInfo)).data[updatedImageAlbumCount], 
  //                       isClicked: true});
  //       }
  //   )
  
  // }

  // function closeViewMediaAndReset(setMediaInfo, setImageAlbumCount) {
  //   setMediaInfo({dataInfo: "", isClicked: false});
  //   setImageAlbumCount(0);
  // }

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
