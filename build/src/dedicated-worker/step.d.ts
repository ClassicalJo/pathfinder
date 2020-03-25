declare let workStep: {
    f1: (event: MessageEvent) => void;
};
declare let timeouts: number[];
declare let workInstructions: (event: StepData) => StepData[] | undefined;
interface Square {
    id: string;
    blocked: boolean;
    coords: Coords;
    distances?: Distances;
}
interface Distances {
    [key: string]: number;
}
interface Board {
    [key: string]: Square;
}
interface Coords {
    x: number;
    y: number;
}
interface StepData {
    board: Board;
    suggestedDirection: string;
    currentLine: string[];
    pathRecord: Coords[];
    currentCoordinates: Coords;
    instruction: string;
}
declare type DirectionsTuple = [string, number];
declare function travel(coordinates: Coords, value: string): Coords;
declare function wasTravelled(array: string[], obj: Coords, path: Coords[]): string[];
declare function directions(obj: Distances): string[];
declare function boardCd(cd: Coords): string;
declare function workerStep(stepData: StepData): StepData[];
