import { Injectable, inject } from '@angular/core';
import { throwError } from 'rxjs';
import { OrganizationProductsService } from '../../../core/api/generated';
import { SessionService } from '../../../core/session/session.service';

@Injectable({
  providedIn: 'root',
})
export class ProductsDataService {
  private readonly organizationProductsApi = inject(OrganizationProductsService);
  private readonly session = inject(SessionService);

  getCatalogProducts() {
    const organizationId = this.session.currentOrganizationId();

    if (!organizationId) {
      return throwError(() => new Error('Nenhuma organização ativa foi encontrada na sessão.'));
    }

    return this.organizationProductsApi.apiV1OrganizacoesOrganizationIdProdutosGet(
      organizationId,
      true,
    );
  }
}
