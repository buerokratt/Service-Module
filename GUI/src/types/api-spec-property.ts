// Possibly needs revision
// A good option would be to use an interface from some well-maintaained library for OpenAPI types
export type ApiSpecProperty = {
  [key: string]: any;
  $ref: string;
  items: ApiSpecProperty;
  paths: Record<string, Record<string, ApiSpecProperty>>;
  requestBody: {
    content: {
      'application/json': {
        schema: ApiSpecProperty;
      };
    };
  };
  parameters: ApiSpecProperty[];
  responses: {
    '200': ApiSpecProperty;
  };
};
