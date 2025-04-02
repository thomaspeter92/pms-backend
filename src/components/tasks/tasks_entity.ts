import {
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Entity,
} from "typeorm";
import { Users } from "../users/users_entity";
import { Projects } from "../projects/projects_entity";

export enum Status {
  Backlog = "Backlog",
  InProgress = "In-Progress",
  Done = "Done",
}

export enum Priority {
  Low = "Low",
  Medium = "Medium",
  High = "High",
}

@Entity()
export class Tasks {
  @PrimaryGeneratedColumn("uuid")
  task_id: string;

  @Column({ length: 30, nullable: false, unique: true })
  name: string;

  @Column({ length: 500 })
  description: string;

  @Column()
  @ManyToOne(() => Projects, (projectData) => projectData.project_id)
  @JoinColumn({ name: "project_id" })
  project_id: string;

  @Column()
  @ManyToOne(() => Users, (userData) => userData.user_id)
  @JoinColumn({ name: "user_id" })
  user_id: string;

  @Column()
  estimated_start_time: Date;

  @Column()
  estimated_end_time: Date;

  @Column({ nullable: true })
  actual_start_time: Date;

  @Column({ nullable: true })
  actual_end_time: Date;

  @Column({ type: "enum", enum: Status, default: Status.Backlog })
  status: Status;

  @Column({ type: "enum", enum: Priority, default: Priority.Low })
  priority: Priority;

  @Column("text", { array: true, default: [] })
  supported_files: string[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
