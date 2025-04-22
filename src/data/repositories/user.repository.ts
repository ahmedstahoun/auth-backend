import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { CreateUserDto } from '../../modules/auth/dto/create-user.dto';

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async createUser(user: CreateUserDto): Promise<UserDocument> {
    const existingUser = await this.findUserByEmail(user.email);
    if (existingUser) throw new ConflictException('Email is already in use');
    const newUser = new this.userModel(user);
    return newUser.save();
  }

  async findUserByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }
}
