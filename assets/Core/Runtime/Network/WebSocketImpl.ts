import { Logger } from "../Logger";
import { ISocket } from "./ISocket";

function CheckIP(str: string): boolean {
    return /([0,1]?\d{1,2}|2([0-4][0-9]|5[0-5]))(\.([0,1]?\d{1,2}|2([0-4][0-9]|5[0-5]))){3}/.test(str) ? true : false;
}
export type SocketOptionsCallback = (ev: CloseEvent | Event | MessageEvent) => any;

export class WebSocketImpl implements ISocket {
    private socket: WebSocket;
    private host: string = "";
    private port: number = 0;

    onConnect: SocketOptionsCallback;
    onClose: SocketOptionsCallback;
    onMessage: SocketOptionsCallback;
    onError: SocketOptionsCallback;

    constructor() {
        if (!WebSocket) {
            Logger.error("当前浏览器不支持WebSocket")
        }
    }

    public Connect(host: string, port?: number): void {
        if (this.Connecting()) {
            Logger.error("websocket Connecting!")
            return;
        }

        if (this.IsConnect()) {
            Logger.error("websocket Connected!")
            return;
        }

        this.host = host;
        this.port = port;

        // 如果是ip地址就使用ws连接，否则就是域名使用wss
        let socketServerUrl: string = CheckIP(this.host) ? "ws://" : "wss://" + this.host + (this.port != null ? ":" + this.port : "");

        this.socket = new WebSocket(socketServerUrl);
        this.socket.binaryType = "arraybuffer";

        this.socket.onclose = function (ev: CloseEvent | Event | MessageEvent) {
            if (this.onClose) this.onClose(ev)
        }.bind(this)
        this.socket.onerror = function (ev: CloseEvent | Event | MessageEvent) {
            if (this.onError) this.onError(ev)
        }.bind(this)
        this.socket.onmessage = function (ev: CloseEvent | Event | MessageEvent) {
            if (this.onMessage) this.onMessage(ev)
        }.bind(this)
        this.socket.onopen = function (ev: CloseEvent | Event | MessageEvent) {
            if (this.onConnect) this.onConnect(ev)
        }.bind(this)
    }

    public Send(message: any): void {
        if (!this.IsConnect()) {
            console.warn("socket is not connected")
            return
        }
        this.socket.send(message);
    }

    public Close(): void {
        if (this.socket && (this.IsConnect() || this.Connecting())) this.socket.close();
    }

    public Connecting(): Boolean {
        if (this.socket) return this.socket.readyState == WebSocket.CONNECTING;
        return false;
    }

    public IsConnect(): Boolean {
        if (this.socket) return this.socket.readyState == WebSocket.OPEN;
        return false;
    }

    AddListener(onConnect?, onClose?, onMessage?, onError?) {
        this.onConnect = onConnect;
        this.onClose = onClose;
        this.onMessage = onMessage;
        this.onError = onError;
    }
}