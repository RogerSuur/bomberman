# mini-framework

A project that implements Abstracting the DOM Routing System, State Management and Event Handling, and has an example a `todoMVC` project using that framework.

- [Task description](https://github.com/01-edu/public/tree/master/subjects/bomberman-dom)
- [Audit questions](https://github.com/01-edu/public/tree/master/subjects/bomberman-dom/audit)
- [Bomberman game descriptions](https://bomberman.fandom.com/wiki/Bomberman_(series))

Before running, install the express dependency with `npm install`.

To start the game, run `npm start` and open `http://localhost:8080` in your browser.

# Framework Documentation

## Features of the Mini Framework

1. **Virtual DOM Abstraction**: The Mini Framework provides an abstraction for creating and managing the Document Object Model (DOM). It allows developers to work with a virtual representation of the DOM, making it easier to create, update, and manipulate elements efficiently.

2. **Event Management**: The framework includes a robust event management system. It enables developers to subscribe to and handle events efficiently, ensuring smooth interaction within the application.

3. **State Management**: The State Manager in the framework provides a way to manage the state of your application. You can easily update and retrieve the application's state, making it suitable for building interactive applications.

4. **Routing**: The Mini Framework includes a simple router that allows you to define routes and handle URL changes. This enables building single-page applications with different views.

## Code Examples and Explanations

### Initializing the Framework

To initialize the framework, you need to import the `framework/mini-framework.js` file into your project. This enables you to set up the framework instance and initialize it with the inital state and routing configuration. A sample can be found in the `todoMVC/fwinstance.js` file.

### Creating an Element

To create a virtual DOM element, you can use the `createVirtualNode` method provided by the `fw.dom` module. This method defines virtual nodes as functions that return virtual nodes. It will also take several parameters, including the element's tag name, attributes, children, and event listeners.

```javascript
const Button = (attrs = {}, children = [], listeners = {}) =>
  fw.dom.createVirtualNode("button", {
    attrs: {
      ...attrs,
      style: "background: blue",
    },
    children,
    listeners,
  });
```

In this example, we define a Button component that creates a virtual button element which has a blue background set.

### Adding Attributes to an Element

You can add attributes to an element by specifying them while exporting the property of a virtual node. Here's an example of adding an `id` and a `style` to a button element:

```javascript
const button = fw.dom.createVirtualNode("button", {
  attrs: {
    id: "counter-button",
    style: "background: blue",
  },
  children: ["Click me"],
});
```

Alternatively, you can use the previously defined Button component to create a button element with the same attributes:

```javascript
const button = Button(
  {
    id: "counter-button",
  },
  ["Click me"]
);
```

Note that the background color is set in the Button component definition. This means that all buttons created using the Button component will have a blue background.

### Nesting Elements

You can nest elements by including them in the children property of a virtual node. Here's an example of nesting two `'li' ` elements:

```javascript
const nestedElement1 = fw.dom.createVirtualNode("li", {
  attrs: {
    id: "nested-1",
    style: "background: blue",
  },
});

const nestedElement2 = fw.dom.createVirtualNode("li", {
  attrs: {
    id: "nested-2",
    style: "background: red",
  },
});

// Create the List component and include the child elements
const List = (attrs = {}, children = []) =>
  fw.dom.createVirtualNode("ul", {
    attrs: {
      ...attrs,
    },
    children: [...children],
  });

export default List(
  {
    id: "list",
    style: "background: green",
  },
  [nestedElement1, nestedElement2]
);
```

### Creating Event Listeners

In this example, we have a bigDiv component that represents a `<div>` element. To create a click event, you can use the listeners property when creating the virtual node. Inside the listeners object, you specify the event type (e.g., 'click') as the key and provide a callback function as the value. This callback function will be executed when the element is clicked.

```javascript
const bigDiv = (attrs = {}, listeners = {}) =>
  fw.dom.createVirtualNode("div", {
    attrs,
    listeners,
  });

export default bigDiv(
  { id: "list", style: "background: green; height: 50px; width: 50px" },
  {
    click: () => {
      // Event handling logic
      console.log("Div clicked!");
    },
  }
);
```

### Updating the DOM

First you need to subscribe to the state changes. You can do this by using the `fw.state.subscribe` method. This method takes a callback function as a parameter. This callback function will be executed whenever the state changes. The callback function will optionally receive the updated state as a parameter.

```javascript
fw.state.subscribe("routeChange", (state) => {
  // Update the DOM
});
```

To update the DOM you need to generate new virtual node and pass it to the `fw.dom.diff` method. This method will compare the new virtual node with the previous virtual node and return a `patch` function.

```javascript
fw.state.subscribe("routeChange", (state) => {
    const newVirtualNode = fw.dom.createVirtualNode('div', {
        attrs: {
            id: 'list',
            style: 'background: blue; height: 50px; width: 50px' },
        },
        listeners: {
            click: () => {
                // Event handling logic
                console.log('Div clicked!');
            }
        }
    });

const patch = fw.dom.diff(newVirtualNode, oldVirtualNode);
```

Finally, you need to retrieve the element you want to update and pass it into the `patch` function. This will update the DOM with the new virtual node.

```javascript
const element = document.getElementById("list");
patch(element);
```

Remember to update the `oldVirtualNode` with the new virtual node after updating the DOM.

```javascript
oldVirtualNode = newVirtualNode;
```

### State Management

You can retrieve the state of your application by using the `fw.state.getState` method. This method will return the state object.

```javascript
const state = fw.state.getState();
```

To update the state of your application, you need to use the `fw.state.setState` method. This method takes an object as a parameter. This object will be merged with the current state object.

```javascript
fw.state.setState({
  count: 1,
});
```

After updating the state, remember to notify the subscribers by using the `fw.state.notify` method. This method takes a string as a parameter. This string will be used to identify the state change and all components that have subscribed to this state change will be notified, and their callback functions will be executed (resulting in re-rendering of the DOM, usually).

```javascript
fw.state.notify("countChange");
```

## Structure

### framework

The framework is in the `framework` folder. It has the following structure:

- `mini-framework.js`: the main file that exports the framework
- `dom.js`: the virtual dom module
- `router.js`: the router module
- `state.js`: the state management module
- `events.js`: the pubsub (or observer or event handling) module
- `utils.js`: some utility functions

### todoMVC

The todoMVC project is in the `todoMVC` folder. It has the following structure:

- `app.js`: the main script file that runs the todoMVC app
- `fwinstance.js`: the framework instance that is shared between the files of the todoMVC app
- `components\`: the components folder for the todoMVC app

The app and the components must import the framework instance from `fwinstance.js` to use the framework.

### Server

The server is in the `server.js` file. It serves the `.html` and `.css` files in the the respective folder referenced in the url. It is a simple server that is not meant to be used in production. It is only meant to serve the files in this project.
