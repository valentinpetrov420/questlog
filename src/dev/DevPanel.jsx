import { __loadMockStorage, __clearStorage } from "./devTools";
import { getTestDocs, getTestLists } from "../api/services/firestoreService";

export default function DevPanel(props) {
    return <div>
        <button onClick={() => __loadMockStorage(props.setLists)}>__loadMockStorage()</button>
        <button onClick={() => __clearStorage(props.setLists)}>__clearStorage()</button>
        <button
            onClick={async () => {
                const docs = await getTestDocs();
                console.log(docs);
            }}
        >
            getTestDocs()
        </button>
        <button
            onClick={async () => {
                const docs = await getTestLists(props.userId);
                console.log(docs);
            }}
        >
            getTestLists()
        </button>
    </div>;
}