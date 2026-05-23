import './StatusMessage.css';

export default function StatusMessage(props) {
    return <p className="form-error">{props.text}</p>;
}