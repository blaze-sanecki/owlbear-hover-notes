import OBR from "@owlbear-rodeo/sdk";
import { setupContextMenu } from "./contextMenu";
import { setupTool } from "./tool";
import { ID } from "./constants";


OBR.onReady(() => {
	setupContextMenu();
	setupTool();
	OBR.player.onChange(async () => {
		await OBR.popover.close(`${ID}/popover`);
	});
});

