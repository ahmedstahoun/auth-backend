import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from 'src/data/database.module';
import { CommonModule } from 'src/common/common.module';

@Module({
  imports: [DatabaseModule, JwtModule,CommonModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
