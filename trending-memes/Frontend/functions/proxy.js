const fetch = require('http-proxy-middleware')


const options = {
    target: 'https://trending-memes-production.up.railway.app',
    changeOrigin: true,
    pathRewrite: {
      '^/search': '/search'
    }
  };
  
  const proxy = createProxyMiddleware(options);
  
  exports.handler = async (event, context) => {
    return new Promise((resolve, reject) => {
      proxy(event, context, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  };
