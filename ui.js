function getContext() {
    return document.querySelector('canvas').getContext('2d')
}
function drawBoard(grid) {
    let { width, height } = config
    let { height: HEIGHT, width: WIDTH, min } = uiConfig
    let ctx = getContext()
    ctx.strokeStyle = 'yellowgreen'
    ctx.lineWidth = '5'
    ctx.clearRect(0, 0, WIDTH * 2, HEIGHT * 2)
    function drawBorder() {
        ctx.beginPath()
        ctx.rect(0, 0, min * width, height * min)
        ctx.stroke()
    }
    function drawColumns() {
        for (let i = 0; i < width - 1; i++) {
            ctx.beginPath()
            ctx.moveTo(i * min + min, 0)
            ctx.lineTo(i * min + min, height * min)
            ctx.stroke()
        }
        for (let i = 0; i < height - 1; i++) {
            ctx.beginPath()
            ctx.moveTo(0, i * min + min)
            ctx.lineTo(width * min, i * min + min)
            ctx.stroke()
        }
    }
    function drawTiles() {
        function isSameTile(tileA, tileB) {
            return tileA.x === tileB.x && tileA.y === tileB.y
        }
        function backgroundColor(tile) {
            if (!tile.travelable) return "yellowgreen"
            if (isSameTile(tile, board.origin)) return "blue"
            if (isSameTile(tile, board.target)) return 'green'
            if (tile.solution) return 'red'
            if (tile.closed) return "grey"
            return 'black'
        }

        function drawTile(tile) {
            ctx.beginPath()
            ctx.fillStyle = backgroundColor(tile)
            ctx.rect(tile.x * min, tile.y * min, min, min)
            ctx.fill()
        }
        let ctx = getContext()
        for (let i = 0; i < grid.length; i++) {
            for (let j = 0; j < grid[i].length; j++) {
                drawTile(grid[i][j])
            }
        }
    }
    drawTiles()
    drawBorder()
    drawColumns()
}


function handleStart() {
    if (!config.ready) return
    config.ready = false
    let frame = 0
    let frameTime = 100
    let timeouts = []
    function animate(arr) {
        frame++
        timeouts.push(setTimeout(() => {
            drawBoard(arr)
        }, frameTime * frame))
    }
    function paintSolution() {
        setTimeout(() => drawBoard(board.grid), timeouts.length * frameTime)
    }
    board.start(animate)
    paintSolution()
}

let config = {
    height: 5,
    width: 5,
    diagonal: 14,
    straight: 10,
    ready: true,
    origin: { x: 0, y: 0 },
    target: { x: 4, y: 4 }
}

let uiConfig = {
    width: 2000,
    height: 2000,
    min: 2000 / Math.max(config.width, config.height)
}

let mouseConfig = {
    active: false,
    dragMode: null,
    startingPoint: null,
    currentCoords: null,
}
function getMousePos(canvas, e) {
    let rect = canvas.getBoundingClientRect()
    return {
        x: (e.clientX - rect.left) * (canvas.width / rect.width),
        y: (e.clientY - rect.top) * (canvas.height / rect.height)
    }
}
function isWithinCanvasBounds(x, y, width, height) {
    return x < width && y < height && x > -1 && y > -1
}

let handleMouseDown = e => {
    let { x, y } = getMousePos($canvas, e)
    let { width, height } = config
    let { min } = uiConfig
    if (isWithinCanvasBounds(x, y, min * width, min * height)) {
        mouseConfig.active = true
        mouseConfig.startingPoint = { x, y }
        let coords = { x: Math.floor(x / min), y: Math.floor(y / min) }
        mouseConfig.dragMode = !board.getTile(coords).travelable
        let tile = board.getTile(coords)
        tile.travelable = !tile.travelable
        setTimeout(() => {
            if (mouseConfig.currentCoords.x === mouseConfig.startingPoint.x) {
                config.target = { x: Math.floor(x / min), y: Math.floor(y / min) }
                board = makeBoard(config)
                drawBoard(board.grid)
            }
        }, 1000)
    }

}
function handleMouseUp() {
    mouseConfig.active = false
}

function handleMouseMove(e) {
    let { x, y } = getMousePos($canvas, e)
    let { width, height } = config
    let { min } = uiConfig
    mouseConfig.currentCoords = { x, y }
    if (mouseConfig.active && isWithinCanvasBounds(x, y, min * width, min * height)) {
        let coords = { x: Math.floor(x / min), y: Math.floor(y / min) }
        let tile = board.getTile(coords)
        tile.travelable = mouseConfig.dragMode
        drawBoard(board.grid)
    }
}

function handleDoubleClick(e) {
    let { x, y } = getMousePos($canvas, e)
    let { width, height } = config
    let { min } = uiConfig
    if (isWithinCanvasBounds(x, y, min * width, min * height)) {
        config.origin = { x: Math.floor(x / min), y: Math.floor(y / min) }
        board = makeBoard(config)
        drawBoard(board.grid)
    }

}

function handleChanger(e) {
    if (!config.ready) return
    let classList = Array.from(e.target.classList)
    let { name } = e.target.form
    let $element = document.querySelector(`#${name}`)
    if (classList.findIndex(k => k === 'decreaser') > -1 && $element.value > 5) $element.value--
    else if (classList.findIndex(k => k === 'increaser') > -1) $element.value++
    else return
    config[name] = $element.value
    uiConfig.min = uiConfig.height / Math.max(config.width, config.height)
    board = makeBoard(config)
    drawBoard(board.grid)
}

function handleChange(e) {
    e.preventDefault()
    if (!config.ready) return
    config[e.target.id] = e.target.value
    uiConfig.min = uiConfig.height / Math.max(config.width, config.height)
    board = makeBoard(config)
    drawBoard(board.grid)
}

function handleReset(){
    config.ready = true
    board = makeBoard(config)
    drawBoard(board.grid)
}

let board = makeBoard(config)
let nodes = board.grid.flat()


let $canvas = document.querySelector('canvas')
$canvas.addEventListener('mouseup', handleMouseUp)
$canvas.addEventListener('mousedown', handleMouseDown)
$canvas.addEventListener('mousemove', handleMouseMove)
$canvas.addEventListener('dblclick', handleDoubleClick)

let $start = document.querySelector("#start")
$start.addEventListener('click', handleStart)

let $reset = document.querySelector('#reset')
$reset.addEventListener('click', handleReset)

let $increasers = document.querySelectorAll('.changer')
$increasers.forEach(k => k.addEventListener('click', handleChanger))

let $forms = document.querySelectorAll('form').forEach(k => k.addEventListener('submit', e => e.preventDefault()))
document.querySelector('#width').addEventListener('change', handleChange)
document.querySelector('#height').addEventListener('change', handleChange)


drawBoard(board.grid)
