import React, { useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Popup from "../Popup";
import { SwitchBox } from "../FormElements";
import { Button, Track } from "..";
import ConditiobRuleType from "./ConditiobRuleType";
import YesNoPopupContent from "./YesNoPopupContent";
import RulesBuilder from "./RulesBuilder";
import './styles.scss'
import { useTranslation } from "react-i18next";
import { StepType } from "../../types/step";
import TextfieldContent from "./TextfieldContent";
import * as Tabs from '@radix-ui/react-tabs';
import TextfieldTestContent from "./TextfieldTestContent";
import DefaultMessageContent from "./DefaultMessageContent";
import EndConversationContent from "./EndConversationContent";


const FlowElementsPopup = ({ node, onClose, onSave, oldRules, onRulesUpdate }: any) => {
  const { t } = useTranslation();
  const [isYesNoQuestion, setIsYesNoQuestion] = useState(node?.isYesNoQuestion ?? false)
  const [rules, setRules] = useState<ConditiobRuleType[]>(node?.rules ?? [])
  const [selectedTab, setSelectedTab] = useState<string | null>(null);

  // StepType.Textfield 
  const [textfieldMessage, setTextfieldMessage] = useState<string | null>(null);
  const [textfieldMessagePlaceholders, setTextfieldMessagePlaceholders] = useState<{ [key: string]: string }>({});

  if (!node) return <></>

  const stepType = node.data.stepType;
  const title = node.data.label;
  const isReadonly = node.data.readonly;

  const handleSaveClick = () => {
    if (stepType === StepType.Input) {
      const count = isYesNoQuestion ? 2 : rules.length
      const result = []
      for (let i = 0; i < count; i++) {
        let item = null
        if (i < oldRules.length)
          item = oldRules[i]
        result.push(item)
      }
      return onRulesUpdate(result);
    }

    const updatedNode = {
      ...node,
      data: {
        ...node.data,
        message: textfieldMessage,
      }
    }
    onSave(updatedNode);
  }

  return (
    <Popup
      style={{ maxWidth: 700 }}
      title={title}
      onClose={() => {
        setSelectedTab(null);
        onClose();
      }}
      footer={
        <Track gap={16}>
          {
            !isReadonly && <Button
              appearance="secondary"
              onClick={onClose}
            >
              {t('global.cancel')}
            </Button>
          }
          <Button onClick={handleSaveClick}>
            {t(isReadonly ? 'global.close' : 'global.save')}
          </Button>
        </Track>
      }
    >
      <Track direction='vertical' align="stretch" gap={16} className="flow-body-reverse-margin">
        <Tabs.Root
          className='vertical-tabs__column'
          orientation='horizontal'
          value={selectedTab ?? t('serviceFlow.tabs.setup')!}
          onValueChange={setSelectedTab}
        >
          <Tabs.List>
            <Tabs.Trigger className='vertical-tabs__trigger' value={t('serviceFlow.tabs.setup')}>
              {t('serviceFlow.tabs.setup')}
            </Tabs.Trigger>
            {!isReadonly && <Tabs.Trigger className='vertical-tabs__trigger' value={t('serviceFlow.tabs.test')}>
              {t('serviceFlow.tabs.test')}
            </Tabs.Trigger>}
          </Tabs.List>

          <Tabs.Content value={t('serviceFlow.tabs.setup')} className='vertical-tabs__body'>
            {
              stepType === StepType.Textfield &&
              <TextfieldContent
                selectedNode={node}
                defaultMessage={node.data.message ?? (textfieldMessage ?? undefined)}
                onChange={(message, placeholders) => {
                  setTextfieldMessage(message);
                  setTextfieldMessagePlaceholders(placeholders);
                }}
              ></TextfieldContent>
            }

            {
              stepType === StepType.Input && <DndProvider backend={HTML5Backend}>
                <Track direction='vertical' align='stretch'>
                  <Track gap={16} className="flow-body-padding">
                    <Track>
                      <SwitchBox
                        label=''
                        name=''
                        hideLabel
                        onCheckedChange={setIsYesNoQuestion}
                        checked={isYesNoQuestion}
                      />
                    </Track>
                    <span>Yes/No Question</span>
                  </Track>
                  {isYesNoQuestion && <YesNoPopupContent />}
                  {
                    !isYesNoQuestion &&
                    <RulesBuilder
                      rules={rules}
                      setRules={setRules}
                    />
                  }
                </Track>
              </DndProvider>
            }
            {
              stepType === StepType.FinishingStepRedirect &&
              <DefaultMessageContent message='Vestlus suunatakse klienditeenindajale'></DefaultMessageContent>
            }
            {
              stepType === StepType.Auth &&
              <DefaultMessageContent message='Jätkamiseks palun logi sisse läbi TARA'></DefaultMessageContent>
            }
            {
              stepType === StepType.FinishingStepEnd &&
              <EndConversationContent></EndConversationContent>
            }
          </Tabs.Content>
          {!isReadonly && <Tabs.Content value={t('serviceFlow.tabs.test')} className='vertical-tabs__body'>
            {
              stepType === StepType.Textfield &&
              <TextfieldTestContent
                placeholders={textfieldMessagePlaceholders}
                message={textfieldMessage || node.data.message}
              ></TextfieldTestContent>
            }

          </Tabs.Content>}
        </Tabs.Root>
      </Track>
    </Popup >
  )
}

export default FlowElementsPopup
