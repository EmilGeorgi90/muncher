const muncher = require("../muncher");
class ContactController {
  async getCrawl(req, res, next) {
    const munch = new muncher.Muncher();
    if (req.query.pdf && req.query.url !== undefined) {
      const data = await munch.crawl(req.query.url, req.query.selector, req.query.pdf).catch((error) => {
        next(error);
        process.exit(400);
      });
      res.contentType("application/pdf")
      res.send(data);
    } else if (req.query.url !== undefined && req.query.isHtmlResponse !== undefined){
      const data = await munch.crawl(req.query.url, req.query.selector, next, false, req.query.isHtmlResponse).catch((error) => {
        next(error);
        process.exit(400);
      });
      res.sendFile(data);
    }
     else if(req.query.url !== undefined) {
      const data = await munch.crawl(req.query.url, req.query.selector, next).catch((error) => {
        next(error);
        res.send(error)
        process.exit(400);
      })
      if(data === null){
        res.status(400).json({success: false, error: 'too buse'})
      }
      res.send(data);
    } else {
      res.status(400).json({success: false, error: 'dont forgot to parse a valid url in query'});
    }
  }
  async parse(req, res){
    const munch = new muncher.Muncher();
    res.send(munch.parse(req.node));
  }
}
exports.ContactController = ContactController;
