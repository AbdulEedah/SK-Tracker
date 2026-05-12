import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { Event } from './entities/event.entity';
import { EventRegistration } from './entities/event-registration.entity';
import { EventFeedback } from './entities/event-feedback.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event, EventRegistration, EventFeedback]),
  ],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}
