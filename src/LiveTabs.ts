/**
 * LiveTabs version 1.0.3
 *
 * @class LiveTabs
 * @description LiveTabs is a TypeScript library for dynamically managing interactive tabs within a web application.
 *              It enables the creation, movement, and closure of tabs, with options to limit the maximum number of tabs
 *              and customize the appearance and behavior of each tab.
 *
 * @version 1.0.3
 * @date Created: 02 Nov 2024
 * @author Davide Ticchiarelli
 * @contact davideticchiarelli01@gmail.com
 * @repository https://github.com/davideticchiarelli01/LiveTabs
 *
 * @param parentDiv (string) - ID of the main container where the tabs will be created.
 * @param maxNumTabs (number, optional) - Maximum number of allowed tabs. Default: no limit.
 * @param allowDragAndDrop (boolean, optional) - Flag to enable drag-and-drop functionality. Default: false.
 *
 * @dependencies None.
 * @license MIT
 */

type LiveTabsOptions = {
    parentDiv: string;
    maxNumTabs?: number;
    allowDragAndDrop?: boolean;
};

type AddTabParams = {
    tabTitle: string;
    showCloseButton?: boolean;
    addContent?: (idContent: string) => void;
};

class LiveTabs {
    private static instanceCounter = 0;

    parentDiv: string; // ID of the parent div where the tabs will be created
    navbarDiv: HTMLElement; // The div element that contains the tabs
    maxNumTabs?: number; // Maximum number of tabs allowed to open
    openedId: string; // ID of the currently opened tab
    allowDragAndDrop: boolean; // Flag to enable/disable drag-and-drop functionality
    tabContentMap: Map<string, string>; // Map to hold tab IDs and their associated content IDs

    private readonly parentElement: HTMLElement;
    private readonly instanceId: string;
    private nextTabIndex: number;
    private tabIdTitleMap: Map<string, string>;
    private tabTitleIdMap: Map<string, string>;

    // Constructor to initialize the LiveTabs class
    constructor(options: LiveTabsOptions) {
        if (typeof document === 'undefined') {
            throw new Error('LiveTabs requires a DOM document.');
        }

        if (!options || typeof options.parentDiv !== 'string' || options.parentDiv.trim() === '') {
            throw new TypeError('LiveTabs requires a non-empty parentDiv option.');
        }

        const parentElement = document.getElementById(options.parentDiv);
        if (!parentElement) {
            throw new Error(`Parent element with id "${options.parentDiv}" not found.`);
        }

        this.parentDiv = options.parentDiv;
        this.parentElement = parentElement;
        this.instanceId = `lt-${++LiveTabs.instanceCounter}`;
        this.nextTabIndex = 0;
        this.openedId = '';
        this.allowDragAndDrop = options.allowDragAndDrop ?? false;
        this.maxNumTabs = this.validateMaxTabs(options.maxNumTabs);
        this.tabContentMap = new Map();
        this.tabIdTitleMap = new Map();
        this.tabTitleIdMap = new Map();

        this.navbarDiv = this.createNavbar();
    }

    // =======================================================
    // NavBar, tab and content creation
    // =======================================================

    /**
     * Creates the navbar where tabs will be displayed.
     *
     * This method creates a new `div` element for the navbar.
     * The new `div` element is assigned a unique ID and a CSS class, and is prepended to the parent element.
     */
    private createNavbar(): HTMLElement {
        this.navbarDiv = document.createElement('div'); // Create a new div for the tabs
        this.navbarDiv.id = `${this.instanceId}-container`; // Set the ID of the navbar div
        this.navbarDiv.classList.add('lt-container'); // Set the class of the navbar div
        this.navbarDiv.setAttribute('role', 'tablist');
        this.parentElement.prepend(this.navbarDiv); // Prepend the navbar div to the parent element

        return this.navbarDiv;
    }

