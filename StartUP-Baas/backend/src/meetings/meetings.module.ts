import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MeetingsService } from './meetings.service';
import { MeetingsController } from './meetings.controller';
import { Meeting } from './entities/meeting.entity';
import { MeetingRegistration } from './entities/meeting-registration.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Meeting, MeetingRegistration])],
  controllers: [MeetingsController],
  providers: [MeetingsService],
})
export class MeetingsModule {}
