export class AISStreamClient {
    private socket: WebSocket | null = null;
    private apiKey: string;
    private boundingBox: [[number, number], [number, number]];
    private onMessage: (message: any) => void;
    private onError: (error: any) => void;
    private onStatusChange?: (status: 'connecting' | 'connected' | 'error' | 'disconnected') => void;

    constructor(
        apiKey: string,
        boundingBox: [[number, number], [number, number]],
        onMessage: (message: any) => void,
        onError: (error: any) => void,
        onStatusChange?: (status: 'connecting' | 'connected' | 'error' | 'disconnected') => void
    ) {
        this.apiKey = apiKey;
        this.boundingBox = boundingBox;
        this.onMessage = onMessage;
        this.onError = onError;
        this.onStatusChange = onStatusChange;
    }

    connect() {
        if (this.socket) {
            this.socket.close();
        }

        this.onStatusChange?.('connecting');
        this.socket = new WebSocket("wss://stream.aisstream.io/v0/stream");

        this.socket.onopen = () => {
            this.onStatusChange?.('connected');
            const subscriptionMessage = {
                APIKey: this.apiKey,
                BoundingBoxes: [this.boundingBox],
                FilterMessageTypes: ["PositionReport", "ShipStaticData"]
            };
            this.socket?.send(JSON.stringify(subscriptionMessage));
        };

        this.socket.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                this.onMessage(message);
            } catch (err) {
                console.error("Error parsing AIS message", err);
            }
        };

        this.socket.onerror = (error) => {
            this.onStatusChange?.('error');
            this.onError(error);
        };

        this.socket.onclose = () => {
            this.onStatusChange?.('disconnected');
        };
    }

    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }

    updateBoundingBox(boundingBox: [[number, number], [number, number]]) {
        this.boundingBox = boundingBox;
        // Reconnect to update subscription
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.connect();
        }
    }
}
