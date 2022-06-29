import { EntityRepository, Like, Not } from 'typeorm';
import { User } from './user.entity';
import { Address } from './address/address.entity';
import { UserDto } from './user.dto';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm/repository/Repository';
import { Product } from '../product/product.entity';
import * as XLSX from 'xlsx';

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

  async findByEmail(email: string): Promise<User> {
    return await this.findOne({
      select: ['id', 'role', 'disabled', 'password'],
      where: { email: email },
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
      this.createQueryBuilder()
        .distinct()
        .select([
          'user.id',
          'user.name',
          'user.email',
          'user.cellphone',
          'user.disabled',
        ])
        .addSelect(
          (subQuery) =>
            subQuery
              .select('COUNT(product.id)')
              .from(Product, 'product')
              .where('product.userId = user.id'),
          'totalProduct',
        )
        .from(User, 'user')
        .where(name != undefined ? { name: Like(`%${name}%`) } : {})
        .offset(offset)
        .limit(limit)
        .getRawMany(),
      this.count({
        where: name != undefined ? { name: Like(`%${name}%`) } : {},
      }),
    ]);

    return [list, { totalUser: count }];
  }

  async findUserProfile(idUser: number): Promise<object> {
    const result = await this.createQueryBuilder()
      .distinct()
      .leftJoin(Address, 'address', 'user.id = address.userId')
      .leftJoin(Product, 'product', 'user.id = product.userId')
      .select([
        'user.name',
        'user.email',
        'user.cellphone',
        'user.phone',
        'user.contactAuthorization',
        'user.birthDate',
        'address.street',
        'address.number',
        'address.complement',
        'address.zipcode',
        'address.neighbourhood',
        'address.city',
        'address.state',
        'product.id',
        'product.code',
        'product.purchaseDate',
      ])
      .from(User, 'user')
      .where({ id: idUser })
      .getRawMany();

    return formatUserProfile(result);
  }

  async deleteUser(idUser: number): Promise<User> {
    const result = await this.createQueryBuilder()
      .delete()
      .where({
        id: idUser,
      })
      .execute();

    return result.raw;
  }

  async updateUserCellphone(userDto: UserDto, idUser: number): Promise<User> {
    const result = await this.createQueryBuilder()
      .update({
        cellphone: userDto.cellphone,
      })
      .where({
        id: idUser,
      })
      .execute();

    return result.raw[0];
  }

  async exportUser(): Promise<object> {
    const result = await this.createQueryBuilder()
      .distinct()
      .leftJoin(Address, 'address', 'user.id = address.userId')
      .leftJoin(Product, 'product', 'user.id = product.userId')
      .select([
        'user.name',
        'user.email',
        'user.cellphone',
        'user.phone',
        'user.contactAuthorization',
        'address.street',
        'address.number',
        'address.complement',
        'address.zipcode',
        'address.neighbourhood',
        'address.city',
        'address.state',
        'product.representativeName',
        'product.code',
        'product.purchaseDate',
      ])
      .addSelect(
        (subQuery) =>
          subQuery
            .select('COUNT(product.id)')
            .from(Product, 'product')
            .where('product.userId = user.id'),
        'totalProduct',
      )
      .from(User, 'user')
      .where({ role: Not('1') })
      .orderBy('user.name')
      .getRawMany();

    const userDataFormatted = formatExportUser(result);
    return { base64: this.jsonToXlsx(userDataFormatted) };
  }

  private jsonToXlsx(data: any): any {
    const workbook = XLSX.utils.book_new();

    const worksheet = XLSX.utils.json_to_sheet(data || []);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Usuários');

    return XLSX.write(workbook, { type: 'base64' });
  }
}

const formatUserProfile = (data: any[]) => {
  if (data.length === 0) return {};

  return {
    name: data[0].user_name,
    email: data[0].user_email,
    cellphone: data[0].user_cellphone,
    phone: data[0].user_phone,
    contactAuthorization: data[0].user_contactAuthorization,
    birthDate: data[0].user_birthDate,
    address: {
      street: data[0].address_street,
      number: data[0].address_number,
      complement: data[0].address_complement,
      zipcode: data[0].address_zipcode,
      neighbourhood: data[0].address_neighbourhood,
      city: data[0].address_city,
      state: data[0].address_state,
    },
    products: data.map((item) => {
      return {
        id: item.product_id,
        code: item.product_code,
        purchaseDate: item.product_purchaseDate,
      };
    }, []),
  };
};

const formatExportUser = (data: any[]) => {
  return data
    .map((item: any) => {
      return {
        Nome: item.user_name,
        Email: item.user_email,
        'Telefone Cadastrado': item.user_cellphone,
        'Telefone para Contato': item.user_phone,
        'Autorização de Contato': item.user_contactAuthorization
          ? 'Sim'
          : 'Não',
        Endereço: item.address_street ? formatAddress(item) : null,
        'Quantidade de Hylas': item.totalProduct,
        'Número de série': arrayToString(
          getProductItem(data, item.user_email, 'product_code'),
        ),
        'Data de compra': arrayToString(
          getProductDate(data, item.user_email, 'product_purchaseDate'),
        ),
        'Nome do representante': arrayToString(
          getProductItem(data, item.user_email, 'product_representativeName'),
        ),
      };
    })
    .filter((value: any, index: any, array: any) => {
      return (
        array.findIndex((index2: any) => index2['Email'] === value['Email']) ===
        index
      );
    });
};

const formatZipcode = (zipcode: string) =>
  `${zipcode.slice(0, 5)}-${zipcode.slice(5, 8)}`;

const formatAddress = (item: any) => {
  if (item.address_complement) {
    return `Rua ${item.address_street}, ${item.address_number}, ${
      item.address_complement
    }, ${formatZipcode(item.address_zipcode)}, ${
      item.address_neighbourhood
    },  ${item.address_city} - ${item.address_state}`;
  } else {
    return `Rua ${item.address_street}, ${item.address_number}, ${formatZipcode(
      item.address_zipcode,
    )}, ${item.address_neighbourhood},  ${item.address_city} - ${
      item.address_state
    }`;
  }
};

const getProductItem = (data: any, emailUser: string, item: any) => {
  return data
    .map((product: any) => {
      if (product.user_email === emailUser) return product[item];
      else return null;
    }, [])
    .filter((item: any) => item);
};

const getProductDate = (data: any, emailUser: string, item: any) => {
  return data
    .map((product: any) => {
      if (product.user_email === emailUser) return product[item];
      else return null;
    }, [])
    .filter((item: any) => item);
};

const arrayToString = (array: any) => `${array.join(', ')}`;
