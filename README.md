# ExpressKit

**Scaffold a clean Express API in seconds — JavaScript or TypeScript.**

[![Watch the ExpressKit demo](docs/demo.jpg)](docs/demo.mp4)

ExpressKit asks four questions, then writes a ready-to-run Express 5 project. Choose JavaScript or TypeScript, optionally add centralized error handling, and start building.

## Quick start

Requires **Node.js 20+**.

```bash
npm create expresskit@latest
```

Or run it directly:

```bash
npx create-expresskit@latest
```

Answer the prompts:

```text
? Project name › my-api
? Language › TypeScript
? Create central error handling middleware? › Yes
? Install dependencies? › Yes
```

Then:

```bash
cd my-api
npm run dev
```

Open <http://localhost:3000/health>.

Use `.` at the project name prompt to scaffold in the current directory. ExpressKit will not overwrite existing files.

## What you get

```text
my-api/
├── package.json
├── tsconfig.json          # TypeScript only
└── src/
    ├── server.ts
    ├── app.ts
    ├── middleware/        # with the optional error handler
    │   ├── error.middleware.ts
    │   └── notFound.middleware.ts
    └── utils/
        ├── helpers.ts
        ├── responseHelpers.ts
        └── AppError.ts    # with the optional error handler
```

JavaScript projects use the same layout with `.js` files and no `tsconfig.json`.

### Scripts

| Command | JavaScript | TypeScript |
| --- | --- | --- |
| `npm run dev` | `node --watch` | `tsx watch` |
| `npm start` | `node` | `tsx` |
| `npm run typecheck` | — | `tsc --noEmit` |

## Error handling

With the error handler enabled, throw `BadRequestError`, `UnauthorizedError`, or `NotFoundError` from any route and one middleware formats the response:

```json
{
  "success": false,
  "message": "Route not found",
  "code": "NOT_FOUND"
}
```

Successful responses use the same envelope with `success: true` and `data`.

## How it works

Projects are assembled from a base template plus optional feature layers. Feature files replace base files at the same path, and feature `package.json` fragments are merged into the base manifest.

## Local development

```bash
npm install
npm run build
npm link
```

Then, in a separate directory:

```bash
mkdir -p /tmp/expresskit-test
cd /tmp/expresskit-test
create-expresskit
```

Rebuild with `npm run build` after changing `src/`; the linked command picks up the new `dist/` automatically. Remove the global link with `npm unlink -g create-expresskit`.

## License

MIT
