import { Injectable } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { AppConfig } from 'src/config/app.config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly appConfig: AppConfig) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: appConfig.Config.Auth.Jwt.Key ?? '',
      passReqToCallback: true,
      algorithms: ['HS512'],
    });
  }

  validate(req: Request, payload: any) {
    return {
      email: payload.email,
      sessionId: payload.sessionId,
    };
  }
  
}
