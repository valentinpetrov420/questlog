import './ProgressBar.css';

type ProgressBarProps = {
    percent: number;
}

export default function ProgressBar(props: ProgressBarProps) {
    return <div className="progress-bar-container">
        <div className="progress-bar-fill" style={{ width: `${props.percent}%` }}>
            {props.percent}%
        </div>
    </div>
}