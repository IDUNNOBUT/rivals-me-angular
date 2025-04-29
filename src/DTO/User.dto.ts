export type UserDto = {
  id: string;
  email: string;
  name: string;
  registeredAt: Date;
};

export type UpdateUserDto = { name?: string, password?: string };
