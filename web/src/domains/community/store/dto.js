export const createBoardDTO = (state) => ({
  code: state.code,
  name: state.name,
  description: state.description,
  writeRole: state.writeRole,
  readRole: state.readRole,
  visible: state.visible,
  deleted: state.deleted,
  sortOrder: state.sortOrder,
})
