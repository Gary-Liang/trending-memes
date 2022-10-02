import React, { useEffect, useState } from 'react'
import ViewMedia from './ViewMedia';

export default function SearchResults({query}) {

  // create state variable to get backend API 
 const [data, setData] = useState([{}]);
 // show media state variable to display media previews
 const [showMedia, setShowMedia] = useState([]);


 // Purpose of useEffect is to define some anonymous lambda function inside the parameters to use it after 
 useEffect(() => {
    fetch('/search').then(
      // Promise
      res => res.json()
    ).then(
      data => {
        setData(JSON.parse(JSON.stringify(data)).data.items)
        console.log(JSON.parse(JSON.stringify(data)).data.items)
      }
    ) 
  }, [])  // render once

  return (
    <>
      { <div className='mediaBox' style={divStyle}>
        {
          data.filter(data => {
              if (query === "") {
                  // if query is empty
                  return data;
              } else if (data.title.toLowerCase().includes(query.toLowerCase())) { 
                  // if condition is true, then return data that matches query to be mapped
                  return data;
              }
          }).map((data, index, dataAsArray) => (
            <>
              <div key={data.id} className={data.id} style={searchResults} onClick={() => promptViewMedia(setShowMedia, index, dataAsArray)}>
                  <p>{data.title}</p>
                  {renderMediaPreview(data)}
              </div>
              <div>
                {showMedia[index] ? <ViewMedia data={data}></ViewMedia> : null}
              </div>
            </>
          ))
        }
      </div>}
    </>
  )
}


const divStyle = {
    color: 'black',
    padding: '1%',
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

}

const searchResults = {
    border: 'black ridge 1px',
    borderRadius: '10px',
    alignSelf: 'flex-start',
    position: 'relative',
    // margin: 'auto',
    // width: '30%',
    padding: '25px',
    
}

const mediaMaxSize = {
  maxheight: '250px',
  maxWidth: '250px',
  height: 'auto',
  width: 'auto',
}

// functions should be declared outside of the functional components or else we re-render the function every time 
// it is called for imgur
function renderMediaPreview(data) {
  console.log('Rendering.');
  if (data.link) {
    if (data.link.includes(".mp4")) {
      return (
        <video style={mediaMaxSize} preload="auto" controls autoPlay muted loop>
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
          <p>{previewHeaderText}</p>
          <video style={mediaMaxSize} preload="auto" controls autoPlay muted loop>
            <source src={mediaURL} type="video/mp4"/>
          </video>
          </>
        )
      } else {
        mediaURL += data.images[0].type.split("/")[1];
        return (
          <>
          <p>{previewHeaderText}</p>
          <img src={mediaURL} style={mediaMaxSize} alt=""/>
          </>
        )
      }
    } else {
      // if link is just a normal image or a gifv, render it normally. 
      return (
        <img src={data.link} style={mediaMaxSize} alt=""/>
      )
    }
  }
}


// push to add to array
function promptViewMedia(setShowMedia, index, dataAsArray) {
  console.log(index);

  let copiedShowMediaList = Array.apply(false, Array(dataAsArray.length));
  copiedShowMediaList[index] = true;
  setShowMedia(copiedShowMediaList);
}