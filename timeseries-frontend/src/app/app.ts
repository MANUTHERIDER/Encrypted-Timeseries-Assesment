// import { Component, OnInit, signal, NgZone } from '@angular/core';
// import { RouterOutlet } from '@angular/router';
// import { DataService } from '../data.service';
// import { CommonModule } from '@angular/common';

// @Component({
//   selector: 'app-root',
//   standalone: true, // This is likely already there
//   imports: [CommonModule],
//   template: `<div style="padding: 20px; font-family: sans-serif;">
//       <h1>Encrypted Time-Series Dashboard</h1>
      
//       <div style="background: #f4f4f4; padding: 15px; border-radius: 8px;">
//         <h3>Stats</h3>
//         <p>Current Success Rate: <strong>{{ successRate | number:'1.2-2' }}%</strong></p>
//         <p>Last Batch Size: {{ lastBatchCount }} messages</p>
//       </div>

//       <h3>Live Feed (Recent)</h3>
//       <table border="1" cellpadding="10" style="width: 100%; border-collapse: collapse;">
//         <thead>
//           <tr>
//             <th>Name</th>
//             <th>Origin</th>
//             <th>Destination</th>
//             <th>Time Received</th>
//           </tr>
//         </thead>
//         <tbody>
//           <tr *ngFor="let item of feed">
//             <td>{{ item.name }}</td>
//             <td>{{ item.origin }}</td>
//             <td>{{ item.destination }}</td>
//             <td>{{ item.received_at | date:'mediumTime' }}</td>
//           </tr>
//         </tbody>
//       </table>
//     </div>`,
//   styleUrl: './app.css'
// })
// export class App implements OnInit {
//   feed: any[] = [];
//   successRate = 0;
//   lastBatchCount = 0;

//   constructor(private dataService: DataService, private ngZone: NgZone) { }

//   ngOnInit() {
//     this.dataService.getLiveUpdates().subscribe(update => {
//       // Run inside Angular zone so change detection triggers
//       this.ngZone.run(() => {
//         this.successRate = update.successRate;
//         this.lastBatchCount = update.count;

//         if (update.sample) {
//           const newItem = { ...update.sample, received_at: update.timestamp };
//           this.feed = [newItem, ...this.feed].slice(0, 10);
//           console.log('Updated feed array:', this.feed);
//         }
//       });
//     });
//   }

//   protected readonly title = signal('timeseries-frontend');
// }


import { Component, OnInit, signal, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../data.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 20px; font-family: sans-serif;">
      <h1>Encrypted Time-Series Dashboard</h1>
      
      <div style="background: #f4f4f4; padding: 15px; border-radius: 8px;">
        <h3>Stats</h3>
        <p>Current Success Rate: <strong>{{ successRate() | number:'1.2-2' }}%</strong></p>
        <p>Last Batch Size: {{ lastBatchCount() }} messages</p>
      </div>

      <h3>Live Feed (Recent)</h3>
      <table border="1" cellpadding="10" style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr>
            <th>Name</th>
            <th>Origin</th>
            <th>Destination</th>
            <th>Time Received</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let item of feed()">
            <td>{{ item.name }}</td>
            <td>{{ item.origin }}</td>
            <td>{{ item.destination }}</td>
            <td>{{ item.received_at | date:'mediumTime' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `
})
export class App implements OnInit {
  // Define signals
  feed = signal<any[]>([]);
  successRate = signal(0);
  lastBatchCount = signal(0);

  constructor(private dataService: DataService, private ngZone: NgZone) { }

  ngOnInit() {
    this.dataService.getLiveUpdates().subscribe(update => {
      // Use ngZone + Signal update
      this.ngZone.run(() => {
        this.successRate.set(update.successRate);
        this.lastBatchCount.set(update.count);

        if (update.sample) {
          const newItem = { ...update.sample, received_at: update.timestamp };
          
          // Update the signal value
          this.feed.update(oldFeed => [newItem, ...oldFeed].slice(0, 10));
          
          console.log('Signal updated with:', newItem.name);
        }
      });
    });
  }
}