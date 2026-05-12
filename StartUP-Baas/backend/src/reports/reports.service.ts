import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './entities/report.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(userId: string, createReportDto: any) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const report = this.reportRepository.create({
      user_id: userId,
      title: createReportDto.title,
      content: createReportDto.content,
      week_start: createReportDto.week_start,
      week_end: createReportDto.week_end,
      submitted_at: new Date(),
    });

    return this.reportRepository.save(report);
  }

  async findAll(
    userId: string,
    role: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const skip = (page - 1) * limit;
    let query = this.reportRepository
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.user', 'user')
      .select(['report', 'user.id', 'user.full_name', 'user.email'])
      .orderBy('report.created_at', 'DESC')
      .skip(skip)
      .take(limit);

    if (role !== 'admin') {
      query = query.where('report.user_id = :userId', { userId });
    }

    const [reports, total] = await query.getManyAndCount();
    return { reports, total, page, limit };
  }

  async findOne(reportId: string, userId: string, role: string) {
    const report = await this.reportRepository.findOne({
      where: { id: reportId },
      relations: ['user', 'reviewer'],
    });

    if (!report) throw new NotFoundException('Report not found');

    if (role !== 'admin' && report.user_id !== userId) {
      throw new ForbiddenException(
        'You do not have permission to view this report',
      );
    }

    return report;
  }

  async update(reportId: string, userId: string, updateReportDto: any) {
    const report = await this.reportRepository.findOne({
      where: { id: reportId },
    });
    if (!report) throw new NotFoundException('Report not found');

    if (report.user_id !== userId) {
      throw new ForbiddenException('You can only update your own reports');
    }

    if (report.status !== 'submitted') {
      throw new ForbiddenException('You can only update submitted reports');
    }

    Object.assign(report, updateReportDto);
    return this.reportRepository.save(report);
  }

  async updateStatus(
    reportId: string,
    adminId: string,
    statusDto: { status: string; feedback?: string },
  ) {
    const report = await this.reportRepository.findOne({
      where: { id: reportId },
    });
    if (!report) throw new NotFoundException('Report not found');

    if (statusDto.status === 'reviewed') {
      report.status = 'reviewed';
      report.reviewed_at = new Date();
      report.reviewed_by = adminId;
      if (statusDto.feedback) {
        report.admin_feedback = statusDto.feedback;
      }
    } else if (statusDto.status === 'rejected') {
      report.status = 'rejected';
      report.reviewed_at = new Date();
      report.reviewed_by = adminId;
      if (statusDto.feedback) {
        report.admin_feedback = statusDto.feedback;
      }
    } else {
      throw new ForbiddenException('Invalid status');
    }

    return this.reportRepository.save(report);
  }

  async remove(reportId: string, userId: string) {
    const report = await this.reportRepository.findOne({
      where: { id: reportId },
    });
    if (!report) throw new NotFoundException('Report not found');

    if (report.user_id !== userId) {
      throw new ForbiddenException('You can only delete your own reports');
    }

    await this.reportRepository.remove(report);
    return { success: true };
  }
}
