function makeTile(x, y) {
    let fCost = null
    let hCost = null
    let gCost = null
    let origin = null
    let pathCost = null
    let travelable = true
    let solution = false
    let closed = false

    function getLimits(width, height) {
        let getMin = (n, limit) => n - 1 < limit ? null : n - 1
        let getMax = (n, limit) => n + 1 >= limit ? null : n + 1
        let minX = getMin(this.x, 0)
        let minY = getMin(this.y, 0)
        let maxX = getMax(this.x, width)
        let maxY = getMax(this.y, height)
        return { minX, minY, maxX, maxY }
    }

    function update(tile, target) {
        let path = getDistanceFrom(this, tile)
        this.origin = tile
        this.pathCost = path
        if (!this.hCost) this.hCost = getDistanceToTarget(this, target)
        this.gCost = path + tile.gCost
        this.fCost = this.gCost + this.hCost
    }

    return { x, y, fCost, hCost, gCost, origin, pathCost, travelable, solution, closed, getLimits, update }
}

function makeBoard(cfg) {
    let { width, height } = cfg
    let grid = makeTiles(width, height)
    let getTile = ({ x, y }) => grid[x][y]
    let origin = getTile(cfg.origin)
    let target = getTile(cfg.target)
    let open = [origin]
    let closed = []
    let solution = []

    let retrace = tile => {
        if (tile === origin) return solution
        tile.solution = true
        solution.push(tile)
        return retrace(tile.origin)
    }

    let start = update => {
        let current = open.shift()
        current.closed = true
        closed.push(current)
        if (current === target) {
            return retrace(target)
        }
        let limits = current.getLimits(width, height)
        let neighbours = []
        for (let x = limits.minX || 0; x <= (limits.maxX || width - 1); x++) {
            for (let y = limits.minY || 0; y <= (limits.maxY || height - 1); y++) {
                if (current !== getTile({ x, y })) neighbours.push(getTile({ x, y }))
            }
        }
        neighbours.forEach(tile => {
            let isClosed = closed.findIndex(t => t === tile) > -1
            let isNotTravelable = !tile.travelable
            if (isNotTravelable || isClosed) return
            let pathCost = getDistanceFrom(tile, current)
            let gCost = pathCost + current.gCost
            let isNotOpen = open.findIndex(t => t === tile) === -1

            if (isNotOpen || gCost < tile.gCost) {
                tile.update(current, target)
                open.push(tile)
                bubbleSort(open)
            }
        })
        update(JSON.parse(JSON.stringify(grid)))
        return start(update)
    }
    return { grid, getTile, origin, target, open, closed, start, solution }
}

function makeTiles(width, height) {
    let grid = []
    for (let x = 0; x < width; x++) {
        let row = []
        for (let y = 0; y < height; y++) {
            let tile = makeTile(x, y)
            row.push(tile)
        }
        grid.push(row)
    }
    return grid
}


function getDistanceFrom(tileA, tileB) {
    return Math.abs(tileA.x - tileB.x) + Math.abs(tileA.y - tileB.y) > 1 ? 14 : 10
}

function getDistanceToTarget(origin, target) {
    let xDif = Math.abs(origin.x - target.x)
    let yDif = Math.abs(origin.y - target.y)
    let min = Math.min(xDif, yDif)
    let max = Math.max(xDif, yDif)
    return min * 14 + (max - min) * 10
}

function bubbleSort(arr) {
    var len = arr.length;
    for (var i = 0; i < len; i++) {
        for (var j = 0; j < len - i - 1; j++) {
            if (arr[j].fCost > arr[j + 1].fCost) {
                var temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
            else if (
                arr[j].fCost === arr[j + 1].fCost
                &&
                arr[j].hCost > arr[j + 1].hCost
            ) {
                var temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
    return arr;
}

