import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";

import NodePage from "./NodePage";

import { useAuth } from "../../contexts/AuthContext.js";
import { useNodes } from "../../contexts/NodesContext.js";

//import firestoreService from "../../api/services/firestoreService.js";

vi.mock("firebase/firestore", () => ({
    doc: vi.fn(),
    onSnapshot: vi.fn((_ref: unknown, cb: (snap: unknown) => void) => {
        cb({
            exists: () => true,
            id: "node-1",
            data: () => ({ text: "parent node", ownerId: "user-1", parentId: null }),
        });
        return vi.fn();
    }),
}));

vi.mock("../../api/firebase.js", () => ({ db: {} }));

vi.mock("../../contexts/AuthContext.js", () => ({ useAuth: vi.fn() }));
vi.mock("../../contexts/NodesContext.js", () => ({ useNodes: vi.fn() }));

vi.mock("../../api/services/firestoreService.js", () => ({
    default: { nodes: { getNode: vi.fn() } },
}));
vi.mock("../../api/services/localStorageService.js", () => ({
    default: { nodes: { getNode: vi.fn() } },
}));

vi.mock("../../components/List/List.js", () => ({
    default: (props: { text: string }) => <div data-testid="list">{props.text}</div>,
}));

const parentNode = {
    id: "node-1",
    text: "parent node",
    ownerId: "user-1",
    parentId: null,
    pinned: false,
    archived: false,
    isPublic: false,
    order: 0,
};
const flatNodes = [parentNode];

function renderPage(path = "/node-1") {
    return render(
        <MemoryRouter initialEntries={[path]}>
            <Routes>
                <Route path="/:nodeId" element={<NodePage />} />
            </Routes>
        </MemoryRouter>
    );
}

describe("NodePage", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        vi.mocked(useAuth).mockReturnValue({
            user: { uid: "user-1" },
            isGuest: () => false,
        } as any);

        vi.mocked(useNodes).mockReturnValue({
            flatNodes,
            nodesLoading: false,
            setNodesLoading: vi.fn(),
        } as any);
    });

    it("renders without crashing", () => {
        renderPage();

        expect(screen.getByTestId("list")).toHaveTextContent("parent node");
    });
});