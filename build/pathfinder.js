"use strict";
var state = {
    startPoint: {
        x: 5,
        y: 5
    },
    endPoint: {
        x: 16,
        y: 16
    },
    lines: [],
    timeouts: [],
    timeoutValue: 100
};
let originalState = { ...state };
function checkDistance(cd) {
    //Establishes the distance between the endpoint and each square in all eight directions.
    //If that square is out of area or is a block, it's marked as blocked.
    if (cd.x > 0 && cd.x < UI.size.x && cd.y > 0 && cd.y < UI.size.y && state.board[`${cd.x}-${cd.y}`].blocked !== true)
        return Math.abs(state.endPoint.x - cd.x) + Math.abs(state.endPoint.y - cd.y);
    return "blocked";
}
function isBlocked(cd) { return boardCd(cd).blocked; }
function boardCd(cd) { return state.board[(`${cd.x}-${cd.y}`)]; }
function travel(coordinates, value) {
    //Receives a coordinate and a direction, and returns the coordinate following that direction.
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
let find = {
    minor: (arr) => {
        let minor = arr[0];
        for (let i = 0; i < arr.length; i++) {
            arr[i] < minor ? minor = arr[i] : null;
        }
        return minor;
    },
    major: (arr) => {
        let major = arr[0];
        for (let i = 0; i < arr.length; i++) {
            arr[i] > major ? major = arr[i] : null;
        }
        return major;
    }
};
function createVirtualBoard() {
    state.board = {};
    let $squares = document.querySelectorAll('.square');
    for (let i = 0; i < $squares.length; i++) {
        let coord = { x: Number($squares[i].attributes.column.value), y: Number($squares[i].attributes.row.value) };
        state.board[`${coord.x}-${coord.y}`] = {
            id: $squares[i].id,
            blocked: $squares[i].classList.contains("block"),
            coords: { ...coord }
        };
    }
    let startId = state.board[`${state.startPoint.x}-${state.startPoint.y}`].id;
    let endId = state.board[`${state.endPoint.x}-${state.endPoint.y}`].id;
    document.querySelector(`#${startId}`).classList.add("start");
    document.querySelector(`#${endId}`).classList.add("end");
    document.querySelector(`#sizeX`).value = String(UI.size.x);
    document.querySelector(`#sizeY`).value = String(UI.size.y);
    document.querySelector(`#startX`).value = String(state.startPoint.x);
    document.querySelector(`#startY`).value = String(state.startPoint.y);
    document.querySelector(`#endX`).value = String(state.endPoint.x);
    document.querySelector(`#endY`).value = String(state.endPoint.y);
}
function findDistances() {
    for (var entry in state.board) {
        let coord = state.board[entry].coords;
        let entryWithDistances = { ...state.board[entry] };
        entryWithDistances.distances = {
            up: checkDistance(travel(coord, "up")),
            upright: checkDistance(travel(coord, "upright")),
            right: checkDistance(travel(coord, "right")),
            downright: checkDistance(travel(coord, "downright")),
            down: checkDistance(travel(coord, "down")),
            downleft: checkDistance(travel(coord, "downleft")),
            left: checkDistance(travel(coord, "left")),
            upleft: checkDistance(travel(coord, "upleft")),
        };
        state.board[entry] = entryWithDistances;
    }
}
function directions(obj) {
    //Receives all directions from the Distances property of a given coordinate in board.
    let directionsArray = [];
    for (let distance in obj) {
        if (obj[distance] !== "blocked")
            directionsArray.push([distance, obj[distance]]);
    }
    let response = directionsArray.sort((a, b) => { return a[1] - b[1]; }).flat().filter((key) => typeof key === "string");
    //Returns viable directions in proximity order
    return response;
}
function breadthFirst() {
    //I'm not really sure if it's a breadth first function.
    let coord = { ...state.startPoint };
    let ways = directions(boardCd(coord).distances);
    for (let i = ways.length - 1; i >= 0; i--) {
        let line = [];
        let record = [coord];
        let timeout = setTimeout(() => step(travel(coord, ways[i]), ways[i], line, record), 5);
        state.timeouts.push(timeout);
    }
}
function wasTravelled(array, obj, path) {
    //Receives an array of possible directions, a coordinate, and an array of travelled coordinates.
    //Returns an array of possible directions that don't point towards a travelled coordinate.
    let filteredArray = [];
    for (let i = 0; i < array.length; i++) {
        let proposal = travel(obj, array[i]);
        if (path.filter((key) => (key.x === proposal.x && key.y === proposal.y)).length <= 0) {
            filteredArray.push(array[i]);
        }
    }
    return filteredArray;
}
function step(newCoordinates, suggestedDirection, currentLine, pathRecord) {
    let filteredWays = wasTravelled(directions(boardCd(newCoordinates).distances), newCoordinates, pathRecord);
    for (let i = 0; i < filteredWays.length; i++) {
        let timeout = setTimeout(() => {
            let thisStep = {
                cd: { ...newCoordinates },
                direction: suggestedDirection,
                line: [...currentLine],
                path: [...pathRecord]
            };
            thisStep.path.push(thisStep.cd);
            thisStep.line.push(thisStep.direction);
            let isFinal = travel(thisStep.cd, filteredWays[i]);
            if (isFinal.x !== state.endPoint.x || isFinal.y !== state.endPoint.y) {
                transposeIntoDom(thisStep.path);
                step(travel(thisStep.cd, filteredWays[i]), filteredWays[i], thisStep.line, thisStep.path);
            }
            else {
                currentLine.push(suggestedDirection, filteredWays[i]);
                state.lines.push(currentLine);
                pathRecord.push(newCoordinates, isFinal);
                state.timeouts.forEach(key => clearTimeout(key));
                transposeSuccess(pathRecord);
            }
        }, state.timeoutValue * i);
        state.timeouts.push(timeout);
    }
}
function transposeIntoDom(path) {
    let $squares = document.querySelectorAll(".square");
    $squares.forEach(key => {
        key.classList.contains("trying") ? key.classList.remove("trying") : null;
    });
    path.forEach(key => {
        let $id = boardCd(key).id;
        document.querySelector(`#${$id}`).classList.add("trying");
    });
}
function transposeSuccess(path) {
    let $squares = document.querySelectorAll(".square");
    $squares.forEach(key => {
        key.classList.contains("trying") ? key.classList.remove("trying") : null;
        key.classList.add("failure");
    });
    path.forEach(key => {
        let $id = boardCd(key).id;
        document.querySelector(`#${$id}`).classList.remove("failure");
        document.querySelector(`#${$id}`).classList.add("success");
    });
}
lockBoard();
function lockBoard() {
    createVirtualBoard();
    findDistances();
}
