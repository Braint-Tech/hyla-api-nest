import { EntityRepository } from 'typeorm';
import { Address } from './address.entity';
import { UserDto } from './../user.dto';
import { Repository } from 'typeorm/repository/Repository';
import { User } from '../user.entity';

@EntityRepository(Address)
export class AddressRepository extends Repository<Address> {
  async insertAddress(
    addressDto: UserDto['address'],
    idUser: number,
  ): Promise<Address> {
    const user = new User();
    user.id = idUser;
    const address = this.create(addressDto);
    address.user = user;
    return await this.save(address);
  }

  async updateAddress(
    addressDto: UserDto['address'],
    idUser: number,
  ): Promise<Address> {
    const user = new User();
    user.id = idUser;

    const result = await this.createQueryBuilder()
      .update({
        street: addressDto.street,
        number: addressDto.number,
        complement: addressDto.complement,
        zipcode: addressDto.zipcode,
        neighbourhood: addressDto.neighbourhood,
        city: addressDto.city,
        state: addressDto.state,
      })
      .where({
        user,
      })
      .execute();
    return result.raw[0];
  }
}
