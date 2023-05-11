import Track from "../Track"
import './styles.scss'

const YesNoPopupContent = () => {
  return <>
    <Track className="popup-top-border-track">
      <span>Rule 1: <b>Yes</b></span>
    </Track>
    <Track className="popup-top-border-track">
      <span>Rule 2: <b>No</b></span>
    </Track>
  </>
}

export default YesNoPopupContent
