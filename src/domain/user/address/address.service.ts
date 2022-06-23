import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserDto } from './../user.dto';
import { AddressRepository } from './address.repository';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(AddressRepository)
    private addressRepository: AddressRepository,
  ) {}

  async insertAddress(
    addressDto: UserDto['address'],
    idUser: number,
  ): Promise<object> {
    return await this.addressRepository.insertAddress(addressDto, idUser);
  }

  async updateAddress(
    addressDto: UserDto['address'],
    idUser: number,
  ): Promise<object> {
    return await this.addressRepository.updateAddress(addressDto, idUser);
  }
}
