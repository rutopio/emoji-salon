<div align="center">

# EmojiSalon: Recolor your emoji

🔗 Playground: [https://emojisalon.chingru.com](https://emojisalon.chingru.com) 🔗

![pnpm](https://img.shields.io/badge/pnpm-v12-F69220?style=flat-square&logo=pnpm&logoColor=white)
![Node](https://img.shields.io/badge/Node.js-v26-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![License: CC_BY_4.0(Graphics)_/_MIT(Code)](<https://img.shields.io/badge/License-CC_BY_4.0(Graphics)_/_MIT(Code)-yellow.svg>)

![TypeScript](https://img.shields.io/badge/TypeScript-7-blue?style=flat-square&logo=typescript)
![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)
![TanStack Router](https://img.shields.io/badge/TanStack_Router-1-black?style=flat-square&logo=tanstack)

![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?style=flat-square&logo=tailwind-css)
[![Rutopio UI](https://img.shields.io/badge/Rutopio_UI-2-000000?style=flat-square)](https://github.com/rutopio/ui)
![Vite](https://img.shields.io/badge/Vite-8-9135FF?style=flat-square&logo=vite&logoColor=white)

Hosted on ![Cloudflare Pages](https://img.shields.io/badge/Cloudflare%20Pages-F38020?logo=cloudflarepages&logoColor=fff&style=flat-square)

![](public/social.png)

EmojiSalon lets you change emoji colors and save your designs as images.

</div>

## How it works

Choose an emoji, edit its colors, then save or share the result. EmojiSalon uses
[Twemoji artwork](https://github.com/jdecked/twemoji) and supports SVG and PNG
exports. Personal and commercial use are allowed under the artwork's license;
see [Copyright](#copyright) for attribution requirements.

Browse the [showcase](https://emojisalon.chingru.com/showcase) for examples.

## Ways to use it

### Match your style

Change colors to suit your style or brand.

![Custom emoji colors](public/images/sample_customize1.png)

![Another custom color palette](public/images/sample_customize2.png)

![More emoji color variations](public/images/sample_customize4.png)

### Adapt emoji for different cultures

Create color variations for different cultural or regional contexts.

![Emoji adapted for a different cultural context](public/images/sample_customize3.png)

### Make emoji easier to distinguish

People see and distinguish colors differently. Color blindness or low vision
can make some emoji hard to recognize, especially at small sizes or in a row.
Recoloring may help, depending on the person, the emoji, and its display size.

Some flag emoji have similar colors:

- 🇮🇹 Italy and 🇮🇪 Ireland
- 🇷🇴 Romania and 🇹🇩 Chad
- 🇱🇻 Latvia and 🇦🇹 Austria
- 🇲🇨 Monaco and 🇮🇩 Indonesia

Heart emoji can also be hard to distinguish by color:

- ❤️ red and 💜 purple
- 💙 blue and 💜 purple
- 💚 green and 🧡 orange

Try increasing contrast or choosing more distinct colors. Changes apply to the
images you save or share, not to emoji on your device's keyboard. When an emoji
conveys important information, include a text label or alt text.

Further reading:

- [Emoji and low vision](https://veroniiiica.com/emoji-and-low-vision/)
- [Colour Blind Vision on emoji colors](https://www.facebook.com/ColourBlindVision/posts/are-you-emoji-colour-blinda-strange-concept-to-say-nevertheless-how-many-times-h/678523570194699/)

## Get started

Clone the repository:

```bash
git clone https://github.com/rutopio/emoji-salon.git
cd emoji-salon
```

Use the versions and commands in [Development toolchain](#development-toolchain).
Vite prints the local development URL when you run `pnpm dev`.

## Deployment

The app runs on Cloudflare Pages. `pnpm build` creates the production files in
`dist/`. Cloudflare Pages Functions provide the server routes.

## Generate emoji data

Run the preprocessing script when updating the Twemoji source:

```bash
pnpm preprocess
```

The script downloads a pinned Twemoji release and converts its SVG files into
one JSON file per emoji, plus an index. Each emoji file contains its paths,
fills, and editable colors. The app and social preview image function load
these files as needed.

See the [preprocessing guide](./docs/preprocessing.md) for the source version,
output format, and palette data.

## Copyright

### Graphics

<div align="center">
<img src="https://mirrors.creativecommons.org/presskit/buttons/88x31/png/by.png" alt="Creative Commons Attribution 4.0" style="width: 100pt;">
</div>

Twemoji artwork is licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
You can share, adapt, and use it commercially, provided you credit the original
creator. The creator of EmojiSalon does not claim copyright over your designs.

### Code

The source code uses the [MIT License](./LICENSE).

## Acknowledgments

- [justfont](https://justfont.com/)

## Development toolchain

Use Node.js 26.13.0 (`nvm use`) and pnpm 12.18.0, as pinned in
`.nvmrc` and `package.json`. Install with `pnpm install --frozen-lockfile`.

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start the Vite development server. |
| `pnpm build` | Run `check`, then create the production output in `dist/`. |
| `pnpm format` | Format code, organize imports and apply safe Biome lint fixes. |
| `pnpm check` | Check formatting, lint rules, and types for the browser and Pages Functions. |
| `pnpm preview` | Serve the existing production build locally. |

`pnpm format` applies safe fixes. Resolve any remaining errors before running
`pnpm check` again. Use `pnpm outdated`, `pnpm update`, and `pnpm audit` to
maintain dependencies.

`pnpm preview:cf` builds the site and starts the local Cloudflare Pages runtime
with Functions support. Use it when testing server routes; `preview` serves the
static build only.

`pnpm preprocess` regenerates the emoji data from the pinned Twemoji source.
It is a separate maintenance task and does not run during a normal build.

The five sites share formatting, lint, TypeScript, and pnpm settings. Keep
shared dependency versions aligned when upgrading. Each site maintains its own
aliases, content pipeline, and Cloudflare bindings. Biome does not format CSS.
Tailwind class sorting uses `src/styles/globals.css` and the shared design tokens.

`pnpm-workspace.yaml` records dependency overrides and the security advisories
they address. Remove the `seroval` override when upstream dependencies resolve
a version compatible with `seroval-plugins`.

## Repository structure

See [Repository structure](docs/repository-structure.md) for shared directory
roles, naming rules, asset placement, and the exceptions used by these sites.
