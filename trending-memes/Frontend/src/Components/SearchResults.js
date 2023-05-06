import React, { useEffect, useState, useMemo } from 'react'
import StarButton from '../Images/starButton.png'

export default function SearchResults({query, mediaInfo, setMediaInfo, albumInfo, setAlbumInfo, setLoadingScreen}) {

  // create state variable to get backend API 
 const [data, setData] = useState([{}]);
 const [favorites, setFavorites] = useState({});

 const memorizedData = useMemo(() => data, [data]);
 // show media state variable to display media previews
 //const [showMedia, setShowMedia] = useState([]);


 // Purpose of useEffect is to define some anonymous lambda function inside the parameters to use it after 
 useEffect(() => {
  setLoadingScreen(true);
    // fetch(`/search?q=${query}`).then(
    fetch(`/api/search?q=${query}`).then(  
      // Promise
      res => res.json()
    ).then(
      data => {
        setData(JSON.parse(JSON.stringify(data)).data);
        //console.log(JSON.parse(JSON.stringify(data)).data.items);
        console.log(JSON.parse(JSON.stringify(data)));
        setLoadingScreen(false);
      }
    ) 
  }, [query, setLoadingScreen])  // by putting query as a dependency here, we render more than once, every time the query changes.

  useEffect(() => {
      fetch('/api/is_a_favorite').then(  
        // Promise
        res => res.json()
      ).then(
        data => {
          setFavorites(JSON.parse(JSON.stringify(data)).data);
          //console.log(JSON.parse(JSON.stringify(data)).data.items);
          console.log(JSON.parse(JSON.stringify(data)));
        }
      ) 
    }); // by putting query as a dependency here, we render more than once, every time the query changes.


  useEffect(() => {
    fetch('/api/add_to_favorites').then(
      // Promise
      res => res.json()
    ).then(
      data => {
        setData(JSON.parse(JSON.stringify(data)).data);
        //console.log(JSON.parse(JSON.stringify(data)).data.items);
        console.log(JSON.parse(JSON.stringify(data)));
        setLoadingScreen(false);
      }
    )
  }, [query, setLoadingScreen])  // by putting query as a dependency here, we render more than once, every time the query changes.

  const divStyle = {
    color: 'black',
    padding: '0.25%',
    border: '3px solid grey',
    textAlign: 'center',
    // display: 'flex',
    display: 'grid',
    // flexDirection: 'row',
    // flexWrap: 'wrap',
    // Condenses flex direction and flex wrap
    // flexFlow: 'row wrap',
    // alignItems: 'space-around',
    // justifyContent: 'space-around',
    // alignContent: 'space-between',
    gridTemplateColumns: 'repeat(4, 0.25fr)',
    gridAutoFlow: 'row',
    //minWidth: '100px',
    gap: '6.5px',
    //gridRowStart: 'span 2',
    position: 'relative'

}

const searchResults = {
    border: 'black ridge 1px',
    borderRadius: '10px',
    alignSelf: 'flex-start',
    // margin: 'auto',
    // width: '30%',
    padding: '25px',
}

const mediaMaxSize = {
  maxHeight: '450px',
  maxWidth: '250px',
  height: 'auto',
  width: 'auto',
}

const mediaBoxStyle = {
  position: 'relative'
}

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
  backgroundColor: favorites ? 'yellow' : 'transparent',
  border: 'none',
  zIndex: '1'
}


