import { Module } from '@nestjs/common';
import { CommunicationsController } from './communications.controller';
import { CommunicationsService } from './communications.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailTemplate } from './entities/email-template.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EmailTemplate])],
  controllers: [CommunicationsController],
  providers: [CommunicationsService],
  exports: [CommunicationsService],
})
export class CommunicationsModule {}
