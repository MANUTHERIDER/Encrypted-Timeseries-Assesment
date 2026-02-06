import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DataService {
  private socket: Socket;

  constructor() {
    this.socket = io('http://localhost:3000');
    this.socket.on('connect', () => {
      console.log('Connected to listener service:',this.socket.id);
    });
    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });
  }

  getLiveUpdates(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('live_data_update', (data) => {
        console.log('Received update:', data);
        observer.next(data);
      });
      this.socket.on('disconnect', () => {
        console.warn('Disconnected from listener');
      });
    });
  }
}