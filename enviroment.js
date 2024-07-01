module.exports = {
  development: {
    node_port: process.env.PORT,
    database : process.env.DATABASE_NAME,
    username : process.env.username,
    password : process.env.PASSWORD,
    db_host : process.env.DB_HOST,
    url: process.env.SERVICE_HOST,
    secret   : process.env.SECRET_KEY,
    instagram_client_secret : process.env.INSTAGRAM_CLIENT_SECRET_KEY,
    instagram_client_id: process.env.INSTAGRAM_CLIENT_ID,
    instagram_redirect_uri :process.env.INSTAGRAM_REDIRECT_URI
  },
  stagging: {
    node_port: process.env.DEV_PORT,
    database : process.env.DATABASE_NAME,
    username : process.env.USERNAME,
    password : process.env.PASSWORD,
    db_host : process.env.DB_HOST,
    url: process.env.DEV_SERVICE_HOST,
    secret   : process.env.SECRET_KEY,
    instagram_client_secret : process.env.INSTAGRAM_CLIENT_SECRET_KEY,
    instagram_client_id: process.env.INSTAGRAM_CLIENT_ID,
    instagram_redirect_uri :process.env.INSTAGRAM_REDIRECT_URI
  }
};
