"use strict";
let workers = generateWorkers();
function generateWorkers() {
    let newWorkers = {
        up: new Worker("./up.js"),
        upright: new Worker("./upright.js"),
        right: new Worker("./right.js"),
        downright: new Worker("./downright.js"),
        down: new Worker("./down.js"),
        downleft: new Worker("./downleft.js"),
        left: new Worker("./left.js"),
        upleft: new Worker("./upleft.js"),
    };
    for (let worker in newWorkers) {
        newWorkers[worker].onmessage = (event) => {
            postMessage(event.data);
            step(event.data);
        };
    }
    return newWorkers;
}
onmessage = (event) => {
    postMessage(event.data);
    step(event.data);
};
function step(destinations) {
    destinations.forEach(key => {
        instructions(key);
    });
}
let instructions = (event) => {
    switch (event.instruction) {
        case "step": {
            workers[event.suggestedDirection].postMessage(event);
            break;
        }
        case "stop": {
            for (let worker in workers) {
                workers[worker].terminate();
            }
            workers = generateWorkers();
            break;
        }
    }
};
//# sourceMappingURL=sorter.js.map