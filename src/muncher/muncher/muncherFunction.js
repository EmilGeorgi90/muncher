const puppeteer = require("puppeteer");
exports.crawledPages = new Map();
const MAXDEPTH = 30;
exports.result = []

module.exports.digger = async (browser, page, data, selector, depth = 0) => {
    if (MAXDEPTH == depth) {
      return data;
    }
    if (this.crawledPages.has(page.url)) {
      console.log(`Reusing route: ${page.url}`);
      const item = this.crawledPages.get(page.url);
      page.title = item.title;
      page.img = item.img;
      page.children = item.children;
      page.children.forEach(c => {
        const item = this.crawledPages.get(c.url);
        c.title = item ? item.title : "";
        c.img = item ? item.img : null;
      });
      return;
    } else {
      const obj = {
        funcParse: parse.toString(),
        selector: selector,
      };
      console.log(`Loading: ${page.url}`);
      console.log(selector)
      const newPage = await browser.newPage();
      await newPage.goto(page.url, { waitUntil: "networkidle0", timeout: 0 });
      await newPage.waitFor(5000);
      let anchors = await newPage.evaluate((selector) => {
          console.log(selector)
        function collectAllSameOriginAnchorsDeep(sameOrigin = true) {
          const allElements = [];
          const findAllElements = function(nodes) {
            for (let i = 0, el; (el = nodes[i]); ++i) {
              allElements.push(el);
              if (el.shadowRoot) {
                findAllElements(el.shadowRoot.querySelectorAll("*"));
              }
            }
          };
          findAllElements(document.querySelector(selector).querySelectorAll('*'));
          const filtered = allElements
            .filter(el => el.localName === "a" && el.href)
            .filter(el => el.href !== location.href)
            .filter(el => {
              if (sameOrigin) {
                return new URL(location).origin === new URL(el.href).origin;
              }
              return true;
            })
            .map(a => a.href);
          return Array.from(new Set(filtered));
        }
        let result = collectAllSameOriginAnchorsDeep();
        console.log(result)
        return result;
    }, selector);
    await newPage.waitFor(5000);

      anchors = anchors.filter(a => a !== page.url);
      page.title = await newPage.evaluate("document.title");
      page.children = anchors.map(url => ({ url }));
      this.crawledPages.set(page.url, page);
      const source = await newPage.evaluate(obj => {
        const funcStr = obj.funcParse;
        const selector = obj.selector;
        const func = new Function(
          `return ${funcStr}.apply(null, arguments)`
        );
        var source = document.createElement("div");
          source.innerHTML = document.getElementsByTagName("body")[0].innerHTML;
        return func(source);
      }, obj);
      let number = data.sites.push({sitesUrl: page.url, body: { children: [] }})
      data.sites[number].body.children.push(source)
      await newPage.close();
    }
    if(depth > 0) {
      return data
    }
    for (const childPage of page.children) {
       this.result.push(await this.digger(browser, childPage, data, 'body', depth + 1));
    }
    return this.result;
  };
  function parse(node) {
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
