import React, {useEffect, useCallback, useLayoutEffect, useState} from 'react'
import ClipboardImage from '../Images/copyToClipboard.png'
import StarButton from '../Images/starButton.png'

// Global fields 
let currentMediaLink = "";
let currentMediaWidth = 0;
let currentMediaHeight;

let breakpoint = 400;

export default function ViewMedia({mediaInfo, setMediaInfo, albumInfo}) {

  const [imageAlbumCount, setImageAlbumCount] = useState(0);

  const [imageAlbumData, setImageAlbumData] = useState(null);

  const [showCopyMessage, setShowCopyMessage] = useState(false);

  const [mediaLoading, setMediaLoading] = useState(false);

  // Use useLayoutEffect for modifying the DOM prior to page rendering
  useLayoutEffect(() => {
      if (mediaInfo.isClicked) {
        document.body.style.overflow = "hidden";
        //document.body.style.minHeight = "100%"
        document.body.style.height = "100%";
      }
      if (!mediaInfo.isClicked) { 
        document.body.style.overflow = "auto";
        document.body.style.height = "auto";
        //document.body.style.minHeight = "auto";
      }
  }, [mediaInfo]);

  const loadNextMediaInAlbum = useCallback(async () => {
    let updateImageIncrement = imageAlbumCount + 1;
    setImageAlbumCount(imageAlbumCount + 1);
    setMediaLoading(true);
    // make a promise and pull imgur album based on album hash 
    if (!imageAlbumData) { 
      await fetch(`/api/album/all_album_image_links/?q=${albumInfo.album}`).then(
          // Promise
          res => res.json()
        ).then(
          albumInfoData => {
            setImageAlbumData(JSON.parse(JSON.stringify(albumInfoData)));
            setMediaInfo({dataInfo: JSON.parse(JSON.stringify(albumInfoData)).data[updateImageIncrement], 
                          isClicked: true,
                          mediaLink: JSON.parse(JSON.stringify(albumInfoData)).data[updateImageIncrement].link, 
                          height: JSON.parse(JSON.stringify(albumInfoData)).data[updateImageIncrement].height,
                          width: JSON.parse(JSON.stringify(albumInfoData)).data[updateImageIncrement].width});
          }
      )
    } else {
      await fetch(imageAlbumData.data[updateImageIncrement].link).then(() => {
        setMediaInfo({dataInfo: imageAlbumData.data[updateImageIncrement], 
                      isClicked: true,
                      mediaLink: imageAlbumData.data[updateImageIncrement].link, 
                      height: imageAlbumData.data[updateImageIncrement].height,
                      width: imageAlbumData.data[updateImageIncrement].width})
      })  
    }
    setMediaLoading(false);
  
  }, [albumInfo.album, imageAlbumCount, imageAlbumData, setMediaInfo, setMediaLoading]);

  // const saveAsFavorite = {
  //   fetch('/api/save_as_favorite').then(
  //       // Promise
  //       res => res.json()
  //   ).then(

  //   )
  // }

  const loadPrevMediaInAlbum = useCallback(() => {
    let updateImageIncrement = imageAlbumCount - 1;
    setImageAlbumCount(imageAlbumCount - 1);
    setMediaLoading(true);

    // make a promise and pull imgur album based on album hash 
    if (!imageAlbumData) { 
      fetch(`/api/album/all_album_image_links/?q=${albumInfo.album}`).then(
          // Promise
          res => res.json()
        ).then(
          albumInfoData => {
            setImageAlbumData(JSON.parse(JSON.stringify(albumInfoData)));
            setMediaInfo({dataInfo: JSON.parse(JSON.stringify(albumInfoData)).data[updateImageIncrement], 
                          isClicked: true,
                          mediaLink: JSON.parse(JSON.stringify(albumInfoData)).data[updateImageIncrement].link, 
                          height: imageAlbumData.data[updateImageIncrement].height,
                          width: imageAlbumData.data[updateImageIncrement].width});
          }
      )
    } else {
      setMediaInfo({dataInfo: imageAlbumData.data[updateImageIncrement], 
                   isClicked: true,
                   mediaLink: imageAlbumData.data[updateImageIncrement].link, 
                   height: imageAlbumData.data[updateImageIncrement].height,
                   width: imageAlbumData.data[updateImageIncrement].width});
    }
    setMediaLoading(false);
  }, [albumInfo.album, imageAlbumCount, imageAlbumData, setMediaInfo, setMediaLoading]);

  const closeViewMediaAndReset = useCallback(() => {
    setMediaInfo({dataInfo: null, isClicked: false, mediaLink: null});
    setImageAlbumCount(0);
    setImageAlbumData(null);
  }, [setMediaInfo, setImageAlbumCount, setImageAlbumData]);


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
  }, [albumInfo, imageAlbumCount, closeViewMediaAndReset, loadNextMediaInAlbum, loadPrevMediaInAlbum]);

  function copyMediaToClipboard() {
    if (currentMediaLink) {
      navigator.clipboard.writeText(currentMediaLink);
      setShowCopyMessage(true);

      setTimeout(() => {
        setShowCopyMessage(false);
      }, 1500) // Set to false after 2 seconds 
    } else {
      console.error("currentMediaLink is not defined or null")
    }
  }

  function renderFullMedia(data) {
    if (data.link) {
      if (data.link.includes(".mp4")) {
        currentMediaLink = data.link
        currentMediaWidth = mediaInfo.width;
        currentMediaHeight = mediaInfo.height;
        let mediaURL = data.link.replace("http://", "https://");
        return (
          <video key={mediaURL} style={mediaResizing()} preload="auto" controls autoPlay loop>
            {console.log(mediaURL)}
            <source src={mediaURL} type="video/mp4"/>
          </video>
        )
      } else if (data.link.includes("/a/")) {
        let mediaURL = "https://i.imgur.com/" + data.cover + ".";
        if (data.images[0].type.includes("mp4")) {
          mediaURL += "mp4";
          currentMediaLink = mediaURL
          currentMediaWidth = mediaInfo.width;
          currentMediaHeight = mediaInfo.height;
          return (
            <video key={mediaURL} style={mediaResizing()} preload="auto" controls autoPlay loop>
              {console.log(data.link)}
              <source src={mediaURL} type="video/mp4"/>
            </video>
          )
        } else {
          mediaURL += data.images[0].type.split("/")[1].replace("http://", "https://");
          currentMediaLink = mediaURL
          console.log(data.link)
          console.log("data info" + data);
          console.log("width at first function: " + mediaInfo.width);
          currentMediaWidth = mediaInfo.width;
          currentMediaHeight = mediaInfo.height;
          return (
            <>
              <img key={mediaURL} style={mediaResizing()} src={mediaURL}  alt=""/>
            </>
          )
        }
      } else {
        // if link is just a normal image or a gifv, render it normally. 
        currentMediaLink = data.link.replace("http://", "https://");
        console.log("width at first function: " + mediaInfo.width);
        currentMediaWidth = mediaInfo.width;
        currentMediaHeight = mediaInfo.height;
        return (
          <>
            {console.log(data.link)}
            <img key={data.link} style={mediaResizing()} src={data.link} alt=""/>
          </>
        )
      }
    }
  }

  function renderLoadIcon() {
    return (
      <>
        <div className='loadIcon' style={loadIconStyle}>
          Loading ... 
        </div>
      </>
    )
  }

  const loadIconStyle = {
    zIndex: "5",
    position: "fixed",
    top: "50%",
    left: "50%",
    color: "white",

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
    color: "white",
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
  width: "30px",
  height: "30px",
  //background: "none",
  //fontSize: "24px",
  zIndex: "5",
  top: "60px",
  left: "30px",
  //border: "24px",
  //fontWeight: "bold",
  //WebkitTextStroke: "0.10px white",
  backgroundImage: "url(" + ClipboardImage  + ")",
  backgroundPosition: "center",
  backgroundSize: "cover",
  backgroundRepeat: "no-repeat",
  opacity: "0.99",
  backgroundColor: "transparent",
  outline: "none",
  border: "none",
  filter: 'brightness(0) invert(1)'
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

const fadeOut = `
  @keyframes fadeOut {
    0% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      display: none;
    }
  }
`;

const copyMessageStyle = {
  zIndex: "5",
  position: "fixed",
  top: "15%",
  left: "10%",
  transform: "translate(-50%, -50%)",
  backgroundColor: "white",
  border: "0.5px solid black",
  padding: "10px",
  borderRadius: "5px",
  animation: `${fadeOut} 2s forwards`
};

const favoriteIcon = {
  backgroundImage: "url(" + StarButton  + ")",
  backgroundPosition: "center",
  backgroundSize: "cover",
  backgroundRepeat: "no-repeat",
  position: 'absolute',
  height: '25px',
  width: '25px',
  top: '2%',
  right: '1%',
  backgroundColor: 'transparent',
  border: 'none',
  filter: 'brightness(0) invert(1)'
}

function writeFavoriteAsMetadata() {
  // console.log(meediainfo);
}

function mediaResizing() {
  let windowWidth = window.innerWidth;
  console.log('window width: ' + windowWidth)
  let adjustedWidth = 0;
  let styles = {};
  if (currentMediaWidth > breakpoint) {
    if (currentMediaWidth > windowWidth) {
      console.log('current media width > windowwidth condition triggered. ');
      currentMediaWidth = windowWidth;
    }
    adjustedWidth = (currentMediaWidth * .85).toString();
    console.log('current width value: ' + adjustedWidth);
    styles= {  
              height: "100%",
              width:  adjustedWidth + "px",
              top: "0",
              left: "0",
              right: "0",
              bottom: "0",
              margin: "0 auto",
              position: "absolute"
    };
  } else {
    styles = {  
                height: "100%",
                width: "auto",
                top: "0",
                left: "0",
                right: "0",
                bottom: "0",
                margin: "0 auto",
                position: "absolute"
              };

  }
  return styles;
}

    return (
        <>
            {(mediaInfo.isClicked) ? 
              <div className="popup" style={overlayDiv}>
                <div className="popupMedia" style={mediaPopupDisplay}>
                    {(mediaLoading) ? renderLoadIcon() : renderFullMedia(mediaInfo.dataInfo)}
                    {/* {(mediaInfo.dataInfo) ? renderFullMedia(mediaInfo.dataInfo): null} */}
                </div>
                <button className="closeButton" style={closeButton} onClick={closeViewMediaAndReset}>x</button>
                <div className="copyToClipBoardContainer"> 
                  <button className="copyToClipBoardButton" style={copyToClipboardButton} onClick={copyMediaToClipboard}></button>
                  <button className="favorite" style={favoriteIcon} onClick={() => writeFavoriteAsMetadata}></button>
                  {showCopyMessage && (<div className="copyMessage" style={copyMessageStyle}>Copied to clipboard!</div>)}
                </div>
                { (albumInfo && albumInfo.albumLength > 1) ? 
                  <div>
                    <div className="imageNumInAlbum" style={imageNumber}>{imageAlbumCount + 1 + "/" + albumInfo.albumLength}</div>
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
