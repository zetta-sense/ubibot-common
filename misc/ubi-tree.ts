import { UbiError } from "../errors/UbiError";
import { EnumAppError } from "../enums/enum-app-error.enum";

const MAX_DEPTH = 20;


/**
 * Ubi named tree.
 * 树结构，目前用于flow控制
 *
 * @export
 * @class UbiTree
 * @template T
 * @author gorebill
 */
export class UbiTree<T> {
    name: string;

    private root: UbiTreeNodeImpl<T>;

    constructor(name: string, treeModel: UbiTreeNode<T>) {
        this.name = name;

        // tag: 根据model构建树
        const rootNode = this.makeNode(treeModel);
        this.root = rootNode;
    }

    private makeNode(treeModel: UbiTreeNode<T>, depth: number = 0): UbiTreeNodeImpl<T> {

        if (depth > MAX_DEPTH) throw new UbiError(EnumAppError.EXCEED_MAX_STACK_DEPTH);

        const node = new UbiTreeNodeImpl(
            treeModel.key,
            treeModel.value,
            null,
        );

        treeModel.children.forEach((v: UbiTreeNode<T>, i: number) => {
            const child = this.makeNode(v, depth + 1);
            child.parent = node;
            node.children.push(child);
        });

        return node;
    }

    /**
     * Find by key, self inclusive.
     *
     * @param {string} key
     * @returns {UbiTreeNode<T>}
     * @memberof UbiTree
     */
    findByKey(key: string): UbiTreeNode<T> {
        return this.findNodeByKey(key, this.root);
    }

    getRoot(): UbiTreeNode<T> {
        return this.root;
    }

    /**
     * If node not found, return null.
     *
     * @param {string} key
     * @returns {UbiTreeNode<T>[]}
     * @memberof UbiTree
     */
    getChildrenOfKey(key: string): UbiTreeNode<T>[] {
        const node = this.findByKey(key);
        return node ? node.children : null;
    }


    /**
     * 根据key深度优先
     *
     * @private
     * @param {string} key
     * @param {UbiTreeNode<T>} tree
     * @returns {UbiTreeNode<T>}
     * @memberof UbiTree
     */
    private findNodeByKey(key: string, node: UbiTreeNode<T>, depth: number = 0): UbiTreeNode<T> {
        console.log(`Matching ${key} with ${node.key}: ${key === node.key}...`);

        if (key === node.key) return node;

        if (depth > MAX_DEPTH) throw new UbiError(EnumAppError.EXCEED_MAX_STACK_DEPTH);

        for (let i = 0; i < node.children.length; i++) {
            const child = node.children[i];
            const found = this.findNodeByKey(key, child, depth + 1);
            if (found) {
                return found;
            }
        }

        return null;
    }
}

export interface UbiTreeNode<T> {
    // 由构建器填写
    parent?: UbiTreeNode<T>;

    key: string;
    value: T;
    children: UbiTreeNode<T>[];
}

class UbiTreeNodeImpl<T> implements UbiTreeNode<T> {
    parent: UbiTreeNodeImpl<T>;

    key: string;
    value: T;
    children: UbiTreeNodeImpl<T>[];

    constructor(key: string, value: T, parent: UbiTreeNodeImpl<T>) {
        this.key = key;
        this.value = value;
        this.children = [];

        this.parent = parent;
    }
}
