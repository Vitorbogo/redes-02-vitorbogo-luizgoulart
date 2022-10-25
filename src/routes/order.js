const router = require('express').Router();

module.exports = function () {
router.get('/order/:id', (request, response) => {
 response.send('Hello World From Order Get ' + request.params.id);
});
router.post('/order/:id', function(request, response) {
 response.send('Hello World From Order Post ' + request.params.id);
});
return router;
}