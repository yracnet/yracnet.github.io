import fetch from "node-fetch";
import fs from "fs";
import path from "path";

const fileData = path.resolve("src/data.json");
const filePage = path.resolve("public/index.md");

const run = async () => {
  const exist = fs.existsSync(fileData);
  if (!exist) {
    const resp = await fetch(
      "https://api.github.com/users/yracnet/repos?per_page=200",
      {
        headers: {
          Authorization: "Bearer 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",
        },
      }
    );
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
  const html = list
    .map((it) => {
      return `
## ${it.name}
${it.description || ""}
  - [${it.html_url}](${it.html_url})
  - [${it.page_url}](${it.page_url})
`;
    })
    .join("\n\n");
  console.log("Read: ", fileData);
  console.log("Write: ", filePage);
  fs.writeFileSync(
    filePage,
    `
# Repositories

${html}  
  
  `
  );
};
run();
