import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
//import userEvent from "@testing-library/user-event";

import List from "./List.js";

import { useNodes } from "../../contexts/NodesContext.js";
import { useAuth } from "../../contexts/AuthContext.js";
import { MemoryRouter } from "react-router-dom";

vi.mock("../../contexts/NodesContext.js", () => ({
    useNodes: vi.fn(),
}));

vi.mock("../../contexts/AuthContext.js", () => ({
    useAuth: vi.fn(),
}));

const mockedUseAuth = vi.mocked(useAuth);
const mockedUseNodes = vi.mocked(useNodes);

afterEach(() => {
    cleanup();
});

describe("List", () => {
    const handleArchiveNode = vi.fn();
    const handleRestoreNode = vi.fn();
    const handleEditNodeText = vi.fn();
    const handlePin = vi.fn();
    const handleVisibilityChange = vi.fn();
    const handleResetTasks = vi.fn();
    const handleDeleteNode = vi.fn();
    const handleCreateChildNode = vi.fn();
    const setFlatNodes = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        mockedUseNodes.mockReturnValue({
            setFlatNodes,

            handleCreateChildNode,
            handleArchiveNode,
            handleRestoreNode,
            handleEditNodeText,
            handlePin,
            handleVisibilityChange,
            handleResetTasks,
            handleDeleteNode,
        } as any);

    });

    describe("authenticated owner", () => {
        beforeEach(() => {
            mockedUseAuth.mockReturnValue({
                isGuest: () => false,
                user: {
                    uid: "user-1",
                },
            } as any);
        });

        it("renders the list title", () => {
            render(
                <MemoryRouter>
                    <List
                        isNodePage={false}
                        id="list-1"
                        key="list-1"
                        text="test"
                        pinned={false}
                        listItems={[]}
                        isArchived={false}
                        isPublic={false}
                        ownerId="user-1"
                    />
                </MemoryRouter>
            );

            expect(screen.getByText("test")).toBeInTheDocument();
        });
        it("renders list items", async () => {
            render(
                <MemoryRouter>
                    <List
                        isNodePage={false}
                        id="list-1"
                        key="list-1"
                        text="test"
                        pinned={false}
                        listItems={[
                            {
                                id: "item-1",
                                text: "#1",
                                parentId: "list-1",
                                type: "todo",
                                ownerId: "user-1",
                                isPublic: false,
                                pinned: false,
                                archived: false,
                                order: 0,
                                createdAt: 0,
                                updatedAt: 0,
                                completed: false,
                            },
                            {
                                id: "item-2",
                                text: "#2",
                                parentId: "list-1",
                                type: "todo",
                                ownerId: "user-1",
                                isPublic: false,
                                pinned: false,
                                archived: false,
                                order: 0,
                                createdAt: 0,
                                updatedAt: 0,
                                completed: false,
                            },
                            {
                                id: "item-3",
                                text: "#3",
                                parentId: "list-1",
                                type: "todo",
                                ownerId: "user-1",
                                isPublic: false,
                                pinned: false,
                                archived: false,
                                order: 0,
                                createdAt: 0,
                                updatedAt: 0,
                                completed: false,
                            }
                        ]}
                        isArchived={false}
                        isPublic={false}
                        ownerId="user-1"
                    />
                </MemoryRouter>
            );

            expect(screen.getByText("#1")).toBeInTheDocument();
            expect(screen.getByText("#2")).toBeInTheDocument();
            expect(screen.getByText("#3")).toBeInTheDocument();
        });
        it("renders details link outside of NodePage", () => {
            render(
                <MemoryRouter>
                    <List
                        isNodePage={false}

                        id="list-1"
                        key="list-1"
                        text="test"
                        pinned={false}
                        listItems={[]}
                        isArchived={false}
                        isPublic={false}
                        ownerId="user-1"
                    />
                </MemoryRouter>
            );

            expect(screen.getByText("Details")).toBeInTheDocument();
        });
        it("does not render details link in NodePage", () => {
            render(
                <MemoryRouter>
                    <List
                        isNodePage={true}

                        id="list-1"
                        key="list-1"
                        text="test"
                        pinned={false}
                        listItems={[]}
                        isArchived={false}
                        isPublic={false}
                        ownerId="user-1"
                    />
                </MemoryRouter>
            );

            expect(screen.queryByText("Details")).not.toBeInTheDocument();
        });
        it("renders progress bar if todos are present", () => {
            render(
                <MemoryRouter>
                    <List
                        isNodePage={false}
                        id="list-1"
                        key="list-1"
                        text="test"
                        pinned={false}
                        listItems={[
                            {
                                id: "item-1",
                                text: "#1",
                                parentId: "list-1",
                                type: "todo",
                                ownerId: "user-1",
                                isPublic: false,
                                pinned: false,
                                archived: false,
                                order: 0,
                                createdAt: 0,
                                updatedAt: 0,
                                completed: false,
                            },
                            {
                                id: "item-2",
                                text: "#2",
                                parentId: "list-1",
                                type: "todo",
                                ownerId: "user-1",
                                isPublic: false,
                                pinned: false,
                                archived: false,
                                order: 0,
                                createdAt: 0,
                                updatedAt: 0,
                                completed: false,
                            },
                            {
                                id: "item-3",
                                text: "#3",
                                parentId: "list-1",
                                type: "todo",
                                ownerId: "user-1",
                                isPublic: false,
                                pinned: false,
                                archived: false,
                                order: 0,
                                createdAt: 0,
                                updatedAt: 0,
                                completed: false,
                            }
                        ]}
                        isArchived={false}
                        isPublic={false}
                        ownerId="user-1"
                    />
                </MemoryRouter>
            );

            expect(screen.getByText("0%")).toBeInTheDocument();
        });
        it("does not progress bar if no todo items", () => {
            render(
                <MemoryRouter>
                    <List
                        isNodePage={false}
                        id="list-1"
                        key="list-1"
                        text="test"
                        pinned={false}
                        listItems={[
                            {
                                id: "item-1",
                                text: "#1",
                                parentId: "list-1",
                                type: "heading",
                                ownerId: "user-1",
                                isPublic: false,
                                pinned: false,
                                archived: false,
                                order: 0,
                                createdAt: 0,
                                updatedAt: 0,
                                completed: false,
                            },
                            {
                                id: "item-2",
                                text: "#2",
                                parentId: "list-1",
                                type: "heading",
                                ownerId: "user-1",
                                isPublic: false,
                                pinned: false,
                                archived: false,
                                order: 0,
                                createdAt: 0,
                                updatedAt: 0,
                                completed: false,
                            },
                            {
                                id: "item-3",
                                text: "#3",
                                parentId: "list-1",
                                type: "heading",
                                ownerId: "user-1",
                                isPublic: false,
                                pinned: false,
                                archived: false,
                                order: 0,
                                createdAt: 0,
                                updatedAt: 0,
                                completed: false,
                            }
                        ]}
                        isArchived={false}
                        isPublic={false}
                        ownerId="user-1"
                    />
                </MemoryRouter>
            );

            expect(screen.queryByText("0%")).not.toBeInTheDocument();
        });
    });

    describe("non-owner", () => {
        beforeEach(() => {
            mockedUseAuth.mockReturnValue({
                isGuest: () => false,
                user: {
                    uid: "user-2",
                },
            } as any);
        });

        it("renders the list title", () => {
            render(
                <MemoryRouter>
                    <List
                        isNodePage={true}
                        id="list-1"
                        key="list-1"
                        text="test"
                        pinned={false}
                        listItems={[]}
                        isArchived={false}
                        isPublic={false}
                        ownerId="user-1"
                    />
                </MemoryRouter>
            );

            expect(screen.getByText("test")).toBeInTheDocument();
        });
    });

    describe("guest mode", () => {
        beforeEach(() => {
            mockedUseAuth.mockReturnValue({
                isGuest: () => true,
                user: {
                    uid: "user-1",
                },
            } as any);
        });

        it("renders the list title", () => {
            render(
                <MemoryRouter>
                    <List
                        isNodePage={false}
                        id="list-1"
                        key="list-1"
                        text="test"
                        pinned={false}
                        listItems={[]}
                        isArchived={false}
                        isPublic={false}
                        ownerId="user-1"
                    />
                </MemoryRouter>
            );

            expect(screen.getByText("test")).toBeInTheDocument();
        });
    });
});