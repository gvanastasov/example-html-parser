import { HTMLTokenizer, TOKEN_TYPES } from './html-tokenizer.mjs';

class HTMLNode {
  constructor(type, name, attributes = [], parent = null) {
    this.type = type;
    this.name = name;
    this.attributes = attributes;
    this.children = [];
    this.parent = parent;
  }

  // Helper to get an attribute value by name
  getAttribute(name) {
    const attr = this.attributes.find((attr) => attr.name === name);
    return attr ? attr.value : null;
  }

  querySelector(selector) {
    const results = [];
    const selectors = selector.trim().split(/\s+(?![^\[]*\])/); // Split by spaces not inside brackets
    this.traverse(this, selectors, results);
    return results;
  }

  traverse(node, selectors, results) {
    if (selectors.length === 0) return;

    const [currentSelector, ...restSelectors] = selectors;

    if (this.matchesSelector(node, currentSelector)) {
      if (restSelectors.length === 0) {
        results.push(node);
      } else {
        for (const child of node.children) {
          this.traverse(child, restSelectors, results);
        }
      }
    } else if (selectors[0] === '>') {
      if (this.matchesSelector(node, selectors[1])) {
        if (restSelectors.length === 1) {
          results.push(node);
        } else {
          for (const child of node.children) {
            this.traverse(child, restSelectors.slice(1), results);
          }
        }
      }
    } else {
      for (const child of node.children) {
        this.traverse(child, selectors, results);
      }
    }
  }

  matchesSelector(node, selector) {
    if (selector.startsWith('#')) {
      return node.getAttribute('id') === selector.slice(1);
    }
    if (selector.startsWith('.')) {
      const classAttr = node.getAttribute('class');
      return classAttr && classAttr.split(' ').includes(selector.slice(1));
    }
    if (selector.includes('.')) {
      const [tag, className] = selector.split('.');
      return node.name === tag && this.matchesSelector(node, `.${className}`);
    }
    if (selector.includes('[') && selector.includes('=')) {
      const [tag, attrPair] = selector.split('[');
      const [attr, value] = attrPair.slice(0, -1).split('=');
      return node.name === tag && node.getAttribute(attr) === value.replace(/['"]/g, '');
    }

    return node.name === selector;
  }
}

class HTMLParser {
  constructor(html) {
    this.tokenizer = new HTMLTokenizer(html);
    this.root = new HTMLNode('root', 'root');
  }

  parse() {
    const tokens = this.tokenizer.tokenize();
    let currentNode = this.root;

    for (const token of tokens) {
      switch (token.type) {
        case TOKEN_TYPES.TAG_OPEN:
          const newNode = new HTMLNode('element', token.value, token.attributes, currentNode);
          currentNode.children.push(newNode);
          currentNode = newNode;
          break;
        case TOKEN_TYPES.TAG_CLOSE:
          if (currentNode.parent) {
            currentNode = currentNode.parent;
          }
          break;
        case TOKEN_TYPES.TEXT:
          currentNode.children.push(new HTMLNode('text', token.value, [], currentNode));
          break;
        case TOKEN_TYPES.COMMENT:
          currentNode.children.push(new HTMLNode('comment', token.value, [], currentNode));
          break;
      }
    }
    return this.root;
  }
}

export default HTMLParser;
