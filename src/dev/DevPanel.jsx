import { __loadMockStorage, __clearStorage } from "./devTools";
import { getTestDocs } from "../api/services/firestoreService";

export default function DevPanel({ setLists }) {
    return <div>
        <button onClick={() => __loadMockStorage(setLists)}>__loadMockStorage()</button>
        <button onClick={() => __clearStorage(setLists)}>__clearStorage()</button>
        <button
            onClick={async () => {
                const docs = await getTestDocs();
                console.log(docs);
            }}
        >
            getTestDocs()
        </button>
    </div>;
}