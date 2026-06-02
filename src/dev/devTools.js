import mockData from "../mockdata";

export function __clearStorage(setLists) {
    setLists([]);
    localStorage.setItem("lists", JSON.stringify([]));
}
export function __loadMockStorage(setLists) {
    setLists(mockData);
}