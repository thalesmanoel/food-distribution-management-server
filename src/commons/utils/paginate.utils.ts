import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';
import { PaginationQueryDto } from '../dtos/pagination-query.dto';
import { PaginatedResponse } from '../interfaces/paginated-response.interface';

export async function paginate<T extends ObjectLiteral>(
  queryBuilder: SelectQueryBuilder<T>,
  paginationDto: PaginationQueryDto,
): Promise<PaginatedResponse<T>> {
  const page = paginationDto.page ?? 1;
  const limit = paginationDto.limit ?? 10;

  queryBuilder.skip((page - 1) * limit);
  queryBuilder.take(limit);

  const [data, total] = await queryBuilder.getManyAndCount();

  const totalPages = Math.ceil(total / limit);

  return {
    data,
    total,
    page,
    limit,
    previousPage: page > 1 ? page - 1 : null,
    nextPage: page < totalPages ? page + 1 : null,
    totalPages,
  };
}
