import OBR from "@owlbear-rodeo/sdk";
import { ID } from "./constants";

export function setupContextMenu() {
	OBR.contextMenu.create({
		id: `${ID}/context-menu-open`,
		icons: [
			{
				icon: "/images/icon-view.svg",
				label: "Preview Hover Note",
				filter: {
					every: [
						{ key: ["metadata", `${ID}/note`], value: undefined, operator: "!=" }
					],
				},
			},
		],
		shortcut: "Z",
		async onClick(context) {
			const item = context.items[0];
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
			}
		},
	});
	OBR.contextMenu.create({
		id: `${ID}/context-menu-set`,
		icons: [
			{
				icon: "/images/icon-select.svg",
				label: "Set Hover Note...",
				filter: {
					roles: ["GM"],
				},
			},
		],
		shortcut: "X",
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
				icon: "/images/icon-disable.svg",
				label: "Remove Hover Note",
				filter: {
					roles: ["GM"],
				},
			},
		],
		shortcut: "C",
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
