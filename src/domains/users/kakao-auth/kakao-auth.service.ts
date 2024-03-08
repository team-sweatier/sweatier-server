import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class KakaoAuthService {
  private readonly kakaoConfig: Record<string, string>;

  constructor(private readonly configService: ConfigService) {
    this.kakaoConfig = {
      clientId: this.configService.get<string>('KAKAO_CLIENT_ID'),
      clientSecret: this.configService.get<string>('KAKAO_CLIENT_SECRET'),
      redirectUri: this.configService.get<string>('KAKAO_REDIRECT_URI'),
    };
  }

  getKakaoAuthUrl() {
    return `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${this.kakaoConfig.clientId}&redirect_uri=${this.kakaoConfig.redirectUri}`;
  }

  async getKakaoUsersId(code: string): Promise<string> {
    const response = await axios.post(
      'https://kauth.kakao.com/oauth/token',
      {
        grant_type: 'authorization_code',
        client_id: this.kakaoConfig.clientId,
        client_secret: this.kakaoConfig.clientSecret,
        redirect_uri: this.kakaoConfig.redirectUri,
        code,
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    );

    const token = jwt.decode(response.data.id_token);

    return token.sub as string;
  }
}
