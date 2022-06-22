import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserDto } from './user.dto';
import { UserRepository } from './user.repository';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
  ) {}

  async authUser(userDto: UserDto): Promise<object> {
    const user = await this.userRepository.findByCellphone(userDto.cellphone);

    if (user != undefined) {
      if (user.disabled) return null;

      const token = this.generateToken(user.id, user.role, user.disabled);

      return {
        token,
        auth: user.name == null ? false : true,
      };
    } else {
      const response = await this.userRepository.createUser(userDto);

      if (!response) return response;

      const token = this.generateToken(response.id);

      return {
        token,
        auth: false,
      };
    }
  }

  private generateToken(idUser: number, role = '2', disabled = false): string {
    return jwt.sign(
      {
        idUser,
        role,
        disabled,
      },
      process.env.TOKEN_KEY,
      {
        expiresIn: '9999 years',
      },
    );
  }
}
