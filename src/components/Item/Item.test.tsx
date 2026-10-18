import {
    describe,
    it,
    expect,
    vi,
    beforeEach,
    afterEach
} from "vitest";
import {
    render,
    screen,
    cleanup,
    waitFor,
    //waitFor
} from "@testing-library/react";

import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import Item from "./Item.js";
import { useNodes } from "../../contexts/NodesContext.js";

vi.mock("../../contexts/NodesContext.js", () => ({
    useNodes: vi.fn(),
}));

const mockedUseNodes = vi.mocked(useNodes);

afterEach(() => {
    cleanup();
});

describe("Item", () => {
    const handleEditNodeText = vi.fn();
    const handleDeleteNode = vi.fn();
    const handleToggleChildNode = vi.fn();
    const handlePromoteTodo = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        mockedUseNodes.mockReturnValue({
            handleEditNodeText,
            handleDeleteNode,
            handleToggleChildNode,
            handlePromoteTodo,
        } as any);

        handleEditNodeText.mockResolvedValue(undefined);
        handleDeleteNode.mockResolvedValue(undefined);
        handlePromoteTodo.mockResolvedValue(undefined);
    });

    describe("owner", () => {
        it("renders correctly with owner actions", () => {
            render(
                <Item
                    id="node-1"
                    text="test"
                    completed={false}
                    autoFocus={false}
                    type="todo"
                    isOwner={true}
                    deletePending={false}
                    resetPending={false}
                    highlightedTodoId={null}
                />
            );

            expect(screen.getByText("⠿")).toBeInTheDocument();
            expect(screen.getByRole("checkbox")).not.toBeChecked();
            expect(screen.getByText("test")).toBeInTheDocument();
            expect(screen.getByText("⋯")).toBeInTheDocument();
        });

        it("renders headings correctly", () => {
            render(
                <Item
                    id="node-1"
                    text="heading"
                    completed={false}
                    autoFocus={false}
                    type="heading"
                    isOwner={true}
                    deletePending={false}
                    resetPending={false}
                    highlightedTodoId={null}
                />
            );
            expect(screen.getByRole("heading", { level: 3 })).toBeInTheDocument();
        });
        it("renders separators correctly", () => {
            render(
                <Item
                    id="node-1"
                    text="separator"
                    completed={false}
                    autoFocus={false}
                    type="separator"
                    isOwner={true}
                    deletePending={false}
                    resetPending={false}
                    highlightedTodoId={null}
                />
            );

            expect(screen.getByRole("separator")).toBeInTheDocument();
        });
        it("renders pages properly", () => {
            render(
                <MemoryRouter>
                    <Item
                        id="node-1"
                        text="page"
                        completed={false}
                        autoFocus={false}
                        type="page"
                        isOwner={true}
                        deletePending={false}
                        resetPending={false}
                        highlightedTodoId={null}
                    />
                </MemoryRouter>
            );

            expect(screen.getByRole("link", { name: "page" })).toHaveAttribute("href", "/node-1");
        });
        it("highlighted todos get correct styling", () => {
            render(
                <Item
                    id="node-1"
                    text="test"
                    completed={false}
                    autoFocus={false}
                    type="todo"
                    isOwner={true}
                    deletePending={false}
                    resetPending={false}
                    highlightedTodoId="node-1"
                />
            );

            expect(screen.getByText("test")).toHaveClass("highlighted");
        });
        it("completed todos get correct styling", () => {
            render(
                <Item
                    id="node-1"
                    text="test"
                    completed={true}
                    autoFocus={false}
                    type="todo"
                    isOwner={true}
                    deletePending={false}
                    resetPending={false}
                    highlightedTodoId={null}
                />
            );

            expect(screen.getByText("test")).toHaveClass("completed");
        });

        it("todo text click opens input", async () => {
            const user = userEvent.setup();

            render(
                <Item
                    id="node-1"
                    text="test"
                    completed={false}
                    autoFocus={false}
                    type="todo"
                    isOwner={true}
                    deletePending={false}
                    resetPending={false}
                    highlightedTodoId={null}
                />
            );

            expect(screen.queryByRole("textbox")).not.toBeInTheDocument();

            await user.click(screen.getByText("test"));

            expect(screen.getByRole("textbox")).toBeInTheDocument();
        });
        it("heading text click opens input", async () => {
            const user = userEvent.setup();

            render(
                <Item
                    id="node-1"
                    text="test"
                    completed={false}
                    autoFocus={false}
                    type="heading"
                    isOwner={true}
                    deletePending={false}
                    resetPending={false}
                    highlightedTodoId={null}
                />
            );

            expect(screen.queryByRole("textbox")).not.toBeInTheDocument();

            await user.click(screen.getByText("test"));

            expect(screen.getByRole("textbox")).toBeInTheDocument();
        });

        it("submit todo edit calls service", async () => {
            const user = userEvent.setup();

            render(
                <Item
                    id="node-1"
                    text="test"
                    completed={false}
                    autoFocus={false}
                    type="todo"
                    isOwner={true}
                    deletePending={false}
                    resetPending={false}
                    highlightedTodoId={null}
                />
            );

            expect(screen.queryByRole("textbox")).not.toBeInTheDocument();

            await user.click(screen.getByText("test"));

            expect(screen.getByRole("textbox")).toBeInTheDocument();

            await user.type(screen.getByRole("textbox"), "123"); 1
            await user.keyboard("{Enter}");

            expect(handleEditNodeText).toHaveBeenCalledWith("node-1", "test123");
        });
        it("invalid input todo edit shows StatusMessage", async () => {
            const user = userEvent.setup();
            handleEditNodeText.mockResolvedValue({ message: "Field cannot be empty." });

            render(
                <Item
                    id="node-1"
                    text="test"
                    completed={false}
                    autoFocus={false}
                    type="todo"
                    isOwner={true}
                    deletePending={false}
                    resetPending={false}
                    highlightedTodoId={null}
                />
            );

            expect(screen.queryByRole("textbox")).not.toBeInTheDocument();

            await user.click(screen.getByText("test"));

            expect(screen.getByRole("textbox")).toBeInTheDocument();

            await user.clear(screen.getByRole("textbox"));
            await user.keyboard("{Enter}");

            await waitFor(() => {
                expect(handleEditNodeText).toHaveBeenCalledWith("node-1", "");
            });

            expect(screen.getByText("Field cannot be empty.")).toBeInTheDocument();
            expect(screen.getByRole("textbox")).toBeInTheDocument();
        });

        it("escape key cancels editing mode", async () => {
            const user = userEvent.setup();

            render(
                <Item
                    id="node-1"
                    text="test"
                    completed={false}
                    autoFocus={false}
                    type="todo"
                    isOwner={true}
                    deletePending={false}
                    resetPending={false}
                    highlightedTodoId={null}
                />
            );

            expect(screen.queryByRole("textbox")).not.toBeInTheDocument();

            await user.click(screen.getByText("test"));

            expect(screen.getByRole("textbox")).toBeInTheDocument();

            await user.keyboard("{Escape}");

            expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
        });
    });

    describe("non-owner", () => {
        it("renders correctly for non-owners", () => {
            render(
                <Item
                    id="node-1"
                    text="test"
                    completed={false}
                    autoFocus={false}
                    type="todo"

                    isOwner={false}

                    deletePending={false}
                    resetPending={false}
                    highlightedTodoId={null}
                />
            );

            expect(screen.queryByText("⠿")).not.toBeInTheDocument();
            expect(screen.getByRole("checkbox")).toBeDisabled;
            expect(screen.getByText("test")).toBeInTheDocument();
            expect(screen.queryByText("⋯")).not.toBeInTheDocument();
        });

        it("todo text click doesn't open input", async () => {
            const user = userEvent.setup();

            render(
                <Item
                    id="node-1"
                    text="test"
                    completed={false}
                    autoFocus={false}
                    type="todo"
                    isOwner={false}
                    deletePending={false}
                    resetPending={false}
                    highlightedTodoId={null}
                />
            );

            expect(screen.queryByRole("textbox")).not.toBeInTheDocument();

            await user.click(screen.getByText("test"));

            expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
        });
        it("heading text click doesn't open input", async () => {
            const user = userEvent.setup();

            render(
                <Item
                    id="node-1"
                    text="test"
                    completed={false}
                    autoFocus={false}
                    type="heading"
                    isOwner={false}
                    deletePending={false}
                    resetPending={false}
                    highlightedTodoId={null}
                />
            );

            expect(screen.queryByRole("textbox")).not.toBeInTheDocument();

            await user.click(screen.getByText("test"));

            expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
        });
    });
});