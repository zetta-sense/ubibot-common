import { UbiError } from "../errors/UbiError";
import { EnumAppError } from "../enums/enum-app-error.enum";

const MAX_DEPTH = 100;

export interface UbiTree<T> {
    label: string;
    value: T;
    children: UbiTree<T>[];
}

export class UbiTreeNode<T> implements UbiTree<T> {
    label: string;
    value: T;
    children: UbiTree<T>[] = [];

    constructor(label: string, value: T) {
        this.label = label;
        this.value = value;
    }

    /**
     * Include self.
     *
     * @param {string} label
     * @returns {UbiTree<T>}
     * @memberof UbiTree
     */
    findFirstByLabel(label: string): UbiTree<T> {
        return this.findByLabel(label, this, 0);
    }


    /**
     * 根据label深度优先
     *
     * @private
     * @param {string} label
     * @param {UbiTree<T>} tree
     * @returns {UbiTree<T>}
     * @memberof UbiTree
     */
    private findByLabel(label: string, tree: UbiTree<T>, depth): UbiTree<T> {
        if (label === tree.label) return tree;

        if (depth > MAX_DEPTH) throw new UbiError(EnumAppError.EXCEED_MAX_STACK_DEPTH);

        for (let i = 0; i < tree.children.length; i++) {
            const child = tree.children[i];
            const found = this.findByLabel(label, child, depth + 1);
            if (found) {
                return found;
            }
        }

        return null;
    }
}
