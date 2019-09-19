import { crawledPages } from "../../muncher/muncher/muncherFunction";

function Crawl() {
  db.urls
    .findAll({
      where: {
        last_crawl_at: {
          [Op.lt]: new Date().setDate(new Date().getDate() - 1)
        }
      },
      limit: 1
    })
    .then(data => {
      let urls = data;
      if (urls.length > 0) {
        for (const url of urls) {
          if (url.url !== null) {
            request(
              `${process.env.MUNCHER_API}/crawl?url=${url.url}&selector=${url.selector}`,
              (error, response, body) => {
                if (!error && response.statusCode < 400) {
                  console.log(body);
                  const clientServerOptions = {
                    uri: `${process.env.LOCAL_API}/data?url=${url.url}`,
                    body: body,
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json"
                    }
                  };
                  request(clientServerOptions, (error, response, body) => {
                    console.log(error, response, body);
                  });
                }
              }
            );
          }
        }
      }
    });
}
Crawl();