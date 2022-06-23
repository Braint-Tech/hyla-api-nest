import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './../user.entity';

@Entity()
export class Address {
  @Column({ nullable: true })
  street: string;

  @Column({ unique: true })
  number: string;

  @Column({ nullable: true })
  complement: string;

  @Column()
  zipcode: string;

  @Column({ nullable: true })
  neighbourhood: string;

  @Column({ default: '2' })
  city: string;

  @Column({ nullable: true, unique: true })
  state: string;

  @OneToOne(() => User, (user) => user.id, { primary: true })
  @JoinColumn()
  user: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
