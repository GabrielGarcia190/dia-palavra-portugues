export interface IResponseData<T> {
    data: T;
    message: string;
    error: string;
    success: boolean;
}