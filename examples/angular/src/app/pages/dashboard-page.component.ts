import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  template: `
    <div style="padding: 32px 40px; max-width: 800px">
      <h1 style="font-size: 28px; font-weight: 700; color: #111; margin: 0 0 24px">Dashboard</h1>

      <div style="display: flex; gap: 14px; margin-bottom: 28px; flex-wrap: wrap">
        @for (s of stats; track s.label) {
          <div style="flex: 1 1 150px; padding: 18px; background: #fff; border-radius: 10px; border: 1px solid #e5e5e5; text-align: center">
            <div style="font-size: 24px; font-weight: 700; color: #111">{{ s.value }}</div>
            <div style="font-size: 13px; color: #888; margin-top: 4px">{{ s.label }}</div>
          </div>
        }
      </div>

      <div style="background: #fff; border-radius: 10px; border: 1px solid #e5e5e5; overflow: hidden">
        <table style="width: 100%; border-collapse: collapse; font-size: 14px">
          <thead>
            <tr style="background: #fafafa; text-align: left">
              <th style="padding: 12px 16px; border-bottom: 1px solid #e5e5e5">Module</th>
              <th style="padding: 12px 16px; border-bottom: 1px solid #e5e5e5">Size</th>
              <th style="padding: 12px 16px; border-bottom: 1px solid #e5e5e5">Type</th>
            </tr>
          </thead>
          <tbody>
            @for (row of rows; track row.name) {
              <tr>
                <td style="padding: 12px 16px; border-bottom: 1px solid #f0f0f0">{{ row.name }}</td>
                <td style="padding: 12px 16px; border-bottom: 1px solid #f0f0f0">{{ row.size }}</td>
                <td style="padding: 12px 16px; border-bottom: 1px solid #f0f0f0">
                  <span style="padding: 2px 10px; border-radius: 12px; font-size: 12px; background: #fef3c7; color: #92400e">
                    {{ row.type }}
                  </span>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class DashboardPageComponent {
  stats = [
    { label: 'Components', value: '18' },
    { label: 'Services', value: '6' },
    { label: 'Pipes', value: '4' },
    { label: 'Bundle', value: '85KB' },
  ];
  rows = [
    { name: 'AppComponent', size: '1.4KB', type: 'Root' },
    { name: 'HomePageComponent', size: '2.0KB', type: 'Page' },
    { name: 'DashboardPageComponent', size: '1.8KB', type: 'Page' },
  ];
}
