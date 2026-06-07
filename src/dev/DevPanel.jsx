import { __loadMockStorage, __clearStorage } from "./devTools";
import { getLists } from "../api/services/firestoreService";

export default function DevPanel(props) {
    return <div>
        <button onClick={() => __loadMockStorage(props.setLists)}>__loadMockStorage()</button>
        <button onClick={() => __clearStorage(props.setLists)}>__clearStorage()</button>
        
        <button
            onClick={async () => {
                console.log(await getLists(props.userId));
            }}
        >
            getLists()
        </button>
    </div>;
}