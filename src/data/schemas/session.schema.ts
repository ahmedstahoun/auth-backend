import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type SessionDocument = Session & Document;

@Schema()
export class Session {
  @ApiProperty({ example: 'user@example.com' })
  @Prop({ required: true })
  email: string;

  @ApiProperty({ example: 'someRefreshTokenValueHere' })
  @Prop({ required: true })
  refreshToken: string;

  @ApiProperty({ example: 'a1b2c3-session-id' })
  @Prop({ required: true })
  sessionId: string;

  @ApiProperty({ example: '2025-05-01T00:00:00.000Z' })
  @Prop({
    type: Date,
    required: true,
    expires: 0, // This sets the TTL index. MongoDB will auto-delete after expiresAt.
  })
  expiresAt: Date;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
