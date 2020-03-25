self.importScripts("./step.js")
declare var self: DedicatedWorkerGlobalScope;
export {};
onmessage = (event: any) => {
    let timeout = setTimeout(()=> workStep.f1(event), 0)
    timeouts.push(timeout)
}

