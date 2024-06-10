
export class IComponent {
    dirty = false;

    MarkDirty(): void { this.dirty = true }
    IsDirty(): boolean { return this.dirty }
}
