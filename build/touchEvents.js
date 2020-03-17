"use strict";
let touchStart = (e) => {
    let target = e.target;
    if (!target.classList.contains(".row"))
        addBlocks(target, e.touches[0].clientX, e.touches[0].clientY);
};
let touchMove = (e) => {
    if (document.elementFromPoint(e.changedTouches[0].clientX, e.changedTouches[0].clientY) === document.querySelector("body"))
        UI.dragging = false;
    if (UI.dragging) {
        (UI.drawLine) ? toggleBlock(document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY)) : dragArea(e.touches[0].clientX, e.touches[0].clientY);
    }
};
