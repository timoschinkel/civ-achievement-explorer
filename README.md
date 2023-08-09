# Civ achievement explorer
A webcomponents experiment to keep track of the Steam achievements for Civilization VI.

This application is available on [https://timoschinkel.github.io/civ-achievement-explorer/](https://timoschinkel.github.io/civ-achievement-explorer/).

## Background
In my opinion the best way to learn a new language, methodology or framework is by building an actual application, as you will encounter scenarios not covered in any tutorials. I have been wanting to experiment with [webcomponents ](https://www.webcomponents.org/) for a while. Currently I am on a [Civilization VI](https://civilization.com/) spree, and because I am a bit of a completionist I am trying to unlock all achievements.

This project is built using:
- [Lit](https://lit.dev/) as an abstraction around webcomponents
- [TypeScript](https://www.typescriptlang.org/) for increased typesafety
- Recent features in HTML and CSS, this makes that this project is best viewed in a modern browser
- [Steam](https://store.steampowered.com/app/289070/Sid_Meiers_Civilization_VI/) as source of the achievements, source for the images of the achievements, as well as for syncing unlocked achievements
- [Civilization Wiki from Fandom](https://civilization.fandom.com/) for background of the achievements

I am a firm believer of using features that are built-in in every browser. This is a reason for me to opt for webcomponents using [Shadow DOM](https://en.wikipedia.org/wiki/Web_Components#Shadow_DOM) - in casu Lit -, and not using [Virtual DOM](https://en.wikipedia.org/wiki/Virtual_DOM) - like for example React and Vue. 

**Disclaimer** I do not own the copyright to this game, nor do I own the copyright to the achievements. This project is meant for educational purposes.

**Disclaimer 2** I am a software engineer, not a designer. I hope the visualization does not bother you too much 😅.

## Contributing
You are welcome to contribute to this codebase, but please keep in mind that this is **my** experiment, and as such do I have the final say in whether a contributions is merged into the codebase.

## Local development

This application uses TypeScript and as such requires NodeJS. I recommend using NVM. After installing NVM all that is needed to set up your development environment is:

```bash
nvm i
npm ci
```

To run the application there's a local webserver supplied in the development dependencies:

```bash
npm run build
npm run start
```
