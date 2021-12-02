import { Popup as SemanticPopup } from "semantic-ui-react";

const Popup = ({content, children}) => {
    return (
        <SemanticPopup inverted content={content} trigger={children} />
    );
}

export default Popup;