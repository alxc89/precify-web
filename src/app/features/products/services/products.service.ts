import { Injectable, inject } from '@angular/core';
import { forkJoin, throwError } from 'rxjs';
import {
  CreateProductRequest,
  IngredientResponse,
  IngredientsService,
  ProductIngredientInputRequest,
  ProductIngredientResponse,
  ProductIngredientsService,
  ProductResponse,
  ProductsService,
  UpdateProductRequest,
} from '../../../core/api/generated';
import { SessionService } from '../../../core/session/session.service';

export interface ProductManagementSnapshot {
  readonly ingredientOptions: readonly IngredientResponse[];
  readonly product: ProductResponse;
  readonly technicalSheet: readonly ProductIngredientResponse[];
}

@Injectable({
  providedIn: 'root',
})
export class ProductsDataService {
  private readonly ingredientsApi = inject(IngredientsService);
  private readonly productIngredientsApi = inject(ProductIngredientsService);
  private readonly productsApi = inject(ProductsService);
  private readonly session = inject(SessionService);

  getCatalogProducts() {
    return this.productsApi.apiV1OrganizacoesOrganizationIdProdutosGet(
      this.requireOrganizationId(),
      true,
    );
  }

  getIngredientOptions() {
    return this.ingredientsApi.apiV1IngredientesGet(
      true,
      this.requireOrganizationId(),
      this.session.currentStoreId() ?? '',
    );
  }

  getProductManagementSnapshot(productId: string) {
    const organizationId = this.requireOrganizationId();

    return forkJoin({
      ingredientOptions: this.getIngredientOptions(),
      product: this.productsApi.apiV1OrganizacoesOrganizationIdProdutosProductIdGet(
        organizationId,
        productId,
      ),
      technicalSheet:
        this.productIngredientsApi.apiV1OrganizacoesOrganizationIdProdutosProductIdIngredientesGet(
          organizationId,
          productId,
        ),
    });
  }

  createProduct(request: CreateProductRequest) {
    return this.productsApi.apiV1OrganizacoesOrganizationIdProdutosPost(
      this.requireOrganizationId(),
      request,
    );
  }

  updateProduct(productId: string, request: UpdateProductRequest) {
    return this.productsApi.apiV1OrganizacoesOrganizationIdProdutosProductIdPut(
      this.requireOrganizationId(),
      productId,
      request,
    );
  }

  replaceProductIngredients(productId: string, items: readonly ProductIngredientInputRequest[]) {
    return this.productIngredientsApi.apiV1OrganizacoesOrganizationIdProdutosProductIdIngredientesPut(
      this.requireOrganizationId(),
      productId,
      {
        items: items.map((item) => ({
          ingredientId: item.ingredientId,
          quantity: item.quantity,
        })),
      },
    );
  }

  deleteProduct(productId: string) {
    return this.productsApi.apiV1OrganizacoesOrganizationIdProdutosProductIdDelete(
      this.requireOrganizationId(),
      productId,
    );
  }

  deactivateProduct(productId: string) {
    return this.productsApi.apiV1OrganizacoesOrganizationIdProdutosProductIdDelete(
      this.requireOrganizationId(),
      productId,
    );
  }

  reactivateProduct(productId: string) {
    return this.productsApi.apiV1OrganizacoesOrganizationIdProdutosProductIdReativarPatch(
      this.requireOrganizationId(),
      productId,
    );
  }

  private requireOrganizationId() {
    const organizationId = this.session.currentOrganizationId();

    if (!organizationId) {
      throw new Error('Nenhuma organização ativa foi encontrada na sessão.');
    }

    return organizationId;
  }
}
