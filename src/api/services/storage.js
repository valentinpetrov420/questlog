export function loadLists() {
	const data = JSON.parse(localStorage.getItem("lists") || "[]");

	return data.map(list => ({
		...list,
		createdAt: list.createdAt ?? Date.now(),
		updatedAt: list.updatedAt ?? Date.now(),
		pinned: list.pinned ?? false,
		archived: list.archived ?? false,
	}));
}

export function saveLists(lists) {
	localStorage.setItem("lists", JSON.stringify(lists));
}