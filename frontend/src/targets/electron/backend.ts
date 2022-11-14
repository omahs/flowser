import path from "path";
import {
  createApp,
  ProcessManagerService,
  ProjectsService,
  ProjectEntity,
} from "@flowser/backend";
import { INestApplication } from "@nestjs/common";
import { Logger } from "./services/logger.service";

export class FlowserBackend {
  private static instance: FlowserBackend;
  public app: INestApplication | undefined;

  public static getInstance(): FlowserBackend {
    if (!this.instance) {
      this.instance = new FlowserBackend();
    }
    return this.instance;
  }

  public async start(options: { userDataPath: string }): Promise<void> {
    const databaseFilePath = path.join(options.userDataPath, "flowser.sqlite");
    if (this.app) {
      await this.app.close();
    }
    this.app = await createApp({
      config: {
        database: {
          type: "sqlite",
          name: databaseFilePath,
        },
        common: {
          httpServerPort: 6061,
        },
      },
      nest: {
        logger: new Logger(),
      },
    });
  }

  public isCleanupComplete(): boolean {
    const processManagerService = this.app?.get(ProcessManagerService);
    return processManagerService?.isStoppedAll() ?? true;
  }

  public async cleanupAndStop(): Promise<void> {
    const processManagerService = this.app?.get(ProcessManagerService);
    // Make sure to stop all child processes, so that they don't become orphans
    await processManagerService?.stopAll();
    await this.app?.close();
  }

  public getDefaultProject(): ProjectEntity {
    const projectService = this.app?.get(ProjectsService);
    if (!projectService) {
      throw new Error("App not initialized");
    }
    const defaultProjectProto = projectService?.getDefaultProject();
    return ProjectEntity.create(defaultProjectProto);
  }

  public async startTemporaryProject(project: ProjectEntity): Promise<void> {
    const projectService = this.app?.get(ProjectsService);
    if (!projectService) {
      throw new Error("App not initialized");
    }
    await projectService?.useProject(project);
  }
}
