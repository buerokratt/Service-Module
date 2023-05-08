import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, FormInput, Track } from "../components";
import { getServiceSettings, saveServiceSettings } from "../resources/api-constants";
import axios from "axios";

const ServiceSettingPage: React.FC = () => {
  const [tryCount, setTryCount] = useState(0)
  const [changed, setChanged] = useState(false)
  const [initValue, setInitValue] = useState(0)
  const { t } = useTranslation();

  const maxLimit = 100;

  useEffect(() => {
    axios.get(getServiceSettings())
      .then((x) => {
        setInitValue(x.data.maxInputTry)
        setTryCount(x.data.maxInputTry)
      });
  }, []);

  const handleSave = async (value: number) => {
    axios.post(saveServiceSettings(), { maxInputTry: value }).then(() => {
      setInitValue(value)
      setChanged(false)
    })
  }

  const canBeSaved =
    !(changed && initValue !== tryCount)
    || isNaN(tryCount)
    || tryCount <= 0
    || tryCount > maxLimit
    || initValue === 0;

  return (
    <>
      <Track justify="between">
        <h1>{t("settings.title")}</h1>
      </Track>
      <div className='vertical-tabs__content-header'>
        <Track gap={8} direction='vertical' align='stretch'>
          <Track gap={16}>
            <FormInput
              label={t('settings.maxUserInputTryCount')}
              name='maxInputTry'
              placeholder={t('settings.maxUserInputTryCount') + ''}
              type="number"
              min={1}
              max={maxLimit}
              value={tryCount}
              readOnly={initValue === 0}
              onChange={(e) => {
                setTryCount(parseInt(e.target.value))
                setChanged(true)
              }}
            />
            <Button
              disabled={canBeSaved}
              onClick={() => handleSave(tryCount)}>
              {t('intents.save')}
            </Button>
          </Track>
        </Track>
      </div>
    </>
  );
};

export default ServiceSettingPage;
