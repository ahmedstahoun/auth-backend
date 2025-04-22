import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type UserDocument = User & Document;

@Schema()
export class User {
  @ApiProperty({ example: 'user@example.com' })
  @Prop({ required: true, unique: true })
  email: string;

  @ApiProperty({ example: 'John Doe' })
  @Prop({ required: true })
  name: string;

  @ApiProperty({ example: 'StrongP@ss123', description: 'Hashed password' })
  @Prop({ required: true })
  password: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
