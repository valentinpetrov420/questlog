import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest';
import PopOver from './PopOver';
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => {
    cleanup();
});

describe('PopOver', () => {
    it('displays the popover toggle menu button', () => {
        render(<PopOver
            type="actions"
            align="left"
            disabled={false}>
            <button onClick={() => { }}>Delete</button>
        </PopOver>)

        expect(screen.getByText('⋯')).toBeInTheDocument();
    });

    it('opens the menu when clicked', async () => {
        const user = userEvent.setup();

        render(<PopOver
            type="actions"
            align="left"
            disabled={false}>
            <button onClick={() => { }}>Delete</button>
        </PopOver>)

        const button = screen.getByText('⋯');

        await user.click(button);

        expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('gets closed by clicking a button inside', async () => {
        const user = userEvent.setup();

        render(<PopOver
            type="actions"
            align="left"
            disabled={false}>
            <button onClick={() => { }}>Delete</button>
        </PopOver>)

        const button = screen.getByText('⋯');

        await user.click(button);

        const deleteButton = screen.getByText('Delete');

        await user.click(deleteButton);

        expect(screen.queryByText('Delete')).not.toBeInTheDocument();
    });

    it('starts closed', () => {
        render(<PopOver
            type="actions"
            align="left"
            disabled={false}>
            <button onClick={() => { }}>Delete</button>
        </PopOver>)

        expect(screen.queryByText('Delete')).not.toBeInTheDocument();
    });

    it('gets closed when clicked on the toggle when open', async () => {
        const user = userEvent.setup();

        render(<PopOver
            type="actions"
            align="left"
            disabled={false}>
            <button onClick={() => { }}>Delete</button>
        </PopOver>)

        const button = screen.getByText('⋯');

        await user.click(button);
        await user.click(button);

        expect(screen.queryByText('Delete')).not.toBeInTheDocument();
    });

    it("doesn't open from click if disabled", async () => {
        const user = userEvent.setup();

        render(<PopOver
            type="actions"
            align="left"
            disabled={true}>
            <button onClick={() => { }}>Delete</button>
        </PopOver>)

        const button = screen.getByText('⋯');

        await user.click(button);

        expect(screen.queryByText('Delete')).not.toBeInTheDocument();
    });

    it('gets closed when clicked outside', async () => {
        const user = userEvent.setup();

        render(<div>
            <PopOver
                type="actions"
                align="left"
                disabled={false}>
                <button onClick={() => { }}>Delete</button>
            </PopOver>
            <button>Outside</button>
        </div>)

        const button = screen.getByText('⋯');

        await user.click(button);

        const outside = screen.getByText('Outside');

        await user.click(outside);

        expect(screen.queryByText('Delete')).not.toBeInTheDocument();
    });

    it('displays the menu toggle as + when type is create', () => {
        render(<PopOver
            type="create"
            align="left"
            disabled={false}>
            <button onClick={() => { }}>Delete</button>
        </PopOver>)

        expect(screen.getByText('+')).toBeInTheDocument();
    });

    it('properly applies left class if it has props.align as left', async () => {
        const user = userEvent.setup();

        const { container } = render(<PopOver
            type="create"
            align="left"
            disabled={false}>
            <button onClick={() => { }}>Delete</button>
        </PopOver>)

        await user.click(screen.getByText('+'));

        const popover = container.querySelector('.item-popover');

        expect(popover).toHaveClass('left');
    });

    it('properly applies right class if it has props.align as right', async () => {
        const user = userEvent.setup();

        const { container } = render(<PopOver
            type="create"
            align="right"
            disabled={false}>
            <button onClick={() => { }}>Delete</button>
        </PopOver>)

        await user.click(screen.getByText('+'));

        const popover = container.querySelector('.item-popover');

        expect(popover).toHaveClass('right');
    });
});