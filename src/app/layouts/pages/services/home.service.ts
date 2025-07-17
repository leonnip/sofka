import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs';
import {environment} from '../../../../environments/environment.development';

@Injectable({
    providedIn: 'root'
})
export class HomeService {

    private API_URL = environment.apiUrl;

    constructor(
        private httpClient: HttpClient,
    ) {
    }

    /**
     * PRODUCTOS BANCO
     * ---------------
     * Retorna todos los productos
     * que tiene el banco para listar
     * *********************************
     */
    public getProducts() {
        return this.httpClient.get(this.API_URL + '/bp/products').pipe(
            map((res: any) => {
                console.log("response create => ", res);
                return res;
            }),
        );
    }

    public deleteProduct(idProduct: any) {
        let data = {
            id: idProduct,
        }
        return this.httpClient.delete(this.API_URL + '/bp/products/' + idProduct);
    }
}
