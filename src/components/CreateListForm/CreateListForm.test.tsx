import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';

import CreateListForm from './CreateListForm';

import { useAuth } from "../../contexts/AuthContext.js";
import { useNodes } from "../../contexts/NodesContext.js";

vi.mock("../../contexts/AuthContext.js", () => ({
    useAuth: vi.fn(),
}));

vi.mock("../../contexts/NodesContext.js", () => ({
    useNodes: vi.fn(),
}));

const mockedUseAuth = vi.mocked(useAuth);
const mockedUseNodes = vi.mocked(useNodes);

beforeEach(() => {
    mockedUseNodes.mockReturnValue({
        handleCreateNode: vi.fn(),
        setSortMode: vi.fn(),
    } as any);
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

        it('renders correctly', () => {
            render(<CreateListForm />);

            expect(screen.getByRole('heading', { name: 'Add Quest' })).toBeInTheDocument();
            expect(screen.getByRole('textbox')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Create new quest' })).toBeInTheDocument();
            expect(screen.getByRole('combobox')).toBeInTheDocument();
        });
    });

    describe("guest mode", () => {
        beforeEach(() => {
            mockedUseAuth.mockReturnValue({
                isGuest: vi.fn(() => true),
            } as any);
        });

        it('renders correctly', () => {
            render(<CreateListForm />);

            expect(screen.getByRole('heading', { name: 'Add Quest' })).toBeInTheDocument();
            expect(screen.getByRole('textbox')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Create new quest' })).toBeInTheDocument();
            expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
        });
    });
});