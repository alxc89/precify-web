# Templates de Código Angular Standalone

Use estes templates como base ao implementar novas funcionalidades.

## 🧱 Standalone Component Template
```typescript
import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-feature-name',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="p-4 bg-background text-foreground">
      <!-- UI implementation -->
    </section>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeatureComponent {
  // Use Signals for local UI state
  loading = signal(false);
}
```

## ⚙️ Service (Facade) Template
```typescript
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FeatureService {
  private http = inject(HttpClient);
  
  // Expose state as readonly signals
  private _data = signal<any[]>([]);
  public data = this._data.asReadonly();

  fetch() {
    return this.http.get<any[]>('/api/v1/endpoint').pipe(
      map(res => this._data.set(res)),
      catchError(err => {
        console.error(err);
        return of([]);
      })
    );
  }
}
```

## 🧪 Unit Test (Vitest) Template
```typescript
import { TestBed } from '@angular/core/testing';
import { FeatureComponent } from './feature.component';
import { describe, it, expect, beforeEach } from 'vitest';

describe('FeatureComponent', () => {
  let component: FeatureComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeatureComponent]
    }).compileComponents();

    component = TestBed.createComponent(FeatureComponent).componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```
