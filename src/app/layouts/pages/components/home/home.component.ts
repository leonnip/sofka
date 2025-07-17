import {Component, OnInit} from '@angular/core';
import {RouterLink, Router} from '@angular/router';
import {HomeService} from '../../services/home.service';
import {AlertComponent} from '../../../../shared/alert/alert.component';
import {DropdownComponent, DropdownOption} from '../../../../shared/dropdown/dropdown.component';
import {FormsModule} from '@angular/forms';

@Component({
    selector: 'app-home',
    imports: [
        RouterLink,
        AlertComponent,
        DropdownComponent,
        FormsModule
    ],
    templateUrl: './home.component.html',
    styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {

    private searchText: string = "";
    private filter = false;
    public totalProducts: number = 0;
    public products: any;
    public showAlert = false;
    public messageAlert: string = "";
    public indexDelete: any;
    public filteredProducts: any;
    public filteredProductsSearch: any;
    public actions = ['Editar', 'Eliminar'];
    public pageSize: number = 5;
    public pageSizeOptions = [5, 10, 20];

    constructor(
        private homeService: HomeService,
        private router: Router
    ) { }

    ngOnInit() {
        this.homeService.getProducts().subscribe((response: any) => {
            this.products = response.data;
            this.filteredProducts = this.products;
            //this.totalProducts = this.products.length ? this.products.length : 0;
            this.onPageSizeChange();
        });
    }

    /**
     * REGISTROS
     * ---------
     * Nos va a mostrar la cantidad
     * de registros seleccionados
     * *******************************
     */
    onPageSizeChange() {
        let products = !this.filter ? this.products : this.filteredProductsSearch;
        this.filteredProducts = products.slice(0, this.pageSize);
        this.totalProducts = this.filteredProducts.length ? this.filteredProducts.length : 0;
    }

    /**
     * BÚSQUEDA PRODUCTO
     * -----------------
     * Según se vaya digitando el nombre
     * del producto se irá realizando una
     * búsqueda interactiva en el listado
     * *************************************
     * @param event
     */
    changeTextField(event: any) {
        const searchText = event && event.target ? event.target.value.toLowerCase() : event;
        this.searchText = searchText;

        /** Si no hay texto en el campo se muestran todos los productos
         * ------------------------------------------------------------ */
        if (!searchText) {
            this.filteredProducts = this.products;
            this.totalProducts = this.products.length;
            this.filter = false;
            this.searchText = '';
            this.onPageSizeChange();
            return;
        }

        /** Cuando ya se va añadiendo texto se va realizando la búsqueda
         * ------------------------------------------------------------- */
        this.filteredProductsSearch = this.products.filter((product: any) => {
            const nameMatch = product.name?.toLowerCase().includes(searchText) || false;
            const descMatch = product.description?.toLowerCase().includes(searchText) || false;
            return nameMatch || descMatch;
        });
        this.filter = true;
        //this.totalProducts = this.filteredProductsSearch.length;
        this.onPageSizeChange();
    }

    /**
     * ACCIÓN SELECCIONADA
     * -------------------
     * Según la acción seleccionada
     * se realiza el proceso siguiente
     * **********************************
     * @param actionSelect
     * @param id
     * @param name
     */
    actionSelectDropdown(actionSelect: string, id: any, name: string) {
        if (actionSelect === 'Editar') {
            this.router.navigate(['/register/' + id]);
        } else {
            this.deleteProduct(id, name);
        }
    }

    /**
     * ELIMINAR PRODUCTO
     * -----------------
     * Se le pasa el index y el nombre
     * para inicializar valores, mostrar
     * modal de confirmación y borrar producto
     * *******************************************
     * @param index
     * @param name
     */
    deleteProduct(index: any, name: string) {
        this.indexDelete = index;
        this.messageAlert = "Estas seguro de eliminar el producto " + name + "?";
        this.showAlert = true;
    }

    /**
     * ACCIÓN ELIMINAR
     * ---------------
     * Si se confirma la acción de
     * eliminar el producto se accede
     * a este metodo para realizar la acción
     * ****************************************
     */
    actionDeleteProduct() {
        this.homeService.deleteProduct(this.indexDelete).subscribe((response: any) => {
            if (response && response.message === "Product removed successfully") {
                this.homeService.getProducts().subscribe((response: any) => {
                    console.info('PRODUCTOS RESULTANTES => ', response.data);
                    this.products = response.data;
                    this.filteredProducts = this.products;
                    this.filteredProductsSearch = this.products;
                    this.changeTextField(this.searchText);
                    this.onPageSizeChange();
                })
            }
        })
        this.showAlert = false;
    }

}
