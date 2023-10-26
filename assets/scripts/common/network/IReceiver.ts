export interface IReceiver {
    Received(cmd: number, bytes: Uint8Array[]): void;
}