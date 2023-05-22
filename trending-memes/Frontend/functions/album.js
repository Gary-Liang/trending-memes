
const fetch = require('isomorphic-fetch');

const API_ENDPOINT = 'https://tmback.xyz/all_album_image_links/';
// const API_ENDPOINT = "http://127.0.0.1:5000/all_album_image_links/"

exports.handler = async (event, context) => {
  try {
    const query = event.queryStringParameters.q;
    const response = await fetch(API_ENDPOINT + `${query}`);
    const data = await response.json();
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': 'https://tmback.xyz',
        'Content-Type': 'application/json',
        'Connection': 'keep-alive'
      },
      body: JSON.stringify(data),
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': 'https://tmback.xyz',
        'Content-Type': 'application/json',
        'Connection': 'keep-alive'
      },
      body: JSON.stringify({
        error: 'Internal Server Error',
      }),
    };
  }
};
