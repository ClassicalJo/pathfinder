interface Coords {
    x: number;
    y: number;
}
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
interface Step {
    cd: Coords;
    direction: string;
    line: string[];
    path: Coords[];
}
declare type Line = string[];
declare type DirectionsTuple = [string, number];
interface State {
    startPoint: Coords;
    endPoint: Coords;
    board?: Board;
    lines: Array<Line>;
    timeouts: number[];
    timeoutValue: number;
}
declare var state: State;
declare let originalState: State;
declare let sorter: Worker;
interface StepData {
    currentCoordinates: Coords;
    suggestedDirection: string;
    currentLine: string[];
    pathRecord: Coords[];
    board: Board;
    instruction: string;
}
declare function checkDistance(cd: Coords): number;
declare function isBlocked(cd: Coords): boolean;
declare function boardCd(cd: Coords): Square;
declare function travel(coordinates: Coords, value: string): Coords;
declare let find: {
    minor: (arr: number[]) => number;
    major: (arr: number[]) => number;
};
declare function createVirtualBoard(): void;
declare function findDistances(): void;
declare function directions(obj: Distances): string[];
declare function breadthFirst(): void;
declare function instructions(event: StepData): void;
declare function transposeIntoDom(path: Coords[]): void;
declare function transposeSuccess(path: Coords[]): void;
declare function generateSorter(): Worker;
declare let startingBoard: () => void;
declare function isStartingBlock(coord: Coords, list: Coords[]): boolean;
declare function lockBoard(): void;
