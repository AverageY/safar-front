
export interface UserDto {
  id?: number;
  userId?: number;
  username?: string;
  userName?: string; // API returns userName, but we might also have username
  userType: 'STUDENT' | 'TEACHER' | 'DRIVER';
  profileImg?: string;
  mobileNum?: string;
  createdAt?: string;
}

export interface LoginDto {
  username: string;
  password: string;
}

export interface RegisterDto {
  userName: string;
  mobileNum: string;
  pswd: string;
  userType: 'STUDENT' | 'TEACHER' | 'DRIVER';
  profileImg: string;
}

export interface UpdateUserDto {
  userName?: string;
  mobileNum?: string;
  pswd?: string;
  userType?: 'STUDENT' | 'TEACHER' | 'DRIVER';
  profileImg?: string;
}
