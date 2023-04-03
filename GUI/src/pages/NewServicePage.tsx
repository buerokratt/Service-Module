import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { Button, FormInput, FormSelect, Track } from '../components';
import { openApiSpeckMock } from '../resources/api-constants';
import Form from '@rjsf/core';
import { EndpointType } from '../types/endpoint-type';
import toJsonSchema from 'to-json-schema';
import validator from '@rjsf/validator-ajv8';

const NewServicePage: React.FC = () => {
  const [openApiSpec, setOpenApiSpec] = useState('');
  const [jsonSchema, setJsonSchema] = useState<any>();
  const [selectedSchema, setSelectedSchema] = useState<any>();
  const [endpoints, setEndpoints] = useState<EndpointType[]>([]);
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('');

  const { t } = useTranslation();

  useEffect(() => {
    if (jsonSchema) {
     setSelectedSchema(jsonSchema.properties?.paths?.properties[selectedEndpoint]);
   }
  }, [selectedEndpoint]);

  const fetchOpenApiSpecMock = async () => {
    const result = await axios.post(openApiSpeckMock());
    const schema = toJsonSchema(result.data.response);
    const paths = Object.keys(schema.properties?.paths?.properties ?? []);
    const endpointsArr: EndpointType[] = [];
    paths.forEach((e) => {
      endpointsArr.push({
        label: `${e}`,
        value: `${e}`,
      });
    });
    filterSchema(schema);
    setJsonSchema(schema);
    setEndpoints(endpointsArr);
    setOpenApiSpec(result.data.response);
  };

  const filterSchema = (schema: any) => {
    delete schema.properties?.openapi;
    delete schema.properties?.components;
    delete schema.properties?.info;
    delete schema.properties?.servers;
  }

  return (
    <Track direction='vertical'>
      <link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css' />
      <h1>{t('menu.newService')}</h1>
      <a style={{ marginBottom: '10p' }}></a>
      <Track>
        <FormInput name={''} label={''}></FormInput>
        <a style={{ marginLeft: '20px' }}></a>
        <Button>Ask For Spec</Button>
        <a style={{ marginLeft: '10px' }}></a>
        <Button appearance='text' onClick={fetchOpenApiSpecMock}>
          Mock It
        </Button>
      </Track>
      <a style={{ marginBottom: '20px' }}></a>
      {endpoints.length > 0 && (
        <FormSelect
          name={''}
          label={''}
          placeholder={'Select Endpoint'}
          options={endpoints}
          onSelectionChange={(value) => setSelectedEndpoint(value?.value ?? '')}
        />
      )}
      {selectedSchema != undefined && <Form schema={selectedSchema} validator={validator}  />}
    </Track>
  );
};

export default NewServicePage;
