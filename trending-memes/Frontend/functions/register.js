
const fetch = require('isomorphic-fetch');

// const API_ENDPOINT = 'http://127.0.0.1:8000/register_new_user';
const API_ENDPOINT = 'https://tmback.xyz/register_new_user';

exports.handler = async (event, context) => {
  try {
    const formData = JSON.parse(event.body);
    const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            'Connection': 'keep-alive'
        },
        body: JSON.stringify(formData),
    });
    const data = await response.json();
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
