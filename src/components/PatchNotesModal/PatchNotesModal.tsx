import './PatchNotesModal.css';

type PatchNote = {
    date: Date,
    message: string,
}

type PatchNotesModalProps = {
    open: boolean,
    onClose: () => void,
    patchnotes: PatchNote[]
}

type GroupedPatchNotes = {
    [date: string]: PatchNote[]
}

export default function PatchNotesModal(props: PatchNotesModalProps) {
    function getSofiaDate(timestamp: Date) {
        const date = new Date(timestamp);
        return date.toLocaleDateString("en-CA", { timeZone: "Europe/Sofia" });
    }

    function groupByDate(entries: PatchNote[]): GroupedPatchNotes {
        return entries.reduce((grouped, entry) => {
            const date = getSofiaDate(entry.date);

            if (entry.message.startsWith("Merge branch")) {
                return grouped;
            }

            if (!grouped[date]) {
                grouped[date] = [];
            }

            grouped[date].push(entry);

            return grouped;
        }, {} as GroupedPatchNotes);
    }

    const grouped = groupByDate(props.patchnotes);
    const sortedDates = Object.keys(grouped).sort((a, b) =>
        b.localeCompare(a)
    );

    if (!props.open) {
        return null;
    }

    return (
        <div className="patchnotes-modal">
            <button onClick={props.onClose}>Close</button>
            {sortedDates.map((date) => (
                <div>
                    <h3>{date}</h3>
                    <ul>
                        {grouped[date].slice().reverse().map((e, i) => {
                            return <li key={i}>
                                {e.message.split("\n").map((line, index) => (
                                    <div key={index}>{line}</div>
                                ))}
                            </li>;
                        })}
                    </ul>
                </div>
            ))}
        </div>
    );
}