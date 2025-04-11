import { Projects } from "../../components/projects/projects_entity";
import { Users } from "../../components/users/users_entity";
import {
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";

@Entity()
export class ProjectMember {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Users, (user) => user.projects, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user: Users;

  @ManyToOne(() => Projects, (project) => project.members, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "project_id" })
  project: Projects;

  @CreateDateColumn()
  created_at: Date;
}

//   @Column()
//   @ManyToOne(() => Projects, (projectData) => projectData.project_id)
//   @JoinColumn({ name: "project_id" })
//   project_id: string;
