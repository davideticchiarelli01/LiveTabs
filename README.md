# LiveTabs

[![Version](https://img.shields.io/npm/v/livetabs?color=brightgreen)](https://www.npmjs.com/package/livetabs)
[![Bundle Size](https://img.shields.io/bundlephobia/min/livetabs?color=blue)](https://www.npmjs.com/package/livetabs)
[![Downloads](https://img.shields.io/npm/dt/livetabs?color=brightgreen)](https://www.npmjs.com/package/livetabs)
[![License](https://img.shields.io/npm/l/livetabs?color=blue)](https://www.npmjs.com/package/livetabs)

LiveTabs is a small browser tab-management library. It creates tabs inside a target element, manages matching content panels, supports optional close buttons, exposes next/previous/programmatic switching, and can reorder tabs with native drag and drop.

## Install

```bash
npm install livetabs
```

Browser CDN:

```html
<script src="https://cdn.jsdelivr.net/npm/livetabs@1.0.4/dist/LiveTabs.min.js"></script>
```

The npm package publishes the built files in `dist/`:

- `dist/LiveTabs.js`
- `dist/LiveTabs.min.js`
- `dist/LiveTabs.d.ts`

## Usage

Browser global:

```html
<div id="tabs-container"></div>

<script src="https://cdn.jsdelivr.net/npm/livetabs@1.0.4/dist/LiveTabs.min.js"></script>
<script>
  const tabs = new LiveTabs({
    parentDiv: 'tabs-container',
    maxNumTabs: 5,
    allowDragAndDrop: true
  });

  tabs.addTab({
    tabTitle: 'Dashboard',
    addContent: (contentId) => {
      document.getElementById(contentId).textContent = 'Dashboard content';
    }
  });
</script>
```

CommonJS:

```js
const LiveTabs = require('livetabs');
```

TypeScript:

```ts
import LiveTabs = require('livetabs');

const tabs = new LiveTabs({
  parentDiv: 'tabs-container',
  allowDragAndDrop: true,
});
```

## API

### Constructor

```ts
new LiveTabs(options: {
  parentDiv: string;
  maxNumTabs?: number;
  allowDragAndDrop?: boolean;
})
```

- `parentDiv`: ID of the existing DOM element that will receive the tab list and content panels. The constructor throws if the element does not exist.
- `maxNumTabs`: Optional non-negative integer. `0` prevents new tabs. If omitted, there is no limit.
- `allowDragAndDrop`: Enables tab reordering with native drag and drop. Defaults to `false`.

### Methods

```ts
addTab(params: {
  tabTitle: string;
  showCloseButton?: boolean;
  addContent?: (idContent: string) => void;
}): void
```

Adds a tab and creates its associated content panel. Exact duplicate titles switch to the existing tab instead of creating another one. Different titles that sanitize similarly still get unique DOM IDs.

```ts
removeTab(idTab: string): void
removeAllTabs(): void
switchTab(id: string): void
nextTab(): void
previousTab(): void
getActiveTab(): string
getAllTabs(): string[]
getTabCount(): number
setMaxTabs(newMax: number): void
```

`getAllTabs()` returns the generated tab IDs. Pass those IDs to `switchTab()` or `removeTab()`.

## Styling

LiveTabs does not ship CSS. Style these classes in your application:

- `.lt-container`: tab list container, rendered with `role="tablist"`
- `.lt-tab`: individual tab element, rendered with `role="tab"`
- `.lt-tab.active`: active tab
- `.lt-tab-label`: tab title text
- `.lt-tab-close-btn`: close button inside a closable tab
- `.lt-tab.over`: tab receiving a drag-over state
- `.lt-tab-content`: content panel, rendered with `role="tabpanel"`

The repository includes a complete local example in `example/index.html` and `example/css/style.css`.

## Development

```bash
npm install
npm test
npm run build
npm pack --dry-run
```

`npm test` builds the package and runs DOM regression tests from `tests/liveTabs.dom.test.js`.

## License

MIT
