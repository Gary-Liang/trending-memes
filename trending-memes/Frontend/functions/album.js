
const API_ENDPOINT = 'https://trending-memes-production.up.railway.app/all_album_image_links/';
//const API_ENDPOINT = `${RAILWAY_API_ENDPOINT}/search`;

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
