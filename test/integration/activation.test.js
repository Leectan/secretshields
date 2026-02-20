const assert = require("assert");
const vscode = require("vscode");

suite("Extension Activation", function () {
  this.timeout(30000);

  test("extension is present in installed extensions", () => {
    const ext = vscode.extensions.getExtension("secretshields.secretshields");
    assert.ok(ext, "Extension secretshields.secretshields should be installed");
  });

  test("extension activates without error", async () => {
    const ext = vscode.extensions.getExtension("secretshields.secretshields");
    assert.ok(ext, "Extension should be installed");
    await ext.activate();
    assert.strictEqual(ext.isActive, true, "Extension should be active");
  });

  test("all expected commands are registered", async () => {
    const ext = vscode.extensions.getExtension("secretshields.secretshields");
    if (ext && !ext.isActive) {
      await ext.activate();
    }

    const allCommands = await vscode.commands.getCommands(true);

    const expectedCommands = [
      "secretshields.maskClipboard",
      "secretshields.restoreLastSecret",
      "secretshields.showExposureLog",
      "secretshields.clearExposureLog",
      "secretshields.markRotated",
    ];

    for (const cmd of expectedCommands) {
      assert.ok(
        allCommands.includes(cmd),
        `Command "${cmd}" should be registered`
      );
    }
  });
});
