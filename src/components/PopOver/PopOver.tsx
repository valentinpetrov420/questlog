import { useRef, useState, useEffect } from "react";
import './PopOver.css';

type PopoverProps = {
    disabled?: boolean;
    children: React.ReactNode;
}

export default function PopOver({ disabled, children }: PopoverProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!menuOpen) return;

        function handleClickOutside(event: MouseEvent) {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Element)) {
                setMenuOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [menuOpen]);

    return (
        <div className="popover-wrapper" ref={popoverRef}>
            <button disabled={disabled} onClick={() => setMenuOpen(!menuOpen)}>⋯</button>
            {menuOpen && (
                <div className="item-popover" onClick={() => setMenuOpen(false)}>
                    {children}
                </div>
            )}
        </div>
    );
}