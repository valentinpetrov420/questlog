import './StatusMessage.css';

type StatusMessageProps = {
    text: string
}

export default function StatusMessage(props: StatusMessageProps) {
    return <p className="form-error">{props.text}</p>;
}