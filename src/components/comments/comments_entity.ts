import { Tasks } from "../tasks/tasks_entity";
import { Users } from "../users/users_entity";
import {
  Entity,
  JoinColumn,
  OneToOne,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from "typeorm";

@Entity()
export class Comments {
  @PrimaryGeneratedColumn("uuid")
  comment_id: string;

  @Column({ type: "text" })
  comment: string;

  @ManyToOne(() => Users, (userData) => userData.user_id)
  @JoinColumn({ name: "user_id" })
  user_id: Users;

  @ManyToOne(() => Tasks, (taskData) => taskData.task_id)
  @JoinColumn({ name: "task_id" })
  task_id: Tasks;

  @Column("text", { array: true, default: [] })
  supported_files: string[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
