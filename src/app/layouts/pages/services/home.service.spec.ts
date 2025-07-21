import { TestBed } from '@angular/core/testing';
import { HomeService, Product } from './home.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HandleErrorService } from './handle-error.service';
import { environment } from '../../../../environments/environment.development';

describe('HomeService', () => {
    let service: HomeService;
    let httpMock: HttpTestingController;
    let handleErrorService: HandleErrorService;

    const mockProducts: Product[] = [
        {
            id: 'test123',
            name: 'Test Product',
            description: 'Test Description',
            logo: 'test-logo.png',
            date_release: '2024-02-20',
            date_revision: '2025-02-20'
        }
    ];

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                HomeService,
                HandleErrorService
            ]
        });

        service = TestBed.inject(HomeService);
        httpMock = TestBed.inject(HttpTestingController);
        handleErrorService = TestBed.inject(HandleErrorService);
    });

    afterEach(() => {
        httpMock.verify(); // Verifica que no haya solicitudes pendientes
    });

    it('Debería crear el servicio', () => {
        expect(service).toBeTruthy();
    });

    describe('getProducts', () => {
        /** Prueba para obtener la lista de productos
         * ********************************************
         */
        it('Debería obtener la lista de productos', () => {
            service.getProducts().subscribe(products => {
                expect(products).toEqual(mockProducts);
            });

            const req = httpMock.expectOne(`${environment.apiUrl}/bp/products`);
            expect(req.request.method).toBe('GET');
            req.flush(mockProducts);
        });

        /** Prueba cuando hay errores al obtener productos
         * *************************************************
         */
        it('Debería manejar errores al obtener productos', () => {
            const errorMessage = 'Error al obtener productos';
            jest.spyOn(handleErrorService, 'handleError');

            service.getProducts().subscribe({
                error: (error) => {
                    expect(error).toBeTruthy();
                    expect(handleErrorService.handleError).toHaveBeenCalled();
                }
            });

            const req = httpMock.expectOne(`${environment.apiUrl}/bp/products`);
            req.error(new ErrorEvent('Network error', {
                message: errorMessage
            }));
        });
    });

    describe('deleteProduct', () => {
        /** Prueba para eliminar el producto
         * ***********************************
         */
        it('Debería eliminar un producto exitosamente', () => {
            const productId = 'test123';

            service.deleteProduct(productId).subscribe(response => {
                expect(response).toBeTruthy();
            });

            const req = httpMock.expectOne(`${environment.apiUrl}/bp/products/${productId}`);
            expect(req.request.method).toBe('DELETE');
            req.flush({ success: true });
        });

        /** Prueba para retornar error si el Id está vacío
         * *************************************************
         */
        it('Debería retornar error si el ID del producto está vacío', (done) => {
            service.deleteProduct('').subscribe({
                error: (error) => {
                    expect(error.message).toBe('El ID del producto es requerido');
                    done();
                }
            });
        });

        /** Prueba para eliminar un producto
         * ***********************************
         */
        it('Debería manejar errores al eliminar un producto', () => {
            const productId = 'test123';
            const errorMessage = 'Error al eliminar producto';
            jest.spyOn(handleErrorService, 'handleError');

            service.deleteProduct(productId).subscribe({
                error: (error) => {
                    expect(error).toBeTruthy();
                    expect(handleErrorService.handleError).toHaveBeenCalled();
                }
            });

            const req = httpMock.expectOne(`${environment.apiUrl}/bp/products/${productId}`);
            req.error(new ErrorEvent('Network error', {
                message: errorMessage
            }));
        });
    });
});
