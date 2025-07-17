import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs';
import {environment} from '../../../../environments/environment.development';

@Injectable({
    providedIn: 'root'
})
export class RegisterService {

    private API_URL = environment.apiUrl;

    constructor(
        private httpClient: HttpClient
    ) { }

    /**
     * VALIDACIÓN ID
     * -------------
     * Realiza la validación del Id
     * antes que se cree un nuevo producto
     * **************************************
     * @param id
     */
    public checkIdExists(id: any) {
        return this.httpClient.get(this.API_URL + '/bp/products/verification/' + id).pipe(
            map((data: any) => {
                console.log(data);
                return data;
            })
        )
    }

    /**
     * CREAR PRODUCTO
     * --------------
     * Se pasan los datos al servicio
     * para crear un nuevo producto con
     * los nuevos datos ingresados por el cliente
     * ********************************************
     * @param datas
     */
    public setCreateNewProduct(datas: any) {
        return this.httpClient.post(this.API_URL + '/bp/products', {
                id: datas.id,
                name: datas.name,
                description: datas.description,
                logo: datas.logo,
                date_release: datas.date_release,
                date_revision: datas.date_revision,
            }).pipe(map((res: any) => {
                console.log("response create => ", res);
                return res;
            }),
        );
    }

    /**
     * DATOS PRODUCTO
     * --------------
     * Retorna los datos del producto
     * que el usuario a seleccionado
     * ********************************
     * @param idProduct
     */
    public getProductSpecific(idProduct: any) {
        return this.httpClient.get(this.API_URL + '/bp/products/' + idProduct);
    }

    /**
     * ACTUALIZAR PRODUCTO
     * -------------------
     * Se actualiza el producto
     * con los nuevos datos ingresados
     * *********************************
     * @param datas
     * @param idProduct
     */
    public setUpdateProduct(idProduct: any, datas: any) {
        return this.httpClient.put(this.API_URL + '/bp/products/' + idProduct, {
                name: datas.name,
                description: datas.description,
                logo: datas.logo,
                date_release: datas.date_release,
                date_revision: datas.date_revision,
            }).pipe(map((res: any) => {
                console.log("response create => ", res);
                return res;
            }),
        );
    }
}
