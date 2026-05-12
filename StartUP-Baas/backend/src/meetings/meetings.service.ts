import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Meeting } from './entities/meeting.entity';
import { MeetingRegistration } from './entities/meeting-registration.entity';

@Injectable()
export class MeetingsService {
  constructor(
    @InjectRepository(Meeting)
    private readonly meetingRepository: Repository<Meeting>,
    @InjectRepository(MeetingRegistration)
    private readonly registrationRepository: Repository<MeetingRegistration>,
  ) {}

  async create(userId: string, createMeetingDto: any) {
    const meeting = this.meetingRepository.create({
      ...createMeetingDto,
      created_by: userId,
      status: 'scheduled',
    });
    return this.meetingRepository.save(meeting);
  }

  async findAll(type?: string, status?: string) {
    let query = this.meetingRepository
      .createQueryBuilder('meeting')
      .orderBy('meeting.meeting_date', 'ASC')
      .addOrderBy('meeting.meeting_time', 'ASC');

    if (type) query = query.andWhere('meeting.meeting_type = :type', { type });
    if (status) query = query.andWhere('meeting.status = :status', { status });

    return query.getMany();
  }

  async findOne(id: string) {
    const meeting = await this.meetingRepository.findOne({
      where: { id },
      relations: ['creator'],
    });

    if (!meeting) throw new NotFoundException('Meeting not found');

    const registrations = await this.registrationRepository.find({
      where: { meeting_id: id },
      relations: ['user'],
    });

    return { ...meeting, registrations };
  }

  async update(id: string, updateMeetingDto: any) {
    const meeting = await this.meetingRepository.findOne({ where: { id } });
    if (!meeting) throw new NotFoundException('Meeting not found');

    Object.assign(meeting, updateMeetingDto);
    return this.meetingRepository.save(meeting);
  }

  async remove(id: string) {
    const meeting = await this.meetingRepository.findOne({ where: { id } });
    if (!meeting) throw new NotFoundException('Meeting not found');

    await this.meetingRepository.remove(meeting);
    return { success: true };
  }

  async register(meetingId: string, userId: string) {
    const meeting = await this.meetingRepository.findOne({
      where: { id: meetingId },
    });
    if (!meeting) throw new NotFoundException('Meeting not found');

    const existingRegistration = await this.registrationRepository.findOne({
      where: { meeting_id: meetingId, user_id: userId },
    });

    if (existingRegistration) {
      throw new ConflictException('Already registered for this meeting');
    }

    const currentRegistrations = await this.registrationRepository.count({
      where: { meeting_id: meetingId, status: 'registered' },
    });

    const status =
      meeting.max_attendees && currentRegistrations >= meeting.max_attendees
        ? 'waitlist'
        : 'registered';

    const registration = this.registrationRepository.create({
      meeting_id: meetingId,
      user_id: userId,
      status,
    });

    await this.registrationRepository.save(registration);

    return { success: true, data: { registration, status } };
  }
}
