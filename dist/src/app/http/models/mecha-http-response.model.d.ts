export declare class MechaHttpResponse<T> {
    requester: string;
    requestNumber: number;
    lastRequestTimestamp: Date | number;
    data: T;
    constructor({requester, requestNumber, lastRequestTimestamp, data}: MechaHttpResponseInterface<T>);
}
export interface MechaHttpResponseInterface<T> {
    requester: string;
    requestNumber: number;
    lastRequestTimestamp?: Date | number;
    data: T;
}
