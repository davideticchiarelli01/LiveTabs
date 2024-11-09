"use strict";
/**
 * LiveTabsTS version 0.1
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
 * @methods
 * - `addTab`: Adds a new tab with a specified title and content, allowing the addition of a close button and enabling drag-and-drop functionality.
 * - `removeTab`: Removes an existing tab and its associated content, switching to another tab if necessary.
 * - `switchTab`: Switches to a specified tab, updating the displayed content.
 * - `dragAndDropTab`: Enables reordering of tabs through drag-and-drop.
 * - `reorderingMap`: Updates the tab-content association map based on the current tab order.
 * - `createNavbar`: Creates the navbar for the tabs inside the parent container.
 * - `createTab`: Creates and returns a tab button element.
 * - `createTabContent`: Creates a content container for a tab.
 * - `removeAllTabs`: Removes all open tabs and their associated content.
 * - `nextTab`: Switches to the next tab in the list.
 * - `previousTab`: Switches to the previous tab in the list.
 * - `getActiveTab`: Returns the currently active tab element.
 * - `getAllTabs`: Returns an array of all tab IDs.
 * - `getTabCount`: Returns the number of currently opened tabs.
 * - `setMaxTabs`: Sets the maximum number of tabs allowed.
 *
 * @dependencies None.
 * @license Proprietary (©2024 Davide Ticchiarelli)
 */
class LiveTabs {
    // Constructor to initialize the LiveTabsTS class
    constructor(options) {
        this.parentDiv = options.parentDiv; // Set the parentDiv from the options
        this.openedId = ''; // Initialize openedId as an empty string
        this.maxNumTabs = options.maxNumTabs; // Set the maximum number of tabs from the options
        this.tabContentMap = new Map(); // Initialize the map for tab-content relationship
        this.createNavbar(); // Call method to create the navbar for tabs
    }
    // =======================================================
    // NavBar, tab and content creation
    // =======================================================
    // Method to create the navbar where tabs will be displayed
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
    // Method to add a new tab
    addTab(params) {
        var _a;
        // Destructure parameters to get tabTitle and optional properties
        const { tabTitle, showCloseButton = true, allowDragAndDrop = true, callback } = params;
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
        (_a = this.navbarDiv) === null || _a === void 0 ? void 0 : _a.appendChild(tab);
        this.createTabContent(tabId); // Create a corresponding content area for the new tab
        const idContent = `${sanitizedId}-container`; // Generate a unique content div ID for storing content related to this tab
        this.tabContentMap.set(tabId, idContent); // Map the tab ID to its corresponding content div ID
        // If a callback function is provided, execute it to inject content into the new content div
        if (callback) {
            callback(idContent); // Pass the content div ID to the callback
        }
        // Switch to the newly created tab after it has been added
        this.switchTab(tabId); // Activate the new tab
    }
    createTab(tabTitle, tabId, showCloseButton, allowDragAndDrop) {
        const tab = document.createElement("button"); // Create a new button element to represent the tab
        tab.textContent = tabTitle; // Set the text of the tab to the provided title
        tab.id = tabId; // Set the unique ID of the tab to the provided ID
        tab.className = 'lt-tab active'; // Assign a class to the tab for styling, initially setting it as active
        // Conditionally create and append the close button based on `showCloseButton`
        let closeButton = null; // Declare a variable to hold the close button reference
        if (showCloseButton) { // If `showCloseButton` is true, create the close button
            closeButton = document.createElement('button'); // Create the close button element
            closeButton.textContent = 'x'; // Set the text of the close button to 'x'
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
    createTabContent(tabId) {
        const parentElement = document.getElementById(this.parentDiv);
        const tabContentDiv = document.createElement('div');
        tabContentDiv.id = tabId.replace('lt-tab-', '') + '-container'; // Assign content ID
        tabContentDiv.style.display = 'block'; // Set the style to display block
        tabContentDiv.classList.add('lt-tab-content');
        parentElement === null || parentElement === void 0 ? void 0 : parentElement.appendChild(tabContentDiv);
    }
    // =======================================================
    // Tab Reordering With DragAndDrop
    // =======================================================
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
            e.target.classList.add('over');
        };
        tab.ondragleave = (e) => {
            e.target.classList.remove('over');
        };
        tab.ondrop = (e) => {
            var _a, _b;
            e.preventDefault();
            let dropTarget = e.target;
            // If dropTarget is a button inside the tab, find the parent tab
            if (dropTarget.tagName === 'BUTTON' && dropTarget.parentElement === tab) {
                dropTarget = tab; // Set the parent tab as the drop target
            }
            const draggedId = (_a = e.dataTransfer) === null || _a === void 0 ? void 0 : _a.getData("text/plain");
            const draggedElement = document.getElementById(draggedId || '');
            // Check to exclude the specific button from being the drop target
            if (draggedElement && dropTarget && draggedElement !== dropTarget) {
                const dropTargetRect = dropTarget.getBoundingClientRect();
                const center = (dropTargetRect.left + dropTargetRect.right) / 2;
                // Check if the cursor is left or right of the center
                const insertBefore = e.clientX < center;
                // Insert the dragged element before or after the drop target
                (_b = dropTarget.parentNode) === null || _b === void 0 ? void 0 : _b.insertBefore(draggedElement, insertBefore ? dropTarget : dropTarget.nextSibling);
                this.reorderingMap(); // reorder map with new position;
            }
            else {
                console.warn("No valid dragged element or drop target found.");
            }
            dropTarget.classList.remove('over');
        };
    }
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
    // Method to remove a tab
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
        if (tabsArray.length < 0) {
            this.openedId = ''; // Clear openedId if no tabs are left
            return;
        }
        // Determine the index of the removed tab
        const removedTabIndex = tabsArray.indexOf(idTab); // This will give the index of the removed tab
        const nextTabIndex = removedTabIndex + 1; // Calculate the next tab index
        // Switch to the next tab if it exists, otherwise to the previous tab
        const switchToTabId = nextTabIndex < tabsArray.length ? tabsArray[nextTabIndex] : tabsArray[removedTabIndex - 1];
        if (switchToTabId) {
            this.switchTab(switchToTabId); // Switch to the determined tab
        }
    }
    removeAllTabs() {
        this.tabContentMap.forEach((contentId, tabId) => {
            this.removeTab(tabId);
        });
    }
    // =======================================================
    // Tab Switching
    // =======================================================
    // Method to switch to a specific tab
    switchTab(id) {
        if (this.openedId === id)
            return;
        if (this.openedId) {
            const previousContentId = this.tabContentMap.get(this.openedId);
            const previousContent = document.getElementById(previousContentId);
            if (previousContent)
                previousContent.style.display = 'none';
            const previousTab = document.getElementById(this.openedId);
            previousTab === null || previousTab === void 0 ? void 0 : previousTab.classList.remove('active');
        }
        const activeContentId = this.tabContentMap.get(id);
        const activeContent = document.getElementById(activeContentId);
        if (activeContent)
            activeContent.style.display = 'block';
        const activeTab = document.getElementById(id);
        activeTab === null || activeTab === void 0 ? void 0 : activeTab.classList.add('active');
        this.openedId = id;
    }
    // Method to switch to the next tab, if you're not on the last tab
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
    // Method to switch to the previous tab, if you're not on the first tab
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
    getActiveTab() {
        return this.openedId;
    }
    getAllTabs() {
        return Array.from(this.tabContentMap.keys());
    }
    getTabCount() {
        return this.tabContentMap.size;
    }
    // =======================================================
    // Setter
    // =======================================================
    setMaxTabs(newMax) {
        this.maxNumTabs = newMax;
    }
}
