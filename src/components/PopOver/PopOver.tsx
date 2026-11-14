import { useRef, useState, useEffect, useId } from "react";
import './PopOver.css';

type PopoverProps = {
    type: "create" | "actions";
    align: "left" | "right";
    disabled?: boolean;
    children: React.ReactNode;
}

export default function PopOver({ type, align, disabled, children }: PopoverProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const menuId = useId();

    useEffect(() => {
        if (!menuOpen) return;

        function handleClickOutside(event: MouseEvent) {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Element)) {
                setMenuOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setMenuOpen(false);
                triggerRef.current?.focus();
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [menuOpen]);

    let symbol = "";
    if (type === "create") {
        symbol = "+";
    } else if (type === "actions") {
        symbol = "⋯";
    }

    return (
        <div className="popover-wrapper" ref={popoverRef}>
            <button className="item-create-options"
                ref={triggerRef}

                aria-expanded={menuOpen}
                aria-controls={menuOpen ? menuId : undefined}
                aria-label={type === "create" ? "Add item" : "Item actions"}

                type="button"
                disabled={disabled}
                onClick={() => setMenuOpen(!menuOpen)}>{symbol}
            </button>
            {menuOpen && (
                <div className={`item-popover ${align}`}
                    id={menuId}
                    role="presentation"
                    onClick={() => setMenuOpen(false)}>
                    {children}
                </div>
            )}
        </div>
    );
}