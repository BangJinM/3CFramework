import { HeapSortNode } from "./HeapSortNode";

/** 
 * 堆排序 
 */
export class HeapSortArray {
    private heap: HeapSortNode[] = [];

    /** 
     * 添加元素到堆中
     */
    add(data: HeapSortNode) {
        data.nodeIndex = this.heap.length;
        this.heap.push(data);
        this.bubbleUp(this.heap.length - 1);
    }

    /** 
     * 删除堆顶元素，并重新调整堆
     */
    deleteMin(): HeapSortNode {
        if (this.heap.length === 0) return null;

        if (this.heap.length === 1) {
            return this.heap.pop();
        }

        // 将最后一个元素移动到堆顶
        const lastElement = this.heap.pop();
        const root = this.heap[0];
        lastElement.nodeIndex = 0;

        // 如果最后一个元素比堆顶元素小，则直接替换堆顶并结束
        if (lastElement.getSortValue() <= root.getSortValue()) {
            this.heap[0] = lastElement;
            return root;
        }

        // 否则将堆顶元素移到末尾，并对新的堆顶执行下沉操作
        this.heap[0] = lastElement;
        this.bubbleDown(0);

        return root;
    }

    /**
     * 获取堆顶元素
     */
    getMinGrid(): HeapSortNode | null {
        return this.deleteMin();
    }

    length() {
        return this.heap.length;
    }

    clear() {
        this.heap.length = 0;
    }

    /** 
     * 上浮操作：将元素从其当前位置调整至正确位置
     */
    private bubbleUp(index: number): void {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            const parent = this.heap[parentIndex];
            const current = this.heap[index];

            // 如果当前元素小于其父节点，则交换它们的位置
            if (current.getSortValue() < parent.getSortValue()) {
                [this.heap[parentIndex], this.heap[index]] = [current, parent];
                current.nodeIndex = parentIndex;
                parent.nodeIndex = index;
                index = parentIndex;
            } else {
                break;
            }
        }
    }

    /**
     * 下沉操作：将元素从堆顶向下调整至正确位置
     */
    private bubbleDown(currentIndex: number): void {
        const current = this.heap[currentIndex];

        let smallerChildIndex = 0;
        while ((smallerChildIndex = (currentIndex * 2) + 1) < this.heap.length) {
            const rightChildIndex = (currentIndex * 2) + 2;

            // 找出两个子节点中较小的一个
            if (rightChildIndex < this.heap.length && this.heap[rightChildIndex].getSortValue() < this.heap[smallerChildIndex].getSortValue()) {
                smallerChildIndex = rightChildIndex;
            }

            const smallerChild = this.heap[smallerChildIndex];
            // 如果当前元素大于或等于其较小子节点，则交换它们的位置
            if (current.getSortValue() >= smallerChild.getSortValue()) {
                [this.heap[currentIndex], this.heap[smallerChildIndex]] = [smallerChild, current];
                current.nodeIndex = smallerChildIndex;
                smallerChild.nodeIndex = currentIndex;
                currentIndex = smallerChildIndex;
            } else {
                break;
            }
        }
    }

    /**
     * 更新指定节点的值并重新调整其在堆中的位置
     */
    updateNode(nodeToUpdate: HeapSortNode): void {
        if (nodeToUpdate.nodeIndex > 0) {
            if (nodeToUpdate.getSortValue() < this.heap[Math.floor((nodeToUpdate.nodeIndex - 1) / 2)].getSortValue()) {
                this.bubbleUp(nodeToUpdate.nodeIndex);
            } else {
                this.bubbleDown(nodeToUpdate.nodeIndex);
            }
        }
    }
}
