import { Injectable, inject } from '@angular/core';
import { forkJoin, throwError } from 'rxjs';
import {
  CreateIngredientPriceEntryRequest,
  CreateIngredientRequest,
  IngredientCategoriesService,
  IngredientCategoryResponse,
  IngredientPriceSourceResponse,
  IngredientResponse,
  IngredientsService,
  OrganizationIngredientPricesService,
  OrganizationManagedIngredientsService,
  StoreIngredientPricesService,
  UpdateIngredientPriceEntryRequest,
  UpdateIngredientRequest,
} from '../../../core/api/generated';
import { SessionService } from '../../../core/session/session.service';
import { IngredientPriceScope } from '../models/ingredient.model';

export interface IngredientsCatalogSnapshot {
  readonly categories: readonly IngredientCategoryResponse[];
  readonly ingredients: readonly IngredientResponse[];
}

@Injectable({
  providedIn: 'root',
})
export class IngredientsDataService {
  private readonly categoriesApi = inject(IngredientCategoriesService);
  private readonly ingredientsApi = inject(IngredientsService);
  private readonly managedIngredientsApi = inject(OrganizationManagedIngredientsService);
  private readonly organizationIngredientPricesApi = inject(OrganizationIngredientPricesService);
  private readonly session = inject(SessionService);
  private readonly storeIngredientPricesApi = inject(StoreIngredientPricesService);

  getCatalogSnapshot() {
    return forkJoin({
      categories: this.categoriesApi.apiV1CategoriasIngredienteGet(true),
      ingredients: this.ingredientsApi.apiV1IngredientesGet(true),
    });
  }

  getManagedIngredient(ingredientId: string) {
    const organizationId = this.session.currentOrganizationId();

    if (!organizationId) {
      return throwError(() => new Error('Nenhuma organizacao ativa foi encontrada na sessao.'));
    }

    return this.managedIngredientsApi.apiV1OrganizacoesOrganizationIdIngredientesIngredientIdGestaoGet(
      organizationId,
      ingredientId,
      this.session.currentStoreId() ?? undefined,
    );
  }

  createIngredient(request: CreateIngredientRequest) {
    return this.ingredientsApi.apiV1IngredientesPost(request);
  }

  updateIngredient(ingredientId: string, request: UpdateIngredientRequest) {
    return this.ingredientsApi.apiV1IngredientesIdPut(ingredientId, request);
  }

  deactivateIngredient(ingredientId: string) {
    return this.ingredientsApi.apiV1IngredientesIdDelete(ingredientId);
  }

  createIngredientPriceEntry(
    ingredientId: string,
    source: IngredientPriceScope,
    request: CreateIngredientPriceEntryRequest,
  ) {
    if (source === IngredientPriceSourceResponse.Organization) {
      const organizationId = this.session.currentOrganizationId();

      if (!organizationId) {
        return throwError(() => new Error('Nenhuma organizacao ativa foi encontrada na sessao.'));
      }

      return this.organizationIngredientPricesApi.apiV1OrganizacoesOrganizationIdIngredientesIngredientIdPrecosPost(
        organizationId,
        ingredientId,
        request,
      );
    }

    const storeId = this.session.currentStoreId();

    if (!storeId) {
      return throwError(() => new Error('Nenhuma loja ativa foi encontrada na sessao.'));
    }

    return this.storeIngredientPricesApi.apiV1LojasStoreIdIngredientesIngredientIdPrecosPost(
      storeId,
      ingredientId,
      request,
    );
  }

  updateIngredientPriceEntry(
    ingredientId: string,
    entryId: string,
    source: IngredientPriceScope,
    request: UpdateIngredientPriceEntryRequest,
  ) {
    if (source === IngredientPriceSourceResponse.Organization) {
      const organizationId = this.session.currentOrganizationId();

      if (!organizationId) {
        return throwError(() => new Error('Nenhuma organizacao ativa foi encontrada na sessao.'));
      }

      return this.organizationIngredientPricesApi.apiV1OrganizacoesOrganizationIdIngredientesIngredientIdPrecosPriceEntryIdPut(
        organizationId,
        ingredientId,
        entryId,
        request,
      );
    }

    const storeId = this.session.currentStoreId();

    if (!storeId) {
      return throwError(() => new Error('Nenhuma loja ativa foi encontrada na sessao.'));
    }

    return this.storeIngredientPricesApi.apiV1LojasStoreIdIngredientesIngredientIdPrecosPriceEntryIdPut(
      storeId,
      ingredientId,
      entryId,
      request,
    );
  }

  deactivateIngredientPriceEntry(ingredientId: string, entryId: string, source: IngredientPriceScope) {
    if (source === IngredientPriceSourceResponse.Organization) {
      const organizationId = this.session.currentOrganizationId();

      if (!organizationId) {
        return throwError(() => new Error('Nenhuma organizacao ativa foi encontrada na sessao.'));
      }

      return this.organizationIngredientPricesApi.apiV1OrganizacoesOrganizationIdIngredientesIngredientIdPrecosPriceEntryIdDelete(
        organizationId,
        ingredientId,
        entryId,
      );
    }

    const storeId = this.session.currentStoreId();

    if (!storeId) {
      return throwError(() => new Error('Nenhuma loja ativa foi encontrada na sessao.'));
    }

    return this.storeIngredientPricesApi.apiV1LojasStoreIdIngredientesIngredientIdPrecosPriceEntryIdDelete(
      storeId,
      ingredientId,
      entryId,
    );
  }
}
