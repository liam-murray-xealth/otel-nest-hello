import { Injectable } from '@nestjs/common';
import { trace } from '@opentelemetry/api';
import { createMetricInstruments, Instruments } from './app.service.metrics';

@Injectable()
export class AppService {
  private readonly instruments: Instruments;
  constructor() {
    // TODO probably a better way
    this.instruments = createMetricInstruments();
  }
  getHello(): string {
    const span = trace.getActiveSpan();
    if (span) {
      span.setAttribute('mytag', 'someval');
      span.addEvent('This is an event');
    }

    this.instruments.helloCount.add(1);
    return 'Hello World!';
  }
}
