import "./DevPanel.css";

import firestoreService from "../api/services/firestoreService";

import { useNodes } from "../contexts/NodesContext";

import { networkStress } from "./networkStress";

type DevPanelProps = {
    userId?: string,
}

export default function DevPanel(props: DevPanelProps) {
    const { nodes } = useNodes();

    return <div className="devPanel">

        <button
            onClick={async () => {
                if (props.userId) {


                    console.log(await firestoreService.nodes.createNode(props.userId, {
                        type: "todo",
                        parentId: "K45SQVA1sKFE1zzwXMoz",
                        text: "test todo 2",
                        isPublic: false,
                    }));
                }
            }}>
            createNode()
        </button>
        <button
            onClick={async () => {
                console.log(nodes);
            }}>
            getNodes()
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