    /**
     * Adds a new tab to the LiveTabs instance.
     *
     * @param {Object} params - The parameters for the new tab.
     * @param {string} params.tabTitle - The title of the new tab.
     * @param {boolean} [params.showCloseButton=true] - Whether to show a close button on the tab.
     * @param {Function} [params.addContent] - A callback function to add content to the tab.
     */
    public addTab(params: AddTabParams): void {
        // Destructure parameters to get tabTitle and optional properties
        const {tabTitle, showCloseButton = true, addContent} = params;
        const normalizedTitle = this.validateTabTitle(tabTitle);

        // Check if the tab already exists
        const existingTabId = this.tabTitleIdMap.get(normalizedTitle);
        if (existingTabId && this.tabContentMap.has(existingTabId)) {
            // If it exists, switch to the existing tab
            this.switchTab(existingTabId);
            return; // Exit as no new tab needs to be created
        }

        // Check if the maximum number of tabs has been reached
        if (this.maxNumTabs !== undefined && this.tabContentMap.size >= this.maxNumTabs) {
            console.warn('Maximum number of tabs reached. Please close some tabs to continue.');
            return; // Exit the method to prevent adding more tabs
        }

        const tabId = this.createTabId(normalizedTitle);
        const idContent = `${tabId}-container`;

        // Create a new tab element and append it to the navigation bar
        const tab = this.createTab(normalizedTitle, tabId, idContent, showCloseButton);
        this.navbarDiv.appendChild(tab);

        this.createTabContent(tabId, idContent); // Create a corresponding content area for the new tab

        this.tabContentMap.set(tabId, idContent); // Map the tab ID to its corresponding content div ID
        this.tabIdTitleMap.set(tabId, normalizedTitle);
        this.tabTitleIdMap.set(normalizedTitle, tabId);

        // If a callback function is provided, execute it to inject content into the new content div
        if (addContent) {
            addContent(idContent); // Pass the content div ID to the addContent
        }

        // Switch to the newly created tab after it has been added
        this.switchTab(tabId); // Activate the new tab
    }

