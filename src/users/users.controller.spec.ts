import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { UsersController } from './users.controller';

describe('UsersController', () => {
  let controller: UsersController;
  let app: INestApplication;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
    })
      .useMocker(() => ({}))
      .compile();

    controller = module.get<UsersController>(UsersController);
    app = module.createNestApplication();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('documents all user routes in Swagger', () => {
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder().addBearerAuth().build(),
    );

    expect(document.paths['/users']?.post).toBeDefined();
    expect(document.paths['/users']?.get).toBeDefined();
    expect(document.paths['/users/{id}']?.get).toBeDefined();
    expect(document.paths['/users/{id}']?.put).toBeDefined();
    expect(document.paths['/users/{id}']?.delete).toBeDefined();
  });
});
