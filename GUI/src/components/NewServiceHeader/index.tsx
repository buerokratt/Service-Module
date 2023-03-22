import React, { FC } from "react";
import { Button, StepCounter, Track } from "..";
import "../Header/Header.scss";

const NewServiceHeader: FC = () => {
  return (
    <>
      <header className="header" style={{ paddingLeft: 24 }}>
        <Track justify="between" gap={16}>
          <h1 style={{ whiteSpace: "nowrap" }}>Uus teenus</h1>
          <StepCounter />
          <Button appearance="secondary">Salvesta mustandina</Button>
          <Button>Jätka</Button>
        </Track>
      </header>
    </>
  );
};

export default NewServiceHeader;
