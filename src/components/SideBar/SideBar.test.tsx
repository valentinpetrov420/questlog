import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
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

const { navigate } = vi.hoisted(() => ({ navigate: vi.fn() }))

vi.mock('react-router-dom', async (importOriginal) => ({
    ...(await importOriginal<typeof import('react-router-dom')>()),
    useNavigate: () => navigate,
}))


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