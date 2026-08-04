import { useRef, useState, useEffect } from "react";
import './PopOver.css';

type PopoverProps = {
    type: "create" | "actions"
    disabled?: boolean;
    children: React.ReactNode;
}

export default function PopOver({type, disabled, children }: PopoverProps) {
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

    let symbol = "";
    if (type === "create"){
        symbol = "+";
    } else if (type === "actions"){
        symbol = "⋯";
    }

    return (
        <div className="popover-wrapper" ref={popoverRef}>
            <button className="item-create-options" 
            type="button"
            disabled={disabled} 
            onClick={() => setMenuOpen(!menuOpen)}>{symbol}</button>
            {menuOpen && (
                <div className="item-popover" onClick={() => setMenuOpen(false)}>
                    {children}
                </div>
            )}
        </div>
    );
}