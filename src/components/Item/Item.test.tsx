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
    const handleEditNodeUrl = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        mockedUseNodes.mockReturnValue({
            handleEditNodeText,
            handleEditNodeUrl,
            handleDeleteNode,
            handleToggleChildNode,
            handlePromoteTodo,
        } as any);

        handleEditNodeText.mockResolvedValue(undefined);
        handleDeleteNode.mockResolvedValue(undefined);
        handlePromoteTodo.mockResolvedValue(undefined);
        handleEditNodeUrl.mockResolvedValue(undefined);
    });

    describe("owner", () => {
        it("renders correctly with owner actions", () => {
            render(
                <Item
                    id="node-1"
                    text="test"
                    completed={false}
                    newNodeId={null}
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
                    newNodeId={null}
                    type="heading"
                    isOwner={true}
                    deletePending={false}
                    resetPending={false}
                    highlightedTodoId={null}
                />
            );
            expect(screen.getByRole("button", { name: "heading" })).toBeInTheDocument();
        });
        it("renders separators correctly", () => {
            render(
                <Item
                    id="node-1"
                    text="separator"
                    completed={false}
                    newNodeId={null}
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
                        newNodeId={null}
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
        it("renders link without an url as span", () => {
            render(
                <MemoryRouter>
                    <Item
                        id="node-1"
                        text="link"
                        url={undefined}
                        completed={false}
                        newNodeId={null}
                        type="link"
                        isOwner={true}
                        deletePending={false}
                        resetPending={false}
                        highlightedTodoId={null}
                    />
                </MemoryRouter>
            );

            expect(screen.queryByRole("link", { name: "link" })).not.toBeInTheDocument();
            expect(screen.getByText("link")).toBeInTheDocument();
        });
        it("renders link with a link as link", () => {
            render(
                <MemoryRouter>
                    <Item
                        id="node-1"
                        text="link"
                        url="example.com"
                        completed={false}
                        newNodeId={null}
                        type="link"
                        isOwner={true}
                        deletePending={false}
                        resetPending={false}
                        highlightedTodoId={null}
                    />
                </MemoryRouter>
            );

            expect(screen.getByRole("link", { name: "link" })).toHaveAttribute("href", "https://example.com/");
        });
        it("highlighted todos get correct styling", () => {
            render(
                <Item
                    id="node-1"
                    text="test"
                    completed={false}
                    newNodeId={null}
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
                    newNodeId={null}
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
                    newNodeId={null}
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
                    newNodeId={null}
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
                    newNodeId={null}
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

            await user.type(screen.getByRole("textbox"), "123");
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
                    newNodeId={null}
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
                    newNodeId={null}
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
        it("blur cancels editing mode", async () => {
            const user = userEvent.setup();

            render(
                <Item
                    id="node-1"
                    text="test"
                    completed={false}
                    newNodeId={null}
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

            await user.tab();

            expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
        });

        it("delete click sets pending state and disables all input options", async () => {
            let resolveDelete!: (value: undefined) => void;
            handleDeleteNode.mockReturnValueOnce(new Promise((resolve) => { resolveDelete = resolve; }));

            const user = userEvent.setup();

            render(
                <Item
                    id="node-1"
                    text="test"
                    completed={false}
                    newNodeId={null}
                    type="todo"
                    isOwner={true}
                    deletePending={false}
                    resetPending={false}
                    highlightedTodoId={null}
                />
            );

            await user.click(screen.getByRole("button", { name: "Item actions" }));
            await user.click(screen.getByRole("button", { name: "Delete" }));

            expect(screen.getByRole("button", { name: "Item actions" })).toBeDisabled();
            expect(screen.getByRole("checkbox")).toBeDisabled();

            resolveDelete(undefined);

            await waitFor(() => {
                expect(screen.getByText("⋯")).toBeEnabled();
                expect(screen.getByRole("checkbox")).toBeEnabled();
            });
        });

        it("page popover options don't show promote to page button", async () => {
            const user = userEvent.setup();

            render(
                <MemoryRouter>
                    <Item
                        id="node-1"
                        text="page"
                        completed={false}
                        newNodeId={null}
                        type="page"
                        isOwner={true}
                        deletePending={false}
                        resetPending={false}
                        highlightedTodoId={null}
                    />
                </MemoryRouter>
            );

            await user.click(screen.getByRole("button", { name: "Item actions" }));

            expect(screen.queryByRole("button", { name: "Promote to Page" })).not.toBeInTheDocument();
        });
        it("page link navigates to the correct node id", () => {
            render(
                <MemoryRouter>
                    <Item
                        id="node-1"
                        text="page"
                        completed={false}
                        newNodeId={null}
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

        it("promote to page calls the correct context handler with the correct id", async () => {
            const user = userEvent.setup();

            render(
                <Item
                    id="node-1"
                    text="test"
                    completed={false}
                    newNodeId={null}
                    type="todo"
                    isOwner={true}
                    deletePending={false}
                    resetPending={false}
                    highlightedTodoId={null}
                />
            );
            
            await user.click(screen.getByRole("button", {name: "Item actions"}));
            await user.click(screen.getByRole("button", {name: "Promote to Page"}));

            expect(handlePromoteTodo).toHaveBeenCalledWith("node-1");
        });
        it("delete click calls the correct context handler with the correct id", async () => {
            const user = userEvent.setup();

            render(
                <Item
                    id="node-1"
                    text="test"
                    completed={false}
                    newNodeId={null}
                    type="todo"
                    isOwner={true}
                    deletePending={false}
                    resetPending={false}
                    highlightedTodoId={null}
                />
            );
            
            await user.click(screen.getByRole("button", {name: "Item actions"}));
            await user.click(screen.getByRole("button", {name: "Delete"}));

            expect(handleDeleteNode).toHaveBeenCalledWith("node-1");
        });

        it("link edit url calls the correct context handler with the normalized value", async () => {
            const user = userEvent.setup();

            render(
                <MemoryRouter>
                    <Item
                        id="node-1"
                        text="link"
                        url="example.com/"
                        completed={false}
                        newNodeId={null}
                        type="link"
                        isOwner={true}
                        deletePending={false}
                        resetPending={false}
                        highlightedTodoId={null}
                    />
                </MemoryRouter>
            );
            
            await user.click(screen.getByRole("button", {name: "Item actions"}));
            await user.click(screen.getByRole("button", {name: "Edit Link Url"}));

            expect(screen.getByRole("textbox")).toBeInTheDocument();

            await user.type(screen.getByRole("textbox"), "page");
            await user.keyboard("{Enter}");

            expect(handleEditNodeUrl).toHaveBeenCalledWith("node-1", "https://example.com/page");
        });
        it("submitting link url without changing it doesn't call context handler", async () => {
            const user = userEvent.setup();

            render(
                <MemoryRouter>
                    <Item
                        id="node-1"
                        text="link"
                        url="example.com/"
                        completed={false}
                        newNodeId={null}
                        type="link"
                        isOwner={true}
                        deletePending={false}
                        resetPending={false}
                        highlightedTodoId={null}
                    />
                </MemoryRouter>
            );
            
            await user.click(screen.getByRole("button", {name: "Item actions"}));
            await user.click(screen.getByRole("button", {name: "Edit Link Url"}));

            expect(screen.getByRole("textbox")).toBeInTheDocument();

            await user.keyboard("{Enter}");

            await waitFor(() => { 
                expect(handleEditNodeUrl).not.toHaveBeenCalled();
            });
        });
        it("submitting invalid url shows StatusMessage and doesn't call context handler", async () => {
            const user = userEvent.setup();

            render(
                <MemoryRouter>
                    <Item
                        id="node-1"
                        text="link"
                        url="example.com/"
                        completed={false}
                        newNodeId={null}
                        type="link"
                        isOwner={true}
                        deletePending={false}
                        resetPending={false}
                        highlightedTodoId={null}
                    />
                </MemoryRouter>
            );
            
            await user.click(screen.getByRole("button", {name: "Item actions"}));
            await user.click(screen.getByRole("button", {name: "Edit Link Url"}));

            expect(screen.getByRole("textbox")).toBeInTheDocument();

            await user.clear(screen.getByRole("textbox"));
            await user.keyboard("{Enter}");

            await waitFor(() => { 
                expect(handleEditNodeUrl).not.toHaveBeenCalled();
            });

            expect(screen.getByText("Enter a valid http or https URL")).toBeInTheDocument();
        });
        it("escape exits link editing mode", async () => {
            const user = userEvent.setup();

            render(
                <MemoryRouter>
                    <Item
                        id="node-1"
                        text="link"
                        url="example.com/"
                        completed={false}
                        newNodeId={null}
                        type="link"
                        isOwner={true}
                        deletePending={false}
                        resetPending={false}
                        highlightedTodoId={null}
                    />
                </MemoryRouter>
            );
            
            await user.click(screen.getByRole("button", {name: "Item actions"}));
            await user.click(screen.getByRole("button", {name: "Edit Link Url"}));

            expect(screen.getByRole("textbox")).toBeInTheDocument();

            await user.keyboard("{Escape}");

            expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
        });
        it("blur exits link editing mode", async () => {
            const user = userEvent.setup();

            render(
                <MemoryRouter>
                    <Item
                        id="node-1"
                        text="link"
                        url="example.com/"
                        completed={false}
                        newNodeId={null}
                        type="link"
                        isOwner={true}
                        deletePending={false}
                        resetPending={false}
                        highlightedTodoId={null}
                    />
                </MemoryRouter>
            );
            
            await user.click(screen.getByRole("button", {name: "Item actions"}));
            await user.click(screen.getByRole("button", {name: "Edit Link Url"}));

            expect(screen.getByRole("textbox")).toBeInTheDocument();

            await user.tab();

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
                    newNodeId={null}
                    type="todo"

                    isOwner={false}

                    deletePending={false}
                    resetPending={false}
                    highlightedTodoId={null}
                />
            );

            expect(screen.queryByText("⠿")).not.toBeInTheDocument();
            expect(screen.getByRole("checkbox")).toBeDisabled();
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
                    newNodeId={null}
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
                    newNodeId={null}
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