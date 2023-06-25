import { FlowCliService } from "../services/cli.service";
import { FlowConfigService } from "../services/config.service";
import { ProcessManagerService } from "../../processes/process-manager.service";
import { ProjectEntity } from "../../projects/project.entity";
import { DevWallet, Emulator, Gateway } from "@flowser/shared";

describe("FlowCliService", function () {
  let cliService: FlowCliService;

  beforeAll(async () => {
    const configService = new FlowConfigMockService();
    const processManagerService = new ProcessManagerService();
    cliService = new FlowCliService(configService, processManagerService);

    const mockProject = new ProjectEntity({
      devWallet: DevWallet.fromPartial({}),
      emulator: Emulator.fromPartial({}),
      filesystemPath: "",
      gateway: Gateway.fromPartial({}),
      id: "",
      name: "",
      startBlockHeight: 0,
    });
    await cliService.onEnterProjectContext(mockProject);
  });

  it("should return the generated key", async function () {
    const generatedKey = await cliService.generateKey();

    expect(generatedKey.private).toBeDefined();
    expect(generatedKey.public).toBeDefined();
    expect(generatedKey.derivationPath).toBeDefined();
    expect(generatedKey.mnemonic).toBeDefined();
  });
});

class FlowConfigMockService extends FlowConfigService {
  hasConfigFile(): boolean {
    // This is to skip the flow cli initialization in tests.
    return true;
  }
}