import {
    describe,
    //it,
    //expect,
    vi,
    beforeEach,
    afterEach
} from "vitest";
import {
    //render,
    //screen,
    cleanup,
    //waitFor
} from "@testing-library/react";
//import userEvent from "@testing-library/user-event";
//import { MemoryRouter } from "react-router-dom";

//import Item from "./Item.js";
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
    });

    describe("non-owner", () => {
    });
});