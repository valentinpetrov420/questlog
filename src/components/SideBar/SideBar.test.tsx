import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";

import SideBar from "./SideBar";

import { useNodes } from "../../contexts/NodesContext";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";

vi.mock("../../contexts/NodesContext", () => ({
    useNodes: vi.fn(),
}));

vi.mock("../../contexts/AuthContext", () => ({
    useAuth: vi.fn(),
}));

vi.mock("../../contexts/ThemeContext", () => ({
    useTheme: vi.fn(),
}));

const mockedUseNodes = vi.mocked(useNodes);
const mockedUseAuth = vi.mocked(useAuth);
const mockedUseTheme = vi.mocked(useTheme);

const flatNodes = [
    { id: "1", parentId: null, order: 0, type: "page" as const, isPublic: false, text: "Charlie", ownerId: "1", pinned: false, createdAt: 300, updatedAt: 300, archived: false, completed: false },
    { id: "2", parentId: null, order: 1, type: "page" as const, isPublic: false, text: "Alpha", ownerId: "1", pinned: false, createdAt: 100, updatedAt: 500, archived: false, completed: false },
    { id: "3", parentId: null, order: 2, type: "page" as const, isPublic: false, text: "Echo", ownerId: "1", pinned: false, createdAt: 500, updatedAt: 200, archived: false, completed: false },
    { id: "4", parentId: null, order: 3, type: "page" as const, isPublic: false, text: "Bravo", ownerId: "1", pinned: false, createdAt: 200, updatedAt: 400, archived: false, completed: false },
    { id: "5", parentId: null, order: 4, type: "page" as const, isPublic: false, text: "Delta", ownerId: "1", pinned: false, createdAt: 400, updatedAt: 100, archived: false, completed: false },
    { id: "6", parentId: null, order: 5, type: "page" as const, isPublic: false, text: "Foxtrot", ownerId: "1", pinned: false, createdAt: 600, updatedAt: 600, archived: false, completed: false },
    { id: "7", parentId: null, order: 6, type: "page" as const, isPublic: false, text: "Golf", ownerId: "1", pinned: false, createdAt: 700, updatedAt: 300, archived: false, completed: false },
    { id: "8", parentId: null, order: 7, type: "page" as const, isPublic: false, text: "Hotel", ownerId: "1", pinned: false, createdAt: 800, updatedAt: 700, archived: false, completed: false },
    { id: "9", parentId: null, order: 8, type: "page" as const, isPublic: false, text: "Archived Alpha", ownerId: "1", pinned: false, createdAt: 1, updatedAt: 1, archived: true, completed: false },
    { id: "10", parentId: null, order: 9, type: "page" as const, isPublic: false, text: "Archived Bravo", ownerId: "1", pinned: false, createdAt: 2, updatedAt: 2, archived: true, completed: false },
];
const popoverFlatNodes = [
    {
        id: "1",
        parentId: null,
        order: 0,
        type: "page" as const,

        isPublic: false,

        text: "Private Page",
        ownerId: "1",
        pinned: false,
        createdAt: 1,
        updatedAt: 1,

        archived: false,

        completed: false,
    },
    {
        id: "2",
        parentId: null,
        order: 1,
        type: "page" as const,
        isPublic: true,
        text: "Public Page",
        ownerId: "1",
        pinned: false,
        createdAt: 2,
        updatedAt: 2,
        archived: false,
        completed: false,
    },
    {
        id: "3",
        parentId: null,
        order: 2,
        type: "page" as const,
        isPublic: false,
        text: "Archived Private Page",
        ownerId: "1",
        pinned: false,
        createdAt: 3,
        updatedAt: 3,
        archived: true,
        completed: false,
    },
    {
        id: "4",
        parentId: null,
        order: 3,
        type: "page" as const,
        isPublic: true,
        text: "Archived Public Page",
        ownerId: "1",
        pinned: false,
        createdAt: 4,
        updatedAt: 4,
        archived: true,
        completed: false,
    },
];

const { navigate } = vi.hoisted(() => ({ navigate: vi.fn() }))

vi.mock('react-router-dom', async (importOriginal) => ({
    ...(await importOriginal<typeof import('react-router-dom')>()),
    useNavigate: () => navigate,
}));

afterEach(() => {
    cleanup();
    navigate.mockClear();
});

