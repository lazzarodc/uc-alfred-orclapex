# Oracle APEX for Raycast

Raycast port of the [UC APEX Alfred Workflow](https://github.com/United-Codes/uc-alfred-orclapex) by United Codes.
Quickly search Oracle APEX resources:

- API Reference / Documentation (PL/SQL and JS) — current and 19.2
- Font APEX icons + icon modifiers
- APEX views
- Universal Theme CSS classes and CSS variables
- Substitution strings
- HTML snippets
- Data Generator domains
- Useful links and websites

Use **Search Everything** to search across all categories, or one of the dedicated commands.
Results that are URLs open in the browser; everything else is pasted into the active app
(or copied — configurable in the extension preferences).

## Development

```sh
npm install
npm run sync-data   # copy ../data/*.json into src/data
npm run generate-icons  # render Font APEX icons into assets/icons (from the Oracle CDN)
npm test            # vitest: search, data, icons and command rendering
npm run dev
```

The data lives in the repository root `data/` directory and is shared with the Alfred workflow.
Run `npm run sync-data` after updating it. Run `npm run generate-icons` after `data/icons.json` changes
(pass `-- --apex=<version> --font-apex=<version>` to target another APEX release). `src/lib/core.ts` is a TypeScript port of `lib/core.js`
and `src/lib/sources.ts` mirrors `getOptions.js` — keep them in sync.
