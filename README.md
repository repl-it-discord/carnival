# carnival

`carnival` is a website that showcases great games made by the community of [repl.it](https://repl.it). this implies categorization and search of these games, but we also wish to offer additional capabilities such as leaderboard systems, identity management, and / or multiplayer apis.

the project is in early development. if you have a suggestion, feel free to [add one](https://github.com/repl-it-discord/carnival/issues/2). or, chat about this project real-time on the [repl.it discord server](https://repl.it/discord).

## contributing

### installation

```bash
git clone https://github.com/repl-it-discord/carnival
cd carnival
yarn install

# lerna bootstrap
yarn bootstrap

# runs `yarn dev` in for both `./client` and `./server` folders
yarn dev

# as an alternative to `yarn dev`, you can build and serve the frontend statically
# only do this if you are not yourself making code changes to the client and you
# want to save on system resources.
make setup-additional
cd server && yarn dev
```

- if you are using vscode, ensure you have the [editorconfig](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig), [prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode), [stylelint](https://github.com/shinnn/vscode-stylelint), [eslint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint), and [vetur](https://marketplace.visualstudio.com/items?itemName=octref.vetur) extensions; we have project-specific [`.vscode`](./.vscode/settings.json) settings

## license

licensed under gnu gpl v2; see [details](https://github.com/repl-it-discord/carnival/wiki)
