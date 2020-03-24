interface Workers {
    [key: string]: Worker;
}
declare let workers: Workers;
declare function generateWorkers(): Workers;
declare function step(destinations: Array<StepData>): void;
declare let instructions: (event: StepData) => void;
//# sourceMappingURL=sorter.d.ts.map