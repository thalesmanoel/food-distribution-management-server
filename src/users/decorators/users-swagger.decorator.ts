import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { ApiResponseDto } from 'src/commons/dtos/api-response.dto';
import { UserResponseDto } from '../dtos/reponse-user.dto';

const userId = 'd2f18216-cb15-4cfe-8f7b-0cc7a66dbd3a';

const userExample = {
  id: userId,
  name: 'Joao Silva',
  email: 'joao.silva@example.com',
  isActive: true,
};

const userResponseSchema = (message: string) => ({
  allOf: [
    { $ref: getSchemaPath(ApiResponseDto) },
    {
      properties: {
        message: { type: 'string', example: message },
        data: { $ref: getSchemaPath(UserResponseDto) },
      },
    },
  ],
});

const userIdParam = () =>
  ApiParam({
    name: 'id',
    description: 'ID do usuario',
    example: userId,
  });

const unauthorizedResponse = () =>
  ApiUnauthorizedResponse({ description: 'Token ausente ou invalido' });

export function ApiUsersController() {
  return applyDecorators(
    ApiTags('Users'),
    ApiExtraModels(ApiResponseDto, UserResponseDto),
  );
}

export function ApiCreateUser() {
  return applyDecorators(
    ApiOperation({ summary: 'Criar usuário' }),
    ApiCreatedResponse({
      description: 'Usuário criado com sucesso',
      schema: userResponseSchema('Usuário criado com sucesso'),
    }),
    ApiBadRequestResponse({ description: 'Dados de entrada invalidos' }),
    ApiConflictResponse({ description: 'Nome ou email ja cadastrado' }),
  );
}

export function ApiFindAllUsers() {
  return applyDecorators(
    ApiBearerAuth(),
    unauthorizedResponse(),
    ApiOperation({ summary: 'Listar usuários' }),
    ApiQuery({ name: 'page', required: false, example: 1 }),
    ApiQuery({ name: 'limit', required: false, example: 10 }),
    ApiQuery({
      name: 'search',
      required: false,
      description: 'Texto pesquisado no campo informado em identifier',
      example: 'joao',
    }),
    ApiQuery({
      name: 'identifier',
      required: false,
      enum: ['name', 'email', 'isActive'],
      description: 'Campo usado na pesquisa',
      example: 'name',
    }),
    ApiOkResponse({
      description: 'Usuários encontrados com sucesso',
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponseDto) },
          {
            properties: {
              message: {
                type: 'string',
                example: 'Usuários encontrados com sucesso',
              },
              data: {
                type: 'object',
                properties: {
                  data: {
                    type: 'array',
                    items: { $ref: getSchemaPath(UserResponseDto) },
                    example: [userExample],
                  },
                  total: { type: 'number', example: 1 },
                  page: { type: 'number', example: 1 },
                  limit: { type: 'number', example: 10 },
                  previousPage: {
                    type: 'number',
                    nullable: true,
                    example: null,
                  },
                  nextPage: {
                    type: 'number',
                    nullable: true,
                    example: null,
                  },
                  totalPages: { type: 'number', example: 1 },
                },
              },
            },
          },
        ],
      },
    }),
  );
}

export function ApiFindUserById() {
  return applyDecorators(
    ApiBearerAuth(),
    unauthorizedResponse(),
    ApiOperation({ summary: 'Buscar usuário por ID' }),
    userIdParam(),
    ApiOkResponse({
      description: 'Usuário encontrado com sucesso',
      schema: userResponseSchema('Usuário encontrado com sucesso'),
    }),
    ApiNotFoundResponse({ description: 'Usuario nao encontrado' }),
  );
}

export function ApiUpdateUser() {
  return applyDecorators(
    ApiBearerAuth(),
    unauthorizedResponse(),
    ApiOperation({ summary: 'Atualizar usuário' }),
    userIdParam(),
    ApiOkResponse({
      description: 'Usuário atualizado com sucesso',
      schema: userResponseSchema('Usuário atualizado com sucesso'),
    }),
    ApiBadRequestResponse({ description: 'Dados de entrada invalidos' }),
    ApiNotFoundResponse({ description: 'Usuario nao encontrado' }),
  );
}

export function ApiDeleteUser() {
  return applyDecorators(
    ApiBearerAuth(),
    unauthorizedResponse(),
    ApiOperation({ summary: 'Remover usuário' }),
    userIdParam(),
    ApiOkResponse({
      description: 'Usuário removido com sucesso',
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiResponseDto) },
          {
            properties: {
              message: {
                type: 'string',
                example: 'Usuário deletado com sucesso',
              },
              data: { type: 'null', example: null },
            },
          },
        ],
      },
    }),
    ApiNotFoundResponse({ description: 'Usuario nao encontrado' }),
  );
}
