/**
 * key => BE의 dto 참고, value 내가 넘길때 page/redux에서 정의한 state값
 * @param value
 * @returns {{userName: (string|*), userPhone: (string|*)}}
 *
 * endpoint 한개당 dto 한개 mapping 한다 생각 할 것 (규격 통일)
 */
export const authVerifyDTO = (value) => ({
  userName: value.userName,
  userPhone: value.userPhone,
});

export const authJoinDTO = (value) => ({
  userName: value.userName,
  userPhone: value.userPhone,
  userAccount: value.userAccount,
  password: value.password,
})

export const authLoginDTO = (value) => ({
  userAccount: value.userAccount,
  password: value.password,
})
