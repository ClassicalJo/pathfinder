interface UI {
    size: Size
    locked: boolean
    dragging: boolean
    dragClean: boolean
    drawLine: boolean
    area: Area
    loop: number
    settingStart: boolean
    settingEnd: boolean
}

interface Size {
    x: number
    y: number
}

interface Area {
    x: number
    y: number
    width: number
    height: number
    rotateX: number
    rotateY: number
}

let UI: UI

UI = {
    size: {
        x: 22,
        y: 22,
    },
    locked: false,
    dragging: false,
    settingStart: false,
    settingEnd: false,
    dragClean: false,
    drawLine: true,
    loop: 0,
    area: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        rotateX: 1,
        rotateY: 1,
    }
}

let originalUI: UI = { ...UI }

function* idGenerator(): IterableIterator<string> {
    let number: number = 0
    while (true) yield "id" + String(number++)
}

let iterator = idGenerator()

let createBoard = () => {
    let $grid: HTMLDivElement = document.querySelector(".pathfinder-grid") as HTMLDivElement
    $grid.innerHTML = ""
    $grid.setAttribute("draggable", "false")

    for (let y: number = 0; y < UI.size.y; y++) {
        let $row = document.createElement("div")
        $row.classList.add("row")
        $row.setAttribute("draggable", "false")
        $grid.appendChild($row)

        for (let x: number = 0; x < UI.size.x; x++) {
            let $input: HTMLInputElement = document.createElement("input")
            $input.classList.add("square")
            $input.setAttribute("row", `${y}`)
            $input.setAttribute("column", `${x}`)
            $input.setAttribute("id", iterator.next().value)
            $input.type = "text"
            $input.setAttribute("draggable", "false")
            $input.setAttribute("disabled", "true")
            $row.appendChild($input)
        }
    }
}

let handleHover = (e: MouseEvent) => {
    if (UI.dragging) {
        if (UI.drawLine) toggleBlock(e)
        else {
            let area: Area = { ...UI.area }
            area.width = Math.abs(UI.area.x - e.clientX)
            area.height = Math.abs(UI.area.y - e.clientY)
            area.rotateX = e.clientX < UI.area.x ? -1 : 1
            area.rotateY = e.clientY < UI.area.y ? -1 : 1
            UI.area = area
        }
    }
}


let toggleBlock = (e: MouseEvent) => {
    if (UI.dragClean) (e!.target as HTMLInputElement).classList.contains("block") ? (e!.target as HTMLInputElement).classList.remove("block") : null
    else (e!.target as HTMLInputElement).classList.add("block")
}

let eventHandler = {
    mouseup: () => mouseUp(),
    mouseleave: () => mouseUp(),
    mousedown: (e: MouseEvent) => mouseDown(e),
    mousemove: (e: MouseEvent) => handleHover(e),
}

let setDrawLine = (value: boolean) => {
    UI.drawLine = value
}

let mouseDown = (e: MouseEvent) => {
    if (UI.settingStart) {
        UI.settingStart = false
        settingStart.set(e)
        crosshairs.remove()
    }
    else if (UI.settingEnd) {
        UI.settingEnd = false
        settingEnd.set(e)
        crosshairs.remove()
    }
    else if (UI.drawLine) {
        UI.dragging = true;
        UI.dragClean = (e!.target as HTMLInputElement).classList.contains("block")
    }
    else {
        UI.dragging = true;
        let area: Area = { ...UI.area }
        area.height = 0
        area.width = 0
        area.x = e.clientX
        area.y = e.clientY
        UI.area = area
        cycle()
    }
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
        lockBoard()
    }
    UI.dragging = false

}


var cycle = () => {
    updateCycle()
    UI.loop = requestAnimationFrame(() => cycle())
}

let updateCycle = () => {
    let $rect = document.querySelector("rect") as SVGRectElement
    $rect.setAttribute("width", `${UI.area.width}`)
    $rect.setAttribute("height", `${UI.area.height}`)
    $rect.setAttribute("x", `${UI.area.x}`)
    $rect.setAttribute("y", `${UI.area.y}`)
    $rect.setAttribute("transform", getTransformString())

}

