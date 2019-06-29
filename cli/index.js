const nunjucks = require("nunjucks");
const path = require("path");
const fs = require("fs");
const env = new nunjucks.Environment(
  new nunjucks.FileSystemLoader([path.join(process.cwd(), "templates")])
);

const Parser = require("rss-parser");
const parser = new Parser({
  timeout: 3000 // 3 seconds timeout per url for fast testing
});

async function retryPromise(func, retry) {
  if (retry > 0) {
    return await func().catch(e => {
      console.log(`caught: ${e}, ${retry} retry left`);
      return retryPromise(func, retry - 1);
    });
  }
}

(async () => {
  const configFilePath = path.join(process.cwd(), "indie-rss.json");
  const config = require(configFilePath);
  const urls = config.feeds.map(sub => sub.url);
  const feedsPromise = urls.map(url =>
    retryPromise(() => parser.parseURL(url), 3)
  );

  const feeds = await Promise.all(feedsPromise);

  // console.dir(feeds);

  const data = {
    feeds
  };

  const res = env.render("page.njk", data);

  const distDir = path.join(process.cwd(), "dist");
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
  }

  fs.writeFileSync(path.join(distDir, "index.html"), res);
})();
