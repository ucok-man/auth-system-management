export interface ActiveUserPayload {
  sub: string; // user id
  user: {
    id: string;
    email: string;
  };
  role: {
    id: string;
    code: string;
  };
}
