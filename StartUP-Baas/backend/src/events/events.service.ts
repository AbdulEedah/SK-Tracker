import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { EventRegistration } from './entities/event-registration.entity';
import { EventFeedback } from './entities/event-feedback.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(EventRegistration)
    private readonly registrationRepository: Repository<EventRegistration>,
    @InjectRepository(EventFeedback)
    private readonly feedbackRepository: Repository<EventFeedback>,
  ) {}

  async create(userId: string, createEventDto: any) {
    const event = this.eventRepository.create({
      ...createEventDto,
      created_by: userId,
      status: 'upcoming',
    });
    return this.eventRepository.save(event);
  }

  async findAll(type?: string, status?: string, featured?: string) {
    let query = this.eventRepository
      .createQueryBuilder('event')
      .orderBy('event.event_date', 'ASC')
      .addOrderBy('event.event_time', 'ASC');

    if (type) query = query.andWhere('event.type = :type', { type });
    if (status) query = query.andWhere('event.status = :status', { status });
    if (featured === 'true') query = query.andWhere('event.featured = true');

    return query.getMany();
  }

  async findOne(id: string) {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['creator'],
    });

    if (!event) throw new NotFoundException('Event not found');

    const registrations = await this.registrationRepository.find({
      where: { event_id: id },
      relations: ['user'],
    });

    return { ...event, registrations };
  }

  async update(id: string, updateEventDto: any) {
    const event = await this.eventRepository.findOne({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');

    Object.assign(event, updateEventDto);
    return this.eventRepository.save(event);
  }

  async remove(id: string) {
    const event = await this.eventRepository.findOne({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');

    await this.eventRepository.remove(event);
    return { success: true };
  }

  async register(eventId: string, userId: string) {
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
    });
    if (!event) throw new NotFoundException('Event not found');

    if (
      event.registration_deadline &&
      new Date() > event.registration_deadline
    ) {
      throw new BadRequestException('Registration deadline has passed');
    }

    const existingRegistration = await this.registrationRepository.findOne({
      where: { event_id: eventId, user_id: userId },
    });

    if (existingRegistration) {
      throw new ConflictException('Already registered for this event');
    }

    const currentRegistrations = await this.registrationRepository.count({
      where: { event_id: eventId, status: 'registered' },
    });

    const isWaitlist =
      event.max_participants && currentRegistrations >= event.max_participants;
    const status = isWaitlist ? 'waitlist' : 'registered';
    const waitlistPos = isWaitlist
      ? currentRegistrations - event.max_participants + 1
      : null;

    const registration = this.registrationRepository.create({
      event_id: eventId,
      user_id: userId,
      status,
      waitlist_position: waitlistPos === null ? undefined : waitlistPos,
    });

    await this.registrationRepository.save(registration);

    return {
      success: true,
      data: { registration, status, position: waitlistPos },
    };
  }

  async submitFeedback(eventId: string, userId: string, feedbackDto: any) {
    const existing = await this.feedbackRepository.findOne({
      where: { event_id: eventId, user_id: userId },
    });
    if (existing) {
      throw new ConflictException('Feedback already submitted');
    }

    const feedback = this.feedbackRepository.create({
      event_id: eventId,
      user_id: userId,
      ...feedbackDto,
    });

    await this.feedbackRepository.save(feedback);
    return { success: true, data: feedback };
  }
}
