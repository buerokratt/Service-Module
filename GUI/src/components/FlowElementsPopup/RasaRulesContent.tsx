import { FC, useEffect, useState } from "react";
import Track from "../Track";
import axios from "axios";
import { getDomainFile } from "../../resources/api-constants";
import { FormInput, FormSelect } from "../FormElements";
import Button from "../Button";
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from "react-i18next";

const RasaRulesContent: FC = ({ }) => {
  const [config, setConfig] = useState<any>({})
  const [rules, setRules] = useState<any[]>([])
  const { t } = useTranslation()

  useEffect(() => {
    axios.get(getDomainFile())
      .then(x => setConfig(x.data.response))
      .catch(err => console.log(err));
  }, [])

  return (
    <>
      <Track direction="horizontal" align="left" style={{ width: '100%', padding: 16 }} gap={16}>
        <FormInput name={"name"} label={t("serviceFlow.popup.name")} placeholder={t("serviceFlow.popup.name") + ""} />
      </Track>
      {
        rules.map((rule, index) => (
          <Track
            key={rule.id}
            direction="vertical"
            align="left"
            style={{ width: '100%', padding: 16, border: '1px solid #eee' }}
          >
            <Track
              direction="horizontal"
              justify="between"
              gap={16}
              style={{ width: '100%' }}
            >
              <span>{`${t("serviceFlow.popup.rule")} ${index + 1}`}</span>
              <Button onClick={() => setRules(rules.filter(x => x.id !== rule.id))} appearance="text"> x </Button>
            </Track>
            <Track
              direction="horizontal"
              gap={16}
              style={{ width: '100%' }}
            >
              <FormSelect
                options={config?.intents?.map((x: string) => ({ label: x, value: x })) ?? []}
                name={"intent"}
                label={t("serviceFlow.popup.intent")}
              />
              <FormSelect
                options={config?.actions?.map((x: string) => ({ label: x, value: x })) ?? []}
                name={"actions"}
                label={t("serviceFlow.popup.action")}
              />
            </Track>
          </Track>
        ))
      }
      <Track direction="horizontal" justify="center" style={{ width: '100%', padding: 16 }} gap={16}>
        <Button onClick={() => setRules([...rules, { id: uuidv4() }])} appearance="text"> {t("serviceFlow.popup.add")} </Button>
      </Track>
    </>
  );
};

export default RasaRulesContent;
