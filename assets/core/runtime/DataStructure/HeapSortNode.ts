export class HeapSortNode {
    /** 在堆中的下标 */
    nodeIndex = -1;

    constructor() {
        this.nodeIndex = -1;
    }

    getSortValue(): number {
        return 0;
    }

    clean() {
        this.nodeIndex = -1;
    }
}
