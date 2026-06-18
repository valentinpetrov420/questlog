import "./DevPanel.css";
import firestoreService from "../api/services/firestoreService";
import { networkStress } from "./networkStress";

export default function DevPanel(props) {
    return <div className="devPanel">

        <button
            onClick={async () => {
                console.log(await firestoreService.lists.getHydratedLists(props.userId));
            }}
        >
            getLists()
        </button>
        <select
            onChange={(event) => {
                networkStress.delayMs = Number(event.target.value);
            }}
        >
            <option value="0">no delay</option>
            <option value="500">500ms</option>
            <option value="1000">1000ms</option>
            <option value="3000">3000ms</option>
        </select>
    </div>;
}