require('newrelic');
// Controllers

const facebookController = require('../controllers/facebook');
// Middleware
const middleware = require('../middleware.js');
let checkUser = middleware.checkUser;
let checkDiscoveryToken = middleware.checkDiscoveryToken;
// Express router
const router = require('express').Router();
// Swagger
swaggerUi = require('swagger-ui-express'),
    swaggerDocument = require('../swagger.json');
// Swagger Route
router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(swaggerDocument));

/* Routes */

// User FB connect
router.get('/facebook/auth', facebookController.facebookCodeURI);
router.get('/facebook/page_list', facebookController.getPageList);
router.post('/facebook/callback', facebookController.facebookConnect);
router.post('/facebook/callback/mobile', facebookController.facebookConnectMobile);
router.post('/facebook/page_data', facebookController.getPageData);
/*Export*/
module.exports = router;