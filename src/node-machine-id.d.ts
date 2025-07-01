declare module "node-machine-id" {
  export function machineIdSync(): string;
  interface NodeMachineId {
    machineIdSync: typeof machineIdSync;
  }
  const id: NodeMachineId;
  export default id;
}
