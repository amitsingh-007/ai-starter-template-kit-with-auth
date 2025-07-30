# Gemini Customization

This file is used to customize how Gemini interacts with your project. You can add instructions here that Gemini will follow.

For example, you can specify:
* Never auto commit and push changes to the repository. Only commit and push when explicitly requested.
* Preferred libraries and frameworks already installed in package.json
* Strictly adhere to using the installed package version, dont use old versions
* Always use pnpm package manager
* Tailwind, drizzle and NextAuth is already installed and configured/setup.
* Dont try to run `npm run dev` or `pnpm run dev` command as its already running in the background.

Gemini will read this file and use it to provide more accurate and relevant assistance.
