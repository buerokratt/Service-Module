import { useTranslation } from "react-i18next";
import Track from "../Track"
import './styles.scss'

const YesNoPopupContent = () => {
  const { t } = useTranslation();

  return <>
    <Track className="popup-top-border-track">
      <span>{t("serviceFlow.rule")} 1: <b>Yes</b></span>
    </Track>
    <Track className="popup-top-border-track">
      <span>{t("serviceFlow.rule")} 2: <b>No</b></span>
    </Track>
  </>
}

export default YesNoPopupContent
