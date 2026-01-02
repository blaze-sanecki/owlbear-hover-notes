import OBR from "@owlbear-rodeo/sdk";
import { setupContextMenu } from "./contextMenu";
import { ID } from "./constants";

OBR.onReady(() => {
	setupContextMenu();

	OBR.player.onChange(async (player) => {
		const selection = player.selection;
		if (selection && selection.length === 1) {
			const items = await OBR.scene.items.getItems([selection[0]]);
			if (items.length > 0) {
				const item = items[0];
				const metadata = item.metadata[`${ID}/note`] as { url: string } | undefined;
				if (metadata && metadata.url) {
					const bounds = await OBR.scene.items.getItemBounds([item.id]);
					const position = await OBR.viewport.transformPoint(bounds.center);

					const width = 400;
					const height = 400;
					await OBR.popover.open({
						id: `${ID}/popover`,
						url: `/note.html?url=${encodeURIComponent(metadata.url)}`,
						height,
						width,
						anchorReference: "POSITION",
						anchorPosition: { left: position.x, top: position.y },
						anchorOrigin: {
							horizontal: "CENTER",
							vertical: "CENTER",
						},
						transformOrigin: {
							horizontal: "CENTER",
							vertical: "CENTER",
						},
						disableClickAway: false,
						hidePaper: true,
					});
					return;
				}
			}
		}
		await OBR.popover.close(`${ID}/popover`);
	});
});
