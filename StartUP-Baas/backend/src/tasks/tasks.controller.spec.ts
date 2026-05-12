import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { createMockRepository } from '../test/test-utils';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { TaskHistory } from './entities/task-history.entity';
import { User } from '../users/entities/user.entity';

describe('TasksController', () => {
  let controller: TasksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(TaskHistory),
          useValue: createMockRepository(),
        },
        {
          provide: getRepositoryToken(User),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    controller = module.get<TasksController>(TasksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
