import fetch from "node-fetch";
import fs from "fs";
import path from "path";

const fileData = path.resolve("src/data.json");
const filePage = path.resolve("public/index.md");
const fileXml = path.resolve("public/sitemap.xml");

const token = "";

const doSitemap = (list) => {
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  list.forEach((repo) => {
    sitemap += `
  <url>
    <loc>${repo.page_url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
  });

  sitemap += `
</urlset>`;
  return sitemap;
};

const doIndex = (list) => {
  const html = list
    .map((it) => {
      return `
## ${it.name}
${it.description || ""}
  - [${it.html_url}](${it.html_url})
  - [${it.page_url}](${it.page_url})
`.trim();
    })
    .join("\n\n");
  return `
# Repositories

${html}
  `;
};

const run = async () => {
  const exist = fs.existsSync(fileData);
  if (!exist) {
    const resp = await fetch(
      "https://api.github.com/users/yracnet/repos?per_page=200",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log(resp);
    const data = await resp.json();
    const list = data
      .filter((it) => !it.private)
      .filter((it) => !it.fork)
      .map((it) => {
        return {
          id: it.id,
          name: it.name,
          full_name: it.full_name,
          html_url: it.html_url,
          description: it.description,
          license: it.license?.name,
          page_url: "https://yracnet.github.io/" + it.name,
        };
      });
    fs.writeFileSync(fileData, JSON.stringify(list, null, 2));
  }
  const data = fs.readFileSync(fileData);
  const list = JSON.parse(data);
  const html = doIndex(list);
  console.log("Read: ", fileData);
  console.log("Write: ", filePage);
  fs.writeFileSync(filePage, html);
  const xml = doSitemap(list);
  console.log("Write: ", fileXml);
  fs.writeFileSync(fileXml, xml);
};
run();
