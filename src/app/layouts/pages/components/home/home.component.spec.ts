import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { HomeService } from '../../services/home.service';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing'; // Agregar esta importación

describe('HomeComponent', () => {
    // Declaración de variables necesarias para las pruebas
    let component: HomeComponent;
    let fixture: ComponentFixture<HomeComponent>;
    let homeService: jest.Mocked<HomeService>;

    // Datos de pruebas mock para productos
    const mockProducts = [
        { id: 1, name: 'Product 1', description: 'Description 1' },
        { id: 2, name: 'Product 2', description: 'Description 2' },
        { id: 3, name: 'Test Product', description: 'Test Description' }
    ];

    // Configuración que se ejecuta antes de cada prueba
    beforeEach(() => {
        const mockHomeService = {
            getProducts: jest.fn().mockReturnValue(of({ data: [] })),
            deleteProduct: jest.fn().mockReturnValue(of({ message: "Product removed successfully" }))
        };

        TestBed.configureTestingModule({
            imports: [
                HomeComponent,
                RouterTestingModule
            ],
            providers: [
                { provide: HomeService, useValue: mockHomeService }
            ]
        }).compileComponents();
    
        fixture = TestBed.createComponent(HomeComponent);
        component = fixture.componentInstance;
        homeService = TestBed.inject(HomeService) as jest.Mocked<HomeService>;
        fixture.detectChanges();
    });

    // Pruebas de creación de componente
    it('Debería crear', () => {
        expect(component).toBeTruthy();
    });

    // Prueba de carga de productos
    it('Debeería cargar productos al iniciar', () => {
        homeService.getProducts.mockReturnValue(of({ data: mockProducts }));

        component.ngOnInit();

        expect(homeService.getProducts).toHaveBeenCalled();
        expect(component.products).toEqual(mockProducts);
        expect(component.filteredProducts).toEqual(mockProducts);
        expect(component.totalProducts).toBe(3);
    });

    // Suite de pruebas para la funcionalidad de búsqueda
    describe('changeTextField', () => {
        beforeEach(() => {
            // Configuración inicial para cada prueba de búsqueda
            component.products = mockProducts;
            component.filteredProducts = mockProducts;
            component.totalProducts = mockProducts.length;
        });

        // Prueba cuando el texto de búsqueda está vacío
        it('Debería mostrar todos los productos cuando el texto de búsqueda esté vacío', () => {
            const event = { target: { value: '' } };
            component.changeTextField(event);

            expect(component.filteredProducts).toEqual(mockProducts);
            expect(component.totalProducts).toBe(3);
        });

        // Prueba de filtrado por nombre
        it('Debería filtrar los productos por nombre', () => {
            const event = { target: { value: 'Product 1' } };
            component.changeTextField(event);

            expect(component.filteredProducts.length).toBe(1);
            expect(component.filteredProducts[0]).toEqual(mockProducts[0]);
            expect(component.totalProducts).toBe(1);
        });

        // Prueba de filtrado por descripción
        it('Debería filtrar los productos por descripción', () => {
            const event = { target: { value: 'test description' } };
            component.changeTextField(event);

            expect(component.filteredProducts.length).toBe(1);
            expect(component.filteredProducts[0]).toEqual(mockProducts[2]);
            expect(component.totalProducts).toBe(1);
        });

        // Prueba de manejo de valores nulos o indefinidos
        it('Debe manejar valores nulos o indefinidos en las propiedades del producto', () => {
            component.products = [{ id: 1 }]; // Producto sin name ni description
            const event = { target: { value: 'test' } };
            component.changeTextField(event);

            expect(component.filteredProducts.length).toBe(0);
            expect(component.totalProducts).toBe(0);
        });
    });

    // Suite de pruebas para la funcionalidad de eliminación
    describe('deleteProduct', () => {
        // Prueba de configuración del alert de confirmación
        it('Debería configurar una alerta para eliminar el producto', () => {
            const index = 1;
            const name = 'Test Product';

            component.deleteProduct(index, name);

            expect(component.indexDelete).toBe(index);
            expect(component.messageAlert).toBe('Estas seguro de eliminar el producto Test Product?');
            expect(component.showAlert).toBe(true);
        });

        // Prueba de eliminación confirmada
        describe('deleteProduct', () => {
            it('Debería eliminar el producto cuando se confirme', () => {
                const mockResponse = { message: "Product removed successfully" };
                homeService.deleteProduct.mockReturnValue(of(mockResponse));
                homeService.getProducts.mockReturnValue(of({ data: mockProducts }));
                component.indexDelete = 1;

                component.actionDeleteProduct();

                expect(homeService.deleteProduct).toHaveBeenCalledWith(1);
                expect(component.showAlert).toBe(false);
            });
        });
    });
});
