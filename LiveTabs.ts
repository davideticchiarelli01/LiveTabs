/**
 * LiveTabs version 0.1
 *
 * @class LiveTabs
 * @description LiveTabs is a TypeScript library for dynamically managing interactive tabs within a web application.
 *              It enables the creation, movement, and closure of tabs, with options to limit the maximum number of tabs
 *              and customize the appearance and behavior of each tab.
 *
 * @version 0.1
 * @date Created: 02 Nov 2024
 * @author Davide Ticchiarelli
 * @contact davideticchiarelli01@gmail.com
 * @repository TBD
 *
 * @param parentDiv (string) - ID of the main container where the tabs will be created.
 * @param maxNumTabs (number, optional) - Maximum number of allowed tabs. Default: no limit.
 *
 * @dependencies None.
 * @license Proprietary (©2024 Davide Ticchiarelli)
 */


class LiveTabs {
    parentDiv: string; // ID of the parent div where the tabs will be created
    navbarDiv: HTMLElement | undefined; // The div element that contains the tabs
    maxNumTabs?: number; // Maximum number of tabs allowed to open
    openedId: string; // ID of the currently opened tab
    tabContentMap: Map<string, string>; // Map to hold tab IDs and their associated content IDs

    // Constructor to initialize the LiveTabsTS class
    constructor(options: { parentDiv: string; maxNumTabs?: number }) {
        this.parentDiv = options.parentDiv;      // Set the parentDiv from the options
        this.openedId = '';                       // Initialize openedId as an empty string
        this.maxNumTabs = options.maxNumTabs;    // Set the maximum number of tabs from the options
        this.tabContentMap = new Map();          // Initialize the map for tab-content relationship

        this.createNavbar();                      // Call method to create the navbar for tabs
    }

    // =======================================================
    // NavBar, tab and content creation
    // =======================================================


    // Method to create the navbar where tabs will be displayed
    private createNavbar(): void {
        const parentElement = document.getElementById(this.parentDiv); // Get the parent element by ID

        if (!parentElement) { // Check if the parent element exists
            console.error(`Parent element with id "${this.parentDiv}" not found.`); // Log error if not found
            return; // Exit the method if the parent element does not exist
        }

        this.navbarDiv = document.createElement('div'); // Create a new div for the tabs
        this.navbarDiv.id = 'liveTabs-container'; // Set the ID of the navbar div
        this.navbarDiv.classList.add('lt-container'); // Set the class of the navbar div
        parentElement.prepend(this.navbarDiv); // Prepend the navbar div to the parent element
    }

    // Method to add a new tab
    public addTab(params: {
        tabTitle: string;
        showCloseButton?: boolean;
        allowDragAndDrop?: boolean;
        addContent?: (idContent: string) => void
    }): void {
        // Destructure parameters to get tabTitle and optional properties
        const {tabTitle, showCloseButton = true, allowDragAndDrop = true, addContent} = params;

        // Check if the maximum number of tabs has been reached
        if (this.maxNumTabs && this.tabContentMap.size >= this.maxNumTabs) {
            // Alert the user if the maximum limit is reached
            alert('Maximum number of tabs reached. Please close some tabs to continue.');
            return; // Exit the method to prevent adding more tabs
        }

        // Sanitize the tab title to create a valid ID (lowercase and alphanumeric only)
        const sanitizedId = tabTitle.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        // Construct a unique tab ID using the sanitized title
        const tabId = `lt-tab-${sanitizedId}`;

        // Check if the tab already exists
        if (this.tabContentMap.has(tabId)) {
            // If it exists, switch to the existing tab
            this.switchTab(tabId);
            return; // Exit as no new tab needs to be created
        }

        // Create a new tab element and append it to the navigation bar
        const tab = this.createTab(tabTitle, tabId, showCloseButton, allowDragAndDrop);
        this.navbarDiv?.appendChild(tab);

        this.createTabContent(tabId); // Create a corresponding content area for the new tab

        const idContent = `${sanitizedId}-container`; // Generate a unique content div ID for storing content related to this tab
        this.tabContentMap.set(tabId, idContent); // Map the tab ID to its corresponding content div ID


        // If a callback function is provided, execute it to inject content into the new content div
        if (addContent) {
            addContent(idContent); // Pass the content div ID to the addContent
        }

        // Switch to the newly created tab after it has been added
        this.switchTab(tabId); // Activate the new tab
    }

