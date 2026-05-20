export default function StatusMessage(props) {
    let className;

    if (props.type === "error") {
        className = "form-error";
    } else {
        className = "form-default";
    }

    return <p className={className}>{props.text}</p>
}