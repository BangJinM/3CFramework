import { IReceiver } from "./IReceiver";
import { ISocket } from "./ISocket";
export type MessageReceiveHandler = (cmd: number, bytes: Uint8Array[]) => any;
export class NetClient implements IReceiver {
    private socket: ISocket = null
    private messageHandlerMap: Map<number, MessageReceiveHandler> = new Map()

    constructor(socket: ISocket) {
        this.socket = socket
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