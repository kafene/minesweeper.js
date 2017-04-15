
import "babel-polyfill";
import $ from "jquery";
import Minesweeper from "./Minesweeper.js";

// global minesweeper instance for the page.
let gMinesweeper;

// set up buttons to start the game.
Minesweeper.createStartButtons().forEach($button => {
    $button.on("click", function () {
        if (gMinesweeper.confirmNewGame()) {
            gMinesweeper.endGame(); // this kills the timer.
            gMinesweeper = new Minesweeper($(this).data("mode"));
            gMinesweeper.render();
        }
    }).appendTo("#start-buttons");
});

gMinesweeper = new Minesweeper();
gMinesweeper.render();
