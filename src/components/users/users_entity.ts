import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { Roles } from "../roles/roles_entity";
import { ProjectMember } from "../../components/project_member/project_member_entity";

@Entity()
export class Users {
  @PrimaryGeneratedColumn("uuid")
  user_id: string;

  @Column({ length: 50, nullable: true })
  full_name: string;

  @Column({ length: 30, nullable: false, unique: true })
  username: string;

  @Column({ length: 60, nullable: false, unique: true })
  email: string;

  @Column({ nullable: false })
  password: string;

  @Column({ nullable: false })
  @ManyToOne(() => Roles)
  @JoinColumn({ name: "role_id" })
  role_id: Roles["role_id"];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => ProjectMember, (member) => member.user)
  projects: ProjectMember[];
}
