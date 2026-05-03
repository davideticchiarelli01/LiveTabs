const assert = require('node:assert/strict');
const test = require('node:test');

const LiveTabs = require('../dist/LiveTabs.js');

class FakeClassList {
    constructor(element) {
        this.element = element;
        this.classes = new Set();
    }

    add(...classNames) {
        classNames.forEach((className) => this.classes.add(className));
    }

    remove(...classNames) {
        classNames.forEach((className) => this.classes.delete(className));
    }

    contains(className) {
        return this.classes.has(className);
    }

    toString() {
        return Array.from(this.classes).join(' ');
    }
}

class FakeElement {
    constructor(tagName) {
        this.tagName = tagName.toUpperCase();
        this.children = [];
        this.parentNode = null;
        this.style = {};
        this.attributes = new Map();
        this.classList = new FakeClassList(this);
        this.id = '';
        this.draggable = false;
        this.textContent = '';
        this.onclick = null;
        this.onkeydown = null;
        this.ondragstart = null;
        this.ondragend = null;
        this.ondragover = null;
        this.ondragenter = null;
        this.ondragleave = null;
        this.ondrop = null;
        this.rect = {left: 0, right: 100};
    }

    get className() {
        return this.classList.toString();
    }

    set className(value) {
        this.classList.classes = new Set(String(value).split(/\s+/).filter(Boolean));
    }

    get nextSibling() {
        if (!this.parentNode) {
            return null;
        }

        const index = this.parentNode.children.indexOf(this);
        return index === -1 ? null : this.parentNode.children[index + 1] ?? null;
    }

    appendChild(child) {
        child.remove();
        child.parentNode = this;
        this.children.push(child);
        return child;
    }

    prepend(child) {
        child.remove();
        child.parentNode = this;
        this.children.unshift(child);
        return child;
    }

    insertBefore(child, referenceNode) {
        child.remove();
        child.parentNode = this;

        if (!referenceNode) {
            this.children.push(child);
            return child;
        }

        const index = this.children.indexOf(referenceNode);
        if (index === -1) {
            this.children.push(child);
        } else {
            this.children.splice(index, 0, child);
        }

        return child;
    }

    remove() {
        if (!this.parentNode) {
            return;
        }

        const siblings = this.parentNode.children;
        const index = siblings.indexOf(this);
        if (index !== -1) {
            siblings.splice(index, 1);
        }
        this.parentNode = null;
    }

    setAttribute(name, value) {
        const stringValue = String(value);
        if (name === 'class') {
            this.className = stringValue;
            return;
        }
        if (name === 'id') {
            this.id = stringValue;
            return;
        }
        this.attributes.set(name, stringValue);
    }

    getAttribute(name) {
        if (name === 'class') {
            return this.className;
        }
        if (name === 'id') {
            return this.id;
        }
        return this.attributes.get(name) ?? null;
    }

    closest(selector) {
        if (!selector.startsWith('.')) {
            throw new Error(`Unsupported selector in test DOM: ${selector}`);
        }

        const className = selector.slice(1);
        let current = this;
        while (current) {
            if (current.classList.contains(className)) {
                return current;
            }
            current = current.parentNode;
        }

        return null;
    }

    getBoundingClientRect() {
        return this.rect;
    }
}

class FakeDocument {
    constructor() {
        this.body = new FakeElement('body');
    }

    createElement(tagName) {
        return new FakeElement(tagName);
    }

    createElementNS(_namespace, tagName) {
        return new FakeElement(tagName);
    }

    getElementById(id) {
        return findById(this.body, id);
    }
}

function findById(element, id) {
    if (element.id === id) {
        return element;
    }

    for (const child of element.children) {
        const match = findById(child, id);
        if (match) {
            return match;
        }
    }

    return null;
}

function installDom(parentIds = ['root']) {
    const document = new FakeDocument();
    global.document = document;
    global.window = {document};
    global.Element = FakeElement;
    global.HTMLElement = FakeElement;

    for (const id of parentIds) {
        const parent = document.createElement('div');
        parent.id = id;
        document.body.appendChild(parent);
    }

    return document;
}

function withWarnCapture(callback) {
    const originalWarn = console.warn;
    const warnings = [];
    console.warn = (...args) => warnings.push(args.join(' '));

    try {
        callback(warnings);
    } finally {
        console.warn = originalWarn;
    }
}

function createDragEvent(target, dataTransfer, clientX = 0) {
    return {
        target,
        dataTransfer,
        clientX,
        preventDefault() {},
    };
}

function createDataTransfer() {
    const data = new Map();
    return {
        setData(type, value) {
            data.set(type, value);
        },
        getData(type) {
            return data.get(type) ?? '';
        },
    };
}

test('constructor fails fast when the parent does not exist', () => {
    installDom();

    assert.throws(
        () => new LiveTabs({parentDiv: 'missing'}),
        /Parent element with id "missing" not found/
    );
});

