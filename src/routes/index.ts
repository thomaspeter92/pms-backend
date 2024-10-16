import { Express, Router } from "express";
import { RolesRouter } from "../components/roles/roles_router";
import { UsersRouter } from "../components/users/users_router";
import { CommentsRouter } from "../components/comments/comments_router";
import { TasksRouter } from "../components/tasks/tasks_router";
import { ProjectsRouter } from "../components/projects/projects_router";

export class AppRouter {
  public router: Router;

  constructor(app: Express) {
    const routerClasses = [
      RolesRouter,
      UsersRouter,
      CommentsRouter,
      TasksRouter,
      ProjectsRouter,
    ];

    for (const RouterClass of routerClasses) {
      try {
        new RouterClass(app);
        console.log(`Router: ${RouterClass.name} - CONNECTED`);
      } catch (error) {
        console.log(`Router: ${RouterClass.name} - FAILED`);
      }
    }
  }
}
