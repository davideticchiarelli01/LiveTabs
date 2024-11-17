# LiveTabs

**LiveTabs** is a lightweight, interactive tab management library for web applications. It allows for dynamic tab creation, movement, and removal with easy-to-use methods, plus advanced features such as tab limiting, drag-and-drop functionality, and customizable appearances.



## Table of Contents

1. [Features](#features)
2. [Installation](#installation)
3. [Quick Usage Example](#quick-usage-example)
   - [JavaScript Example](#javascript-example)
4. [API Reference](#api-reference)
   - [Constructor](#constructor)
   - [Methods](#methods)
5. [Example Use Cases](#example-use-cases)
6. [Styling](#styling)
7. [License](#license)

## Demo
[Demo](https://codepen.io/Davide-Ticchiarelli-the-sans/pen/abePKpy)
## Features

- **Dynamic Tab Creation:** Create new tabs effortlessly, each with customizable titles and content.
- **Tab Management:** Switch between tabs, reorder them, and close them.
- **Tab Limiting:** Set a maximum number of allowed open tabs.
- **Drag and Drop Support:** Reorder tabs easily by dragging and dropping (if enabled).
- **Customizable Tab Appearance:** Optionally display close buttons on tabs.
- **Simple API:** Includes methods to switch, remove, and get the active tab.

## Installation
- Download: Download the JavaScript and include it in your project.
- CDN: Use the following CDN link to include the library directly in your HTML file <br/>
   
   **JavaScript**: 
   ```html
   <script src="https://cdn.jsdelivr.net/npm/livetabs@1.0.1/dist/LiveTabs.min.js"></script>
   ```

- NPM: Install LiveTabs via NPM
  `npm install livetabs`

## Quick Usage Example
To get started with LiveTabs, follow the example below to create a simple tabbed interface in your web application.
### Javascript example
```javascript
<div id="tabs-container"></div> <!-- Target div where the navbar is injected -->

<script src="https://cdn.jsdelivr.net/gh/davideticchiarelli01/LiveTabs@master/LiveTabs.js"></script>
<script>
    const liveTabs = new LiveTabs({
        parentDiv: 'tabs-container',
        maxNumTabs: 5 // Optional: Maximum number of open tabs
        allowDragAndDrop: true, // Optional: it is set to false by default
    });

    liveTabs.addTab({
        tabTitle: 'Tab 1',
        showCloseButton: true,
        addContent: (contentId) => {
            const contentElement = document.getElementById(contentId);
            contentElement.innerHTML = 'Content for Tab 1';
        }
    });
</script>
```

## API Reference
### Constructor: 
`LiveTabs(options: { parentDiv: string, maxNumTabs?: number, allowDragAndDrop?: boolean})` <br />
Where:
- **parentDiv** (string):  
  The ID of the div where you want to create the tab container (e.g., `tabs-container`).

- **maxNumTabs** (number, optional):  
  The maximum number of tabs that can be opened at once. If not specified, there is no limit.

- **allowDragAndDrop** (boolean, optional, default = `false`):  
  Enables drag-and-drop functionality for reordering tabs when set to true. Defaults to false.

### Methods

- `addTab(params: { tabTitle: string, showCloseButton?: boolean, addContent?: (idContent: string) => void })`  
  Adds a new tab with the specified title. Optionally, enables a close button who is enabled by default. You can also provide an addContent callback to populate the content of the tab.

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
1. **Dynamically Create Tabs with Content** <br/>
     You can dynamically create tabs and inject custom content into each one.
      
     ```javascript
      liveTabs.addTab({
          tabTitle: 'New Tab',
          addContent: (contentId) => {
              const contentElement = document.getElementById(contentId);
              contentElement.innerHTML = 'This is a dynamically created tab!';
          }
      });
     ```
2. **Limiting the Number of Tabs** <br/>
    You can limit the number of tabs open at any time.
    
    ```javascript
    const liveTabs = new LiveTabs({
        parentDiv: 'tabs-container',
        maxNumTabs: 3 // set the maximum number of tab allowed (optional)
    });
    ```
3. **Allow Drag and Drop** <br/>
    Enable the drag-and-drop feature to reorder tabs.
    
    ```javascript
    const liveTabs = new LiveTabs({
        parentDiv: 'tabs-container',
        maxNumTabs: 3, // set the maximum number of tab allowed (optional)
        allowDragAndDrop: true // default: false
    });
    ```
5. **Switch to Next/Previous Tab** <br/>
    Switch between tabs programmatically.
  
    ```javascript
    liveTabs.nextTab(); // Switch to the next tab
    liveTabs.previousTab(); // Switch to the previous tab
    ```
## Styling
The tabs and their contents are styled using CSS classes. You can customize the look and feel of the tabs using the following CSS classes:

- `.lt-container`: The container for the tabs.
- `.lt-tab`: A tab button element.
- `.lt-tab.active`: The currently active tab.
- `.lt-tab.over`: The tab hovered by another during drag-and-drop.
- `.lt-tab-close-btn`: The close button inside each tab.
- `.lt-tab-content`: The content area for each tab.
You can also add your custom CSS rules to further tailor the design to fit your application.

## License
LiveTabs is licensed under the MIT License.
