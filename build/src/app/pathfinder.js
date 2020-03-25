"use strict";
var state = {
    startPoint: {
        x: 6,
        y: 6
    },
    endPoint: {
        x: 15,
        y: 15,
    },
    lines: [],
    timeouts: [],
    timeoutValue: 100
};
let originalState = { ...state };
let sorter = generateSorter();
function checkDistance(cd) {
    //Establishes the distance between the endpoint and each square in all eight directions.
    //If that square is out of area or is a block, it's returns -1.
    if (cd.x > -1 && cd.x < UI.size.x && cd.y > -1 && cd.y < UI.size.y && state.board[`${cd.x}-${cd.y}`].blocked !== true)
        return Math.abs(state.endPoint.x - cd.x) + Math.abs(state.endPoint.y - cd.y);
    return -1;
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
        let coord = { x: Number($squares[i].dataset.column), y: Number($squares[i].dataset.row) };
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
    //Receives all directions from the Distances property of a given coordinate in board and returns viable directions in proximity order.
    let directionsArray = [];
    for (let distance in obj) {
        if (obj[distance] !== -1)
            directionsArray.push([distance, obj[distance]]);
    }
    let response = directionsArray.sort((a, b) => { return a[1] - b[1]; }).flat().filter((key) => typeof key === "string");
    return response;
}
function breadthFirst() {
    restart();
    let coord = { ...state.startPoint };
    let ways = directions(boardCd(coord).distances);
    let destinations = [];
    for (let i = ways.length - 1; i >= 0; i--) {
        let stepData = {
            suggestedDirection: ways[i],
            currentLine: [ways[i]],
            currentCoordinates: coord,
            pathRecord: [coord],
            board: state.board,
            instruction: "step",
        };
        destinations.push(stepData);
    }
    sorter.postMessage(destinations);
}
function instructions(event) {
    switch (event.instruction) {
        case "step": {
            let timeout = setTimeout(() => transposeIntoDom(event.pathRecord));
            state.timeouts.push(timeout);
            break;
        }
        case "stop": {
            state.timeouts.forEach((key) => clearTimeout(key));
            sorter.terminate();
            sorter = generateSorter();
            transposeSuccess(event.pathRecord);
            break;
        }
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
    let endpointId = document.querySelector(`#${boardCd(state.endPoint).id}`).classList.remove("failure");
    document.querySelector(`#${boardCd(state.endPoint).id}`).classList.add("success");
}
function generateSorter() {
    let newSorter = new Worker("./build/src/dedicated-worker/sorter.js");
    newSorter.onmessage = (event) => {
        event.data.forEach((key) => {
            instructions(key);
        });
    };
    return newSorter;
}
let startingBoard = () => {
    let $squares = document.querySelectorAll('.square');
    $squares.forEach(key => key.classList.add("block"));
    let blockedSquares = [{ x: 6, y: 6 }, { x: 6, y: 7 }, { x: 6, y: 8 }, { x: 6, y: 9 }, { x: 6, y: 10 }, { x: 6, y: 11 }, { x: 6, y: 12 }, { x: 6, y: 13 }, { x: 6, y: 14 }, { x: 6, y: 15 }, { x: 7, y: 9 }, { x: 7, y: 13 }, { x: 7, y: 15 }, { x: 8, y: 6 }, { x: 8, y: 7 }, { x: 8, y: 9 }, { x: 8, y: 11 }, { x: 8, y: 13 }, { x: 8, y: 15 }, { x: 9, y: 7 }, { x: 9, y: 8 }, { x: 9, y: 9 }, { x: 9, y: 10 }, { x: 9, y: 11 }, { x: 9, y: 13 }, { x: 9, y: 15 }, { x: 10, y: 7 }, { x: 10, y: 13 }, { x: 10, y: 15 }, { x: 11, y: 6 }, { x: 11, y: 9 }, { x: 11, y: 11 }, { x: 11, y: 12 }, { x: 11, y: 15 }, { x: 12, y: 6 }, { x: 12, y: 8 }, { x: 12, y: 10 }, { x: 12, y: 13 }, { x: 12, y: 15 }, { x: 13, y: 6 }, { x: 13, y: 7 }, { x: 13, y: 9 }, { x: 13, y: 11 }, { x: 13, y: 12 }, { x: 13, y: 15 }, { x: 14, y: 6 }, { x: 14, y: 10 }, { x: 15, y: 6 }, { x: 15, y: 7 }, { x: 15, y: 8 }, { x: 15, y: 11 }, { x: 15, y: 12 }, { x: 15, y: 13 }, { x: 15, y: 14 }, { x: 15, y: 15 }];
    for (let i = 0; i < $squares.length; i++) {
        if (Number($squares[i].dataset.column) >= state.startPoint.x &&
            Number($squares[i].dataset.row) >= state.startPoint.y &&
            Number($squares[i].dataset.column) <= state.endPoint.x &&
            Number($squares[i].dataset.row) <= state.endPoint.y &&
            isStartingBlock({ x: Number($squares[i].dataset.column), y: Number($squares[i].dataset.row) }, blockedSquares)) {
            $squares[i].classList.remove("block");
        }
    }
    lockBoard();
};
function isStartingBlock(coord, list) {
    let response = false;
    for (let i = 0; i < list.length; i++) {
        if (list[i].x === coord.x && list[i].y === coord.y)
            response = true;
    }
    return response;
}
startingBoard();
function lockBoard() {
    createVirtualBoard();
    findDistances();
}
