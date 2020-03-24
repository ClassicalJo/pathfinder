let handleHover = (e: MouseEvent) => {
    if (UI.dragging) {
        (UI.drawLine) ? toggleBlock(e.target as HTMLInputElement) : dragArea(e.clientX, e.clientY)
    }
}

let mouseDown = (e: MouseEvent) => {
    let target = e.target as HTMLElement
    if (!target.classList.contains(".row")) addBlocks(e.target as HTMLInputElement, e.clientX, e.clientY)
}

let mouseUp = () => {
    if (!UI.drawLine && UI.dragging) {
        cancelAnimationFrame(UI.loop)
        let $squares = document.querySelectorAll(".square") as NodeListOf<HTMLInputElement>
        let minorX: number = UI.area.rotateX > 0 ? UI.area.x : UI.area.x - UI.area.width
        let minorY: number = UI.area.rotateY > 0 ? UI.area.y : UI.area.y - UI.area.height
        for (let i = 0; i < $squares.length; i++) {
            if (minorX < $squares[i].offsetLeft + $squares[i].offsetWidth &&
                minorY < $squares[i].offsetTop + $squares[i].offsetHeight &&
                minorX + UI.area.width > $squares[i].offsetLeft &&
                minorY + UI.area.height > $squares[i].offsetTop) $squares[i].classList.contains("block") ? $squares[i].classList.remove("block") : $squares[i].classList.add("block")
        }
        let $rect = document.querySelector("rect") as SVGRectElement
        $rect.setAttribute("width", `0`)
        $rect.setAttribute("height", `0`)
        UI.dragClean = false
    }
    UI.dragging = false
    lockBoard()
}

