import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, Observable, throwError} from 'rxjs';
import {environment} from '../../../../environments/environment.development';
import {catchError} from 'rxjs/operators';
import {HandleErrorService} from './handle-error.service';

/**
 * Interfaz para definir la estructura de un producto
 */
export interface Product {
    id: string;
    name: string;
    description?: string;
    logo: string;
    date_release: string;
    date_revision: string;
}

@Injectable({
    providedIn: 'root'
})
export class HomeService {

    // Propiedades inmutables
    private readonly API_URL = environment.apiUrl;

    constructor(
        private httpClient: HttpClient,
        private handleErrorService: HandleErrorService,
    ) {
    }

    /**
     * PRODUCTOS BANCO
     * ---------------
     * Retorna todos los productos
     * que tiene el banco para listar
     * *********************************
     */
    public getProducts(): Observable<Product[]> {
        return this.httpClient.get(this.API_URL + '/bp/products').pipe(
            map((res: any) => {
                return res;
            }), catchError(this.handleErrorService.handleError.bind(this))
        );
    }


    /**
     * BORRAR PRODUCTO
     * ---------------
     * Borra el producto en el back
     * y retorna el resultado al usuario
     * ***********************************
     * @param productId
     */
    public deleteProduct(productId: any): Observable<any> {
        if (!productId || productId.trim() === '') {
            return throwError(() => new Error('El ID del producto es requerido'));
        }

        let data = {
            id: productId,
        }
        return this.httpClient.delete(this.API_URL + '/bp/products/' + productId).pipe(
            catchError(this.handleErrorService.handleError.bind(this))
        );
    }
}
