import { Component } from '@angular/core';

@Component({
  selector: 'app-home-page',
  standalone: true,
  template: `
    <div style="padding: 32px 40px; max-width: 800px">
      <h1 style="font-size: 28px; font-weight: 700; color: #111; margin: 0 0 8px">Angular + GoSnap</h1>
      <p style="color: #666; margin: 0 0 24px; font-size: 15px">
        GoSnap loaded via <code>&lt;go-snap&gt;</code> web component. No React needed in your Angular project.
      </p>

      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; margin-bottom: 28px">
        @for (item of cards; track item.title) {
          <div style="padding: 20px; background: #fff; border-radius: 10px; border: 1px solid #e5e5e5">
            <h3 style="margin: 0 0 6px; font-size: 16px; color: #111">{{ item.title }}</h3>
            <p style="margin: 0; font-size: 13px; color: #888">{{ item.desc }}</p>
          </div>
        }
      </div>

      <div style="padding: 20px; background: #fff; border-radius: 10px; border: 1px solid #e5e5e5">
        <h2 style="margin: 0 0 12px; font-size: 18px">Reactive Form</h2>
        <div style="display: flex; gap: 10px">
          <input
            [value]="query"
            (input)="query = $any($event.target).value"
            style="flex: 1; padding: 10px 12px; border-radius: 6px; border: 1px solid #ddd; font-size: 14px"
            placeholder="Type something..."
          />
          <button style="padding: 10px 20px; border-radius: 6px; border: none; background: #111; color: #fff; cursor: pointer; font-size: 14px">
            Search
          </button>
        </div>
        @if (query) {
          <p style="margin: 10px 0 0; font-size: 14px; color: #666">You typed: <strong>{{ query }}</strong></p>
        }
      </div>
    </div>
  `,
})
export class HomePageComponent {
  query = '';
  cards = [
    { title: 'Angular 19', desc: 'Standalone components with signals' },
    { title: 'Web Component', desc: 'GoSnap loaded via <go-snap> custom element' },
    { title: 'No React', desc: 'Embed script bundles its own React runtime' },
  ];
}
