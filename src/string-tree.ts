// A text tree consists of Nodes that have a "value" as a string.
// Nodes can either be string types, or an Object that has "child"
// nodes like { "value": { key: value, .... }

export { StringTree, TreeNode, ChildNodes, leafEntries };

import { stringify } from 'wide-json';

type TreeNode = string | { [value: string]: ChildNodes };

interface ChildNodes {
  [key: string]: TreeNode;
}

function nodeValue(node: TreeNode): string {
  if (typeof node === 'string') {
    return node;
  }

  return Object.keys(node)[0];
}

function childNodes(node: TreeNode): ChildNodes {
  return (node as { [value: string]: ChildNodes })[nodeValue(node)];
}

function makeNode(value: string): TreeNode {
  return { [value]: {} };
}

function *leafEntries(node: TreeNode): Generator<[string[], string]> {
  const path: string[] = [];

  yield *emitEntries(node);

  function *emitEntries(node: TreeNode): Generator<[string[], string]> {
    if (typeof node === 'string') {
      yield [path.slice(), node];
      return;
    }

    for (const key in node) {
      path.push(key);
      yield *emitEntries(node[key] as TreeNode);
      path.pop();
    }
  }
}

class Ref {
  parent: ChildNodes;
  key: string;

  constructor(parent: ChildNodes, key: string) {
    this.parent = parent;
    this.key = key;
  }

  getChildNodes(): ChildNodes {
    let node = this.parent[this.key];
    let value = nodeValue(node);
    if (typeof node === 'string') {
      node = makeNode(value);
      this.parent[this.key] = node;
    }
    return childNodes(node);
  }

  ensureChildNode(key: string, value: string): Ref {
    const childNodes = this.getChildNodes();
    if (childNodes[key] === undefined) {
      childNodes[key] = value;
    }
    return new Ref(childNodes, key);
  }
}

class StringTree {
  parent: ChildNodes;

  constructor(start: string) {
    this.parent = { _dummy: start };
  }

  getStartRef(): Ref {
    return new Ref(this.parent, "_dummy");
  }

  rootNode(): TreeNode {
    return this.parent._dummy;
  }

  stringify(): string {
    return stringify(this.rootNode());
  }
}
