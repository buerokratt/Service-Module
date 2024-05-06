import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button, Track } from "../components";
import { trainingModuleTraining } from "../resources/api-constants";
import ServicesTable from "../components/ServicesTable";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../resources/routes-constants";
import useServiceListStore from "store/services.store";

const OverviewPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    useServiceListStore.getState().loadServicesList();
  }, []);

  return (
    <>
      <Track justify="between">
        <h1>{t("overview.services")}</h1>
        <Button onClick={() => navigate(ROUTES.NEWSERVICE_ROUTE)}>{t("overview.create")}</Button>
      </Track>
      <ServicesTable />
      <Track justify="between">
        <h1>{t("overview.commonServices")}</h1>
      </Track>
      <ServicesTable isCommon />
      <p>
        {t("overview.trainingModuleLink.text")}{" "}
        <a href={trainingModuleTraining()}>{t("overview.trainingModuleLink.train")}</a>.
      </p>
    </>
  );
};

export default OverviewPage;