// functions should be declared outside of the functional components or else we re-render the function every time 
// it is called for imgur
function renderMediaPreview(data) {
  console.log('Rendering.');
  if (data && data.link) {
    if (data.link.includes(".mp4")) {
      let mediaURL = data.link.replace("http://", "https://");
      return (
        <video key={data.id} style={mediaMaxSize} preload="auto" controls autoPlay muted loop>
          <source src={mediaURL} type="video/mp4"/>
        </video>
      )
    } else if (data.link.includes("/a/")) {
      let mediaURL = getMediaLink(data).replace("http://", "https://");
      //let mediaURL = "http://i.imgur.com/" + data.cover + ".";
      let previewHeaderText = "";
      if (data.images_count > 1)
        previewHeaderText = "(Album Count: " + data.images_count +")";
      if (data.images[0].type.includes("mp4")) {
        //mediaURL += "mp4";
        return (
          <div key={data.id}>
            <p>{previewHeaderText}</p>
            <video key={mediaURL} style={mediaMaxSize} preload="auto" controls autoPlay muted loop>
              <source src={mediaURL} type="video/mp4"/>
            </video>
            </div>
        )
      } else {
        //mediaURL += data.images[0].type.split("/")[1];
        return (
          <div key={data.id}>
            <p>{previewHeaderText}</p>
            <img key={mediaURL} src={mediaURL} style={mediaMaxSize} alt=""/>
          </div>
        )
      }
    } else {
      // if link is just a normal image or a gifv, render it normally. 
      let mediaURL = data.link.replace("http://", "https://");
      return (
        <img key={mediaURL} src={mediaURL} style={mediaMaxSize} alt=""/>
      )
    }
  }
}

// getter function - generate a media link based on data passed in and what type of media it is 
// based off of imgur's url
function getMediaLink(data) {
  if (data.link) {
    if (data.link.includes("/a/")) {
      return data.images[0].link;
    } else {
      return data.link;
    }
  }
}

function getHeightLink(data) {
  if (data.link) {
    if (data.link.includes("/a/")) {
      return data.images[0].height;
    } else {
      return data.height;
    }
  }
}

function getWidthLink(data) {
  if (data.link) {
    if (data.link.includes("/a/")) {
      return data.images[0].width;
    } else {
      return data.width;
    }
  }
}

function getAlbumLink(data) {
  if (data.images_count > 1) {
    return data.images_count;
  } else {
    return 1;
  }
}

function getAlbumData(data) {
  if (data.images_count > 1) {
    return data.id;
  } else {
    return null;
  }
}

// data.id is album hash link
function writeMetadataToMediaInfo(data) {
    setMediaInfo({dataInfo: data, isClicked: true, mediaLink: getMediaLink(data), height: getHeightLink(data), width: getWidthLink(data)});
    setAlbumInfo({album: getAlbumData(data), albumLength: getAlbumLink(data)});

}

// Update state when a favorite is clicked
const toggleFavorite = (id) => {
    // setFavorites(id);

    const mediaMetaData = {'id': data.id, 'mediaInfo': mediaInfo, 'albumInfo': albumInfo, token: sessionStorage.getItem('token')};
    const newFavorites = { ...favorites};
    newFavorites[id] = !newFavorites[id];
    setFavorites(newFavorites);
    fetch("/api/update_favorites", {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
          'Connection': 'keep-alive',
      },
      body: JSON.stringify(mediaMetaData),
  })
      .then((response) => response.json())
      .then((data) => {
          // Handle server response
          // console.log(data);
          // console.log(data.success);
          // console.log('status code: ' + data.statusCode);
          // setStatusMessage(data.message);
          // setStatusSuccess(data.success);
          // if (data.token !== undefined && data.token !== null) {
          //     sessionStorage.setItem('token', data.token);
          // }
          // if (statusMessage) {
          //     console.log('status message: ' + statusMessage);
          // }


      })
      .catch((error) => {
          console.error("Error:", error);
      });
};


  return (
    <>
      { <div className='mediaBox' style={divStyle}>
        {
          (data ? data.filter(data => {
              if (query === "") {
                  // if query is empty
                  return data;
              } else if (data.title.toLowerCase().includes(query.toLowerCase())) { 
                  // if condition is true, then return data that matches query to be mapped
                  return data;
              } else {
                return {};
              }
          }).map((data, index) => (
              // data can be an empty list {}
              Object.keys(data).length !== 0 ? (
                <div className={"mediaBox" + index} style={mediaBoxStyle}>
                  <div key={data.id} className={"mediaInfo" + index} style={searchResults} onClick={() => writeMetadataToMediaInfo(data)}>
                    <p>{data.title}</p>
                    {renderMediaPreview(data)}
                  </div>
                  <button className={favorites[data.id] ? "fave_highlighted_" + index : "favorite_" + index} style={favoriteIcon} onClick={() => toggleFavorite(data.id)}></button>
                </div>): null

          )) : null)
        }
      </div>}
    </>
  )
}