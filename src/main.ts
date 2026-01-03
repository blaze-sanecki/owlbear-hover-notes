import OBR from "@owlbear-rodeo/sdk";
import type { Image } from "@owlbear-rodeo/sdk";
import { setupContextMenu } from "./contextMenu";
import { setupTool } from "./tool";
import { ID } from "./constants";


OBR.onReady(() => {
	setupContextMenu();
	setupTool();

	OBR.scene.items.onChange((items) => {
		const defaults = JSON.parse(localStorage.getItem(`${ID}/defaults`) || "{}");
		const itemsToUpdate = items.filter((item) => {
			const metadata = item.metadata[`${ID}/note`] as { url: string } | undefined;
			const ignore = item.metadata[`${ID}/ignore-default`];
			if (metadata || ignore) return false;
			else if (item.type === "IMAGE" && (item as Image).image && defaults[(item as Image).image.url]) {
				return true;
			}
			return false;
		});

		if (itemsToUpdate.length > 0) {
			OBR.scene.items.updateItems(
				itemsToUpdate.map((item) => item.id),
				(items) => {
					for (const item of items) {
						if (item.type === "IMAGE" && (item as Image).image) {
							const defaultUrl = defaults[(item as Image).image.url];
							if (defaultUrl) {
								item.metadata[`${ID}/note`] = { url: defaultUrl };
							}
						}
					}
				}
			);
		}
	});
	OBR.player.onChange(async () => {
		await OBR.popover.close(`${ID}/popover`);
	});
});

