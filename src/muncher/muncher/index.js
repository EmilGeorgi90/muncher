const puppeteer = require("puppeteer");
const helper = require('./muncherFunction');
const os = require("os");
const path = require("path");
const fs = require("fs");
const log = require("../util/logger");
class Muncher {
  constructor() {
    this.browser = null;
    this.tempFolderFilePath = path.join(os.tmpdir(), "fileDumpMuncher");
    this.filePath = path.join(os.tmpdir(), "muncher");
    this.funcParse = null;
    this.logger = new log.logger();
  }

  parse(node) {
    var elm = {};
    if (
      node.tagName === "STYLE" ||
      node.tagName === "SCRIPT" ||
      node.tagName === "IFRAME" ||
      node.tagName === "NOSCRIPT"
    ) {
      return;
    }
    // is it a text node?
    if (node.nodeType === 3) {
      elm.text = node.textContent;
      if (elm.text) {
        elm.text = elm.text.trim();
      }
    }

    // any attributes ?
       if (node.attributes && node.attributes.length>0) {
     elm.attr = {}
     for (var j=0;j<node.attributes.length;j++) {
       var attr = node.attributes[j]
       elm.attr[attr.name] = attr.value
     }
   }

    if (node.childNodes.length === 0) {
      // we ignore empty text nodes
      if (!elm.text) {
        return null;
      }
      return elm;
    }

    // any childnodes ?
    elm.children = [];
    for (var i = 0; i < node.childNodes.length; i++) {
      var n = parse(node.childNodes[i]);
      if (n) {
        elm.children.push(n);
      }
    }

    // only one childNode, try to combine the single node
    if (elm.children.length === 1) {
      var attr = elm.attr;
      var elm = elm.children[0];
      if (attr) {
        if (elm.attr) {
          Object.getOwnPropertyNames(attr).forEach(a => {
            elm.attr[a] = attr[a];
          });
        } else {
          elm.attr = attr;
        }
      }
      return elm;
    }

    // no childNodes, then dont return anything
    if (elm.children.length === 0) {
      return null;
    }

    return elm;
  }

  async crawl(urls, selector, next = null, isPdfReponse = false, isHtmlReponse = false) {
    this.browser = await puppeteer.launch({
      args: [
        "--lang=en-GB,en",
        '--profile-directory="Default',
        "--disable-dev-shm-usage",
        "--no-sandbox",
        "--disable-setuid-sandbox"
      ],
    });
    let data = [];
    if ((await this.browser.pages()).length > 1) {
      this.crawl(urls, next, isPdfReponse, isHtmlReponse);
    }
    data = await this.crawlStarter(urls, selector, isPdfReponse, isHtmlReponse).catch(
      async error => {
        await this.browser.close();
        next !== null
          ? next(error)
          : await db.urls.create({
              url: data.url,
              last_crawl_at: null,
              error_at: error
            });
      }
    );
    await this.browser.close();
    return data;
  }

  async crawlStarter(url, selector, isPdfReponse, isHtmlReponse) {
    let data = [];
    const root = { url };
    data = await this.recursiveCrawl(root, selector, isPdfReponse, isHtmlReponse).catch(
      error => {
        throw new Error(error);
      }
    );
    return data;
  }

  async recursiveCrawl(page, selector, isPdfReponse, isHtmlReponse) {
    const newPage = await this.browser.newPage();
	console.log(page.url.split('/')[2])
    if (page.url.split("/")[2] == "frequl.eu") {
      await newPage.setViewport({ width: 1200, height: 720 });
      await newPage.goto("https://www.frequl.eu/login", { waitUntil: "networkidle0" }); // wait until page load
      await newPage.type("#username-967", "emilgeorgi90");
      await newPage.type("#user_password-967", "UCMyTaHf1998");
      // click and wait for navigation
      await Promise.all([
        newPage.click("#um-submit-btn"),
        newPage.waitForNavigation({ waitUntil: "networkidle0" })
      ]);
    }
    const json = {
      headers: {
        date: new Date()
      },
      body: {
        children: []
      }
    };

    let response = await newPage
      .goto(page.url, {
        waitUntil: "networkidle0",
        timeout: 0
      })
      .catch(async error => {
        this.logger.LogToStatus(
          `${JSON.stringify(
            error
          )}, status: error on website ${await page.url}`,
          this.tempFolderFilePath
        );
        throw new Error("not a valid url");
      });

    if (!fs.existsSync(this.filePath)) {
      fs.mkdirSync(this.filePath);
    }

    if (!fs.existsSync(this.tempFolderFilePath)) {
      fs.mkdirSync(this.tempFolderFilePath);
    }

    this.logger.LogToStatus(
      `${JSON.stringify(response.status())}, status: success \n`,
      this.tempFolderFilePath
    );

    fs.writeFileSync(
      `${path.join(
        this.filePath,
        (await newPage.url()).replace(/\//g, "_")
      )}.html`,
      await newPage.content(),
      error => {
        console.log(error);
      }
    );
    if (isHtmlReponse) {
      return `${path.join(
        this.filePath,
        (await newPage.url()).replace(/\//g, "_")
      )}.html`;
    }
    // eslint-disable-next-line no-console
    if (isPdfReponse) {
      newPage.emulateMedia("screen");
      newPage.screenshot({
        path: `${path.join(
          this.filePath,
          (await newPage.url()).split(".")[1]
        )}.png`,
        fullPage: true
      });
      return await newPage.pdf({
        path: `${path.join(
          this.filePath,
          (await newPage.url()).split(".")[1]
        )}.pdf`
      });
    }

    newPage.on(
      "console",
      consoleMessageObject =>
        function(consoleMessageObject) {
          if (consoleMessageObject._type !== "warning") {
            console.debug(consoleMessageObject._text);
          }
        }
    );
    const obj = {
      funcParse: this.parse.toString(),
      selector: selector,
    };
    // const source = await newPage.evaluate(obj => {
    //   const funcStr = obj.funcParse;
    //   const selector = obj.selector;
    //   const func = new Function(
    //     `return function ${funcStr}.apply(null, arguments)`
    //   );
    //   var source = document.createElement("div");
    //   if(selector){
    //     source.innerHTML = document.querySelectorAll(selector)[0].innerHTML
    //   } else {
    //     source.innerHTML = document.getElementsByTagName("body")[0].innerHTML;
    //   }
    //   return func(source);
    // }, obj);
    await helper.digger(this.browser, page, json.body.children, obj.selector);
    helper.crawledPages.clear();
    return json;
  }
}
exports.Muncher = Muncher;
