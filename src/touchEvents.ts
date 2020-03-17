let touchStart = (e: TouchEvent) => {
    let target = e.target as HTMLElement
    if (!target.classList.contains(".row")) addBlocks(target as HTMLInputElement, e.touches[0].clientX, e.touches[0].clientY)
}

let touchMove = (e: TouchEvent) => {
    if (document.elementFromPoint(e.changedTouches[0].clientX, e.changedTouches[0].clientY) === document.querySelector("body")) UI.dragging = false
    if (UI.dragging) {
        (UI.drawLine) ? toggleBlock(document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY) as HTMLInputElement) : dragArea(e.touches[0].clientX, e.touches[0].clientY)
    }

}

