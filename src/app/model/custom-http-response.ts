
//como interfaz para que sea inmodificable
export interface CustomHttpResponse {
    httpStatusCode:number;
    httpStatus:string;
    reason:string;
    message:string;

}