import './PatchNotesModal.css';

export default function PatchNotesModal({ open, onClose, patchnotes, }) {

    function groupByDate(entries) {
        return entries.reduce((grouped, entry) => {
            const date = entry.date.split("T")[0];

            if (entry.message.startsWith("Merge branch")) {
                return grouped;
            }

            if (!grouped[date]) {
                grouped[date] = [];
            }

            grouped[date].push(entry);

            return grouped;
        }, {});
    }

    const grouped = groupByDate(patchnotes);
    const sortedDates = Object.keys(grouped).sort((a, b) =>
        b.localeCompare(a)
    );

    if (!open) {
        return null;
    }

    return (
        <div className="patchnotes-modal">
            <button onClick={onClose}>Close</button>
            {sortedDates.map((date) => (
                <div>
                    <h3>{date}</h3>
                    <ul>
                        {grouped[date].map((e, i) => {
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