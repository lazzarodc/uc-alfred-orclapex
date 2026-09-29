import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import manifest from "../package.json";
import doc192Data from "../src/data/doc-192.json";
import docData from "../src/data/doc.json";
import iconsData from "../src/data/icons.json";
import websitesData from "../src/data/websites.json";
import { fontApexIcon, isUrl, searchAll, SourceId, SOURCES } from "../src/lib/sources";
import { preferences } from "./raycast-api.mock";

const ROOT = path.resolve(__dirname, "..");
const titles = (items: { title: string }[]) => items.map((i) => i.title);

describe("sources", () => {
  it.each(Object.keys(SOURCES) as SourceId[])("%s returns results for an empty query", (id) => {
    const items = SOURCES[id].search("");
    expect(items.length).toBeGreaterThan(0);
    expect(items.length).toBeLessThanOrEqual(50);
    for (const item of items) {
      expect(item.title).toBeTruthy();
      expect(item.arg).toBeTruthy();
      expect(item.sourceId).toBe(id);
    }
  });

  it("finds API docs, including via synonyms", () => {
    expect(titles(SOURCES.doc.search("send mail")).some((t) => /SEND/.test(t))).toBe(true);
    const mail = SOURCES.doc.search("email");
    expect(mail.some((i) => i.subtitle?.includes("APEX_MAIL"))).toBe(true);
    for (const item of SOURCES.doc.search("apex_json")) expect(isUrl(item.arg)).toBe(true);
  });

  it("finds icons via synonyms", () => {
    expect(titles(SOURCES.icons.search("delete"))).toContain("fa-trash");
    expect(titles(SOURCES.icons.search("add"))).toContain("fa-plus");
  });

  it("finds views, css classes, css vars, substitutions", () => {
    expect(titles(SOURCES.views.search("app items"))).toContain("APEX_APPLICATION_ITEMS");
    expect(titles(SOURCES["css-classes"].search("u-danger"))).toContain("u-danger");
    expect(SOURCES["css-vars"].search("u-color-1")[0].arg).toBe("--u-color-1");
    expect(titles(SOURCES.substitution.search("APP_USER"))).toContain("APP_USER");
  });

  it("search everything mixes sources", () => {
    const ids = new Set(searchAll("a").map((i) => i.sourceId));
    expect(ids.size).toBeGreaterThan(3);
    expect(ids.has("api-192")).toBe(false);
  });
});

describe("data", () => {
  it("every website and doc URL is valid", () => {
    const urls = [
      ...websitesData.data.map((w) => w.url),
      ...docData.results[0].items.map((d) => d.url),
      ...doc192Data.data.map((d) => d.url),
    ];
    const invalid = urls.filter((u) => !/^https?:\/\/\S+$/.test(u) || !URL.canParse(u));
    expect(invalid).toEqual([]);
  });

  it("the Roadmap link is fixed", () => {
    const roadmap = SOURCES.websites.search("Roadmap")[0];
    expect(roadmap.arg).toBe("https://apex.oracle.com/roadmap");
  });

  it("every Font APEX icon has a generated SVG", () => {
    const names = iconsData.results[0].items.map((i) => i.name);
    const files = new Set(readdirSync(path.join(ROOT, "assets/icons")));
    const missing = names.filter((n) => !files.has(`${n}.svg`) || !fontApexIcon(n));
    expect(missing).toEqual([]);
  });

  it("glyph icons are tinted, flags are not", () => {
    expect(fontApexIcon("fa-home")).toEqual({ source: "icons/fa-home.svg", tintColor: "PrimaryText" });
    expect(fontApexIcon("fa-flag-br")).toBe("icons/fa-flag-br.svg");
    expect(fontApexIcon("fa-does-not-exist")).toBeUndefined();
  });
});

describe("commands", () => {
  it("every command in package.json has an entry file", () => {
    for (const cmd of manifest.commands) {
      expect(existsSync(path.join(ROOT, "src", `${cmd.name}.tsx`)), cmd.name).toBe(true);
    }
  });

  it.each(manifest.commands.map((c) => c.name))("%s renders items with actions", async (name) => {
    const { default: Command } = await import(`../src/${name}.tsx`);
    const html = renderToStaticMarkup(<Command />);
    const count = (html.match(/data-item=/g) ?? []).length;
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThanOrEqual(50);
    expect((html.match(/data-actions=/g) ?? []).length).toBe(count);
    if (name === "search-icons") expect(html).toContain("icons/fa-");
    if (name === "search-all") expect(html).toContain("data-accessories=\"[{&quot;tag&quot;");
  });

  it("URL results open in the browser first; others paste or copy per preference", async () => {
    const { ItemActions } = await import("../src/components/SearchList");
    const firstAction = (html: string) => html.match(/data-action="(\w+)"/)?.[1];

    const url = SOURCES.websites.search("Roadmap")[0];
    expect(firstAction(renderToStaticMarkup(<ItemActions item={url} />))).toBe("open");

    const icon = SOURCES.icons.search("fa-home")[0];
    preferences.primaryAction = "paste";
    expect(firstAction(renderToStaticMarkup(<ItemActions item={icon} />))).toBe("paste");
    preferences.primaryAction = "copy";
    expect(firstAction(renderToStaticMarkup(<ItemActions item={icon} />))).toBe("copy");
    preferences.primaryAction = "paste";
  });
});