    private createTab(tabTitle: string, tabId: string, showCloseButton: boolean, allowDragAndDrop: boolean): HTMLElement {
        const tab = document.createElement("button"); // Create a new button element to represent the tab
        tab.textContent = tabTitle; // Set the text of the tab to the provided title
        tab.id = tabId; // Set the unique ID of the tab to the provided ID
        tab.className = 'lt-tab active'; // Assign a class to the tab for styling, initially setting it as active

        // Conditionally create and append the close button based on `showCloseButton`
        let closeButton: HTMLElement | null = null; // Declare a variable to hold the close button reference

        if (showCloseButton) { // If `showCloseButton` is true, create the close button
            closeButton = document.createElement('button'); // Create the close button element
            closeButton.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
            `;
            closeButton.classList.add('lt-tab-close-btn'); // Add a class to the close button for styling
            closeButton.onclick = (event) => {
                event.stopPropagation(); // Prevent triggering tab switch on close
                this.removeTab(tabId); // Call `removeTab` to remove the tab
            };
            tab.appendChild(closeButton); // Append the close button to the tab element
        }

        if (allowDragAndDrop) {
            this.dragAndDropTab(tab);
        }

        // Set the `onclick` event for the tab itself
        tab.onclick = (event) => {
            if (!closeButton || event.target !== closeButton) { // Check if close button exists and if the click target is not the close button
                this.switchTab(tab.id); // If true, call `switchTab` with the tab's ID to switch to the tab
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
    private createTabContent(tabId: string): void {
        const parentElement = document.getElementById(this.parentDiv); // Get the parent element by ID
        const tabContentDiv = document.createElement('div'); // Create a new div for the tab content

        tabContentDiv.id = tabId.replace('lt-tab-', '') + '-container'; // Assign content ID
        tabContentDiv.style.display = 'block'; // Set the style to display block
        tabContentDiv.classList.add('lt-tab-content'); // Add a CSS class for styling

        parentElement?.appendChild(tabContentDiv); // Append the content div to the parent element
    }


    // =======================================================
    // Tab Reordering With DragAndDrop
    // =======================================================

    private dragAndDropTab(tab: HTMLElement) {
        tab.draggable = true; // Make the tab draggable

        let dragSrcEl: HTMLElement | null = null;

        tab.ondragstart = (e: DragEvent) => {
            dragSrcEl = e.target as HTMLElement;
            if (dragSrcEl) {
                dragSrcEl.style.opacity = '0.4';
                e.dataTransfer?.setData("text/plain", dragSrcEl.id);
            }
        };

        tab.ondragend = () => {
            if (dragSrcEl) dragSrcEl.style.opacity = '1';
        };

        tab.ondragover = (e: DragEvent) => {
            e.preventDefault();
        };

        tab.ondragenter = (e: DragEvent) => {
            e.preventDefault();
            (e.target as HTMLElement).classList.add('over');
        };

        tab.ondragleave = (e: DragEvent) => {
            (e.target as HTMLElement).classList.remove('over');
        };

        tab.ondrop = (e: DragEvent) => {
            e.preventDefault();

            let dropTarget = e.target as HTMLElement;

            // If dropTarget is a button inside the tab, find the parent tab
            if (dropTarget.tagName === 'BUTTON' && dropTarget.parentElement === tab) {
                dropTarget = tab; // Set the parent tab as the drop target
            }

            const draggedId = e.dataTransfer?.getData("text/plain");
            const draggedElement = document.getElementById(draggedId || '');

            // Check to exclude the specific button from being the drop target
            if (draggedElement && dropTarget && draggedElement !== dropTarget) {
                const dropTargetRect = dropTarget.getBoundingClientRect();
                const center = (dropTargetRect.left + dropTargetRect.right) / 2;
                // Check if the cursor is left or right of the center
                const insertBefore = e.clientX < center;

                // Insert the dragged element before or after the drop target
                dropTarget.parentNode?.insertBefore(
                    draggedElement,
                    insertBefore ? dropTarget : dropTarget.nextSibling
                );

                this.reorderingMap(); // reorder map with new position;

            } else {
                console.warn("No valid dragged element or drop target found.");
            }

            dropTarget.classList.remove('over');
        };
    }

    private reorderingMap() {
        const newOrder: Map<string, string> = new Map();

        // Get all tabs currently in the DOM
        const tabs = Array.from(this.navbarDiv?.children || []).filter(tab => tab instanceof HTMLElement) as HTMLElement[];

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

    // Method to remove a tab
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

        // Check if the currently opened tab is still available
        if (this.tabContentMap.has(this.openedId)) {
            return; // If so, do nothing
        }

        if (tabsArray.length === 0) {
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
        this.tabContentMap.forEach((contentId, tabId) => {
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
    private switchTab(id: string): void {
        if (this.openedId === id) {
            return;
        } // If the tab is already open, do nothing

        if (this.openedId) { // Check if there is a currently opened tab
            const previousContentId = this.tabContentMap.get(this.openedId); // Get the content ID of the previously opened tab
            const previousContent = document.getElementById(previousContentId!); // Get the content element by ID
            if (previousContent) previousContent.style.display = 'none'; // Hide the previously opened content
            const previousTab = document.getElementById(this.openedId); // Get the tab element by ID
            previousTab?.classList.remove('active'); // Remove the 'active' class from the previously opened tab
        }

        const activeContentId = this.tabContentMap.get(id); // Get the content ID of the newly opened tab
        const activeContent = document.getElementById(activeContentId!); // Get the content element by ID
        if (activeContent) activeContent.style.display = 'block'; // Display the newly opened content

        const activeTab = document.getElementById(id); // Get the tab element by ID
        activeTab?.classList.add('active'); // Add the 'active' class to the newly opened tab
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
        this.maxNumTabs = newMax;
    }


}
