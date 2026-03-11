import { onCall, HttpsError } from "firebase-functions/v2/https";
import fetch from "node-fetch";
import * as cheerio from "cheerio";

export const fetchOgData = onCall(
  { maxInstances: 10, timeoutSeconds: 30 },
  async (request) => {
    const url = request.data?.url;
    if (!url || typeof url !== "string") {
      throw new HttpsError("invalid-argument", "A valid URL is required.");
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      throw new HttpsError("invalid-argument", "Invalid URL format.");
    }

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; URLListBot/1.0; +https://url-list.web.app)",
          Accept: "text/html",
        },
        timeout: 10000,
        redirect: "follow",
      });

      if (!response.ok) {
        return { title: "", description: "", image: "" };
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      const ogTitle =
        $('meta[property="og:title"]').attr("content") ||
        $("title").text() ||
        "";

      const ogDescription =
        $('meta[property="og:description"]').attr("content") ||
        $('meta[name="description"]').attr("content") ||
        "";

      const ogImage =
        $('meta[property="og:image"]').attr("content") || "";

      // Resolve relative image URLs
      let resolvedImage = ogImage;
      if (ogImage && !ogImage.startsWith("http")) {
        try {
          resolvedImage = new URL(ogImage, url).href;
        } catch {
          resolvedImage = "";
        }
      }

      return {
        title: ogTitle.substring(0, 300),
        description: ogDescription.substring(0, 500),
        image: resolvedImage.substring(0, 2000),
      };
    } catch (error) {
      console.error("OG fetch error:", error);
      return { title: "", description: "", image: "" };
    }
  }
);