let getTransformString = () => {
    if (UI.area.rotateX < 0 && UI.area.rotateY < 0) return `translate(${2 * UI.area.x},${2 * UI.area.y}) scale(${UI.area.rotateX} ${UI.area.rotateY})`
    if (UI.area.rotateX < 0) return `translate(${2 * UI.area.x},0) scale(${UI.area.rotateX} ${UI.area.rotateY})`
    if (UI.area.rotateY < 0) return `translate(0, ${2 * UI.area.y}) scale(${UI.area.rotateX} ${UI.area.rotateY})`
    return `translate(0,0) scale(${UI.area.rotateX} ${UI.area.rotateY})`
}

function restart() {
    let $squares = document.querySelectorAll(".square") as NodeListOf<HTMLInputElement>
    for (let i = 0; i < $squares.length; i++) {
        $squares[i].classList.contains("failure") ? $squares[i].classList.remove("failure") : null
        $squares[i].classList.contains("success") ? $squares[i].classList.remove("success") : null
        $squares[i].classList.contains("trying") ? $squares[i].classList.remove("trying") : null
    }

}
function removeBlocks() {
    let $squares = document.querySelectorAll(".square") as NodeListOf<HTMLInputElement>
    for (let i = 0; i < $squares.length; i++) $squares[i].classList.contains("block") ? $squares[i].classList.remove("block") : null
}

let pathFind = () => {
    breadthFirst()
}

let resetAll = () => {
    let start: Coords = { ...originalState.startPoint };
    state.startPoint = start;
    (document.querySelector(".start") as HTMLInputElement).classList.remove("start");
    (document.querySelector(`#${state.board![`${state.startPoint.x}-${state.startPoint.y}`].id}`) as HTMLInputElement).classList.add("start");
    lockBoard()
    removeBlocks()
    restart()
}
/////////////////////////////////////////////////////////////
//Cambiar el onchange de esto; JESUS NO TERMINO MAS JAJAJA?//
/////////////////////////////////////////////////////////////
//BORRAR ESTO ///////////////////////////////////////////////
/////////////////////////////////////////////////////////////
//LO MISMO CON SETTINGEND Y SETTINGSIZE NO TE OLVIDES EH/////
/////////////////////////////////////////////////////////////

let settingStart = {
    start: () => {
        let $startX = document.querySelector("#startX") as HTMLInputElement;
        let $startY = document.querySelector("#startY") as HTMLInputElement;
        if (Number($startX.value) === state.startPoint.x && Number($startY.value) === state.startPoint.y) {
            crosshairs.add()
            UI.settingStart = true
        }
        else {
            let start: Coords = { ...state.startPoint }
            start.x = Number($startX.value)
            start.y = Number($startY.value)
            state.startPoint = start;
            (document.querySelector(".start") as HTMLInputElement).classList.remove("start");
            (document.querySelector(`#${state.board![`${start.x}-${start.y}`].id}`) as HTMLInputElement).classList.add("start");
            lockBoard()
        }
    },
    set: (e: any) => {
        if (e.target.attributes.column !== undefined) {
            let start: Coords = { ...state.startPoint }
            start.x = Number(e.target.attributes.column.value);
            start.y = Number(e.target.attributes.row.value);
            state.startPoint = start;
            (document.querySelector(".start") as HTMLInputElement).classList.remove("start");
            (document.querySelector(`#${state.board![`${start.x}-${start.y}`].id}`) as HTMLInputElement).classList.add("start");
            lockBoard()
        }
    }
}

