"use strict";
let workStep = {
    f1: (event) => {
        let response = workInstructions(event.data);
        postMessage(response);
    }
};
let timeouts = [];
let workInstructions = (event) => {
    switch (event.instruction) {
        case "stop": {
            timeouts.forEach(key => clearTimeout(key));
            break;
        }
        case "step": {
            return workerStep(event);
        }
        default: return;
    }
};
function travel(coordinates, value) {
    let { x, y } = { ...coordinates };
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
function wasTravelled(array, obj, path) {
    let filteredArray = [];
    for (let i = 0; i < array.length; i++) {
        let proposal = travel(obj, array[i]);
        if (path.filter((key) => (key.x === proposal.x && key.y === proposal.y)).length <= 0) {
            filteredArray.push(array[i]);
        }
    }
    return filteredArray;
}
function directions(obj) {
    let directionsArray = [];
    for (let distance in obj) {
        if (obj[distance] !== -1)
            directionsArray.push([distance, obj[distance]]);
    }
    let response = directionsArray.sort((a, b) => { return a[1] - b[1]; }).flat().filter((key) => typeof key === "string");
    return response;
}
function boardCd(cd) { return `${cd.x}-${cd.y}`; }
function workerStep(stepData) {
    let newCoordinates = travel(stepData.currentCoordinates, stepData.suggestedDirection);
    let distances = stepData.board[boardCd(newCoordinates)].distances;
    let filteredWays = wasTravelled(directions(stepData.board[boardCd(newCoordinates)].distances), newCoordinates, stepData.pathRecord);
    let newDestinations = [];
    for (let i = 0; i < filteredWays.length; i++) {
        let thisStep = {
            board: stepData.board,
            currentCoordinates: { ...newCoordinates },
            suggestedDirection: filteredWays[i],
            currentLine: [...stepData.currentLine].concat([filteredWays[i]]),
            pathRecord: [...stepData.pathRecord].concat([newCoordinates]),
            instruction: distances[filteredWays[i]] === 0 ? "stop" : "step"
        };
        newDestinations.push(thisStep);
    }
    return newDestinations;
}
//# sourceMappingURL=step.js.map