require("dotenv").config();
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const CMS_REPO = "i-dot-ai/ai-gov-uk-cms-content";
const ASSETS_FOLDER = "./_site/assets";

module.exports = (eleventyConfig) => {
  eleventyConfig.addPassthroughCopy("components/");

  // Copy static assets over from CMS repo
  eleventyConfig.on("eleventy.before", async ({ dir, runMode, outputMode }) => {
    if (!process.env.CMS_CONTENT_REPO_TOKEN) {
      throw new Error("CMS_CONTENT_REPO_TOKEN is not set");
    }

    // Get all entries in CMS folder
    const assets = await axios.get(
      `https://api.github.com/repos/${CMS_REPO}/contents/static/images/uploads`,
      {
        headers: {
          Authorization: `token ${process.env.CMS_CONTENT_REPO_TOKEN}`,
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );

    // create ./_site/assets folder if it doesn't already exist
    if (!fs.existsSync(ASSETS_FOLDER)) {
      fs.mkdirSync(ASSETS_FOLDER, { recursive: true });
    }

    // loop through each asset, and copy over if it doesn't already exist
    for (const asset of assets.data) {
      const localFilePath = path.resolve(
        __dirname,
        `${ASSETS_FOLDER}/${asset.name}`
      );
      if (fs.existsSync(localFilePath)) {
        return;
      }

      const writer = fs.createWriteStream(localFilePath);
      const response = await axios({
        url: asset.download_url,
        method: "GET",
        responseType: "stream",
        headers: {
          Authorization: `token ${process.env.CMS_CONTENT_REPO_TOKEN}`,
          "X-GitHub-Api-Version": "2022-11-28",
        },
      });
      response.data.pipe(writer);
    }
  });
};
