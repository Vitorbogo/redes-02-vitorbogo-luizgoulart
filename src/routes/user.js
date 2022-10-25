const router = require('express').Router();

module.exports = function () {
router.get('/user/:id', (request, response) => {
 response.send('Hello World From User Get ' + request.params.id);
});
router.post('/user/:id', function(request, response) {
 response.send('Hello World From User Post ' + request.params.id);
});
return router;
}