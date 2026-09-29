// Raycast port of ../../getOptions.js: one source per Alfred "mode".
import { Icon, Image } from "@raycast/api";
import fuzzysort from "fuzzysort";

import cssClassesData from "../data/css-classes.json";
import cssVarsData from "../data/css-vars.json";
import dgDomainsData from "../data/data_generator_domains.json";
import doc192Data from "../data/doc-192.json";
import docData from "../data/doc.json";
import htmlSnippetsData from "../data/html-snippets.json";
import iconModifiersData from "../data/icon-modifiers.json";
import iconsData from "../data/icons.json";
import substitutionsData from "../data/substitutions.json";
import synonymsData from "../data/synonyms.json";
import viewsData from "../data/views.json";
import websitesData from "../data/websites.json";

import {
  CssClassItem,
  CssVarItem,
  DocItem,
  IconItem,
  RESULT_SIZE,
  Synonyms,
  ViewItem,
  getFuzzyOptions,
  prepareCssClassItems,
  prepareCssVarItems,
  prepareDocItems,
  prepareIconItems,
  prepareViewItems,
} from "./core";

export interface ApexItem {
  uid: string;
  title: string;
  subtitle?: string;
  /** Value that gets pasted/copied, or the URL that gets opened. */
  arg: string;
  sourceId: SourceId;
}

export type SourceId =
  | "doc"
  | "css-vars"
  | "css-classes"
  | "views"
  | "icons"
  | "icon-modifiers"
  | "websites"
  | "html-snippets"
  | "substitution"
  | "data_generator_domains"
  | "api-192";

export interface Source {
  id: SourceId;
  label: string;
  icon: Image.ImageLike;
  search: (input: string) => ApexItem[];
}

const synonyms = synonymsData as unknown as Record<string, Synonyms>;

function lazy<T>(fn: () => T): () => T {
  let value: T | undefined;
  return () => (value ??= fn());
}

function makeSource<T extends object>(
  id: SourceId,
  label: string,
  icon: Image.ImageLike,
  load: () => T[],
  keys: string[],
  toItem: (obj: T) => Omit<ApexItem, "sourceId">,
): Source {
  const data = lazy(load);
  return {
    id,
    label,
    icon,
    search: (input) =>
      fuzzysort.go(input, data(), getFuzzyOptions(keys)).map((r) => ({ ...toItem(r.obj), sourceId: id })),
  };
}

export const SOURCES: Record<SourceId, Source> = {
  doc: makeSource<DocItem>(
    "doc",
    "API Docs",
    Icon.Book,
    () => prepareDocItems(docData.results[0].items as DocItem[], synonyms.doc),
    ["title", "submatcher", "synonyms"],
    (o) => ({
      uid: o.url,
      title: o.title,
      subtitle: o.parent_title ? `${o.api_type} | ${o.parent_title}` : o.api_type,
      arg: o.url,
    }),
  ),
  "css-vars": makeSource<CssVarItem>(
    "css-vars",
    "CSS Variables",
    Icon.Brush,
    () => prepareCssVarItems(cssVarsData.data as CssVarItem[]),
    ["name", "description"],
    (o) => ({ uid: o.name, title: o.name, subtitle: o.description, arg: o.copyValue ?? `--${o.name}` }),
  ),
  "css-classes": makeSource<CssClassItem>(
    "css-classes",
    "CSS Classes",
    Icon.Code,
    () => prepareCssClassItems(cssClassesData.data as CssClassItem[], synonyms.cssClasses),
    ["name", "description", "category", "synonyms"],
    (o) => ({
      uid: o.name,
      title: o.name,
      subtitle: o.category ? `${o.description} | ${o.category}` : o.description,
      arg: o.name,
    }),
  ),
  views: makeSource<ViewItem>(
    "views",
    "Views",
    Icon.List,
    () => prepareViewItems(viewsData.results[0].items as ViewItem[], synonyms.views),
    ["name", "description", "synonyms"],
    (o) => ({
      uid: o.name,
      title: o.name,
      subtitle: `${o.description}${o.parentView ? ` | parent: ${o.parentView}` : ""}`,
      arg: o.name,
    }),
  ),
  icons: makeSource<IconItem>(
    "icons",
    "Icons",
    Icon.Star,
    () => prepareIconItems(iconsData.results[0].items as IconItem[], synonyms.icons),
    ["name", "search", "synonyms"],
    (o) => ({ uid: o.name, title: o.name, subtitle: o.description, arg: o.name }),
  ),
  "icon-modifiers": makeSource<{ name: string; description: string }>(
    "icon-modifiers",
    "Icon Modifiers",
    Icon.Wand,
    () => iconModifiersData.data,
    ["name", "description"],
    (o) => ({ uid: o.name, title: o.name, subtitle: o.description, arg: o.name }),
  ),
  websites: makeSource<{ name: string; url: string }>(
    "websites",
    "Websites",
    Icon.Globe,
    () => websitesData.data,
    ["name", "url"],
    (o) => ({ uid: o.url, title: o.name, subtitle: o.url, arg: o.url }),
  ),
  "html-snippets": makeSource<{ name: string; snippet: string }>(
    "html-snippets",
    "HTML Snippets",
    Icon.Snippets,
    () => htmlSnippetsData.data,
    ["name", "snippet"],
    (o) => ({ uid: o.name, title: o.name, subtitle: o.snippet, arg: o.snippet }),
  ),
  substitution: makeSource<{ name: string; description: string }>(
    "substitution",
    "Substitution Strings",
    Icon.Replace,
    () => substitutionsData.data,
    ["name", "description"],
    (o) => ({ uid: o.name, title: o.name, subtitle: o.description, arg: o.name }),
  ),
  data_generator_domains: makeSource<{ name: string; category: string; datatype: string }>(
    "data_generator_domains",
    "Data Generator Domains",
    Icon.Shuffle,
    () => dgDomainsData.results[0].items,
    ["name", "description"],
    (o) => ({ uid: o.name, title: o.name, subtitle: `${o.category} | ${o.datatype}`, arg: o.name }),
  ),
  "api-192": makeSource<{ url: string; title: string }>(
    "api-192",
    "API Docs 19.2",
    Icon.Book,
    () => doc192Data.data,
    ["title"],
    (o) => ({ uid: o.title, title: o.title, arg: o.url }),
  ),
};

/** Same sources as the Alfred "all" mode (19.2 docs excluded). */
const ALL_SOURCE_IDS: SourceId[] = [
  "doc",
  "css-vars",
  "css-classes",
  "views",
  "icons",
  "websites",
  "html-snippets",
  "icon-modifiers",
  "substitution",
  "data_generator_domains",
];

export function searchAll(input: string): ApexItem[] {
  const items = ALL_SOURCE_IDS.flatMap((id) => SOURCES[id].search(input));
  return fuzzysort.go(input, items, { keys: ["title", "subtitle"], limit: RESULT_SIZE, all: true }).map((r) => r.obj);
}

export function isUrl(value: string) {
  return /^https?:\/\//.test(value);
}
