import { Track } from 'components';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Assign } from 'types/assign';
import { v4 as uuidv4 } from 'uuid';

import JumpToServiceInputElement from './JumpToServiceInputElement';
import '../styles.scss';

interface JumpToServiceInputBuilderProps {
  seedGroup: Assign[];
  onChange: (group: Assign[]) => void;
}

const createNewElement = (): Assign => ({
  id: uuidv4(),
  key: '',
  value: '',
});

const JumpToServiceInputBuilder: React.FC<JumpToServiceInputBuilderProps> = ({ seedGroup, onChange }) => {
  const { t } = useTranslation();
  const [elements, setElements] = useState<Assign[]>(seedGroup ?? []);

  useEffect(() => {
    onChange(elements);
  }, [elements, onChange]);

  const addElement = () => setElements((prev) => [...prev, createNewElement()]);

  const remove = (id: string) => setElements((prev) => prev.filter((x) => x.id !== id));

  const changeElement = (element: Assign) =>
    setElements((prev) => prev.map((x) => (x.id === element.id ? element : x)));

  return (
    <Track direction="vertical" align="stretch" className="assign-action-container">
      <Track justify="end" style={{ padding: '10px' }}>
        <button className="small-assign-button assign-blue" onClick={addElement}>
          {t('serviceFlow.popup.addElement')}
        </button>
      </Track>
      {elements.map((element) => (
        <JumpToServiceInputElement key={element.id} element={element} onRemove={remove} onChange={changeElement} />
      ))}
    </Track>
  );
};

export default JumpToServiceInputBuilder;
