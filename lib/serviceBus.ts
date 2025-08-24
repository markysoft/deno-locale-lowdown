// serviceBus.ts
type MessageHandler = (msg: any) => void;

class ServiceBus {
  private bus = new Map<string, MessageHandler[]>();

  subscribe(sessionId: string, handler: MessageHandler) {
    if (!this.bus.has(sessionId)) {
      this.bus.set(sessionId, []);
    }
    this.bus.get(sessionId)!.push(handler);
  }

  publish(sessionId: string, msg: any) {
    const handlers = this.bus.get(sessionId);
    if (handlers) {
      handlers.forEach(handler => handler(msg));
    }
  }

  unsubscribe(sessionId: string, handler: MessageHandler) {
    const handlers = this.bus.get(sessionId);
    if (handlers) {
      this.bus.set(sessionId, handlers.filter(h => h !== handler));
    }
  }
}

export const serviceBus = new ServiceBus();
