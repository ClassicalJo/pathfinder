"use strict";
let handleHover = (e) => {
    if (UI.dragging) {
        (UI.drawLine) ? toggleBlock(e.target) : dragArea(e.clientX, e.clientY);
    }
};
let mouseDown = (e) => {
    let target = e.target;
    target.classList.contains("row") ? "" : addBlocks(e.target, e.clientX, e.clientY);
};
let mouseUp = () => {
    if (!UI.drawLine && UI.dragging) {
        cancelAnimationFrame(UI.loop);
        let $squares = document.querySelectorAll(".square");
        let minorX = UI.area.rotateX > 0 ? UI.area.x : UI.area.x - UI.area.width;
        let minorY = UI.area.rotateY > 0 ? UI.area.y : UI.area.y - UI.area.height;
        for (let i = 0; i < $squares.length; i++) {
            if (minorX < $squares[i].offsetLeft + $squares[i].offsetWidth &&
                minorY < $squares[i].offsetTop + $squares[i].offsetHeight &&
                minorX + UI.area.width > $squares[i].offsetLeft &&
                minorY + UI.area.height > $squares[i].offsetTop)
                $squares[i].classList.contains("block") ? $squares[i].classList.remove("block") : $squares[i].classList.add("block");
        }
        let $rect = document.querySelector("rect");
        $rect.setAttribute("width", `0`);
        $rect.setAttribute("height", `0`);
        UI.dragClean = false;
    }
    UI.dragging = false;
    lockBoard();
};
let touchStart = (e) => {
    let target = e.target;
    if (!target.classList.contains("row"))
        addBlocks(target, e.touches[0].clientX, e.touches[0].clientY);
};
let touchMove = (e) => {
    if (document.elementFromPoint(e.changedTouches[0].clientX, e.changedTouches[0].clientY) === document.querySelector("body"))
        UI.dragging = false;
    if (UI.dragging) {
        (UI.drawLine) ? toggleBlock(document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY)) : dragArea(e.touches[0].clientX, e.touches[0].clientY);
    }
};
