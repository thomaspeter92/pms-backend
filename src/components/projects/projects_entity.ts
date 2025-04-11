import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";

import { ProjectMember } from "../../components/project_member/project_member_entity";

@Entity()
export class Projects {
  @PrimaryGeneratedColumn("uuid")
  project_id: string;

  @Column({ length: 30, nullable: false, unique: true })
  name: string;

  @Column({ length: 500 })
  description: string;

  @Column()
  start_time: Date;

  @Column()
  end_time: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => ProjectMember, (member) => member.project)
  members: ProjectMember[];
}
