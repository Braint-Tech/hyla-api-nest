import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UserDto } from './user.dto';
import * as bcrypt from 'bcrypt';
import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';

export class UserRepository extends Repository<User> {
  public async createUser(userDto: UserDto): Promise<User> {
    const { cellphone, password } = userDto;
    const user = new User();

    user.cellphone = cellphone;
    const salt = await bcrypt.genSalt();
    user.password = await this.hashPassword(password, salt);

    try {
      await this.save(user);
      delete user.password;

      return user;
    } catch (error) {
      if (error.code.toString() === '1062') {
        throw new ConflictException('Endereço de email já está em uso');
      } else {
        throw new InternalServerErrorException(
          'Erro ao salvar o usuário no banco de dados',
        );
      }
    }
  }

  private async hashPassword(password: string, salt: string): Promise<string> {
    return bcrypt.hash(password, salt);
  }

  public async findAll(): Promise<User[]> {
    return await this.find();
  }
}
