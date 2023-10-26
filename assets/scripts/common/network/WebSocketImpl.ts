import { ISocket, SocketOptions, SocketOptionsCallback } from "./ISocket";

function CheckIP(str: string): boolean {
    return /([0,1]?\d{1,2}|2([0-4][0-9]|5[0-5]))(\.([0,1]?\d{1,2}|2([0-4][0-9]|5[0-5]))){3}/.test(str) ? true : false;
}

export class WebSocketImpl implements ISocket {
    private socket: WebSocket = null
    private socketOptions: SocketOptions = null

    constructor(socketOptions: SocketOptions) {
        this.socketOptions = socketOptions
    }

    Connect(url: string): void {
        if (!('WebSocket' in window)) {
            throw new Error('当前浏览器不支持，无法使用')
        }
        if (!url) {
            throw new Error('地址不存在，无法建立通道')
        }
        this.socket = new WebSocket(url)
        let thisSocketImpl = this
        this.socket.onopen = (e: Event) => {
            console.log('连接成功的默认回调::::', e)
            if (thisSocketImpl.socketOptions.openCb)
                thisSocketImpl.socketOptions.openCb.call(e)
        };
        this.socket.onclose = (e: CloseEvent) => {
            console.log('关闭的默认回调::::', e)
            if (thisSocketImpl.socketOptions.closeCb)
                thisSocketImpl.socketOptions.closeCb.call(e)
        }
        this.socket.onmessage = (e: Event) => {
            console.log('错误的默认回调::::', e)
            if (thisSocketImpl.socketOptions.messageCb)
                thisSocketImpl.socketOptions.messageCb.call(e)
        }
        this.socket.onerror = (e: MessageEvent) => {
            console.log('连接成功的默认回调::::', e)
            if (thisSocketImpl.socketOptions.errorCb)
                thisSocketImpl.socketOptions.errorCb.call(e)
        }
    }

    Connecting(): Boolean {
        if (this.socket)
            return this.socket.readyState == WebSocket.CONNECTING
        return false
    }
    Connected(): Boolean {
        if (this.socket)
            return this.socket.readyState == WebSocket.OPEN
        return false
    }
    Send(message: any): void {
        if (!this.Connected()) {
            console.warn("socket is not Connected")
            return
        }
        this.socket.send(message)
    }
    Close(): void {
        if (this.socket && (this.Connected() || this.Connecting())) {
            this.socket.close()
        }
    }
}