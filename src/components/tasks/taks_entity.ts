import {
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Entity,
} from "typeorm";
import { Users } from "components/users/users_entity";
import { Projects } from "components/projects/projects_entity";

export enum Status {
  NotStarted = "Not-Started",
  InProgress = "In-Progress",
  Completed = "Completed",
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

  @Column()
  actual_end_time: Date;

  @Column({ type: "enum", enum: Status, default: Status.NotStarted })
  status: Status;

  @Column("text", { array: true, default: [] })
  supported_files: string[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
