import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, Observable, throwError} from 'rxjs';
import {environment} from '../../../../environments/environment.development';
import {catchError} from 'rxjs/operators';
import {HandleErrorService} from './handle-error.service';

/**
 * Interfaz para definir la estructura completa de un producto
 */
export interface Product {
    id: string;
    name: string;
    description: string;
    logo: string;
    date_release: string;
    date_revision: string;
}

/**
 * Interfaz para los datos de creación/actualización de producto
 */
export interface ProductCreateRequest {
    id: string;
    name: string;
    description: string;
    logo: string;
    date_release: string;
    date_revision: string;
}

/**
 * Interfaz para los datos de actualización de producto (sin ID)
 */
export interface ProductUpdateRequest {
    name: string;
    description: string;
    logo: string;
    date_release: string;
    date_revision: string;
}

@Injectable({
    providedIn: 'root'
})

export class RegisterService {

    private API_URL = environment.apiUrl;

    constructor(
        private httpClient: HttpClient,
        private handleErrorService: HandleErrorService
    ) { }

    /**
     * VALIDACIÓN ID
     * -------------
     * Realiza la validación del Id
     * antes que se cree un nuevo producto
     * **************************************
     * @param productId
     */
    public checkIdExists(productId: string) {
        if (!productId || productId.trim() === '') {
            return throwError(() => new Error('El ID del producto es requerido para la validación'));
        }

        return this.httpClient.get(this.API_URL + '/bp/products/verification/' + productId.trim()).pipe(
            map((response: any) => {
                return response;
            }),
            catchError(this.handleErrorService.handleError.bind(this))
        )
    }

    /**
     * CREAR PRODUCTO
     * --------------
     * Se pasan los datos al servicio
     * para crear un nuevo producto con
     * los nuevos datos ingresados por el cliente
     * ********************************************
     * @param productData
     */
    public setCreateNewProduct(productData: ProductCreateRequest): Observable<Product> {
        return this.httpClient.post<Product>(this.API_URL + '/bp/products', productData).pipe(
            map((response: Product) => response),
            catchError(this.handleErrorService.handleError.bind(this))
        );
    }

    /**
     * DATOS PRODUCTO
     * --------------
     * Retorna los datos del producto
     * que el usuario ha seleccionado
     * ********************************
     * @param productId
     */
    public getProductSpecific(productId: any): Observable<Product> {
        if (!productId || productId.trim() === '') {
            return throwError(() => new Error('El ID del producto es requerido'));
        }

        return this.httpClient.get<Product>(this.API_URL + '/bp/products/' + productId).pipe(
            catchError(this.handleErrorService.handleError.bind(this))
        );
    }

    /**
     * ACTUALIZAR PRODUCTO
     * -------------------
     * Se actualiza el producto
     * con los nuevos datos ingresados
     * *********************************
     * @param productData
     * @param productId
     */
    public setUpdateProduct(productId: any, productData: ProductUpdateRequest): Observable<Product> {
        return this.httpClient.put<Product>(this.API_URL + '/bp/products/' + productId, productData).pipe(
            map((response: Product) => response),
            catchError(this.handleErrorService.handleError.bind(this))
        );
    }
}