let crosshairs = {
    add: () => {
        let $squares = document.querySelectorAll(".square") as NodeListOf<HTMLInputElement>
        $squares.forEach(key => key.setAttribute("style", "cursor:crosshair"))
    },
    remove: () => {
        let $squares = document.querySelectorAll(".square") as NodeListOf<HTMLInputElement>
        $squares.forEach(key => key.removeAttribute("style"))
    }

}
let settingEnd = {
    start: () => {
        let $endX = document.querySelector("#endX") as HTMLInputElement;
        let $endY = document.querySelector("#endY") as HTMLInputElement;
        if (Number($endX.value) === state.endPoint.x && Number($endY.value) === state.endPoint.y) {
            crosshairs.add()
            UI.settingEnd = true
        }
        else {
            let end: Coords = { ...state.endPoint }
            end.x = Number($endX.value)
            end.y = Number($endY.value)
            state.endPoint = end;
            (document.querySelector(".end") as HTMLInputElement).classList.remove("end");
            (document.querySelector(`#${state.board![`${end.x}-${end.y}`].id}`) as HTMLInputElement).classList.add("end");
            lockBoard()
        }
    },
    set: (e: any) => {
        if (e.target.attributes.column !== undefined) {
            let end: Coords = { ...state.endPoint }
            end.x = Number(e.target.attributes.column.value);
            end.y = Number(e.target.attributes.row.value);
            state.endPoint = end;
            (document.querySelector(".end") as HTMLInputElement).classList.remove("end");
            (document.querySelector(`#${state.board![`${end.x}-${end.y}`].id}`) as HTMLInputElement).classList.add("end");

            lockBoard()
        }
    }
}

let setSize = () => {
    let $sizeX: number = Number((document.querySelector("#sizeX") as HTMLInputElement).value);
    let $sizeY: number = Number((document.querySelector("#sizeY") as HTMLInputElement).value);

    (document.querySelector("#sizeX") as HTMLInputElement).value = String($sizeX);
    (document.querySelector("#sizeY") as HTMLInputElement).value = String($sizeY);

    let size = { ...UI.size }
    size.x = $sizeX
    size.y = $sizeY
    UI.size = size

    let startPoint: Coords = {
        x: 0,
        y: 0,
    }
    let endPoint: Coords = {
        x: size.x - 1,
        y: size.y - 1,
    }

    state.startPoint = startPoint
    state.endPoint = endPoint


    createBoard()
    lockBoard()
}

let onlyNumbers = (element: string) => {
    let response: any = element.match(/[0-9]+/)
    return response === null ? "0" : response[0]
}


let checkAgainstMaxValue: any = {
    sizeX: (value: number) => { return value > 22 ? 22 : value },
    sizeY: (value: number) => { return value > 22 ? 22 : value },
    startX: (value: number) => { return value > UI.size.x - 1 ? UI.size.x - 1 : value },
    startY: (value: number) => { return value > UI.size.y - 1 ? UI.size.y - 1 : value },
    endX: (value: number) => { return value > UI.size.x - 1 ? UI.size.x - 1 : value },
    endY: (value: number) => { return value > UI.size.y - 1 ? UI.size.y - 1 : value },
}

let handleChange: any = {
    slider: () => {
        let newValue = (document.querySelector(".slider") as HTMLInputElement).value;
        state.timeoutValue = Number(newValue) * 100
    },
    text: (id: string) => {
        let $element = document.querySelector(id) as HTMLInputElement;
        let value = $element.value;
        /^[0-9]+$/.test(value) ? null : value = onlyNumbers(value);
        if (Number(value) < 0) value = "0";
        value = String(checkAgainstMaxValue[$element.id](value));
        $element.value = value
    }
}

let stopPathfind = () => {
    state.timeouts.forEach(key => clearTimeout(key))
}

let setContainerListeners = () => {
    let $container: HTMLDivElement = document.querySelector(".pathfinder-grid") as HTMLDivElement
    $container.addEventListener("mousemove", eventHandler["mousemove"])
    $container.addEventListener("mousedown", eventHandler["mousedown"])
    $container.addEventListener("mouseup", eventHandler["mouseup"])
    $container.addEventListener("mouseleave", eventHandler["mouseleave"])
}

setContainerListeners()
createBoard()
