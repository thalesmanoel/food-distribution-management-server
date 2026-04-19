import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { DbModule } from './db/db.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UsersModule,
    DbModule,
  ],
})
export class AppModule {}
