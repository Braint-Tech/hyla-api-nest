export class UserDto {
  id?: number;
  name?: string;
  cellphone: string;
  phone?: string;
  password?: string;
  birthDate?: string;
  role?: string;
  email?: string;
  contactAuthorization?: boolean;
  disabled?: boolean;
  createdAt?: string;
  updatedAt?: string;
  address?: {
    street: string;
    number: string;
    complement?: string;
    zipcode: string;
    neighbourhood: string;
    city: string;
    state: string;
  };
}
