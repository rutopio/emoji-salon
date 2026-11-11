<div align="center">

# EmojiSalon - Coloring Your Emoji

🔗 Playground: [https://emojisalon.chingru.com](https://emojisalon.chingru.com) 🔗

![pnpm](https://img.shields.io/badge/pnpm-v11-F69220?style=flat-square&logo=pnpm&logoColor=white)
![Node](https://img.shields.io/badge/Node.js-v24-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![License: CC_BY_4.0(Graphics)_/_MIT(Code)](<https://img.shields.io/badge/License-CC_BY_4.0(Graphics)_/_MIT(Code)-yellow.svg>)

![TypeScript](https://img.shields.io/badge/TypeScript-6-blue?style=flat-square&logo=typescript)
![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)
![TanStack Router](https://img.shields.io/badge/TanStack_Router-1-black?style=flat-square&logo=tanstack)

![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?style=flat-square&logo=tailwind-css)
![ShadCN](https://img.shields.io/badge/shadcn%2Fui-4-000000?style=flat-square&logo=shadcnui&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-9135FF?style=flat-square&logo=vite&logoColor=white)

Host on ![Cloudflare Pages](https://img.shields.io/badge/Cloudflare%20Pages-F38020?logo=cloudflarepages&logoColor=fff&style=flat-square)

![](public/social.png)

**EmojiSalon** allows you to customize the colors of emojis, just like dressing them up with various cosmetics or coloring them with different paints.

</div>

## Introduction

EmojiSalon uses [Twemoji](https://github.com/jdecked/twemoji) SVG data for emoji rendering. You can select any emoji, customize its colors, and download your creation as SVG or PNG for personal or commercial use.

## Usage

Live Page: [https://emojisalon.chingru.com/showcase](https://emojisalon.chingru.com/showcase)

### Extend Emoji & For Fun

Create unique emoji variations by changing colors to match your style or brand.

![](public/images/sample_customize1.png)

![](public/images/sample_customize2.png)

![](public/images/sample_customize4.png)

### Cross-cultural Design

Adapt emojis for different cultural contexts or create region-specific variations.

![](public/images/sample_customize3.png)

### Accessibility

Emoji accessibility is not just a binary between being able to see emoji perfectly and not being able to see them at all — it is a spectrum that accounts for multiple experiences.

#### Challenges for Visually Impaired Users

For people with color vision deficiencies, color blindness, or low vision, identifying certain emojis can be challenging:

- **Similar colors**: Emoji may appear blurry or distorted, making it difficult to distinguish between similar-looking icons
- **Color-based identification**: Many users identify emoji by color or general shape rather than fine details
- **Multiple emoji in sequence**: When several emoji appear in a row, they can be hard to tell apart, especially with similar colors
- **Small keyboard icons**: Emoji keyboards have small icons arranged closely together, making selection difficult

#### Commonly Confused Emoji

**Flag emoji** with similar color schemes are particularly problematic:

- 🇮🇹 Italy vs 🇮🇪 Ireland
- 🇷🇴 Romania vs 🇹🇩 Chad
- 🇱🇻 Latvia vs 🇦🇹 Austria
- 🇲🇨 Monaco vs 🇮🇩 Indonesia

**Heart emoji** colors can also be easily confused:

- ❤️ Red vs 💜 Purple
- 💙 Blue vs 💜 Purple
- 💚 Green vs 🧡 Orange

#### How EmojiSalon Helps

Most current emoji designs do not consider these accessibility needs. EmojiSalon provides a solution by allowing users to:

- Customize emoji colors for better personal distinction
- Create high-contrast variants tailored to individual visual needs
- Generate easily distinguishable emoji for users with specific color vision deficiencies

#### See More

- [Emoji And Low Vision - Veronica With Four Eyes](https://veroniiiica.com/emoji-and-low-vision/)
- [Are you emoji colour blind? - Colour Blind Vision](https://www.facebook.com/ColourBlindVision/posts/are-you-emoji-colour-blinda-strange-concept-to-say-nevertheless-how-many-times-h/678523570194699/)

## Getting Started

1. Clone this repository:

   ```bash
   git clone https://github.com/rutopio/emoji-salon.git
   cd EmojiSalon
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Run the development server:

   ```bash
   pnpm dev
   ```

   The development server should now be running at [http://localhost:5173](http://localhost:5173).

## Building for Production

```bash
pnpm run build
```

The app is deployed to [Cloudflare Pages](https://developers.cloudflare.com/pages/). The build output in `dist/` can be served as a static site on any platform.

## Data Preprocessing

The emoji SVG data used in this application is preprocessed from [Twemoji](https://github.com/jdecked/twemoji) source files into one per-emoji JSON file each. The whole pipeline is a single reproducible Node script — no fonts, no Glyphs App, no manual steps.

```bash
pnpm preprocess
```

This shallow-clones `jdecked/twemoji` at a pinned tag, parses every `assets/svg/*.svg` (skipping skin-tone-modifier files), and writes per-emoji data to `public/data/emoji/u<code>.json` plus an `index.json`. Each file holds the emoji's SVG paths, fills, and editable colors, served as static assets and fetched on demand by both the app and the OG image function.

See [`preprocess/README.md`](./preprocess/README.md) for the pinned tag, output format, and details.

## Copyright

### Graphics

<div align="center">
<img src="https://mirrors.creativecommons.org/presskit/buttons/88x31/png/by.png" style="width: 100pt;">
</div>

Your creation is based on [Twemoji](https://github.com/jdecked/twemoji), licensed under [CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/) (graphic).

This license enables reusers to distribute, remix, adapt, and build upon the material in any medium or format, so long as attribution is given to the creator. The license allows for commercial use.

The author does not own any copyright to your work.

### Code

Code licensed under the MIT License: http://opensource.org/licenses/MIT

## Special Thanks

- [justfont](https://justfont.com/)

## Development toolchain

Use Node.js 26.13.0 (`nvm use`) and pnpm 12.18.0, as pinned in
`.nvmrc` and `package.json`. Install with `pnpm install --frozen-lockfile`.

- `pnpm check`: read-only Biome formatting/lint and browser/Functions type checks
- `pnpm check:fix`: apply safe Biome fixes
- `pnpm format`: format source files
- `pnpm build`: create the production output
- `pnpm audit`: check direct and transitive dependencies

The five personal sites share the same `biome.json`, `.editorconfig`,
`.gitattributes`, `tsconfig.base.json`, Functions compiler settings and pnpm
policy. Keep shared package versions aligned when upgrading. Project aliases,
content pipelines and Cloudflare bindings remain specific to each site.
CSS formatting stays outside Biome; Tailwind class sorting reads
`src/styles/globals.css` and its shared design tokens.

Security overrides in `pnpm-workspace.yaml` document the advisories they fix.
The serializer override aligns `seroval` with `seroval-plugins`; remove it once
the upstream dependency graph consistently resolves compatible versions.
