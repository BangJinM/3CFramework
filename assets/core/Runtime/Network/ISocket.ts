export interface ISocket {
    Connect(url: string): void;
    Connecting(): Boolean;
    IsConnect(): Boolean;
    Send(message: any): void;
    Close(): void;
    AddListener(onConnect?, onClose?, onMessage?, onError?): void;
}
