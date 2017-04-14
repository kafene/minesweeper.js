
import "babel-polyfill";
import $ from "jquery";
import Minesweeper from "./Minesweeper.js";

// set up buttons to start the game.
Minesweeper.createStartButtons().forEach($button => {
    $button.on("click", function () {
        if (!window.gMinesweeper.gameStarted ||
            confirm("A game is in progress - are you sure you want to start a new one?"))
        {
            window.gMinesweeper.endGame(); // this kills the timer.
            window.gMinesweeper = new Minesweeper($(this).data("mode"));
            window.gMinesweeper.render();
        }
    }).appendTo("#start-buttons");
});

// global minesweeper instance for the page.
window.gMinesweeper = new Minesweeper();
window.gMinesweeper.render();
