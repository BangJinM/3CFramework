import { IReceiver } from "./IReceiver";
export type MessageReceiveHandler = (cmd: number, bytes: Uint8Array[]) => any;
export class MessageManager implements IReceiver {
    private messageHandlerMap: Map<number, MessageReceiveHandler> = new Map()

    static messageManager: MessageManager = null
    static Instance(): MessageManager {
        if (!MessageManager.messageManager)
            MessageManager.messageManager = new MessageManager()

        return MessageManager.messageManager
    }

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