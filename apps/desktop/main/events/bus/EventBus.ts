import { AsyncEventEmitter } from '@vladfrangu/async_event_emitter';
import { EventSpec } from '../event-spec';

export class EventBus extends AsyncEventEmitter<EventSpec> {}
