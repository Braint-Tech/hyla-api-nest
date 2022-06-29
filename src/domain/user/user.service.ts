import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserDto } from './user.dto';
import { UserRepository } from './user.repository';
import * as jwt from 'jsonwebtoken';
import { AddressService } from './address/address.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserRepository)
    private userRepository: UserRepository,
    private addressService: AddressService,
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

  async authAdmin(userDto: UserDto): Promise<object> {
    const user = await this.userRepository.findByEmail(userDto.email);

    if (user != undefined) {
      if (user.disabled) return null;

      const authenticated = await bcrypt.compare(
        userDto.password,
        user.password,
      );

      if (authenticated) {
        const token = this.generateToken(user.id, user.role, user.disabled);
        console.log(token);
        return {
          token,
          auth: true,
        };
      } else return null;
    } else throw { message: 'Email not found!' };
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

  async updateUser(userDto: UserDto, idUser: number): Promise<any> {
    try {
      await this.userRepository.updateUser(userDto, idUser);

      if (
        (await this.addressService.updateAddress(userDto.address, idUser)) !=
        undefined
      )
        await this.addressService.insertAddress(userDto.address, idUser);

      return { success: true };
    } catch (error) {
      return error;
    }
  }

  async listUser(offset: number, limit: number, name: string): Promise<any> {
    return await this.userRepository.listUser(offset, limit, name);
  }

  async findUserProfile(idUser: number): Promise<any> {
    return await this.userRepository.findUserProfile(idUser);
  }

  async deleteUser(idUser: number): Promise<any> {
    try {
      await this.userRepository.deleteUser(idUser);

      return { success: true };
    } catch (error) {
      return error;
    }
  }

  async updateUserCellphone(userDto: UserDto, idUser: number): Promise<any> {
    return await this.userRepository.updateUserCellphone(userDto, idUser);
  }

  async exportUser(): Promise<any> {
    return await this.userRepository.exportUser();
  }
}