test('tab and content ids are scoped and survive sanitized title collisions', () => {
    installDom(['first-root', 'second-root']);

    const first = new LiveTabs({parentDiv: 'first-root'});
    const second = new LiveTabs({parentDiv: 'second-root'});

    first.addTab({tabTitle: 'A!'});
    first.addTab({tabTitle: 'A?'});
    second.addTab({tabTitle: 'A!'});

    assert.equal(first.getTabCount(), 2);
    assert.equal(second.getTabCount(), 1);
    assert.notEqual(first.navbarDiv.id, second.navbarDiv.id);

    const firstIds = first.getAllTabs();
    const secondIds = second.getAllTabs();
    assert.notEqual(firstIds[0], firstIds[1]);
    assert.notEqual(firstIds[0], secondIds[0]);
    assert.ok(firstIds.every((id) => id.startsWith('lt-')));
});

test('exact duplicate titles switch to the existing tab', () => {
    installDom();

    const tabs = new LiveTabs({parentDiv: 'root', maxNumTabs: 2});
    tabs.addTab({tabTitle: 'Dashboard'});
    const dashboardId = tabs.getActiveTab();
    tabs.addTab({tabTitle: 'Settings'});

    assert.equal(tabs.getTabCount(), 2);

    tabs.addTab({tabTitle: 'Dashboard'});

    assert.equal(tabs.getTabCount(), 2);
    assert.equal(tabs.getActiveTab(), dashboardId);
});

test('maxNumTabs zero prevents additions without calling alert', () => {
    installDom();
    const originalAlert = global.alert;
    global.alert = () => {
        throw new Error('alert should not be called');
    };

    try {
        withWarnCapture((warnings) => {
            const tabs = new LiveTabs({parentDiv: 'root', maxNumTabs: 0});
            tabs.addTab({tabTitle: 'Blocked'});

            assert.equal(tabs.getTabCount(), 0);
            assert.match(warnings[0], /Maximum number of tabs reached/);
        });
    } finally {
        global.alert = originalAlert;
    }
});

test('switchTab is public and keeps tab and panel state synchronized', () => {
    installDom();

    const tabs = new LiveTabs({parentDiv: 'root'});
    tabs.addTab({tabTitle: 'One'});
    const firstId = tabs.getActiveTab();
    tabs.addTab({tabTitle: 'Two'});
    const secondId = tabs.getActiveTab();

    assert.notEqual(firstId, secondId);

    tabs.switchTab(firstId);

    const firstPanel = document.getElementById(`${firstId}-container`);
    const secondPanel = document.getElementById(`${secondId}-container`);

    assert.equal(tabs.getActiveTab(), firstId);
    assert.equal(firstPanel.style.display, 'block');
    assert.equal(firstPanel.getAttribute('aria-hidden'), 'false');
    assert.equal(secondPanel.style.display, 'none');
    assert.equal(secondPanel.getAttribute('aria-hidden'), 'true');

    withWarnCapture(() => tabs.switchTab('missing-tab'));
    assert.equal(tabs.getActiveTab(), firstId);
});

test('removeTab cleans title mappings and associated content', () => {
    installDom();

    const tabs = new LiveTabs({parentDiv: 'root'});
    tabs.addTab({tabTitle: 'Reusable'});
    const firstId = tabs.getActiveTab();

    tabs.removeTab(firstId);
    tabs.addTab({tabTitle: 'Reusable'});
    const secondId = tabs.getActiveTab();

    assert.equal(tabs.getTabCount(), 1);
    assert.notEqual(secondId, firstId);
    assert.equal(document.getElementById(firstId), null);
    assert.equal(document.getElementById(`${firstId}-container`), null);
});

test('tab markup avoids nested buttons and close button removes the tab', () => {
    installDom();

    const tabs = new LiveTabs({parentDiv: 'root'});
    tabs.addTab({tabTitle: 'Closable'});
    const tabId = tabs.getActiveTab();
    const tab = document.getElementById(tabId);
    const closeButton = tab.children[1];

    assert.equal(tab.tagName, 'DIV');
    assert.equal(closeButton.tagName, 'BUTTON');

    closeButton.onclick({
        stopPropagation() {},
    });

    assert.equal(tabs.getTabCount(), 0);
    assert.equal(document.getElementById(tabId), null);
});

test('drag start uses the tab element even when dragging from a child node', () => {
    installDom();

    const tabs = new LiveTabs({parentDiv: 'root', allowDragAndDrop: true});
    tabs.addTab({tabTitle: 'First'});
    tabs.addTab({tabTitle: 'Second'});

    const [firstId, secondId] = tabs.getAllTabs();
    const firstTab = document.getElementById(firstId);
    const secondTab = document.getElementById(secondId);
    const closePath = firstTab.children[1].children[0].children[0];
    const dataTransfer = createDataTransfer();

    firstTab.ondragstart(createDragEvent(closePath, dataTransfer));
    assert.equal(dataTransfer.getData('text/plain'), firstId);

    secondTab.rect = {left: 0, right: 100};
    secondTab.ondrop(createDragEvent(secondTab, dataTransfer, 75));

    assert.deepEqual(tabs.getAllTabs(), [secondId, firstId]);
});
