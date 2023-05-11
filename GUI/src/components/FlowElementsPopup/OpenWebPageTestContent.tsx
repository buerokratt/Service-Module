import { CSSProperties, FC } from "react";
import Button from "../Button";
import Track from "../Track";

type OpenWebPageTestContentProps = {
  readonly websiteUrl?: string | null;
  readonly websiteName?: string | null;
}

const OpenWebPageTestContent: FC<OpenWebPageTestContentProps> = ({ websiteUrl, websiteName }) => {
  const popupBodyCss: CSSProperties = {
    padding: 16,
    borderBottom: `1px solid #D2D3D8`
  }

  return (
    <>
      <Track direction="vertical" align="left" style={{ ...popupBodyCss }} gap={16}>
        {websiteName && websiteUrl && <a href={websiteUrl} target="_blank">{websiteName}</a>}
        <Button
          disabled={!(!!(websiteUrl && websiteName))}
          onClick={() => window.open(websiteUrl!, "_blank")}
        >
          Testi
        </Button>
      </Track>
    </>
  );
}

export default OpenWebPageTestContent;
