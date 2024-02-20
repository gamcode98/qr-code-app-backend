export interface PayloadToken {
  sub: number;
}

export interface PayloadUser extends PayloadToken {
  iat: number;
  exp: number;
}
