import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailTemplate } from './entities/email-template.entity';

@Injectable()
export class CommunicationsService {
	constructor(
		@InjectRepository(EmailTemplate)
		private readonly emailTemplateRepo: Repository<EmailTemplate>,
	) {}

	async createEmailTemplate(userId: string, createTemplateDto: any) {
		const existing = await this.emailTemplateRepo.findOne({
			where: { name: createTemplateDto.name },
		});

		if (existing) {
			throw new ConflictException(
				'Email template with this name already exists',
			);
		}

		const template = this.emailTemplateRepo.create({
			name: createTemplateDto.name,
			subject: createTemplateDto.subject,
			body: createTemplateDto.body,
			variables: createTemplateDto.variables || [],
			is_active: createTemplateDto.is_active !== false,
			created_by: userId,
		});

		return this.emailTemplateRepo.save(template);
	}

	async getEmailTemplates(onlyActive: boolean = true) {
		const query = this.emailTemplateRepo.createQueryBuilder('template');

		if (onlyActive) {
			query.where('template.is_active = true');
		}

		return query.orderBy('template.created_at', 'DESC').getMany();
	}

	async getEmailTemplate(id: string) {
		const template = await this.emailTemplateRepo.findOne({ where: { id } });
		if (!template) {
			throw new NotFoundException('Email template not found');
		}

		return template;
	}

	async updateEmailTemplate(id: string, updateTemplateDto: any) {
		const template = await this.getEmailTemplate(id);

		if (updateTemplateDto.name && updateTemplateDto.name !== template.name) {
			const existing = await this.emailTemplateRepo.findOne({
				where: { name: updateTemplateDto.name },
			});

			if (existing) {
				throw new ConflictException(
					'Email template with this name already exists',
				);
			}
		}

		Object.assign(template, updateTemplateDto);
		return this.emailTemplateRepo.save(template);
	}

	async deleteEmailTemplate(id: string) {
		const template = await this.getEmailTemplate(id);
		await this.emailTemplateRepo.remove(template);
		return { success: true };
	}

	async testEmailTemplate(id: string, testData: any) {
		const template = await this.getEmailTemplate(id);

		try {
			let renderedBody = template.body;
			let renderedSubject = template.subject;

			for (const [key, value] of Object.entries(testData.variables || {})) {
				const regex = new RegExp(`{{${key}}}`, 'g');
				renderedBody = renderedBody.replace(regex, String(value));
				renderedSubject = renderedSubject.replace(regex, String(value));
			}

			return {
				success: true,
				data: {
					subject: renderedSubject,
					body: renderedBody,
				},
			};
		} catch (error) {
			throw new BadRequestException('Failed to render email template');
		}
	}
}
