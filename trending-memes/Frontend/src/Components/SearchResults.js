import React, { useEffect, useState, useCallback, useMemo} from 'react'
import StarButton from '../Images/starButton.png'
import StarButtonHightlight from '../Images/starButtonHighlight.png'

export default function SearchResults({query, setMediaInfo, setAlbumInfo, setShowLoginModal, setLoadingScreen}) {

  // create state variable to get backend API 
 const [data, setData] = useState([{}]);
 const [isFavorite, setIsFavorite] = useState({});
 const token = sessionStorage.getItem('token') || '';

 const memorizedData = useMemo(() => data, [data]);


  useEffect(() => {
    const abortController = new AbortController();
    const fetchData = async () => {
      try {
        setLoadingScreen(true);
        console.log('called from search results.')
        const response = await fetch(`/api/search?q=${query}`, {
          signal: abortController.signal,
        });


        const responseData = await response.json();
        const parseResponseData = JSON.parse(JSON.stringify(responseData)); 
        if (parseResponseData && parseResponseData.data.length === 0) {
          console.log("set data to empty");
          setData([{}]);
        } else {
          setData(parseResponseData.data);
        }
        setLoadingScreen(false);
      } catch (error) {
        if (!abortController.signal.aborted) {
          console.error(error);
          setLoadingScreen(false);
        }
      }
    };

    fetchData();

    return () => {
      abortController.abort();
    };
  }, [query, setLoadingScreen]);  // by putting query as a dependency here, we render more than once, every time the query changes.

  // useEffect(() => {
  //   // Update the sessionStorage whenever the token changes
  //   setToken({'token': sessionStorage.getItem('token')});
  // });

  const fetchFavorites = useCallback(async () => {
    const response = await fetch("/api/saved_favorites", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Connection": "keep-alive",
        "Authorization": token
      },
      body: '',
    });

    if (response.status !== 200) {
      return [];
    }

    const favoriteList = await response.json();
    return favoriteList;
  }, [token]);


  useEffect(() => {
    // const abortController = new AbortController();
    const fetchData = async () => {
      const favoriteList = await fetchFavorites();
      const initialFavorites = {};
      const favoriteObj = {};
      if (Object.keys(favoriteList).length !== 0) {
        favoriteList.forEach(item => {
          const key = Object.keys(item);
          favoriteObj[key] = item;
        });
      } 
      data.forEach(media => {
        if (favoriteObj.hasOwnProperty(media.id)) {
          //console.log(media.id);
          initialFavorites[media.id] = true;
        } else {
          initialFavorites[media.id] = false;
        }
      });
      setIsFavorite(initialFavorites);
    };
    fetchData();

    // return () => {
    //   abortController.abort();
    // };
  }, [data, fetchFavorites]);

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

const favoriteIcon = (id) => ({
  backgroundImage: isFavorite[id] ? "url(" + StarButtonHightlight  + ")" : "url(" + StarButton  + ")",
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
  zIndex: '1',
  cursor: 'pointer'
})


// functions should be declared outside of the functional components or else we re-render the function every time 
// it is called for imgur
function renderMediaPreview(data) {
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
      let previewHeaderText = "";
      if (data.images_count > 1)
        previewHeaderText = "(Album Count: " + data.images_count +")";
      if (data.images[0].type.includes("mp4")) {
        return (
          <div key={data.id}>
            <p>{previewHeaderText}</p>
            <video key={mediaURL} style={mediaMaxSize} preload="auto" controls autoPlay muted loop>
              <source src={mediaURL} type="video/mp4"/>
            </video>
            </div>
        )
      } else {
        return (
          <div key={data.id}>
            <p>{previewHeaderText}</p>
            <img key={mediaURL} src={mediaURL} style={mediaMaxSize} alt=""/>
          </div>
        )
      }
    } else {
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

const noResults = {
  position: 'relative',
}

// data.id is album hash link
function writeMetadataToMediaInfo(data) {
    setMediaInfo({dataInfo: data, isClicked: true, mediaLink: getMediaLink(data), height: getHeightLink(data), width: getWidthLink(data)});
    setAlbumInfo({album: getAlbumData(data), albumLength: getAlbumLink(data)});

}

// Update state when a favorite is clicked
const toggleFavorite = (data, id) => {
    fetch("/api/update_favorites", {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
          "Connection": "keep-alive",
          "Authorization": sessionStorage.getItem('token')
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (response.status === 401) {
          sessionStorage.clear();
          setShowLoginModal(true);
          setIsFavorite({});
          throw new Error('401 Unauthorized'); // Stops the promise 
        }
        return response.json();
      })
      .then(() => {
        const newFavorite = {...isFavorite};
        newFavorite[id] = !newFavorite[id];
        setIsFavorite(newFavorite);
      })
      .catch((error) => {
          console.error("Error:", error);
      });
};


  return (
    <>
      { <div className='mediaPreview' style={divStyle}>
        {
          (data ? data.filter(data => {
              if (query === "") {
                  // if query is empty
                  return data;
              } else if (data.title && data.title.toLowerCase().includes(query.toLowerCase())) { 
                  // if condition is true, then return data that matches query to be mapped
                  return data;
              } else {
                return {};
              }
          }).map((resultData, index) => (
              // data can be an empty list {}
              Object.keys(resultData).length !== 0 ? (
                <div key={resultData.id + "mediaBox" + index} className={"mediaBox" + index} style={mediaBoxStyle}>
                  <div key={resultData.id + "info" + index} className={"mediaInfo" + index} style={searchResults} onClick={() => writeMetadataToMediaInfo(resultData)}>
                    <p>{resultData.title}</p>
                    {renderMediaPreview(resultData)}
                  </div>
                  <button key={resultData.id + "btn" + index} className={isFavorite[resultData.id] ? "fave_highlighted_" + index : "favorite_" + index} style={favoriteIcon(resultData.id)} onClick={() => toggleFavorite(resultData, resultData.id)}></button>
                </div>): (query !== "") ? <div className="noResults" style={noResults}>No results found. Please try again.</div> : null

          )) : null)
        }
      </div>}
    </>
  )
}