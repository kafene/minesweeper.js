# minesweeper.js
A basic javascript implementation of the game "minesweeper"

:information_desk_person: [Try it in your browser](https://kafene.github.io/minesweeper.js/dist/index.html)

To play, select a mode - click one of the buttons "Easy", "Normal" or "Hard".

To cheat and peek at the mines without triggering them, you can open the browser console and type `gMinesweeper.reveal()`.

## Building

Clone the repository: `git clone https://github.com/kafene/minesweeper.js.git`

Enter the repository and install dependencies (using [Yarn](https://yarnpkg.com/)): `yarn install`

Run `yarn build`

The output file `index.js` will be in the `dist/` folder.

You can view the game in your browser by opening `index.html`.

To run tests simply run `yarn test`.
