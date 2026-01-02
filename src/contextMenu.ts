import OBR from "@owlbear-rodeo/sdk";
import { ID } from "./constants";

export function setupContextMenu() {
	OBR.contextMenu.create({
		id: `${ID}/context-menu-set`,
		icons: [
			{
				icon: "/images/id-card.svg",
				label: "Set Image on Select...",
				filter: {
					every: [{ key: "layer", value: "ATTACHMENT" }],
				},
			},
		],
		async onClick(context) {
			const images = await OBR.assets.downloadImages(false);
			if (images.length > 0) {
				const url = images[0].image.url;
				const itemIds = context.items.map(item => item.id);
				await OBR.scene.items.updateItems(itemIds, (items) => {
					for (const item of items) {
						item.metadata[`${ID}/note`] = { url };
					}
				});
			}
			await OBR.player.deselect();
		},
	});

	OBR.contextMenu.create({
		id: `${ID}/context-menu-clear`,
		icons: [
			{
				icon: "/images/cancel.svg",
				label: "Disable Image on Select",
				filter: {
					every: [{ key: "layer", value: "ATTACHMENT" }],
				},
			},
		],
		async onClick(context) {
			const itemIds = context.items.map(item => item.id);
			await OBR.scene.items.updateItems(itemIds, (items) => {
				for (const item of items) {
					delete item.metadata[`${ID}/note`];
				}
			});
			await OBR.player.deselect();
		},
	});
}
