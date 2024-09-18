import { Tasks } from "components/tasks/taks_entity";
import { Users } from "components/users/users_entity";
import {
  Entity,
  JoinColumn,
  OneToOne,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity()
export class Comments {
  @PrimaryGeneratedColumn("uuid")
  comment_id: string;

  @Column({ type: "text" })
  comment: string;

  @OneToOne(() => Users, (userData) => userData.user_id)
  @JoinColumn({ name: "user_id" })
  user_id: string;

  @OneToOne(() => Tasks, (taskData) => taskData.task_id)
  @JoinColumn({ name: "task_id" })
  task_id: string;

  @Column("text", { array: true, default: [] })
  supported_files: string[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
