interface UI {
    size: Size;
    locked: boolean;
    dragging: boolean;
    dragClean: boolean;
    drawLine: boolean;
    area: Area;
    loop: number;
    settingStart: boolean;
    settingEnd: boolean;
}
interface Size {
    x: number;
    y: number;
}
interface Area {
    x: number;
    y: number;
    width: number;
    height: number;
    rotateX: number;
    rotateY: number;
}
declare let UI: UI;
declare let originalUI: UI;
declare function idGenerator(): IterableIterator<string>;
declare let iterator: IterableIterator<string>;
declare let createBoard: () => void;
declare var cycle: () => void;
declare let updateCycle: () => void;
declare let getTransformString: () => string;
declare function restart(): void;
declare function removeBlocks(): void;
declare let pathFind: () => void;
declare let resetAll: () => void;
declare let setStartPoint: {
    start: () => void;
    set: (x: number, y: number) => void;
};
declare let crosshairs: {
    add: () => void;
    remove: () => void;
};
declare let setEndPoint: {
    start: () => void;
    set: (x: number, y: number) => void;
};
declare let setSize: () => void;
declare let onlyNumbers: (element: string) => any;
declare let checkAgainstMaxValue: any;
declare let toggleBlock: (e: HTMLInputElement) => void;
declare let handleChange: any;
declare let stopPathfind: () => void;
declare let setContainerListeners: () => void;
declare let setDrawLine: (value: boolean) => void;
declare let addBlocks: (target: HTMLElement, x: number, y: number) => void;
declare let dragArea: (x: number, y: number) => void;
