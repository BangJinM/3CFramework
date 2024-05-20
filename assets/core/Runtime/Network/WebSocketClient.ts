import { IReceiver } from "./IReceiver";
import { ISocket } from "./ISocket";
import { WebSocketImpl } from "./WebSocketImpl";

export class WebSocketClient {
    private socket: ISocket = null
    private messageReceiver: IReceiver = null

    constructor(messageReceiver) {
        this.messageReceiver = messageReceiver
    }

    public Connect(url) {
        if (!this.socket) {
            this.socket = new WebSocketImpl()
        }

        if (this.socket.Connecting()) {
            console.log("websocket Connecting!")
            return;
        }

        if (this.socket.IsConnect()) {
            console.log("websocket Connected!")
            return;
        }

        this.socket.AddListener(this.OnOpen.bind(this), this.OnClose.bind(this), this.OnMessage.bind(this), this.OnError.bind(this))
        this.socket.Connect(url);
    }

    public Disconnect(): void {
        if (this.socket) {
            this.socket.Close();
        }
    }

    public Connected(): Boolean {
        return (this.socket && this.socket.IsConnect());
    }

    public Connecting(): Boolean {
        return (this.socket && this.socket.Connecting());
    }

    Received(cmd: number, bytes: Uint8Array[]): void {
        throw new Error("Method not implemented.");
    }

    OnOpen(e: Event) {
        console.log('连接成功的默认回调::::', e)
    }
    OnClose(e: CloseEvent) {
        console.log('关闭的默认回调::::', e)
    }
    OnMessage(e: MessageEvent) {
        console.log('连接成功的默认回调::::', e)
        this.messageReceiver.Received(1, [])
    }
    OnError(e: Event) {
        console.log('错误的默认回调::::', e)
    }
}