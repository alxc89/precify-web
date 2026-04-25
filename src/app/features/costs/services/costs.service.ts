import { Injectable, inject } from '@angular/core';
import {
  CreateStoreFixedCostRequest,
  CreateStoreVariableCostRequest,
  StoreFixedCostResponse,
  StoreFixedCostsService,
  StoreVariableCostResponse,
  StoreVariableCostsService,
  UpdateStoreFixedCostRequest,
  UpdateStoreVariableCostRequest,
} from '../../../core/api/generated';
import { SessionService } from '../../../core/session/session.service';
import { forkJoin } from 'rxjs';

export interface CostsSnapshot {
  readonly fixedCosts: readonly StoreFixedCostResponse[];
  readonly variableCosts: readonly StoreVariableCostResponse[];
}

@Injectable({
  providedIn: 'root',
})
export class CostsDataService {
  private readonly fixedCostsApi = inject(StoreFixedCostsService);
  private readonly variableCostsApi = inject(StoreVariableCostsService);
  private readonly session = inject(SessionService);

  getSnapshot(includeInactive = true) {
    const storeId = this.requireStoreId();

    return forkJoin({
      fixedCosts: this.fixedCostsApi.apiV1LojasStoreIdCustosFixosGet(storeId, includeInactive),
      variableCosts: this.variableCostsApi.apiV1LojasStoreIdCustosVariaveisGet(
        storeId,
        undefined,
        includeInactive,
      ),
    });
  }

  createFixedCost(request: CreateStoreFixedCostRequest) {
    return this.fixedCostsApi.apiV1LojasStoreIdCustosFixosPost(this.requireStoreId(), request);
  }

  updateFixedCost(costId: string, request: UpdateStoreFixedCostRequest) {
    return this.fixedCostsApi.apiV1LojasStoreIdCustosFixosStoreFixedCostIdPut(
      this.requireStoreId(),
      costId,
      request,
    );
  }

  deactivateFixedCost(costId: string) {
    return this.fixedCostsApi.apiV1LojasStoreIdCustosFixosStoreFixedCostIdDelete(
      this.requireStoreId(),
      costId,
    );
  }

  createVariableCost(request: CreateStoreVariableCostRequest) {
    return this.variableCostsApi.apiV1LojasStoreIdCustosVariaveisPost(this.requireStoreId(), request);
  }

  updateVariableCost(costId: string, request: UpdateStoreVariableCostRequest) {
    return this.variableCostsApi.apiV1LojasStoreIdCustosVariaveisStoreVariableCostIdPut(
      this.requireStoreId(),
      costId,
      request,
    );
  }

  deactivateVariableCost(costId: string) {
    return this.variableCostsApi.apiV1LojasStoreIdCustosVariaveisStoreVariableCostIdDelete(
      this.requireStoreId(),
      costId,
    );
  }

  private requireStoreId() {
    const storeId = this.session.currentStoreId();

    if (!storeId) {
      throw new Error('Nenhuma loja ativa foi encontrada na sessao.');
    }

    return storeId;
  }
}
