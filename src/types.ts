export type Handler = (
  metadata_key: string,
  metadata_value: string,
  handler: FunctionConstructor,
  instance: any
) => void;

export interface OrchestratorInterface {
  registerHander: (
    metadata_key: string,
    metadata_value: string,
    handler: FunctionConstructor,
    instance: any
  ) => void;
}

export type Options = {
  metadata_key: string;
  discover_controllers?: boolean;
  discover_services?: boolean;
};
