export const VisibleToggleHandler = (dispatch, updateThunk) => {
  return (id) => (nextVisible) => {
    dispatch(
      updateThunk({
        id,
        visible: nextVisible
      })
    );
  };
};
