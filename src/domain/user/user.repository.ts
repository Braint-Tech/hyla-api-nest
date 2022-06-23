import { EntityRepository, Like } from 'typeorm';
import { User } from './user.entity';
import { UserDto } from './user.dto';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm/repository/Repository';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  async createUser(userDto: UserDto): Promise<User> {
    const user = this.create(userDto);

    const password = this.generatePassword();
    const salt = await bcrypt.genSalt();
    user.password = await this.hashPassword(password, salt);

    await this.save(user);
    delete user.password;
    return user;
  }

  private async hashPassword(password: string, salt: string): Promise<string> {
    return await bcrypt.hash(password, salt);
  }

  private generatePassword(): string {
    return Math.random().toString(36).slice(-10);
  }

  async findByCellphone(cellphone: string): Promise<User> {
    return await this.findOne({
      select: ['id', 'role', 'disabled', 'name'],
      where: { cellphone: cellphone },
    });
  }

  async updateUser(userDto: UserDto, idUser: number): Promise<User> {
    const result = await this.createQueryBuilder()
      .update({
        name: userDto.name,
        email: userDto.email,
        phone: userDto.phone,
        birthDate: userDto.birthDate,
        contactAuthorization: userDto.contactAuthorization,
      })
      .where({
        id: idUser,
      })
      .execute();

    return result.raw[0];
  }

  async listUser(
    offset: number,
    limit: number,
    name: string,
  ): Promise<object[]> {
    const [list, count] = await Promise.all([
      this.find({
        select: ['id', 'name', 'email', 'cellphone', 'disabled'],
        skip: offset,
        take: limit,
        where: name != undefined ? { name: Like(`%${name}%`) } : {},
      }),
      this.count({
        where: name != undefined ? { name: Like(`%${name}%`) } : {},
      }),
    ]);

    return [list, { total: count }];
  }
}
