const Parser = require("rss-parser");
const parser = new Parser();

(async () => {
  const feed = await parser.parseURL("https://www.reddit.com/.rss");
  console.dir(feed.items);
})();
