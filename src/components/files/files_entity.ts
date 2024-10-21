import { Tasks } from "../../components/tasks/tasks_entity";
import { Users } from "../../components/users/users_entity";
import {
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Entity,
} from "typeorm";

@Entity()
export class Files {
  @PrimaryGeneratedColumn("uuid")
  file_id: string;

  @Column({ length: 30, nullable: false, unique: true })
  file_name: string;

  @Column({ length: 30 })
  mime_type: string;

  @Column()
  @ManyToOne(() => Users, (userData) => userData.user_id)
  @JoinColumn({ name: "user_id" })
  created_by: string;

  @Column()
  @ManyToOne(() => Tasks, (taskData) => taskData.task_id)
  @JoinColumn({ name: "task_id" })
  task_id: string;

  @Column()
  @CreateDateColumn()
  created_at: Date;

  @Column()
  @CreateDateColumn()
  updated_at: Date;
}
