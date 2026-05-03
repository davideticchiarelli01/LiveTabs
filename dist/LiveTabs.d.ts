declare class LiveTabs {
    parentDiv: string;
    navbarDiv: HTMLElement;
    maxNumTabs?: number;
    openedId: string;
    allowDragAndDrop: boolean;
    tabContentMap: Map<string, string>;

    constructor(options: LiveTabs.Options);

    addTab(params: LiveTabs.AddTabParams): void;
    removeTab(idTab: string): void;
    removeAllTabs(): void;
    switchTab(id: string): void;
    nextTab(): void;
    previousTab(): void;
    getActiveTab(): string;
    getAllTabs(): string[];
    getTabCount(): number;
    setMaxTabs(newMax: number): void;
}

declare namespace LiveTabs {
    type Options = {
        parentDiv: string;
        maxNumTabs?: number;
        allowDragAndDrop?: boolean;
    };

    type AddTabParams = {
        tabTitle: string;
        showCloseButton?: boolean;
        addContent?: (idContent: string) => void;
    };
}

export = LiveTabs;
export as namespace LiveTabs;