    /**
     * Creates a new tab element.
     *
     * @param {string} tabTitle - The title of the tab.
     * @param {string} tabId - The unique ID of the tab.
     * @param {boolean} showCloseButton - Whether to show a close button on the tab.
     * @returns {HTMLElement} The created tab element.
     */
    private createTab(tabTitle: string, tabId: string, contentId: string, showCloseButton: boolean): HTMLElement {
        const tab = document.createElement('div'); // Create a new element to represent the tab
        tab.id = tabId; // Set the unique ID of the tab to the provided ID
        tab.className = 'lt-tab'; // Assign a class to the tab for styling
        tab.setAttribute('role', 'tab');
        tab.setAttribute('tabindex', '-1');
        tab.setAttribute('aria-selected', 'false');
        tab.setAttribute('aria-controls', contentId);

        const label = document.createElement('span');
        label.classList.add('lt-tab-label');
        label.textContent = tabTitle;
        tab.appendChild(label);

        // Conditionally create and append the close button based on `showCloseButton`
        let closeButton: HTMLButtonElement | null = null; // Declare a variable to hold the close button reference

        if (showCloseButton) {
            closeButton = document.createElement('button');
            closeButton.type = 'button';
            closeButton.setAttribute('aria-label', `Close ${tabTitle}`);

            // Directly insert the SVG markup into the close button
            const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.setAttribute("width", "20px");
            svg.setAttribute("height", "20px");
            svg.setAttribute("viewBox", "0 0 16 16");
            svg.setAttribute("class", "bi bi-x");
            svg.setAttribute("fill", "currentColor");

            const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
            path.setAttribute("fill-rule", "evenodd");
            path.setAttribute("d", "M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z");

            svg.appendChild(path); // Add the path to the SVG element

            closeButton.appendChild(svg); // Add the SVG to the close button

            closeButton.onclick = (event) => {
                event.stopPropagation(); // Prevent the click from propagating to the tab
                this.removeTab(tabId);   // Call removeTab on click
            };
            closeButton.classList.add('lt-tab-close-btn');
            tab.appendChild(closeButton); // Add the close button to the tab
        }

        if (this.allowDragAndDrop) { // Check if drag-and-drop functionality is enabled
            this.dragAndDropTab(tab);
        }

        // Set the `onclick` event for the tab itself
        tab.onclick = (event) => {
            const target = event.target instanceof Element ? event.target : null;
            if (!target?.closest('.lt-tab-close-btn')) {
                this.switchTab(tab.id); // If true, call `switchTab` with the tab's ID to switch to the tab
            }
        };

        tab.onkeydown = (event: KeyboardEvent) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                this.switchTab(tab.id);
            }
        };

        return tab; // Return the fully constructed tab element
    }


    /**
     * Creates a content area for a new tab.
     *
     * This method generates a new `div` element for the content associated with the specified tab ID.
     * It assigns a unique ID to the content `div`, sets its display style to `block`, and adds a CSS class for styling.
     * The content `div` is then appended to the parent element.
     *
     * @param {string} tabId - The ID of the tab for which the content area is being created.
     */
    private createTabContent(tabId: string, contentId: string): void {
        const tabContentDiv = document.createElement('div'); // Create a new div for the tab content

        tabContentDiv.id = contentId; // Assign content ID
        tabContentDiv.style.display = 'none'; // Hide the content until the tab is active
        tabContentDiv.classList.add('lt-tab-content'); // Add a CSS class for styling
        tabContentDiv.setAttribute('role', 'tabpanel');
        tabContentDiv.setAttribute('aria-labelledby', tabId);
        tabContentDiv.setAttribute('aria-hidden', 'true');

        this.parentElement.appendChild(tabContentDiv); // Append the content div to the parent element
    }


    // =======================================================
    // Tab Reordering With DragAndDrop
    // =======================================================

    /**
     * Enables drag-and-drop functionality for a tab element.
     *
     * This method makes the tab element draggable and sets up event handlers for drag-and-drop operations.
     * It handles the drag start, drag end, drag over, drag enter, drag leave, and drop events.
     *
     * @param {HTMLElement} tab - The tab element to enable drag-and-drop functionality for.
     */
    private dragAndDropTab(tab: HTMLElement) {
        tab.draggable = true; // Make the tab draggable

        let dragSrcEl: HTMLElement | null = null;

        tab.ondragstart = (e: DragEvent) => {
            dragSrcEl = tab;
            dragSrcEl.style.opacity = '0.4';
            e.dataTransfer?.setData("text/plain", dragSrcEl.id);
        };

        tab.ondragend = () => {
            if (dragSrcEl) dragSrcEl.style.opacity = '1';
        };

        tab.ondragover = (e: DragEvent) => {
            e.preventDefault();
        };

        tab.ondragenter = (e: DragEvent) => {
            e.preventDefault();
            const target = e.target instanceof Element ? e.target : null;
            let dropTarget = target?.closest('.lt-tab') as HTMLElement | null;
            if (dropTarget) {
                dropTarget.classList.add('over');
            }
        };

        tab.ondragleave = (e: DragEvent) => {
            const target = e.target instanceof Element ? e.target : null;
            let dropTarget = target?.closest('.lt-tab') as HTMLElement | null;

            if (!dropTarget || dropTarget !== e.target) return;
            dropTarget.classList.remove('over');
        };

        tab.ondrop = (e: DragEvent) => {
            e.preventDefault();

            const target = e.target instanceof Element ? e.target : null;
            let dropTarget = target?.closest('.lt-tab') as HTMLElement | null;

            if (!dropTarget || dropTarget.parentNode !== this.navbarDiv) {
                dropTarget = tab;
            }

            const draggedId = e.dataTransfer?.getData("text/plain") ?? '';
            const draggedElement = document.getElementById(draggedId);

            if (draggedElement && draggedElement !== dropTarget && draggedElement.parentNode === this.navbarDiv) {
                const dropTargetRect = dropTarget.getBoundingClientRect(); // Get the bounding rectangle of the drop target
                const center = (dropTargetRect.left + dropTargetRect.right) / 2; // Get the center of the drop target
                const insertBefore = e.clientX <= center; // Check if the cursor is left or right of the center

                // Insert the dragged element before or after the drop target
                dropTarget.parentNode?.insertBefore(
                    draggedElement,
                    insertBefore ? dropTarget : dropTarget.nextSibling
                );

                this.reorderingMap(); // reorder map with new position;

            } else {
                console.warn("No valid dragged element or drop target found.");
            }

            dropTarget?.classList.remove('over');
        };
    }

    /**
     * Reorders the tabContentMap to reflect the new order of tabs in the DOM.
     */
    private reorderingMap() {
        const newOrder: Map<string, string> = new Map();

        // Get all tabs currently in the DOM
        const tabs = Array.from(this.navbarDiv.children).filter(tab => tab instanceof HTMLElement) as HTMLElement[];

        tabs.forEach(tab => {
            const tabId = tab.id;
            const contentId = this.tabContentMap.get(tabId);
            if (contentId) {
                newOrder.set(tabId, contentId); // Preserve the content ID association
            }
        });

        this.tabContentMap = newOrder; // Update the tabContentMap to reflect the new order
    }

    // =======================================================
    // Tab Removal
    // =======================================================

    /**
     * Removes a tab by its ID.
     *
     * This method removes the tab element and its associated content from the DOM.
     * It also updates the internal tabContentMap and switches to another tab if necessary.
     *
     * @param {string} idTab - The ID of the tab to be removed.
     */
    public removeTab(idTab: string): void {
        if (!this.tabContentMap.has(idTab)) { // If the tab is not found
            console.warn("Tab not found in the tab-content map for ID:", idTab); // Log a warning
            return; // Exit the method
        }

        const tab = document.getElementById(idTab); // Get the tab element by ID
        tab?.remove(); // Remove the tab element from the DOM

        // Also remove the associated content
        const contentId = this.tabContentMap.get(idTab);
        const contentElement = document.getElementById(contentId!);
        contentElement?.remove();

        // Convert the tabContentMap to an array of tab IDs (include also the deleted tab)
        const tabsArray = Array.from(this.tabContentMap.keys());

        this.tabContentMap.delete(idTab); // Remove the closed tab from the map
        const tabTitle = this.tabIdTitleMap.get(idTab);
        if (tabTitle) {
            this.tabTitleIdMap.delete(tabTitle);
            this.tabIdTitleMap.delete(idTab);
        }

        // Check if the currently opened tab is still available
        if (this.tabContentMap.has(this.openedId)) {
            return; // If so, do nothing
        }

        if (tabsArray.length <= 1) {
            this.openedId = ''; // Clear openedId if no tabs are left
            return;
        }

        // Determine the index of the removed tab
        const removedTabIndex = tabsArray.indexOf(idTab); // This will give the index of the removed tab
        const nextTabIndex = removedTabIndex < tabsArray.length - 1 ? removedTabIndex + 1 : removedTabIndex - 1; // Calculate the next tab index
        const switchToTabId = tabsArray[nextTabIndex]; // Switch to the determined tab

        if (switchToTabId) {
            this.switchTab(switchToTabId); // Switch to the determined tab
        }
    }

    /**
     * Removes all tabs from the tabContentMap and the DOM.
     *
     * This method iterates over each entry in the tabContentMap and calls the removeTab method
     * to remove each tab and its associated content from the DOM.
     */
    public removeAllTabs(): void {
        const tabIds = Array.from(this.tabContentMap.keys());
        tabIds.forEach(tabId => {
            this.removeTab(tabId); // Remove each tab and its associated content
        });
    }

    // =======================================================
    // Tab Switching
    // =======================================================


    /**
     * Switches to the specified tab by its ID.
     *
     * This method hides the currently active tab and its content, and then displays the new tab and its content.
     * It also updates the `openedId` to the new tab's ID.
     *
     * @param {string} id - The ID of the tab to switch to.
     */
    public switchTab(id: string): void {
        if (!this.tabContentMap.has(id)) {
            console.warn('Tab not found in the tab-content map for ID:', id);
            return;
        }

        if (this.openedId === id) {
            return;
        } // If the tab is already open, do nothing

        if (this.openedId) { // Check if there is a currently opened tab
            this.setTabActive(this.openedId, false);
        }

        this.setTabActive(id, true);
        this.openedId = id; // Update the currently opened tab ID
    }

    /**
     * Switches to the next tab if it exists.
     *
     * This method retrieves an array of all tab IDs and finds the index of the currently opened tab.
     * If the current tab is not the last one, it switches to the next tab.
     * If the current tab is the last one, it logs a warning.
     */
    public nextTab(): void {
        const tabsArray = this.getAllTabs(); // Retrieve an array of all tab IDs
        const currentIndex = tabsArray.indexOf(this.openedId); // Find the index of the currently opened tab

        // Check if the current tab is not the last one
        if (currentIndex !== -1 && currentIndex < tabsArray.length - 1) {
            const nextTabId = tabsArray[currentIndex + 1]; // Identify the next tab in the array
            this.switchTab(nextTabId); // Switch to the next tab
        } else {
            console.warn('Currently on the last tab. No next tab available.'); // Log a warning if already on the last tab
        }
    }


    /**
     * Switches to the previous tab if it exists.
     *
     * This method retrieves an array of all tab IDs and finds the index of the currently opened tab.
     * If the current tab is not the first one, it switches to the previous tab.
     * If the current tab is the first one, it logs a warning.
     */
    public previousTab(): void {
        const tabsArray = this.getAllTabs(); // Retrieve an array of all tab IDs
        const currentIndex = tabsArray.indexOf(this.openedId); // Find the index of the currently opened tab

        // Check if the current tab is not the first one
        if (currentIndex > 0) {
            const prevTabId = tabsArray[currentIndex - 1]; // Identify the previous tab in the array
            this.switchTab(prevTabId); // Switch to the previous tab
        } else {
            console.warn('Currently on the first tab. No previous tab available.'); // Log a warning if already on the first tab
        }
    }


    // =======================================================
    // Getter
    // =======================================================

    /**
     * Gets the ID of the currently active tab.
     *
     * @returns {string} The ID of the currently active tab.
     */
    public getActiveTab(): string {
        return this.openedId;
    }

    /**
     * Retrieves an array of all tab IDs.
     *
     * @returns {string[]} An array of all tab IDs.
     */
    public getAllTabs(): string[] {
        return Array.from(this.tabContentMap.keys());
    }

    /**
     * Gets the total number of tabs.
     *
     * @returns {number} The total number of tabs.
     */
    public getTabCount(): number {
        return this.tabContentMap.size;
    }

    // =======================================================
    // Setter
    // =======================================================

    /**
     * Sets the maximum number of tabs allowed.
     *
     * @param {number} newMax - The new maximum number of tabs.
     */
    public setMaxTabs(newMax: number): void {
        this.maxNumTabs = this.validateMaxTabs(newMax);
    }

    private setTabActive(tabId: string, isActive: boolean): void {
        const contentId = this.tabContentMap.get(tabId);
        const content = contentId ? document.getElementById(contentId) : null;
        if (content) {
            content.style.display = isActive ? 'block' : 'none';
            content.setAttribute('aria-hidden', isActive ? 'false' : 'true');
        }

        const tab = document.getElementById(tabId);
        if (tab) {
            if (isActive) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
            tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
            tab.setAttribute('tabindex', isActive ? '0' : '-1');
        }
    }

    private createTabId(tabTitle: string): string {
        const sanitizedTitle = tabTitle
            .replace(/[^a-zA-Z0-9_-]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .toLowerCase() || 'tab';

        this.nextTabIndex += 1;
        return `${this.instanceId}-tab-${sanitizedTitle}-${this.nextTabIndex}`;
    }

    private validateTabTitle(tabTitle: string): string {
        if (typeof tabTitle !== 'string' || tabTitle.trim() === '') {
            throw new TypeError('addTab requires a non-empty tabTitle.');
        }

        return tabTitle;
    }

    private validateMaxTabs(maxTabs: number | undefined): number | undefined {
        if (maxTabs === undefined) {
            return undefined;
        }

        if (!Number.isInteger(maxTabs) || maxTabs < 0) {
            throw new RangeError('maxNumTabs must be a non-negative integer.');
        }

        return maxTabs;
    }

}

// Support browser globals and Node.js require() / CommonJS
declare var module: any;
if (typeof window !== 'undefined') {
    (window as typeof window & { LiveTabs: typeof LiveTabs }).LiveTabs = LiveTabs;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = LiveTabs;
}
