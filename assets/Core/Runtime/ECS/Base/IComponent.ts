
export function set_property_dirty(target: any, propertyKey: string) {
    let originalValue: any;

    // 获取原始的getter和setter
    const descriptor = Object.getOwnPropertyDescriptor(target.prototype, propertyKey)!;
    const originalGetter = descriptor.get;
    const originalSetter = descriptor.set;

    // 创建新的getter和setter
    descriptor.get = originalGetter
    descriptor.set = function (newValue) {
        if (originalValue !== newValue) {
            target?.MarkDirty()
            originalValue = newValue;
            originalSetter?.call(this, newValue)
        }
    };

    // 更新对象的属性描述符
    Object.defineProperty(target, propertyKey, descriptor);
}

export class IComponent {
    dirty = false;

    MarkDirty(): void { this.dirty = true }
    IsDirty(): boolean { return this.dirty }
}
