export interface ISocket {
    Connect(url: string): void;
    Connecting(): Boolean;
    Connected(): Boolean;
    Send(message: any): void;
    Close(): void;
}
export type SocketOptionsCallback = (ev: CloseEvent | Event | MessageEvent) => any;
export class SocketOptions {
    /** 连接成功的回调 */
    openCb: SocketOptionsCallback = (e: Event) => {
        console.log('连接成功的默认回调::::', e)
    };
    /** 关闭的回调 */
    closeCb: SocketOptionsCallback = (e: CloseEvent) => {
        console.log('关闭的默认回调::::', e)
    };
    /** 消息的回调 */
    messageCb: SocketOptionsCallback = (e: MessageEvent) => {
        console.log('连接成功的默认回调::::', e)
    };
    /** 错误的回调 */
    errorCb: SocketOptionsCallback = (e: Event) => {
        console.log('错误的默认回调::::', e)
    };
}
