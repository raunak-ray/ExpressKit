# express-project-init

Set up a clean Express 5 API in seconds. Pick JavaScript or TypeScript, your linter, and your formatter. Then run it.

<p align="center">
  <video
    src="https://cdn.jsdelivr.net/gh/raunak-ray/ExpressKit@main/docs/express-project-init-v1.1.0-demo.mp4"
    poster="https://cdn.jsdelivr.net/gh/raunak-ray/ExpressKit@main/docs/express-project-init-v1.1.0-demo.jpg"
    autoplay
    muted
    loop
    playsinline
    controls
    width="100%"
  >
    <img
      src="https://cdn.jsdelivr.net/gh/raunak-ray/ExpressKit@main/docs/express-project-init-v1.1.0-demo.gif"
      alt="express-project-init demo"
      width="100%"
    />
  </video>
</p>

## Quick start

Requires Node.js 20 or newer.

```bash
npx express-project-init@latest
```

It asks six quick questions:

1. Project name
2. JavaScript or TypeScript
3. Central error handling
4. Linter
5. Formatter
6. Install dependencies

Then:

```bash
cd my-api
npm run dev
```

Open <http://localhost:3000/health>.

Use `.` as the project name to set up in the current folder. Existing files are never overwritten.

## What you get

- A small Express 5 API with a `/health` route
- JavaScript or TypeScript
- Optional central error handling with one response format
- ESLint, Biome, or Oxlint
- Prettier or Biome
- Real config files, dependencies, and npm scripts
- Dependencies installed for you, if you want

TypeScript projects also get `tsconfig.json` and `npm run typecheck`.

## Scripts

The scripts you get depend on your choices.

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the API and watch for changes |
| `npm start` | Run the API |
| `npm run lint` | Check your code |
| `npm run format` | Format your code |
| `npm run typecheck` | Check TypeScript types |

## Publish

Commit your changes first. If this version is already on npm, bump it with `npm version patch` before publishing.

```bash
npm login
npm pack --dry-run   # check what goes into the package
npm publish
npm view express-project-init version
```

`npm publish` builds the package first.

## License

[MIT](LICENSE.md) © 2026 Raunak Ray
