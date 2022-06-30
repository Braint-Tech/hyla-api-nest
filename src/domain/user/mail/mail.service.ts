import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendPasswordReset(mail: string, token: string) {
    const url = `example.com/auth/confirm?token=${token}`;

    await this.mailerService.sendMail({
      to: mail,
      subject: 'Redefinição de Senha',
      html: `<h4>Redefinição de Senha</h4>
            <br><span>Aqui está o link para a sua redefinição de senha:  
            ${url}</span><br>
            <p>Atenciosamente</p><p>Equipe Hyla!</p>`,
    });
  }
}
