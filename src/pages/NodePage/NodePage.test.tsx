import {
    render, screen, act, cleanup
    //waitFor
} from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import NodePage from "./NodePage";

import { useAuth } from "../../contexts/AuthContext.js";
import { useNodes } from "../../contexts/NodesContext.js";

import firestoreService from "../../api/services/firestoreService.js";

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

vi.mock("../SkeletonPage/SkeletonPage.js", () => ({
    default: () => <div data-testid="skeleton" />,
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

afterEach(() => {
    cleanup();
});

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

    it("renders node from state", () => {
        renderPage();

        expect(screen.getByTestId("list")).toHaveTextContent("parent node");
    });

    it("renders 404 if node is not in state and firestoreService getNode returns null", async () => {
        vi.mocked(firestoreService.nodes.getNode).mockResolvedValue(null as any);

        renderPage("/node-2");

        expect(await screen.findByText("404")).toBeInTheDocument();
    });

    it("renders skeleton loading page during inflight request", async () => {
        let resolveNode!: (value: unknown) => void;
        const pending = new Promise((resolve) => {
            resolveNode = resolve;
        });

        vi.mocked(useNodes).mockReturnValue({
            flatNodes: [],
            nodesLoading: false,
            setNodesLoading: vi.fn(),
        } as any);
        vi.mocked(firestoreService.nodes.getNode).mockReturnValue(pending as any);

        renderPage("/node-1");

        expect(screen.getByTestId("skeleton")).toBeInTheDocument();
        expect(screen.queryByTestId("list")).not.toBeInTheDocument();

        resolveNode(parentNode);

        await act(async () => {
            resolveNode(parentNode);
        });

        expect(await screen.findByTestId("list")).toHaveTextContent("parent node");
        expect(screen.queryByTestId("skeleton")).not.toBeInTheDocument();
    });

    it("renders firestore list if id isn't in state", async () => {
        const storedNode = { ...parentNode, text: "stored node" }

        vi.mocked(useNodes).mockReturnValue({
            flatNodes: [],
            nodesLoading: false,
            setNodesLoading: vi.fn(),
        } as any);
        vi.mocked(firestoreService.nodes.getNode).mockResolvedValue(storedNode as any);

        renderPage("/node-1");

        expect(await screen.findByTestId("list")).toHaveTextContent("stored node");
        expect(firestoreService.nodes.getNode).toHaveBeenCalledWith("node-1");
    });
});