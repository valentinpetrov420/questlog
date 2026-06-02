import { __loadMockStorage, __clearStorage } from "./devTools";

export default function DevPanel({ setLists }) {
    return <div>
        <button onClick={() => __loadMockStorage(setLists)}>__loadMockStorage()</button>
        <button onClick={() => __clearStorage(setLists)}>__clearStorage()</button>
    </div>;
}