export class MechaHttpResponse<T> {
  public requester: string;
  public requestNumber: number;
  public lastRequestTimestamp: Date | number;
  public data: T;

  constructor({
    requester,
    requestNumber = 1,
    lastRequestTimestamp = new Date(),
    data,
  }: MechaHttpResponseInterface<T>) {
    this.requester = requester;
    this.requestNumber = requestNumber;
    this.lastRequestTimestamp = lastRequestTimestamp;
    this.data = data;
  }
}

export interface MechaHttpResponseInterface<T> {
  requester: string;
  requestNumber: number;
  lastRequestTimestamp?: Date | number;
  data: T;
}