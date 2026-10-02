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
    });

    describe("authenticated non-owner", () => {
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