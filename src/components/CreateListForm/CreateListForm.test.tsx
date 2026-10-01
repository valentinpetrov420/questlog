import { render, screen, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event'
import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';

import CreateListForm from './CreateListForm';

import { useAuth } from "../../contexts/AuthContext.js";
import { useNodes } from "../../contexts/NodesContext.js";

import { maxLength } from '../../constants/app.js';

vi.mock("../../contexts/AuthContext.js", () => ({
    useAuth: vi.fn(),
}));

vi.mock("../../contexts/NodesContext.js", () => ({
    useNodes: vi.fn(),
}));

const mockedUseAuth = vi.mocked(useAuth);
const mockedUseNodes = vi.mocked(useNodes);
const handleCreateNode = vi.fn();

beforeEach(() => {
    mockedUseNodes.mockReturnValue({
        handleCreateNode,
        setSortMode: vi.fn(),
    } as any);

    //assumes all calls will return as success if error isn't truthy unless a test overrides this
    handleCreateNode.mockResolvedValue({
        error: null
    });
    //for error tests, put error messages into the object to inspect for error messages that are directly expect()'ed

});

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe('CreateListForm', () => {
    describe("authenticated", () => {
        beforeEach(() => {
            mockedUseAuth.mockReturnValue({
                isGuest: vi.fn(() => false),
            } as any);
        });

        it("renders correctly", () => {
            render(<CreateListForm />);

            expect(screen.getByRole('heading', { name: 'Add Quest' })).toBeInTheDocument();
            expect(screen.getByRole('textbox')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Create new quest' })).toBeInTheDocument();
            expect(screen.getByRole('combobox')).toBeInTheDocument();
        });


        it("text input changes the title", async () => {
            render(<CreateListForm />);
            const user = userEvent.setup();

            const input = screen.getByPlaceholderText("Enter Quest Name");

            await user.type(input, "test");

            expect(input).toHaveValue("test");
        });

        it("creates private quest and clears input on submit", async () => {
            render(<CreateListForm />);
            const user = userEvent.setup();

            const input = screen.getByPlaceholderText("Enter Quest Name");
            const submitButton = screen.getByRole("button", { name: "Create new quest" });

            await user.type(input, "test");
            await user.click(submitButton);

            expect(handleCreateNode).toHaveBeenCalledWith("test", false);
            expect(input).toHaveValue("");
        });
        it("creates public quest and clears input on submit", async () => {
            render(<CreateListForm />);
            const user = userEvent.setup();

            const input = screen.getByPlaceholderText("Enter Quest Name");
            const select = screen.getByRole("combobox");
            const submitButton = screen.getByRole("button", { name: "Create new quest" });

            await user.type(input, "test");
            await user.selectOptions(select, "public");
            await user.click(submitButton);

            expect(handleCreateNode).toHaveBeenCalledWith("test", true);
            expect(input).toHaveValue("");
        });

        it("displays error status if input is invalid", async () => {
            render(<CreateListForm />);
            handleCreateNode.mockResolvedValue({
                error: {
                    message: "Field cannot be empty."
                }
            });

            const user = userEvent.setup();

            const input = screen.getByPlaceholderText("Enter Quest Name");
            const submitButton = screen.getByRole("button", { name: "Create new quest" });
            const errorStatus = screen.getByRole("paragraph");

            await user.type(input, " ");
            await user.click(submitButton);

            await waitFor(() => {
                expect(errorStatus).toHaveTextContent(
                    "Field cannot be empty."
                );
            });

            expect(input).toHaveValue(" ");
        });
    });

    describe("guest mode", () => {
        beforeEach(() => {
            mockedUseAuth.mockReturnValue({
                isGuest: vi.fn(() => true),
            } as any);
        });

        it("renders correctly", () => {
            render(<CreateListForm />);

            expect(screen.getByRole('heading', { name: 'Add Quest' })).toBeInTheDocument();
            expect(screen.getByRole('textbox')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Create new quest' })).toBeInTheDocument();

            expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
        });

        it("always creates private quests despite missing select dropdown", async () => {
            render(<CreateListForm />);
            const user = userEvent.setup();

            const input = screen.getByPlaceholderText("Enter Quest Name");
            const submitButton = screen.getByRole("button", { name: "Create new quest" });

            await user.type(input, "test");
            await user.click(submitButton);

            expect(handleCreateNode).toHaveBeenCalledWith("test", false);
            expect(input).toHaveValue("");
        });
    });
});