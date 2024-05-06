import { IReceiver } from "./IReceiver";
import { ISocket, SocketOptions } from "./ISocket";
import { MessageManager } from "./MessageManager";
import { WebSocketImpl } from "./WebSocketImpl";

export class WebSocketClient {
    private socket: ISocket = null
    private messageReceiver: IReceiver = null
    private socketOptions: SocketOptions = null

    constructor(messageReceiver) {
        this.messageReceiver = messageReceiver
        this.socketOptions = new SocketOptions()
        this.socketOptions.openCb = this.OpenCb.bind(this)
        this.socketOptions.closeCb = this.CloseCb.bind(this)
        this.socketOptions.messageCb = this.MessageCb.bind(this)
        this.socketOptions.errorCb = this.ErrorCb.bind(this)
    }

    public Connect(url) {
        if (!this.socket) {
            this.socket = new WebSocketImpl(this.socketOptions)
        }

        if (this.socket.Connecting()) {
            console.log("websocket Connecting!")
            return;
        }

        if (this.socket.Connected()) {
            console.log("websocket Connected!")
            return;
        }

        this.socket.Connect(url);
    }

    public Disconnect(): void {
        if (this.socket) {
            this.socket.Close();
        }
    }

    public Connected(): Boolean {
        return (this.socket && this.socket.Connected());
    }

    public Connecting(): Boolean {
        return (this.socket && this.socket.Connecting());
    }

    Received(cmd: number, bytes: Uint8Array[]): void {
        throw new Error("Method not implemented.");
    }

    OpenCb = (e: Event) => {
        console.log('连接成功的默认回调::::', e)
    };
    CloseCb = (e: CloseEvent) => {
        console.log('关闭的默认回调::::', e)
    }
    MessageCb = (e: MessageEvent) => {
        console.log('连接成功的默认回调::::', e)
        this.messageReceiver.Received(1, [])
    }
    ErrorCb = (e: Event) => {
        console.log('错误的默认回调::::', e)
    }
}