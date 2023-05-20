
const fetch = require('isomorphic-fetch');

// const API_ENDPOINT = 'http://127.0.0.1:5000/check_session';
const API_ENDPOINT = 'https://tmback.xyz/saved_favorites';

exports.handler = async (event, context) => {
  try {
    const token = event.headers["authorization"];
    if (event.httpMethod == 'OPTIONS') {
      console.log('OPTIONS Request');
      return {
        statusCode: 204,
        headers: {
          'Access-Control-Allow-Origin': 'https://tmback.xyz',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'OPTIONS, POST'
        },
        body: ''
      }
    }

    const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': 'https://tmback.xyz',
            'Authorization': `Bearer ${token}`
            },
    });
    const data = await response.json();
    console.log("saved favs: " + JSON.stringify(data));
    return {
      statusCode: response.status,
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
