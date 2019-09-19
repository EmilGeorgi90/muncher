var express = require('express');
var router = express.Router();
const controller = require('../controller')
const dbController = new controller.dbController();
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/manageUrl', async function(req, res, next) {
  res.render('manageUrl', {url: await dbController.getDataManager(req, res, next)})
})
router.get('/seeData', async function(req, res, next) {
  res.render('seeData', {url: await dbController.getDataManager(req, res, next)})
})
router.get('/trainer', async function(req, res, next){
  console.log(await dbController.GetContentFromCrawler(req, res, next))
  res.render('trainer', {url: req.query.url, html: await dbController.GetContentFromCrawler(req, res, next)})
})
router.get('/login', function(req, res, next) {
  res.render('login');
})
router.post('/login', async function(req, res, next) {
  if(dbController.checkLogin(req.body)) {
    res.send(true)
  } else {
    res.send(false);
  }
})
router.get('/data', dbController.getData)
router.put('/updateUrl', dbController.updateUrl)
router.post('/data', dbController.PostData)
router.post('/addUrl', dbController.addUrl)
module.exports = router;
