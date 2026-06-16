import { __loadMockStorage, __clearStorage } from "./devTools";
import firestoreService from "../api/services/firestoreService";

export default function DevPanel(props) {
    return <div>
        <button onClick={() => __loadMockStorage(props.setLists)}>__loadMockStorage()</button>
        <button onClick={() => __clearStorage(props.setLists)}>__clearStorage()</button>
        
        <button
            onClick={async () => {
                console.log(await firestoreService.lists.getHydratedLists(props.userId));
            }}
        >
            getLists()
        </button>
    </div>;
}