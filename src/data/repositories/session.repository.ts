import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Session, SessionDocument } from '../schemas/session.schema';

interface CreateSessionDto {
  email: string;
  sessionId: string;
  refreshToken: string;
  expiresAt: Date;
}

interface SessionQueryDto {
  email: string;
  sessionId: string;
}

@Injectable()
export class SessionRepository {
  constructor(
    @InjectModel(Session.name) private readonly sessionModel: Model<SessionDocument>,
  ) {}

  async createSession(session: CreateSessionDto): Promise<SessionDocument> {
    const existingSession = await this.findSession({
      email: session.email,
      sessionId: session.sessionId,
    });
    if (existingSession) {
      throw new ConflictException('Session is already in use');
    }

    const newSession = new this.sessionModel(session);
    return newSession.save();
  }

  findSession(query: SessionQueryDto): Promise<SessionDocument | null> {
    const { email, sessionId } = query;
    return this.sessionModel.findOne({ email, sessionId }).exec();
  }

  deleteSession(query: SessionQueryDto) {
    const { email, sessionId } = query;
    return this.sessionModel.deleteOne({ email, sessionId }).exec();
  }
}
