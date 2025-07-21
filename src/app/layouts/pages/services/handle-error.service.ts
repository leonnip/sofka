import {Injectable} from '@angular/core';
import {Observable, throwError} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class HandleErrorService {

    constructor() {
    }

    /**
     * MANEJA ERRORES HTTP
     * -------------------
     * Si existe un error en la
     * petición http retornada un
     * error según el código de error
     * *********************************
     * @param error - Error HTTP recibido
     * @returns Observable que emite el error formateado
     */
    public handleError(error: HttpErrorResponse): Observable<never> {
        let errorMessage = 'Ha ocurrido un error inesperado';

        if (error.error instanceof ErrorEvent) {
            // Error del lado del cliente
            errorMessage = `Error del cliente: ${error.error.message}`;
        } else {
            // Error del lado del servidor
            switch (error.status) {
                case 400:
                    errorMessage = 'Solicitud incorrecta. Verifique los datos enviados.';
                    break;
                case 401:
                    errorMessage = 'No autorizado. Inicie sesión nuevamente.';
                    break;
                case 403:
                    errorMessage = 'Acceso denegado. No tiene permisos suficientes.';
                    break;
                case 404:
                    errorMessage = 'Recurso no encontrado.';
                    break;
                case 500:
                    errorMessage = 'Error interno del servidor. Intente más tarde.';
                    break;
                default:
                    errorMessage = `Error del servidor: ${error.status} - ${error.message}`;
            }
        }

        //console.error('Error en Servicio:', error);
        return throwError(() => new Error(errorMessage));
    }
}
