let workStep = {
    f1: (event: MessageEvent) => {
        let response = workInstructions(event.data)
        postMessage(response)
    }
}

let timeouts: number[] = []

let workInstructions = (event: StepData) => {
    switch (event.instruction) {
        case "stop": {
            timeouts.forEach(key => clearTimeout(key))
            break;
        }
        case "step": {
            return workerStep(event)
        }
        default: return
    }
}

interface Square {
    id: string
    blocked: boolean
    coords: Coords
    distances?: Distances
}

interface Distances {
    [key: string]: number
}


interface Board {
    [key: string]: Square
}

interface Coords {
    x: number,
    y: number,
}

interface StepData {
    board: Board
    suggestedDirection: string
    currentLine: string[]
    pathRecord: Coords[]
    currentCoordinates: Coords
    instruction: string
}

type DirectionsTuple = [string, number]


function travel(coordinates: Coords, value: string) {
    let { x, y } = { ...coordinates }
    switch (value) {
        case "up":
            return { x: x, y: y - 1 };
        case "upright":
            return { x: x + 1, y: y - 1 };
        case "right":
            return { x: x + 1, y: y };
        case "downright":
            return { x: x + 1, y: y + 1 };
        case "down":
            return { x: x, y: y + 1 };
        case "downleft":
            return { x: x - 1, y: y + 1 };
        case "left":
            return { x: x - 1, y: y };
        case "upleft":
            return { x: x - 1, y: y - 1 };
        default:
            return coordinates;
    }
}

function wasTravelled(array: string[], obj: Coords, path: Coords[]) {
    let filteredArray = []
    for (let i = 0; i < array.length; i++) {
        let proposal: Coords = travel(obj, array[i])
        if (path.filter((key): key is Coords => (key.x === proposal.x && key.y === proposal.y)).length <= 0) { filteredArray.push(array[i]) }
    }
    return filteredArray
}

function directions(obj: Distances) {
    let directionsArray: any = []
    for (let distance in obj) {
        if (obj[distance] !== -1) directionsArray.push([distance, obj[distance]])
    }
    let response: string[] = directionsArray.sort((a: DirectionsTuple, b: DirectionsTuple) => { return a[1] - b[1] }).flat().filter((key: string) => typeof key === "string")
    return response
}

function boardCd(cd: Coords) { return `${cd.x}-${cd.y}` }

function workerStep(stepData: StepData) {
    let newCoordinates: Coords = travel(stepData.currentCoordinates, stepData.suggestedDirection)
    let distances: Distances = stepData.board[boardCd(newCoordinates)].distances!
    let filteredWays: string[] = wasTravelled(directions(stepData.board[boardCd(newCoordinates)].distances!), newCoordinates, stepData.pathRecord)
    let newDestinations: StepData[] = []
    
    for (let i = 0; i < filteredWays.length; i++) {
        let thisStep: StepData = {
            board: stepData.board,
            currentCoordinates: { ...newCoordinates },
            suggestedDirection: filteredWays[i],
            currentLine: [...stepData.currentLine].concat([filteredWays[i]]),
            pathRecord: [...stepData.pathRecord].concat([newCoordinates]),
            instruction: distances[filteredWays[i]] === 0 ? "stop" : "step"
        }
        newDestinations.push(thisStep)
    }
    return newDestinations
}

