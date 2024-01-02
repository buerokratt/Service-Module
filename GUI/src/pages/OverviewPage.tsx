import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Track } from "../components";
import { getServicesList, trainingModuleTraining } from "../resources/api-constants";
import ServicesTable from "../components/ServicesTable";
import { Service, ServiceState } from "../types";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../resources/routes-constants";
import axios from "axios";
import useServiceListStore from "store/services.store";

type ServicesResponse = {
  readonly id: number;
  readonly name: string;
  readonly state: ServiceState;
  readonly type: "GET" | "POST";
  readonly iscommon: boolean;
};

const OverviewPage: React.FC = () => {
  const { loadServicesList } = useServiceListStore();

  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    loadServicesList();
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
