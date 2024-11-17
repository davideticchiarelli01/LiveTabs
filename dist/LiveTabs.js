"use strict";
/**
 * LiveTabs version 1.0.1
 *
 * @class LiveTabs
 * @description LiveTabs is a TypeScript library for dynamically managing interactive tabs within a web application.
 *              It enables the creation, movement, and closure of tabs, with options to limit the maximum number of tabs
 *              and customize the appearance and behavior of each tab.
 *
 * @version 1.0.1
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
 * @license Proprietary (©2024 Davide Ticchiarelli)
 */
class LiveTabs {
    // Constructor to initialize the LiveTabsTS class
    constructor(options) {
        var _a;
        this.parentDiv = options.parentDiv; // Set the parentDiv from the options
        this.openedId = ''; // Initialize openedId as an empty string
        this.allowDragAndDrop = (_a = options.allowDragAndDrop) !== null && _a !== void 0 ? _a : false; // Default to false if not provided
        this.maxNumTabs = options.maxNumTabs; // Set the maximum number of tabs from the options
        this.tabContentMap = new Map(); // Initialize the map for tab-content relationship
        this.createNavbar(); // Call method to create the navbar for tabs
    }
    // =======================================================
    // NavBar, tab and content creation
    // =======================================================
    /**
     * Creates the navbar where tabs will be displayed.
     *
     * This method retrieves the parent element by its ID and creates a new `div` element for the navbar.
     * If the parent element does not exist, it logs an error and exits the method.
     * The new `div` element is assigned an ID and a CSS class, and is prepended to the parent element.
     */
    createNavbar() {
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
    /**
     * Adds a new tab to the LiveTabs instance.
     *
     * @param {Object} params - The parameters for the new tab.
     * @param {string} params.tabTitle - The title of the new tab.
     * @param {boolean} [params.showCloseButton=true] - Whether to show a close button on the tab.
     * @param {Function} [params.addContent] - A callback function to add content to the tab.
     */
    addTab(params) {
        var _a;
        // Destructure parameters to get tabTitle and optional properties
        const { tabTitle, showCloseButton = true, addContent } = params;
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
        const tab = this.createTab(tabTitle, tabId, showCloseButton);
        (_a = this.navbarDiv) === null || _a === void 0 ? void 0 : _a.appendChild(tab);
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
    /**
     * Creates a new tab element.
     *
     * @param {string} tabTitle - The title of the tab.
     * @param {string} tabId - The unique ID of the tab.
     * @param {boolean} showCloseButton - Whether to show a close button on the tab.
     * @returns {HTMLElement} The created tab element.
     */
    createTab(tabTitle, tabId, showCloseButton) {
        const tab = document.createElement("button"); // Create a new button element to represent the tab
        tab.textContent = tabTitle; // Set the text of the tab to the provided title
        tab.id = tabId; // Set the unique ID of the tab to the provided ID
        tab.className = 'lt-tab active'; // Assign a class to the tab for styling, initially setting it as active
        // Conditionally create and append the close button based on `showCloseButton`
        let closeButton = null; // Declare a variable to hold the close button reference
        if (showCloseButton) {
            closeButton = document.createElement('button');
            // Use the img tag to include the SVG
            const icon = document.createElement('img');
            icon.src = '../assets/images/black-cross.svg'; // Path to the SVG file
            icon.alt = 'Close'; // Optional: Add an alt text for accessibility
            closeButton.appendChild(icon); // Add the icon image to the button
            closeButton.classList.add('lt-tab-close-btn');
            icon.onclick = (event) => {
                event.stopPropagation();
                this.removeTab(tabId);
            };
            tab.appendChild(closeButton);
        }
        if (this.allowDragAndDrop) { // Check if drag-and-drop functionality is enabled
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
    createTabContent(tabId) {
        const parentElement = document.getElementById(this.parentDiv); // Get the parent element by ID
        const tabContentDiv = document.createElement('div'); // Create a new div for the tab content
        tabContentDiv.id = tabId.replace('lt-tab-', '') + '-container'; // Assign content ID
        tabContentDiv.style.display = 'block'; // Set the style to display block
        tabContentDiv.classList.add('lt-tab-content'); // Add a CSS class for styling
        parentElement === null || parentElement === void 0 ? void 0 : parentElement.appendChild(tabContentDiv); // Append the content div to the parent element
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
    dragAndDropTab(tab) {
        tab.draggable = true; // Make the tab draggable
        let dragSrcEl = null;
        tab.ondragstart = (e) => {
            var _a;
            dragSrcEl = e.target;
            if (dragSrcEl) {
                dragSrcEl.style.opacity = '0.4';
                (_a = e.dataTransfer) === null || _a === void 0 ? void 0 : _a.setData("text/plain", dragSrcEl.id);
            }
        };
        tab.ondragend = () => {
            if (dragSrcEl)
                dragSrcEl.style.opacity = '1';
        };
        tab.ondragover = (e) => {
            e.preventDefault();
        };
        tab.ondragenter = (e) => {
            e.preventDefault();
            let dropTarget = e.target.closest('.lt-tab');
            console.log(dropTarget);
            dropTarget.classList.add('over');
        };
        tab.ondragleave = (e) => {
            let dropTarget = e.target.closest('.lt-tab');
            if (dropTarget !== e.target)
                return;
            dropTarget.classList.remove('over');
        };
        tab.ondrop = (e) => {
            var _a, _b, _c;
            e.preventDefault();
            let dropTarget = e.target.closest('.lt-tab');
            if (!dropTarget) {
                dropTarget = tab;
            }
            const draggedId = (_b = (_a = e.dataTransfer) === null || _a === void 0 ? void 0 : _a.getData("text/plain")) !== null && _b !== void 0 ? _b : '';
            const draggedElement = document.getElementById(draggedId);
            // Check to exclude the specific button from being the drop target
            if (draggedElement && dropTarget) {
                const dropTargetRect = dropTarget.getBoundingClientRect(); // Get the bounding rectangle of the drop target
                const center = (dropTargetRect.left + dropTargetRect.right) / 2; // Get the center of the drop target
                const insertBefore = e.clientX <= center; // Check if the cursor is left or right of the center
                // Insert the dragged element before or after the drop target
                (_c = dropTarget.parentNode) === null || _c === void 0 ? void 0 : _c.insertBefore(draggedElement, insertBefore ? dropTarget : dropTarget.nextSibling);
                this.reorderingMap(); // reorder map with new position;
            }
            else {
                console.warn("No valid dragged element or drop target found.");
            }
            dropTarget.classList.remove('over');
        };
    }
    /**
     * Reorders the tabContentMap to reflect the new order of tabs in the DOM.
     */
    reorderingMap() {
        var _a;
        const newOrder = new Map();
        // Get all tabs currently in the DOM
        const tabs = Array.from(((_a = this.navbarDiv) === null || _a === void 0 ? void 0 : _a.children) || []).filter(tab => tab instanceof HTMLElement);
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
    removeTab(idTab) {
        if (!this.tabContentMap.has(idTab)) { // If the tab is not found
            console.warn("Tab not found in the tab-content map for ID:", idTab); // Log a warning
            return; // Exit the method
        }
        const tab = document.getElementById(idTab); // Get the tab element by ID
        tab === null || tab === void 0 ? void 0 : tab.remove(); // Remove the tab element from the DOM
        // Also remove the associated content
        const contentId = this.tabContentMap.get(idTab);
        const contentElement = document.getElementById(contentId);
        contentElement === null || contentElement === void 0 ? void 0 : contentElement.remove();
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
    removeAllTabs() {
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
    switchTab(id) {
        if (this.openedId === id) {
            return;
        } // If the tab is already open, do nothing
        if (this.openedId) { // Check if there is a currently opened tab
            const previousContentId = this.tabContentMap.get(this.openedId); // Get the content ID of the previously opened tab
            const previousContent = document.getElementById(previousContentId); // Get the content element by ID
            if (previousContent)
                previousContent.style.display = 'none'; // Hide the previously opened content
            const previousTab = document.getElementById(this.openedId); // Get the tab element by ID
            previousTab === null || previousTab === void 0 ? void 0 : previousTab.classList.remove('active'); // Remove the 'active' class from the previously opened tab
        }
        const activeContentId = this.tabContentMap.get(id); // Get the content ID of the newly opened tab
        const activeContent = document.getElementById(activeContentId); // Get the content element by ID
        if (activeContent)
            activeContent.style.display = 'block'; // Display the newly opened content
        const activeTab = document.getElementById(id); // Get the tab element by ID
        activeTab === null || activeTab === void 0 ? void 0 : activeTab.classList.add('active'); // Add the 'active' class to the newly opened tab
        this.openedId = id; // Update the currently opened tab ID
    }
    /**
     * Switches to the next tab if it exists.
     *
     * This method retrieves an array of all tab IDs and finds the index of the currently opened tab.
     * If the current tab is not the last one, it switches to the next tab.
     * If the current tab is the last one, it logs a warning.
     */
    nextTab() {
        const tabsArray = this.getAllTabs(); // Retrieve an array of all tab IDs
        const currentIndex = tabsArray.indexOf(this.openedId); // Find the index of the currently opened tab
        // Check if the current tab is not the last one
        if (currentIndex !== -1 && currentIndex < tabsArray.length - 1) {
            const nextTabId = tabsArray[currentIndex + 1]; // Identify the next tab in the array
            this.switchTab(nextTabId); // Switch to the next tab
        }
        else {
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
    previousTab() {
        const tabsArray = this.getAllTabs(); // Retrieve an array of all tab IDs
        const currentIndex = tabsArray.indexOf(this.openedId); // Find the index of the currently opened tab
        // Check if the current tab is not the first one
        if (currentIndex > 0) {
            const prevTabId = tabsArray[currentIndex - 1]; // Identify the previous tab in the array
            this.switchTab(prevTabId); // Switch to the previous tab
        }
        else {
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
    getActiveTab() {
        return this.openedId;
    }
    /**
     * Retrieves an array of all tab IDs.
     *
     * @returns {string[]} An array of all tab IDs.
     */
    getAllTabs() {
        return Array.from(this.tabContentMap.keys());
    }
    /**
     * Gets the total number of tabs.
     *
     * @returns {number} The total number of tabs.
     */
    getTabCount() {
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
    setMaxTabs(newMax) {
        this.maxNumTabs = newMax;
    }
}
