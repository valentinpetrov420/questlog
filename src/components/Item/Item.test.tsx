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
    //waitFor
} from "@testing-library/react";
//import userEvent from "@testing-library/user-event";
//import { MemoryRouter } from "react-router-dom";

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
            )

            expect(screen.getByText("⠿")).toBeInTheDocument();
            expect(screen.getByRole("checkbox")).not.toBeChecked();
            expect(screen.getByText("test")).toBeInTheDocument();
            expect(screen.getByText("⋯")).toBeInTheDocument();
        })

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
            )

            expect(screen.queryByText("⠿")).not.toBeInTheDocument();
            expect(screen.getByRole("checkbox")).toBeDisabled;
            expect(screen.getByText("test")).toBeInTheDocument();
            expect(screen.queryByText("⋯")).not.toBeInTheDocument();
        })
    });
});