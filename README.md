# LiveTabs

**LiveTabs** is a lightweight, interactive tab management library for web applications. It allows for dynamic tab creation, movement, and removal with easy-to-use methods, plus advanced features such as tab limiting, drag-and-drop functionality, and customizable appearances.

This library is available in both TypeScript and JavaScript versions.

## Table of Contents

1. [Features](#features)
2. [Installation](#installation)
3. [Quick Usage Example](#quick-usage-example)
   - [TypeScript Example](#typescript-example)
   - [JavaScript Example](#javascript-example)
4. [API Reference](#api-reference)
   - [Constructor](#constructor)
   - [Methods](#methods)
5. [Example Use Cases](#example-use-cases)
6. [Styling](#styling)
7. [License](#license)

## Features

- **Dynamic Tab Creation:** Easily create new tabs with titles and content.
- **Tab Management:** Switch between tabs, reorder them, and close them.
- **Tab Limiting:** Set a maximum number of allowed open tabs.
- **Drag and Drop Support:** Reorder tabs by dragging and dropping.
- **Customizable Tab Appearance:** Optionally show close buttons, and enable or disable drag-and-drop.
- **Simple API:** Methods to switch tabs, remove tabs, and get the active tab.

---

## Installation
WIP

## Quick Usage Example
### TypeScript Example

```typescript
import { LiveTabs } from 'livetabs';

const liveTabs = new LiveTabs({
    parentDiv: 'tabs-container',
    maxNumTabs: 5 // Optional: Maximum number of open tabs
});

liveTabs.addTab({
    tabTitle: 'Tab 1',
    showCloseButton: true,
    allowDragAndDrop: true,
    addContent: (contentId: string) => {
        const contentElement = document.getElementById(contentId);
        contentElement.innerHTML = 'Content for Tab 1';
    }
});
```
### Javascript example
```javascript
<div id="tabs-container"></div>

<script src="https://cdn.jsdelivr.net/npm/livetabs@0.1/dist/livetabs.min.js"></script>
<script>
    const liveTabs = new LiveTabs({
        parentDiv: 'tabs-container',
        maxNumTabs: 5 // Optional: Maximum number of open tabs
    });

    liveTabs.addTab({
        tabTitle: 'Tab 1',
        showCloseButton: true,
        allowDragAndDrop: true,
        addContent: (contentId) => {
            const contentElement = document.getElementById(contentId);
            contentElement.innerHTML = 'Content for Tab 1';
        }
    });
</script>
```

## API Reference
### Constructor: 
`LiveTabs(options: { parentDiv: string, maxNumTabs?: number })` <br />
Where:
- **parentDiv (string)**:  
  The ID of the parent container where the tabs will be created (e.g., 'tabs-container').

- **maxNumTabs (number, optional)**:  
  The maximum number of tabs that can be opened at once. Default: No limit.

---

### Methods

- `addTab(params: { tabTitle: string, showCloseButton?: boolean, allowDragAndDrop?: boolean, addContent?: (idContent: string) => void })`  
  Adds a new tab with the given title, and optionally enables a close button and drag-and-drop functionality.  
  You can also provide an addContent callback to populate the content of the tab.

- `removeTab(idTab: string)`  
  Removes the tab with the specified ID and its associated content.

- `removeAllTabs()`  
  Removes all open tabs and their content.

- `switchTab(id: string)`  
  Switches to the specified tab by its ID.

- `nextTab()`  
  Switches to the next tab.

- `previousTab()` <br />
  Switches to the previous tab.
  
- `getActiveTab()`  
  Returns the ID of the currently active tab.

- `getAllTabs()`  
  Returns an array of all tab IDs.

- `getTabCount()`  
  Returns the total number of currently open tabs.

- `setMaxTabs(newMax: number)`  
  Sets a new maximum number of open tabs.
  
## Example Use Cases
1. Dynamically Create Tabs with Content
     You can dynamically create tabs and inject custom content into each one.
      
     ```typescript
      liveTabs.addTab({
          tabTitle: 'New Tab',
          addContent: (contentId) => {
              const contentElement = document.getElementById(contentId);
              contentElement.innerHTML = 'This is a dynamically created tab!';
          }
      });
     ```
2. Limiting the Number of Tabs
    You can limit the number of tabs open at any time.
    
    ```typescript
    const liveTabs = new LiveTabs({
        parentDiv: 'tabs-container',
        maxNumTabs: 3 // set the maximum number of tab allowed (optional)
    });
    ```
3. Reorder Tabs via Drag and Drop
    Enable the drag-and-drop feature to reorder tabs.
    
    ```typescript
    liveTabs.addTab({
        tabTitle: 'Drag Me',
        allowDragAndDrop: true
    });
    ```
4. Switch to Next/Previous Tab
    Switch between tabs programmatically.
  
    ```typescript
    liveTabs.nextTab(); // Switch to the next tab
    liveTabs.previousTab(); // Switch to the previous tab
    ```
## Styling
The tabs and their contents are styled using CSS classes. You can customize the look and feel of the tabs using the following CSS classes:

- `.lt-container`: The container for the tabs.
- `.lt-tab`: A tab button element.
- `.lt-tab.active`: The currently active tab.
- `.lt-tab-close-btn`: The close button inside each tab.
- `.lt-tab-content`: The content area for each tab.
You can also add your custom CSS rules to further tailor the design to fit your application.

## License
LiveTabs is licensed under the MIT License.
