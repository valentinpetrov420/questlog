import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

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

afterEach(() => {
    cleanup();
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