self.importScripts("./step.js");
onmessage = (event) => {
    let timeout = setTimeout(() => workStep.f1(event), 0);
    timeouts.push(timeout);
};
//# sourceMappingURL=upleft.js.map