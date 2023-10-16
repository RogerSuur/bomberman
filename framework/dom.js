import { zip } from "./utils.js";

export default class DOMAbstraction {
    constructor(eventManager) {
        this.virtualTree = null;
        this.eventManager = eventManager;

        // Initialization of DOM abstraction,
        // setting up a virtual DOM.
    }

    /**
     * Create a virtual node. Passing any attributes, chilren or listeners is optional.
     *
     * @param {string} tagName node type
     * @param {object} attrs - node attributes
     * @param {array} children - node children
     * @param {object} listeners - node event listeners
     * @returns {object} virtualNode
     * @memberof DOMAbstraction
     */

    createVirtualNode(
        tagName,
        { attrs = {}, children = [], listeners = {} } = {}
    ) {
        return {
            tagName,
            attrs,
            children,
            listeners,
            domElement: null,
        };
    }

    /**
     * Attach an event listener to a virtual node.
     *
     * @param {object} virtualNode
     * @param {string} eventType
     * @param {function} callback
     * @memberof DOMAbstraction
     */
    attachEventListener(virtualNode, eventType, callback) {
        virtualNode.listeners[eventType] = callback;
        this.eventManager.subscribe(eventType, (event) => {
            // Assuming domElement property holds the corresponding
            // actual DOM element
            if (event.target === virtualNode.domElement) {
                callback(event);
            }
        });
    }

    /**
     * Render an element from a virtual node.
     *
     * @param {object} virtualNode
     * @returns {object} domElement
     * @memberof DOMAbstraction
     */
    renderElement(virtualNode) {
        let domElement = virtualNode.domElement;
        if (!domElement) {
            domElement = document.createElement(virtualNode.tagName);
            virtualNode.domElement = domElement;
        }
        for (let attrName in virtualNode.attrs) {
            domElement.setAttribute(attrName, virtualNode.attrs[attrName]);
        }
        for (let child of virtualNode.children) {
            domElement.appendChild(this.render(child));
        }
        for (let eventType in virtualNode.listeners) {
            this.attachEventListener(
                virtualNode,
                eventType,
                virtualNode.listeners[eventType]
            );
        }
        return domElement;
    }

    /**
     * Render a virtual node. When called with a string, it returns a text node.
     *
     * @param {object} virtualNode
     * @returns {object} domElement
     * @memberof DOMAbstraction
     */
    render(virtualNode) {
        if (typeof virtualNode === "string") {
            return document.createTextNode(virtualNode);
        }

        return this.renderElement(virtualNode);
    }

    /**
     * Create a patch function to update attributes.
     *
     * @param {object} oldAttrs
     * @param {object} newAttrs
     * @returns {function} patch
     * @memberof DOMAbstraction
     */
    diffAttrs(oldAttrs, newAttrs) {
        const patches = [];

        // set new attributes
        for (const [k, v] of Object.entries(newAttrs)) {
            patches.push(($node) => {
                $node.setAttribute(k, v);
                return $node;
            });
        }

        // remove old attributes
        for (const k in oldAttrs) {
            if (!(k in newAttrs)) {
                patches.push(($node) => {
                    $node.removeAttribute(k);
                    return $node;
                });
            }
        }

        return ($node) => {
            for (const patch of patches) {
                patch($node);
            }
        };
    }

    /**
     * Create a patch function to update children.
     *
     * @param {array} oldVChildren
     * @param {array} newVChildren
     * @returns {function} patch
     * @memberof DOMAbstraction
     */
    diffChildren(oldVChildren, newVChildren) {
        const childPatches = [];
        for (const [oldVChild, newVChild] of zip(oldVChildren, newVChildren)) {
            childPatches.push(this.diff(oldVChild, newVChild));
        }

        const additionalPatches = [];
        for (const additionalVChild of newVChildren.slice(
            oldVChildren.length
        )) {
            additionalPatches.push(($node) => {
                $node.appendChild(this.render(additionalVChild));
                return $node;
            });
        }

        return ($parent) => {
            const childNodes = Array.from($parent.childNodes);

            for (const [patch, child] of zip(childPatches, childNodes)) {
                patch(child);
            }

            // remove remaining extra child nodes
            for (const child of childNodes.slice(childPatches.length)) {
                child.remove();
            }

            for (const patch of additionalPatches) {
                patch($parent);
            }

            return $parent;
        };
    }

    /**
     * Create a patch function to update node.
     *
     * @param {object} vOldNode
     * @param {object} vNewNode
     * @returns {function} patch
     * @memberof DOMAbstraction
     */
    diff(vOldNode, vNewNode) {
        if (vNewNode === undefined) {
            return ($node) => {
                $node.remove();
                return undefined;
            };
        }

        if (typeof vOldNode === "string" || typeof vNewNode === "string") {
            if (vOldNode !== vNewNode) {
                return ($node) => {
                    const $newNode = this.render(vNewNode);
                    $node.replaceWith($newNode);
                    return $newNode;
                };
            } else {
                return ($node) => undefined;
            }
        }

        if (vOldNode.tagName !== vNewNode.tagName) {
            return ($node) => {
                const $newNode = this.render(vNewNode);
                $node.replaceWith($newNode);
                return $newNode;
            };
        }

        const patchAttrs = this.diffAttrs(vOldNode.attrs, vNewNode.attrs);
        const patchChildren = this.diffChildren(
            vOldNode.children,
            vNewNode.children
        );
        const patchListeners = this.diffAttrs(
            vOldNode.listeners,
            vNewNode.listeners
        );

        return ($node) => {
            patchAttrs($node);
            patchChildren($node);
            patchListeners($node);
            return $node;
        };
    }

    /**
     * Mount a virtual node (tree) to a DOM node.
     *
     * @param {object} $node
     * @param {object} virtualTree
     * @returns {object} $node
     * @memberof DOMAbstraction
     */
    mount($node, virtualTree) {
        this.virtualTree = virtualTree;
        $node.replaceWith(this.render(this.virtualTree));
        return $node;
    }
}
