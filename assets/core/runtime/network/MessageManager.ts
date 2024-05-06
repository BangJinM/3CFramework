import { ISingleton } from "../ISingleton";
import { IReceiver } from "./IReceiver";
export type MessageReceiveHandler = (cmd: number, bytes: Uint8Array[]) => any;
export class MessageManager implements IReceiver, ISingleton {
    Init() {
    }
    Update(deltaTime: number) {
    }
    Clean() {
        for (const key of this.messageHandlerMap.keys()) {
            this.UnregisterHandler(key)
        }
    }
    Destroy() {
        this.Clean()
    }
    private messageHandlerMap: Map<number, MessageReceiveHandler> = new Map()

    public Received(cmd: number, bytes: Uint8Array[]): void {
        if (!this.messageHandlerMap.has(cmd))
            return

        try {
            this.messageHandlerMap.get(cmd).call(bytes)
        } catch (error) {
            console.error(error)
        }
    }

    public RegisterHandler(cmd: number, messageReceiveHandler: MessageReceiveHandler) {
        if (this.messageHandlerMap.has(cmd))
            return

        this.messageHandlerMap.set(cmd, messageReceiveHandler)
    }
    public UnregisterHandler(cmd: number) {
        if (!this.messageHandlerMap.has(cmd))
            return

        this.messageHandlerMap.delete(cmd)
    }
}