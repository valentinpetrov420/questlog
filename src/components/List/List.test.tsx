import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import List from "./List.js";
import type { Node } from "../../types/Node.js";

import { useNodes } from "../../contexts/NodesContext.js";
import { useAuth } from "../../contexts/AuthContext.js";
import { MemoryRouter, Routes, Route } from "react-router-dom";

import type { DragEndEvent } from "@dnd-kit/core";

const { dragEndHandler, localReorder, firestoreReorder } = vi.hoisted(() => ({
    dragEndHandler: { current: undefined as ((e: DragEndEvent) => void) | undefined },
    localReorder: vi.fn(),
    firestoreReorder: vi.fn(),
}));

vi.mock("../../api/services/firestoreService.js", () => ({
    default: { nodes: { reorder: firestoreReorder } },
}));

vi.mock("../../api/services/localStorageService.js", () => ({
    default: { nodes: { reorder: localReorder } },
}));

vi.mock("@dnd-kit/core", async () => {
    const actual = await vi.importActual<typeof import("@dnd-kit/core")>("@dnd-kit/core");
    return {
        ...actual,
        DndContext: ({ children, onDragEnd }: any) => {
            dragEndHandler.current = onDragEnd;
            return <>{children}</>;
        },
    };
});

function drag(activeId: string, overId: string | null) {
    dragEndHandler.current!({
        active: { id: activeId },
        over: overId ? { id: overId } : null,
    } as DragEndEvent);
}

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
        //ownerId: user-1
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

        it("renders owner action menu", async () => {
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

            expect(screen.getByText("⋯")).toBeInTheDocument();
        });

        it("renders add item form", async () => {
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

            expect(screen.getByText("Add new quest")).toBeInTheDocument();
        });
        it("submitting add item calls handleSubmit", async () => {
            vi.mocked(handleCreateChildNode).mockResolvedValue({ error: null, data: {} });

            const user = userEvent.setup();

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

            const input = screen.getByPlaceholderText("New quest task...");
            const button = screen.getByText("Add new quest");

            await user.type(input, "#1");
            await user.click(button);

            expect(handleCreateChildNode).toHaveBeenCalledWith("#1", "list-1", "todo");
        });
        it("invalid add item input shows StatusMessage", async () => {
            vi.mocked(handleCreateChildNode).mockResolvedValue({
                error:
                    { message: "Field cannot be empty." }, data: {}
            });

            const user = userEvent.setup();

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

            const button = screen.getByText("Add new quest");

            await user.click(button);

            waitFor(() => {
                expect(screen.getByText("Field cannot be empty.")).toBeInTheDocument();
            });
        });

        it("clicking title span opens input", async () => {
            const user = userEvent.setup();

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

            const title = screen.getByText("test");

            await user.click(title);

            expect(screen.getByDisplayValue("test")).toBeInTheDocument();
        });
        it("submitting title edit calls handleSubmitEdit", async () => {
            const user = userEvent.setup();

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

            const title = screen.getByText("test");

            await user.click(title);

            const input = screen.getByDisplayValue("test");

            expect(input).toBeInTheDocument();

            await user.type(input, "123"); 1
            await user.keyboard("{Enter}");

            expect(handleEditNodeText).toHaveBeenCalledWith("list-1", "test123");
        });
        it("pressing escape cancels edit mode", async () => {
            const user = userEvent.setup();

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

            const title = screen.getByText("test");

            await user.click(title);

            const input = screen.getByDisplayValue("test");

            expect(input).toBeInTheDocument();

            await user.type(input, "123");
            await user.keyboard("{Escape}");

            expect(input).not.toBeInTheDocument();
            expect(handleEditNodeText).not.toHaveBeenCalled();
        });
        it("invalid input shows StatusMessage and doesn't exit edit mode", async () => {
            const user = userEvent.setup();

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

            const title = screen.getByText("test");

            await user.click(title);

            const input = screen.getByDisplayValue("test");

            expect(input).toBeInTheDocument();

            await user.clear(input);
            await user.keyboard("{Enter}");

            waitFor(() => {
                expect(screen.getByText("Field cannot be empty.")).toBeInTheDocument();
            });

            const newInput = screen.getByDisplayValue("");

            expect(newInput).toBeInTheDocument();
        });

        it("adding separator calls handleCreateChildNode with separator values", async () => {
            vi.mocked(handleCreateChildNode).mockResolvedValue({ error: null, data: {} });

            const user = userEvent.setup();

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

            const button = screen.getByText("+");
            await user.click(button);
            const addSeparatorButton = screen.getByText("Add Separator");
            await user.click(addSeparatorButton);

            expect(handleCreateChildNode).toHaveBeenCalledWith("separator", "list-1", "separator");
        });
        it("adding heading calls handleCreateChildNode with heading values and returns id", async () => {
            vi.mocked(handleCreateChildNode).mockResolvedValue({ error: null, data: { id: "heading-id" } });

            const user = userEvent.setup();

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

            const button = screen.getByText("+");
            await user.click(button);
            const addHeadingButton = screen.getByText("Add Heading");
            await user.click(addHeadingButton);

            expect(handleCreateChildNode).toHaveBeenCalledWith("New Heading", "list-1", "heading");
        });

        it("archive click calls handleArchiveNode", async () => {
            const user = userEvent.setup();

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

            const button = screen.getByText("⋯");
            await user.click(button);
            const archiveButton = screen.getByText("Archive");
            await user.click(archiveButton);

            expect(handleArchiveNode).toHaveBeenCalledWith("list-1");
        });
        it("restore click calls handleRestoreNode", async () => {
            const user = userEvent.setup();

            render(
                <MemoryRouter>
                    <List
                        isNodePage={false}
                        id="list-1"
                        key="list-1"
                        text="test"
                        pinned={false}
                        listItems={[]}
                        isArchived={true}
                        isPublic={false}
                        ownerId="user-1"
                    />
                </MemoryRouter>
            );

            const button = screen.getByText("⋯");
            await user.click(button);
            const RestoreButton = screen.getByText("Restore");
            await user.click(RestoreButton);

            expect(handleRestoreNode).toHaveBeenCalledWith("list-1");
        });
        it("pin click calls handlePinNode", async () => {
            const user = userEvent.setup();

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

            const button = screen.getByText("⋯");
            await user.click(button);
            const pinButton = screen.getByText("Pin");
            await user.click(pinButton);

            expect(handlePin).toHaveBeenCalledWith("list-1");
        });
        it("change to public/private click calls handleVisibilityChange", async () => {
            const user = userEvent.setup();

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

            const button = screen.getByText("⋯");
            await user.click(button);
            const visibilityButton = screen.getByText("Change to Public");
            await user.click(visibilityButton);

            expect(handleVisibilityChange).toHaveBeenCalledWith("list-1");
        });
        it("copy link click adds current url to clipboard", async () => {
            const user = userEvent.setup();

            const writeText = vi.fn().mockResolvedValue(undefined);
            Object.defineProperty(navigator, "clipboard", {
                value: { writeText },
                configurable: true,
            });

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
                        isPublic={true}
                        ownerId="user-1"
                    />
                </MemoryRouter>
            );

            const button = screen.getByText("⋯");
            await user.click(button);
            const copyLinkButton = screen.getByText("Copy link");
            await user.click(copyLinkButton);

            expect(writeText).toHaveBeenCalledWith(window.location.href);
        });
        it("delete click calls handleDeleteNode", async () => {
            const user = userEvent.setup();

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

            const button = screen.getByText("⋯");
            await user.click(button);
            const deleteButton = screen.getByText("Delete");
            await user.click(deleteButton);

            expect(handleDeleteNode).toHaveBeenCalledWith("list-1");

            waitFor(() => {
                expect(screen.getByText("test")).not.toBeInTheDocument();
            });
        });
        it("delete click in NodePage redirects to '/'", async () => {
            const user = userEvent.setup();

            render(
                <MemoryRouter initialEntries={["/list-1"]}>
                    <Routes>
                        <Route path="/" element={<div>Dashboard</div>} />
                        <Route
                            path="/:nodeId"
                            element={<List
                                isNodePage={true}
                                id="list-1"
                                key="list-1"
                                text="test"
                                pinned={false}
                                listItems={[]}
                                isArchived={false}
                                isPublic={false}
                                ownerId="user-1"
                            />}
                        />
                    </Routes>
                </MemoryRouter>
            );

            const button = screen.getByText("⋯");
            await user.click(button);
            const deleteButton = screen.getByText("Delete");
            await user.click(deleteButton);

            waitFor(() => {
                expect(screen.getByText("test")).not.toBeInTheDocument();
            });

            expect(screen.getByText("Dashboard")).toBeInTheDocument();
        });

        it("reset tasks button click resets all completed todos", async () => {
            const user = userEvent.setup();

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
                                completed: true,
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
                                completed: true,
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
                                completed: true,
                            }
                        ]}
                        isArchived={false}
                        isPublic={false}
                        ownerId="user-1"
                    />
                </MemoryRouter>
            );

            await user.click(screen.getByText("Reset"));

            waitFor(() => {
                screen.getAllByRole('checkbox').forEach((cb) => {
                    expect(cb).not.toBeChecked();
                });
            });

            expect(handleResetTasks).toHaveBeenCalledWith("list-1");
        });

        it("drag and drop persists the new order", async () => {
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
                                completed: true,
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
                                completed: true,
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
                                completed: true,
                            }
                        ]}
                        isArchived={false}
                        isPublic={false}
                        ownerId="user-1"
                    />
                </MemoryRouter>
            );

            drag("item-1", "item-3");

            const firstCall = firestoreReorder.mock.calls[0];
            const reorderedNodes = firstCall[0];
            const savedOrder = reorderedNodes.map((node: Node) => node.id);

            expect(savedOrder).toEqual(["item-2", "item-3", "item-1"]);
        });

    });

    describe("non-owner", () => {
        //ownerId: user-2
        beforeEach(() => {
            mockedUseAuth.mockReturnValue({
                isGuest: () => false,
                user: {
                    uid: "user-2",
                },
            } as any);
        });

        it("doesn't render owner menu if not owner", () => {
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

            expect(screen.queryByText("⋯")).not.toBeInTheDocument();
        });

        it("doesn't render add new item button if not owner", () => {
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

            expect(screen.queryByText("Add new item")).not.toBeInTheDocument();
        });

        it("doesn't render title edit span if not owner", async () => {
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

            expect(screen.getByText("test").tagName).toBe("P");
        });

        it("doesn't render reset tasks button if not owner", () => {
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

            expect(screen.queryByText("Reset")).not.toBeInTheDocument();
        })
    });

    describe("guest mode", () => {
        //ownerId: user-1
        //isGuest: () => true;
        beforeEach(() => {
            mockedUseAuth.mockReturnValue({
                isGuest: () => true,
                user: {
                    uid: "user-1",
                },
            } as any);
        });

        it("doesn't render restricted actions", async () => {
            const user = userEvent.setup();

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

            const button = screen.getByText("⋯");

            await user.click(button);

            expect(screen.queryByText("Copy link")).not.toBeInTheDocument();
            expect(screen.queryByText("Change to Public")).not.toBeInTheDocument();
            expect(screen.queryByText("Change to Private")).not.toBeInTheDocument();
        });

        it("drag and drop persists the new order", async () => {
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
                                completed: true,
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
                                completed: true,
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
                                completed: true,
                            }
                        ]}
                        isArchived={false}
                        isPublic={false}
                        ownerId="user-1"
                    />
                </MemoryRouter>
            );

            drag("item-1", "item-3");

            const firstCall = localReorder.mock.calls[0];
            const reorderedNodes = firstCall[0];
            const savedOrder = reorderedNodes.map((node: Node) => node.id);

            expect(savedOrder).toEqual(["item-2", "item-3", "item-1"]);
        });
    });
});