describe("SideBar", () => {
    const logoutUser = vi.fn();
    const loginWithGoogle = vi.fn();
    const setMenuOpen = vi.fn();

    const handleCreateNode = vi.fn();
    const handleArchiveNode = vi.fn();
    const handleRestoreNode = vi.fn();
    const handleVisibilityChange = vi.fn();
    const handleDeleteNode = vi.fn();
    const toggleDarkMode = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();

        mockedUseNodes.mockReturnValue({
            flatNodes: [],
            handleCreateNode,
            handleArchiveNode,
            handleRestoreNode,
            handleVisibilityChange,
            handleDeleteNode,
        } as any);

        mockedUseTheme.mockReturnValue({ toggleDarkMode } as any);

        vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
            json: () => Promise.resolve([]),
        }));
    });

    describe("authenticated behavior", () => {
        //user="user-1", isGuest: false
        beforeEach(() => {
            mockedUseAuth.mockReturnValue({
                isGuest: () => false,
            } as any);
        });

        it("renders user info and lists section", () => {
            render(
                <MemoryRouter>
                    <SideBar
                        user={{ uid: "user-1", displayName: "Test User", photoURL: "" } as any}
                        logoutUser={logoutUser}
                        loginWithGoogle={loginWithGoogle}
                        setMenuOpen={setMenuOpen}
                        menuOpen={true}
                    />
                </MemoryRouter>
            );

            expect(screen.getByPlaceholderText("Search lists...")).toBeInTheDocument();
            expect(screen.getByText("Test User")).toBeInTheDocument();
            expect(screen.getByRole("button", { name: "Logout" })).toBeInTheDocument();
        });

        it("escape key clears the search input", async () => {
            const user = userEvent.setup();
            render(
                <MemoryRouter>
                    <SideBar
                        user={{ uid: "user-1", displayName: "Test User", photoURL: "" } as any}
                        logoutUser={logoutUser}
                        loginWithGoogle={loginWithGoogle}
                        setMenuOpen={setMenuOpen}
                        menuOpen={true}
                    />
                </MemoryRouter>
            );

            await user.type(screen.getByPlaceholderText("Search lists..."), "123");
            expect(screen.getByPlaceholderText("Search lists...")).toHaveValue("123");

            await waitFor(() => {
                expect(screen.getByRole("button", { name: "✕" })).toBeInTheDocument();
            })

            await user.keyboard("{Escape}");

            expect(screen.queryByRole("button", { name: "✕" })).not.toBeInTheDocument();
            expect(screen.getByPlaceholderText("Search lists...")).toHaveValue("");
        });
        it("clicking X clears the search input", async () => {
            const user = userEvent.setup();
            render(
                <MemoryRouter>
                    <SideBar
                        user={{ uid: "user-1", displayName: "Test User", photoURL: "" } as any}
                        logoutUser={logoutUser}
                        loginWithGoogle={loginWithGoogle}
                        setMenuOpen={setMenuOpen}
                        menuOpen={true}
                    />
                </MemoryRouter>
            );

            await user.type(screen.getByPlaceholderText("Search lists..."), "123");
            expect(screen.getByPlaceholderText("Search lists...")).toHaveValue("123");

            await waitFor(() => {
                expect(screen.getByRole("button", { name: "✕" })).toBeInTheDocument();
            })

            await user.click(screen.getByRole("button", { name: "✕" }));

            expect(screen.queryByRole("button", { name: "✕" })).not.toBeInTheDocument();
            expect(screen.getByPlaceholderText("Search lists...")).toHaveValue("");
        });

        it("new page click redirects to calls context and redirects to NodePage", async () => {
            const user = userEvent.setup();
            vi.mocked(handleCreateNode).mockResolvedValue({ id: "list-1" });

            render(
                <MemoryRouter>
                    <SideBar
                        user={{ uid: "user-1", displayName: "Test User", photoURL: "" } as any}
                        logoutUser={logoutUser}
                        loginWithGoogle={loginWithGoogle}
                        setMenuOpen={setMenuOpen}
                        menuOpen={true}
                    />
                </MemoryRouter>
            );

            await user.click(screen.getByText("+ New Page"));

            expect(handleCreateNode).toHaveBeenCalledWith("New Page", false);

            await waitFor(() =>
                expect(navigate).toHaveBeenCalledTimes(1)
            );

            expect(navigate.mock.calls[0][0]).toBe("/list-1");
            expect(navigate.mock.calls[0][1]).toEqual({ state: { newParentId: "list-1" } });
        });
        it("new page displays StatusMessage on failed creation", async () => {
            const user = userEvent.setup();
            vi.mocked(handleCreateNode).mockResolvedValue({ error: { message: "Something went wrong." } });

            render(
                <MemoryRouter>
                    <SideBar
                        user={{ uid: "user-1", displayName: "Test User", photoURL: "" } as any}
                        logoutUser={logoutUser}
                        loginWithGoogle={loginWithGoogle}
                        setMenuOpen={setMenuOpen}
                        menuOpen={true}
                    />
                </MemoryRouter>
            );

            await user.click(screen.getByText("+ New Page"));

            expect(handleCreateNode).toHaveBeenCalledWith("New Page", false);

            await waitFor(() =>
                expect(navigate).toHaveBeenCalledTimes(0)
            );

            const newPageStatus = screen.getAllByRole("paragraph")[0];
            expect(newPageStatus).toHaveTextContent("Something went wrong.");
        });

        it("sorts by newest correctly and doesn't render archived", async () => {
            const user = userEvent.setup();

            mockedUseNodes.mockReturnValue({
                flatNodes,
                handleCreateNode,
                handleArchiveNode,
                handleRestoreNode,
                handleVisibilityChange,
                handleDeleteNode,
            } as any);

            render(
                <MemoryRouter>
                    <SideBar
                        user={{ uid: "user-1", displayName: "Test User", photoURL: "" } as any}
                        logoutUser={logoutUser}
                        loginWithGoogle={loginWithGoogle}
                        setMenuOpen={setMenuOpen}
                        menuOpen={true}
                    />
                </MemoryRouter>
            );

            await user.selectOptions(screen.getByRole("combobox"), "Newest");

            const renderedOrder = screen.getAllByRole("listitem").map(item =>
                item.querySelector("a")?.textContent?.trim()
            );

            expect(renderedOrder).toEqual([
                "Hotel",
                "Golf",
                "Foxtrot",
                "Echo",
                "Delta",
                "Charlie",
                "Bravo",
                "Alpha",
            ]);
        });
        it("sorts by alphabetical order correctly", async () => {
            const user = userEvent.setup();

            mockedUseNodes.mockReturnValue({
                flatNodes,
                handleCreateNode,
                handleArchiveNode,
                handleRestoreNode,
                handleVisibilityChange,
                handleDeleteNode,
            } as any);

            render(
                <MemoryRouter>
                    <SideBar
                        user={{ uid: "user-1", displayName: "Test User", photoURL: "" } as any}
                        logoutUser={logoutUser}
                        loginWithGoogle={loginWithGoogle}
                        setMenuOpen={setMenuOpen}
                        menuOpen={true}
                    />
                </MemoryRouter>
            );

            await user.selectOptions(screen.getByRole("combobox"), "Alphabetical");

            const renderedOrder = screen.getAllByRole("listitem").map(item =>
                item.querySelector("a")?.textContent?.trim()
            );

            expect(renderedOrder).toEqual([
                "Alpha",
                "Bravo",
                "Charlie",
                "Delta",
                "Echo",
                "Foxtrot",
                "Golf",
                "Hotel",
            ]);
        });
        it("sorts by last updated correctly", async () => {
            const user = userEvent.setup();

            mockedUseNodes.mockReturnValue({
                flatNodes,
                handleCreateNode,
                handleArchiveNode,
                handleRestoreNode,
                handleVisibilityChange,
                handleDeleteNode,
            } as any);

            render(
                <MemoryRouter>
                    <SideBar
                        user={{ uid: "user-1", displayName: "Test User", photoURL: "" } as any}
                        logoutUser={logoutUser}
                        loginWithGoogle={loginWithGoogle}
                        setMenuOpen={setMenuOpen}
                        menuOpen={true}
                    />
                </MemoryRouter>
            );

            await user.selectOptions(screen.getByRole("combobox"), "Last updated");

            const renderedOrder = screen.getAllByRole("listitem").map(item =>
                item.querySelector("a")?.textContent?.trim()
            );

            expect(renderedOrder).toEqual([
                "Hotel",
                "Foxtrot",
                "Alpha",
                "Bravo",
                "Charlie",
                "Golf",
                "Echo",
                "Delta",
            ]);
        });
        it("sorting archived only shows only archived nodes", async () => {
            const user = userEvent.setup();

            mockedUseNodes.mockReturnValue({
                flatNodes,
                handleCreateNode,
                handleArchiveNode,
                handleRestoreNode,
                handleVisibilityChange,
                handleDeleteNode,
            } as any);

            render(
                <MemoryRouter>
                    <SideBar
                        user={{ uid: "user-1", displayName: "Test User", photoURL: "" } as any}
                        logoutUser={logoutUser}
                        loginWithGoogle={loginWithGoogle}
                        setMenuOpen={setMenuOpen}
                        menuOpen={true}
                    />
                </MemoryRouter>
            );

            await user.selectOptions(screen.getByRole("combobox"), "Archived only");

            const renderedOrder = screen.getAllByRole("listitem").map(item =>
                item.querySelector("a")?.textContent?.trim()
            );

            expect(renderedOrder).toEqual([
                "Archived Alpha",
                "Archived Bravo",
            ]);
        });

        it("popover renders correct actions for unarchived private pages", async () => {
            const user = userEvent.setup();

            mockedUseNodes.mockReturnValue({
                flatNodes: popoverFlatNodes,
                handleCreateNode,
                handleArchiveNode,
                handleRestoreNode,
                handleVisibilityChange,
                handleDeleteNode,
            } as any);

            render(
                <MemoryRouter>
                    <SideBar
                        user={{ uid: "user-1", displayName: "Test User", photoURL: "" } as any}
                        logoutUser={logoutUser}
                        loginWithGoogle={loginWithGoogle}
                        setMenuOpen={setMenuOpen}
                        menuOpen={true}
                    />
                </MemoryRouter>
            );

            const link = screen.getByRole("link", { name: "Private Page" });
            const listItem = link.closest("li");

            expect(listItem).not.toBeNull();

            const popover = link.nextElementSibling;
            expect(popover?.tagName).toBe("DIV");

            const button = within(popover as HTMLElement).getByRole("button");

            await user.click(button);

            expect(screen.getByText("Archive")).toBeInTheDocument();
            expect(screen.getByText("Change to Public")).toBeInTheDocument();
            expect(screen.getByText("Delete")).toBeInTheDocument();

            expect(screen.queryByText("Restore")).not.toBeInTheDocument();
            expect(screen.queryByText("Change to Private")).not.toBeInTheDocument();
            expect(screen.queryByText("Copy link")).not.toBeInTheDocument();
        });
        it("popover renders correct actions for unarchived public pages", async () => {
            const user = userEvent.setup();

            mockedUseNodes.mockReturnValue({
                flatNodes: popoverFlatNodes,
                handleCreateNode,
                handleArchiveNode,
                handleRestoreNode,
                handleVisibilityChange,
                handleDeleteNode,
            } as any);

            render(
                <MemoryRouter>
                    <SideBar
                        user={{ uid: "user-1", displayName: "Test User", photoURL: "" } as any}
                        logoutUser={logoutUser}
                        loginWithGoogle={loginWithGoogle}
                        setMenuOpen={setMenuOpen}
                        menuOpen={true}
                    />
                </MemoryRouter>
            );

            const link = screen.getByRole("link", { name: "Public Page" });
            const listItem = link.closest("li");

            expect(listItem).not.toBeNull();

            const popover = link.nextElementSibling;
            expect(popover?.tagName).toBe("DIV");

            const button = within(popover as HTMLElement).getByRole("button");

            await user.click(button);

            expect(screen.getByText("Archive")).toBeInTheDocument();
            expect(screen.getByText("Change to Private")).toBeInTheDocument();
            expect(screen.getByText("Delete")).toBeInTheDocument();
            expect(screen.getByText("Copy link")).toBeInTheDocument();

            expect(screen.queryByText("Change to Public")).not.toBeInTheDocument();
        });

        it("popover rendres correct actions for archived private pages", async () => {
            const user = userEvent.setup();

            mockedUseNodes.mockReturnValue({
                flatNodes: popoverFlatNodes,
                handleCreateNode,
                handleArchiveNode,
                handleRestoreNode,
                handleVisibilityChange,
                handleDeleteNode,
            } as any);

            render(
                <MemoryRouter>
                    <SideBar
                        user={{ uid: "user-1", displayName: "Test User", photoURL: "" } as any}
                        logoutUser={logoutUser}
                        loginWithGoogle={loginWithGoogle}
                        setMenuOpen={setMenuOpen}
                        menuOpen={true}
                    />
                </MemoryRouter>
            );

            await user.selectOptions(screen.getByRole("combobox"), "Archived only");

            const link = screen.getByRole("link", { name: "Archived Private Page" });
            const listItem = link.closest("li");

            expect(listItem).not.toBeNull();

            const popover = link.nextElementSibling;
            expect(popover?.tagName).toBe("DIV");

            const button = within(popover as HTMLElement).getByRole("button");

            await user.click(button);

            expect(screen.getByText("Restore")).toBeInTheDocument();
            expect(screen.getByText("Change to Public")).toBeInTheDocument();
            expect(screen.getByText("Delete")).toBeInTheDocument();

            expect(screen.queryByText("Archive")).not.toBeInTheDocument();
            expect(screen.queryByText("Change to Private")).not.toBeInTheDocument();
            expect(screen.queryByText("Copy link")).not.toBeInTheDocument();
        });
        it("popover rendres correct actions for archived public pages", async () => {
            const user = userEvent.setup();

            mockedUseNodes.mockReturnValue({
                flatNodes: popoverFlatNodes,
                handleCreateNode,
                handleArchiveNode,
                handleRestoreNode,
                handleVisibilityChange,
                handleDeleteNode,
            } as any);

            render(
                <MemoryRouter>
                    <SideBar
                        user={{ uid: "user-1", displayName: "Test User", photoURL: "" } as any}
                        logoutUser={logoutUser}
                        loginWithGoogle={loginWithGoogle}
                        setMenuOpen={setMenuOpen}
                        menuOpen={true}
                    />
                </MemoryRouter>
            );

            await user.selectOptions(screen.getByRole("combobox"), "Archived only");

            const link = screen.getByRole("link", { name: "Archived Public Page" });
            const listItem = link.closest("li");

            expect(listItem).not.toBeNull();

            const popover = link.nextElementSibling;
            expect(popover?.tagName).toBe("DIV");

            const button = within(popover as HTMLElement).getByRole("button");

            await user.click(button);

            expect(screen.getByText("Restore")).toBeInTheDocument();
            expect(screen.getByText("Change to Private")).toBeInTheDocument();
            expect(screen.getByText("Delete")).toBeInTheDocument();
            expect(screen.queryByText("Copy link")).toBeInTheDocument();

            expect(screen.queryByText("Archive")).not.toBeInTheDocument();
            expect(screen.queryByText("Change to Public")).not.toBeInTheDocument();
        });
    });

    describe("unauthenticated behavior", () => {
        //user={null}, isGuest: false
        beforeEach(() => {
            mockedUseAuth.mockReturnValue({
                isGuest: () => false,
            } as any);
        });

        it("renders without user info and lists section", () => {
            render(
                <MemoryRouter>
                    <SideBar
                        user={null}
                        logoutUser={logoutUser}
                        loginWithGoogle={loginWithGoogle}
                        setMenuOpen={setMenuOpen}
                        menuOpen={true}
                    />
                </MemoryRouter>
            );

            expect(screen.getByText("Dashboard")).toBeInTheDocument();
            expect(screen.queryByPlaceholderText("Search lists...")).not.toBeInTheDocument();
            expect(screen.queryByRole("button", { name: "Logout" })).not.toBeInTheDocument();
        });
    });

    describe("guest mode behavior", () => {
        //user="guest-1", isGuest: true
        beforeEach(() => {
            mockedUseAuth.mockReturnValue({
                isGuest: () => true,
            } as any);
        });

        it("renders the lists section but not the user info", () => {
            render(
                <MemoryRouter>
                    <SideBar
                        user={{ uid: "guest-1", displayName: "Guest", photoURL: "" } as any}
                        logoutUser={logoutUser}
                        loginWithGoogle={loginWithGoogle}
                        setMenuOpen={setMenuOpen}
                        menuOpen={true}
                    />
                </MemoryRouter>
            );

            expect(screen.getByPlaceholderText("Search lists...")).toBeInTheDocument();
            expect(screen.queryByRole("button", { name: "Logout" })).not.toBeInTheDocument();
        });
    });
});