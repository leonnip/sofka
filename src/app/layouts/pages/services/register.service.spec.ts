import {TestBed} from '@angular/core/testing';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {RegisterService, Product, ProductCreateRequest, ProductUpdateRequest} from './register.service';
import {HandleErrorService} from './handle-error.service';
import {environment} from '../../../../environments/environment.development';

describe('RegisterService', () => {
    let service: RegisterService;
    let httpMock: HttpTestingController;
    const API_URL = environment.apiUrl;

    // Configuración inicial antes de cada prueba
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [RegisterService, HandleErrorService]
        });
        service = TestBed.inject(RegisterService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    // Verificar que no hayan quedado solicitudes HTTP pendientes
    afterEach(() => {
        httpMock.verify();
    });

    // Datos de prueba para simular un producto
    const mockProduct: Product = {
        id: 'test123',
        name: 'Test Product',
        description: 'Test Description',
        logo: 'test-logo.png',
        date_release: '2025-09-22',
        date_revision: '2026-09-22'
    };

    /**
     * Pruebas para el método checkIdExists
     * Verifica la funcionalidad de validación de IDs de productos
     */
    describe('checkIdExists', () => {
        /** Prueba para validar id del producto
         * **************************************
         */
        it('debería validar un ID existente', () => {
            const productId = 'test123';
            const mockResponse = {exists: true};

            // Realizar la solicitud de validación
            service.checkIdExists(productId).subscribe(response => {
                expect(response).toEqual(mockResponse);
            });

            const req = httpMock.expectOne(`${API_URL}/bp/products/verification/${productId}`);
            expect(req.request.method).toBe('GET');
            req.flush(mockResponse);
        });
    });

    /**
     * Pruebas para el método setCreateNewProduct
     * Verifica la creación de nuevos productos
     */
    describe('setCreateNewProduct', () => {
        /** Prueba para crear producto
         * ******************************
         */
        it('debería crear un nuevo producto', () => {
            const productData: ProductCreateRequest = mockProduct;

            // Intentar crear un nuevo producto
            service.setCreateNewProduct(productData).subscribe(response => {
                expect(response).toEqual(mockProduct);
            });

            const req = httpMock.expectOne(`${API_URL}/bp/products`);
            expect(req.request.method).toBe('POST');
            expect(req.request.body).toEqual(productData);
            req.flush(mockProduct);
        });
    });

    /**
     * Pruebas para el método getProductSpecific
     * Verifica la obtención de productos por ID
     */
    describe('getProductSpecific', () => {
        /** Prueba para obtener un producto
         * **********************************
         */
        it('debería obtener un producto específico', () => {
            const productId = 'test123';

            // Solicitar un producto específico
            service.getProductSpecific(productId).subscribe(response => {
                expect(response).toEqual(mockProduct);
            });

            const req = httpMock.expectOne(`${API_URL}/bp/products/${productId}`);
            expect(req.request.method).toBe('GET');
            req.flush(mockProduct);
        });
    });

    /**
     * Pruebas para el método setUpdateProduct
     * Verifica la actualización de productos existentes
     */
    describe('setUpdateProduct', () => {
        /** Prueba para actualizar producto
         * **********************************
         */
        it('debería actualizar un producto existente', () => {
            const productId = 'test123';
            const updateData: ProductUpdateRequest = {
                name: mockProduct.name,
                description: mockProduct.description,
                logo: mockProduct.logo,
                date_release: mockProduct.date_release,
                date_revision: mockProduct.date_revision
            };

            // Intentar actualizar un producto
            service.setUpdateProduct(productId, updateData).subscribe(response => {
                expect(response).toEqual(mockProduct);
            });

            const req = httpMock.expectOne(`${API_URL}/bp/products/${productId}`);
            expect(req.request.method).toBe('PUT');
            expect(req.request.body).toEqual(updateData);
            req.flush(mockProduct);
        });
    });
});
