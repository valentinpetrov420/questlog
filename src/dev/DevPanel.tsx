import "./DevPanel.css";

import localStorageService from "../api/services/localStorageService";

import { networkStress } from "./networkStress";

type DevPanelProps = {
    userId?: string,
}

export default function DevPanel(props: DevPanelProps) {
    console.log("User: " + props.userId);

    return <div className="devPanel">
        <button
            onClick={() => {
                const result = localStorageService.nodes.createNode("guest", {
                    type: "todo",
                    parentId: null,
                    text: "test",
                    isPublic: false,
                })
                console.log(result);
            }}>
            createNode();
        </button>
        <button
            onClick={() => {
                const result = localStorageService.nodes.getNodes();
                console.log(result);
            }}>
            getNodes();
        </button>
        <button
            onClick={() => {
                localStorageService.nodes.clearLocalNodes();
                console.log("cleared guestNodes");
            }}>
            clearLocalNodes();
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