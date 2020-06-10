import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  Unique,
  CreateDateColumn,
  UpdateDateColumn
} from "typeorm";
import { User } from "./User";

@Entity()
@Unique(["uuid"])
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  uuid: string;

  @Column()
  name: string;

  @Column()
  capacity: number;

  @ManyToOne(type => User, user => user.host)
  host: User;

  @ManyToMany(type => User)
  @JoinTable()
  users: User[];

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column()
  @UpdateDateColumn()
  updatedAt: Date;
}
