export type ApiSpecProperty = {
  [key: string]: any;
  $ref: string;
  items: ApiSpecProperty;
};
